# Electric Proxy Architecture

## Holistic Goal

Build a type-safe, real-time local-first data layer on top of TanStack Start + ElectricSQL where:

1. **The client never talks to Electric directly** — a server-side proxy enforces auth before streaming shape data
2. **Mutations flow through typed server functions** — no raw SQL from the client, ownership is enforced server-side
3. **Optimistic UI is reconciled automatically** — the client speculatively applies mutations, then waits for the exact database transaction to appear in the Electric stream to confirm

The two concrete collections (`todos` — user-scoped, `simple-list-items` — public) are working examples of the pattern.

---

## Architecture: Layer by Layer

### 1. Data Tables + Schemas

Each entity has two complementary definitions that must stay in sync:

**Drizzle table** (`src/db/tables/todos.ts`, `src/db/tables/simple-list-items.ts`) — the authoritative PostgreSQL schema.

**Zod schema** (`src/db/schemas/todos.ts`, `src/db/schemas/simple-list-items.ts`) — typed validation with split views:
- `row` — full database row used by the collection and server mutations
- `insert` / `update` / `delete` — narrowed shapes for server function input validators
- `clientSchema` (public export) — the subset safe to expose to client forms

**Drift prevention:** `assertTableSchema(table)(schema.row)` at the bottom of each table file is a compile-time check that the Drizzle column types match the Zod row schema. If they diverge, TypeScript errors at import time.

---

### 2. The Scope Model

`src/integrations/electric/metadata.ts` defines the three-tier access model that drives everything downstream:

```
public         → no auth required, stream entire table
authenticated  → valid session required, stream entire table
user-scoped    → valid session required + WHERE user_id = $1 injected
```

This is declared **once at collection definition time**, not per-request. The scope resolves into an `ElectricShapeDefinition`:
- `table` — derived from shape name by replacing `-` with `_` (convention over config)
- `requiresAuth` — boolean gate
- `buildMainFilter(session)` — optional function returning the parameterized `WHERE` clause

Shape definitions self-register into a module-level `Map` when `createElectricCollection` is called. The proxy later triggers this registration with a lazy `await import('#/db/collections')`.

---

### 3. Collection Factory

`src/integrations/electric/collection.ts` — `createElectricCollection()` is the single entry point for defining a new synced entity. It:

1. Derives the Electric shape URL: `window.location.origin + /api/electric/{shapeName}` (SSR-safe, falls back to relative path)
2. Wraps `electricCollectionOptions` from `@tanstack/electric-db-collection` with the Zod schema, `getKey`, SSE config, and a `timestamptz` parser
3. Bridges the collection's `onInsert` / `onUpdate` / `onDelete` callbacks to your server functions — extracting `transaction.mutations[0]` and returning the `txid`
4. Stamps `collection.electric = { shape, scope }` onto the created collection object
5. Calls `registerElectricShapeDefinition(collection)` as a side effect — this is what populates the server-side registry

---

### 4. Server Mutation Functions

`src/funcs/todos.ts`, `src/funcs/simple-list-items.ts` — TanStack Start server functions (`createServerFn`) that:

- Validate input against the Zod `insert`/`update`/`delete` sub-schemas
- Call `requireCurrentSession()` to enforce auth (throws 401 if no session)
- Run inside a `db.transaction()` so the txid read is from the exact committed transaction
- Return `{ txid: await readTxId(tx) }` — the PostgreSQL transaction id

`src/integrations/electric/read-tx-id.ts` uses `SELECT pg_current_xact_id()::xid::text` to capture the current transaction's id. Electric's client uses this txid to know when the stream has caught up to that specific write, enabling reliable optimistic UI reconciliation.

For `todos`, ownership is enforced in every write: `WHERE id = $1 AND user_id = $2` — a user cannot mutate another user's rows even if they forge an id.

---

### 5. The Proxy — Three Files

**`src/integrations/electric/proxy/shapes.ts`** — pure authorization logic:
- `authorizeElectricShapeRequest()` — looks up the shape name in the registered definitions, checks auth, returns an `AuthorizedElectricProxyContext` or a `Response` (401/404)
- Accepts optional `shapeDefinitions` / `getShapeDefinitions` overrides for testing
- Default path: lazy-imports `#/db/collections` to trigger self-registration, then reads the registry

**`src/integrations/electric/proxy/handler.ts`** — HTTP proxying:
- `createElectricProxyHandler()` — factory returning the actual request handler
- `buildElectricShapeUrl()` — maps the inbound request's Electric protocol query params to the upstream Electric server URL, sets `table`, injects `where` + `params[N]` for user-scoped shapes, appends `source_id` and `secret` for Electric Cloud
- Strips `content-encoding`, `content-length`, and CORS headers from the upstream response
- Adds `Vary: Cookie` when the shape requires auth (prevents caches from cross-contaminating sessions)
- `disableBunRequestIdleTimeout()` — disables Bun's 10-second idle timeout for SSE long-poll connections via `server.timeout(request, 60)`

**`src/integrations/electric/proxy/middleware.ts`** — TanStack Start middleware glue:
- Reads `params.shape` from the route, calls `authorizeElectricShapeRequest` with `getSessionFromHeaders`
- If authorization returns a `Response`, returns it immediately (short-circuits the route)
- Otherwise injects `context.electricProxy` for the route handler to consume

---

### 6. The Route

`src/routes/api/electric.$shape.ts` — a single file-route that wires everything:

```
GET /api/electric/:shape
  → electricProxyMiddleware (auth + shape lookup)
  → handleElectricProxyRequest (upstream proxy)
```

`ENV.ELECTRIC_URL`, `ENV.ELECTRIC_SOURCE_ID`, `ENV.ELECTRIC_SECRET` are read from the environment at module init time via `varlock/env`.

---

## Data Flow

```
Client (React)
  │
  │  useCollection(todoCollection)
  │  ← streams via SSE
  │
GET /api/electric/todos
  │
  ├─ electricProxyMiddleware
  │    ├─ import '#/db/collections'  (self-registers shapes)
  │    ├─ look up 'todos' in registry → { table: 'todos', requiresAuth: true, buildMainFilter }
  │    ├─ getSessionFromHeaders(request.headers)
  │    └─ inject context.electricProxy = { shape, session }
  │
  └─ handleElectricProxyRequest
       ├─ build upstream URL: ELECTRIC_URL/v1/shape?table=todos&where=user_id=$1&params[1]=<uid>
       └─ stream Electric response back to client (stripping CORS/encoding headers)

Client mutates (e.g. insert todo)
  │
  ├─ optimistic update applied immediately to local collection
  │
  └─ insertTodo({ data }) → POST (server function)
       ├─ requireCurrentSession()
       ├─ db.transaction → INSERT INTO todos ...
       ├─ readTxId(tx) → pg_current_xact_id()
       └─ return { txid: N }
            └─ Electric collection waits for txid N in the shape stream
                 → confirms optimistic mutation, reconciles if different
```

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Self-registering collections via side-effect import | No central manifest to maintain; just import the collections file to activate all shapes |
| Scope declared at definition, not request time | Shape access policy is colocated with the schema, not scattered across middleware |
| `id` → table name via `-` → `_` convention | Eliminates a config layer; just name your collection `simple-list-items` and the table `simple_list_items` |
| txid returned from every mutation | Required for Electric's optimistic reconciliation; must be read inside the same transaction |
| `buildMainFilter` returns parameterized SQL | Prevents SQL injection in the `WHERE` clause for user-scoped shapes |
| Proxy strips CORS headers | The proxy is same-origin; adding Electric's upstream CORS headers would be incorrect |
| `Vary: Cookie` on auth-required shapes | Prevents CDN/reverse-proxy caches from serving one user's shape stream to another |
| Bun timeout disabled per-request | Electric uses long-polling; Bun's idle timeout would kill connections after 10s |
