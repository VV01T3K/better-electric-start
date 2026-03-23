import type { InferSelectModel, Table } from 'drizzle-orm'
import type { z } from 'zod'

type BrandKey = typeof z.core.$brand

type UnbrandField<T> =
  T extends string & { [Key in BrandKey]: any } ? string
  : T extends number & { [Key in BrandKey]: any } ? number
  : T extends symbol & { [Key in BrandKey]: any } ? symbol
  : T

type Unbrand<T> = {
  [Key in keyof T]: UnbrandField<T[Key]>
}

type Exact<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
    ? (<T>() => T extends B ? 1 : 2) extends
        (<T>() => T extends A ? 1 : 2)
      ? true
      : false
    : false

type MatchingSchema<TTable extends Table, TSchema extends z.ZodType> =
  Exact<InferSelectModel<TTable>, Unbrand<z.output<TSchema>>> extends true
    ? TSchema
    : never

export function assertTableSchema<TTable extends Table>(table: TTable) {
  return <TSchema extends z.ZodType>(_schema: MatchingSchema<TTable, TSchema>) => table
}
