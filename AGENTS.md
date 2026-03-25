<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "adding a new synced Electric + Postgres feature"
  load: "/workspaces/better-electric-start/node_modules/@electric-sql/client/skills/electric-new-feature/SKILL.md"
- task: "working on Drizzle schema, migrations, or server-side writes for synced data"
  load: "/workspaces/better-electric-start/node_modules/@electric-sql/client/skills/electric-orm/SKILL.md"
- task: "working on TanStack DB collections, live queries, or optimistic mutations"
  load: "/workspaces/better-electric-start/node_modules/@tanstack/db/skills/db-core/SKILL.md"
- task: "building React components with useLiveQuery or other TanStack DB hooks"
  load: "/workspaces/better-electric-start/node_modules/@tanstack/react-db/skills/react-db/SKILL.md"
- task: "preloading TanStack DB collections in TanStack Start routes or handling SSR boundaries"
  load: "/workspaces/better-electric-start/node_modules/@tanstack/db/skills/meta-framework/SKILL.md"

<!-- intent-skills:end -->

Only for running manually by agent and not for user prompts nor scripts only agents integrated terminal.
bun via mise exec -- bun ....

Do not read archive folders unless explicitly asked for, as they may contain outdated information.
