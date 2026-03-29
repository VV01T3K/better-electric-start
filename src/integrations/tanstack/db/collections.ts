import { fileServerSchema } from "#/db/schemas/files";
import { simpleListItemServerSchema } from "#/db/schemas/simple-list-items";
import { todoServerSchema } from "#/db/schemas/todos";
import { deleteFile } from "#/funcs/files";
import { insertSimpleListItem } from "#/funcs/simple-list-items";
import { deleteTodo, insertTodo, updateTodo } from "#/funcs/todos";
import { createElectricCollection } from "#/integrations/electric/collection";

export const todoCollection = createElectricCollection({
	id: "todos",
	scope: "user-scoped",
	schema: todoServerSchema.row,
	onInsert: insertTodo,
	onUpdate: updateTodo,
	onDelete: deleteTodo,
});

export const simpleListCollection = createElectricCollection({
	id: "simple-list-items",
	scope: "public",
	schema: simpleListItemServerSchema.row,
	onInsert: insertSimpleListItem,
});

export const filesCollection = createElectricCollection({
	id: "files",
	scope: "authenticated",
	schema: fileServerSchema.row,
	onDelete: deleteFile,
});
