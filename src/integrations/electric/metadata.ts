export type ElectricCollectionScope =
	| "public"
	| "authenticated"
	| "user-scoped";

export type ElectricProxySession = {
	user: {
		id: string;
	};
};

export type ElectricShapeMainFilter = {
	where: string;
	params?: Record<string, string>;
};

export type ElectricShapeDefinition = {
	table: string;
	requiresAuth: boolean;
	buildMainFilter?: (session: ElectricProxySession) => ElectricShapeMainFilter;
};

export type ElectricCollectionMetadata = {
	shape: string;
	scope?: ElectricCollectionScope;
};

export type ElectricShapeMetadataCarrier = {
	id?: string;
	electric: ElectricCollectionMetadata;
};

type RegisteredElectricShape = {
	owner: string;
	definition: ElectricShapeDefinition;
};

const registeredElectricShapes = new Map<string, RegisteredElectricShape>();

export function getElectricShapeName(options: { id: string; shape?: string }) {
	return options.shape ?? options.id;
}

function shapeNameToTable(shapeName: string) {
	return shapeName.replaceAll("-", "_");
}

function resolveElectricShapeDefinition(
	shapeName: string,
	scope: ElectricCollectionScope,
): ElectricShapeDefinition {
	const table = shapeNameToTable(shapeName);

	switch (scope) {
		case "public":
			return {
				table,
				requiresAuth: false,
			};
		case "authenticated":
			return {
				table,
				requiresAuth: true,
			};
		case "user-scoped":
			return {
				table,
				requiresAuth: true,
				buildMainFilter: (session) => ({
					where: "user_id = $1",
					params: {
						1: session.user.id,
					},
				}),
			};
	}
}

export function registerElectricShapeDefinition(
	collection: ElectricShapeMetadataCarrier,
) {
	const { shape, scope } = collection.electric;

	if (!scope) {
		return;
	}

	const owner = collection.id ?? shape;
	const definition = resolveElectricShapeDefinition(shape, scope);
	const existing = registeredElectricShapes.get(shape);

	if (existing && existing.owner !== owner) {
		throw new Error(
			`Duplicate Electric shape "${shape}" registered by "${owner}". Already registered by "${existing.owner}".`,
		);
	}

	registeredElectricShapes.set(shape, {
		owner,
		definition,
	});
}

export function getRegisteredElectricShapeDefinitions() {
	return Object.fromEntries(
		Array.from(registeredElectricShapes, ([shape, entry]) => [
			shape,
			entry.definition,
		]),
	) as Record<string, ElectricShapeDefinition>;
}
