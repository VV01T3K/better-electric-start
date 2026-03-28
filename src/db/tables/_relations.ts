import "@tanstack/react-start/server-only";
import { relations as authRelations } from "./auth.gen";
import { fileRelations } from "./files";
import { todoRelations } from "./todos";

export const relations = {
	...authRelations,
	...fileRelations,
	...todoRelations,
	users: {
		...authRelations.users,
		relations: {
			...authRelations.users.relations,
			...fileRelations.users.relations,
			...todoRelations.users.relations,
		},
	},
} satisfies typeof authRelations &
	typeof fileRelations &
	typeof todoRelations & {
		users: typeof authRelations.users &
			typeof fileRelations.users &
			typeof todoRelations.users;
	};
