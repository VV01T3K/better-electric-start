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
	id: string;
	shape: string;
	scope?: ElectricCollectionScope;
};

export type ElectricShapeMetadataCarrier = {
	electric: ElectricCollectionMetadata;
};

export function getElectricShapeName(options: { id: string; shape?: string }) {
	return options.shape ?? options.id;
}

function shapeNameToTable(shapeName: string) {
	return shapeName.replaceAll("-", "_");
}

export function getElectricShapeDefinition(options: {
	id: string;
	shape?: string;
	scope?: ElectricCollectionScope;
}) {
	if (!options.scope) {
		return undefined;
	}

	const table = shapeNameToTable(getElectricShapeName(options));

	switch (options.scope) {
		case "public":
			return {
				table,
				requiresAuth: false,
			} satisfies ElectricShapeDefinition;
		case "authenticated":
			return {
				table,
				requiresAuth: true,
			} satisfies ElectricShapeDefinition;
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
			} satisfies ElectricShapeDefinition;
	}
}

export function isElectricShapeMetadataCarrier(
	value: unknown,
): value is ElectricShapeMetadataCarrier {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const electric = (value as { electric?: ElectricCollectionMetadata })
		.electric;

	return (
		typeof electric?.id === "string" &&
		typeof electric.shape === "string" &&
		(typeof electric.scope === "string" ||
			typeof electric.scope === "undefined")
	);
}
