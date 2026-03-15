import { sql } from 'drizzle-orm'

import { db } from '#/db'

type Transaction = Parameters<typeof db.transaction>[0] extends (
  arg: infer T,
) => Promise<unknown>
  ? T
  : never

export async function readTxId(tx: Transaction) {
  const result = await tx.execute<{ txid: string }>(
    sql`SELECT pg_current_xact_id()::xid::text AS txid`,
  )
  const txid = Number(result.rows[0]?.txid)

  if (!Number.isInteger(txid)) {
    throw new Error('Failed to read transaction id from Postgres.')
  }

  return txid
}
