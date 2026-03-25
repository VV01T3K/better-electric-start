import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
	electricCollectionOptions,
	type ElectricCollectionUtils,
	type Txid,
} from "@tanstack/electric-db-collection";
import {
	createCollection,
	type Collection,
	type InferSchemaInput,
	type InferSchemaOutput,
} from "@tanstack/react-db";
import type { CollectionConfig } from "@tanstack/react-db";

import {
	getElectricShapeName,
	registerElectricShapeDefinition,
	type ElectricCollectionScope,
	type ElectricShapeMetadataCarrier,
} from "./metadata";

type RowWithId = {
	id: string | number;
};

type SchemaRow<TSchema extends StandardSchemaV1<unknown, RowWithId>> =
	InferSchemaOutput<TSchema>;

type SchemaInput<TSchema extends StandardSchemaV1<unknown, RowWithId>> =
	InferSchemaInput<TSchema>;

export type ElectricMutationResult = {
	txid: Txid;
};

export type ElectricInsertHandler<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
> = (args: { data: SchemaRow<TSchema> }) => Promise<ElectricMutationResult>;

export type ElectricUpdatePayload<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
> = Partial<SchemaRow<TSchema>> & Pick<SchemaRow<TSchema>, "id">;

export type ElectricUpdateHandler<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
> = (args: {
	data: ElectricUpdatePayload<TSchema>;
}) => Promise<ElectricMutationResult>;

export type ElectricDeleteHandler<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
> = (args: {
	data: Pick<SchemaRow<TSchema>, "id">;
}) => Promise<ElectricMutationResult>;

export type CreateElectricCollectionConfig<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
> = {
	id: string;
	shape?: string;
	scope?: ElectricCollectionScope;
	schema: TSchema;
	onInsert?: ElectricInsertHandler<TSchema>;
	onUpdate?: ElectricUpdateHandler<TSchema>;
	onDelete?: ElectricDeleteHandler<TSchema>;
	url?: string;
};

type ElectricCollectionWithMetadata<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
> = Collection<
	SchemaRow<TSchema>,
	string | number,
	ElectricCollectionUtils<SchemaRow<TSchema>>,
	TSchema,
	SchemaInput<TSchema>
> &
	ElectricShapeMetadataCarrier;

function getElectricShapeUrl(id: string, shape?: string, url?: string) {
	if (url) {
		return url;
	}

	const path = `/api/electric/${getElectricShapeName({ id, shape })}`;
	return typeof window !== "undefined"
		? `${window.location.origin}${path}`
		: path;
}

export function createElectricCollection<
	TSchema extends StandardSchemaV1<unknown, RowWithId>,
>({
	id,
	shape,
	scope,
	schema,
	onInsert,
	onUpdate,
	onDelete,
	url,
}: CreateElectricCollectionConfig<TSchema>) {
	type TRow = SchemaRow<TSchema>;

	const options = electricCollectionOptions<TSchema>({
		id,
		schema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: getElectricShapeUrl(id, shape, url),
			liveSse: true,
			parser: {
				timestamptz: (value: string) => new Date(value),
			} as never,
		},
		onInsert: onInsert
			? async ({ transaction }) => {
					const { txid } = await onInsert({
						data: transaction.mutations[0].modified as TRow,
					});
					return { txid };
				}
			: undefined,
		onUpdate: onUpdate
			? async ({ transaction }) => {
					const { original, changes } = transaction.mutations[0];
					const { txid } = await onUpdate({
						data: {
							id: original.id,
							...changes,
						} as ElectricUpdatePayload<TSchema>,
					});
					return { txid };
				}
			: undefined,
		onDelete: onDelete
			? async ({ transaction }) => {
					const { txid } = await onDelete({
						data: {
							id: transaction.mutations[0].original.id,
						} as Pick<TRow, "id">,
					});
					return { txid };
				}
			: undefined,
	});

	const collection = createCollection(
		options as CollectionConfig<
			TRow,
			string | number,
			TSchema,
			ElectricCollectionUtils<TRow>
		> & {
			schema: TSchema;
		},
	) as ElectricCollectionWithMetadata<TSchema>;

	collection.electric = {
		shape: getElectricShapeName({ id, shape }),
		scope,
	};

	registerElectricShapeDefinition(collection);

	return collection;
}
