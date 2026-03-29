// * Temporary home for collections until TanStack DB supports SSR cleanly. * //

import { fileServerSchema } from "#/db/schemas/files";
import { simpleListItemServerSchema } from "#/db/schemas/simple-list-items";
import { todoServerSchema } from "#/db/schemas/todos";
import { deleteFile } from "#/funcs/files";
import { insertSimpleListItem } from "#/funcs/simple-list-items";
import { deleteTodo, insertTodo, updateTodo } from "#/funcs/todos";
import { createElectricCollection } from "#/integrations/electric/collection";

function getDemoCollectionUrl(shapeName: string) {
	const path = `/api/electric/${shapeName}`;

	if (typeof window === "undefined") {
		return path;
	}
	const url = new URL(path, window.location.origin);
	url.searchParams.set("demo-refresh", String(Date.now()));

	return url.toString();
}

export const demoTodoCollection = createElectricCollection({
	id: "todos-demo-route",
	schema: todoServerSchema.row,
	onInsert: insertTodo,
	onUpdate: updateTodo,
	onDelete: deleteTodo,
	url: getDemoCollectionUrl("todos"),
});

export const demoTodoCollectionPreloadPromise =
	typeof window === "undefined" ? null : demoTodoCollection.preload();

export const demoFilesCollection = createElectricCollection({
	id: "files-demo-route",
	schema: fileServerSchema.row,
	onDelete: deleteFile,
	url: getDemoCollectionUrl("files"),
});

export const demoFilesCollectionPreloadPromise =
	typeof window === "undefined" ? null : demoFilesCollection.preload();

export const demoSimpleListCollection = createElectricCollection({
	id: "simple-list-demo-route",
	schema: simpleListItemServerSchema.row,
	onInsert: insertSimpleListItem,
	url: getDemoCollectionUrl("simple-list-items"),
});

export const demoSimpleListCollectionPreloadPromise =
	typeof window === "undefined" ? null : demoSimpleListCollection.preload();
