export type {
	ElectricProxySession,
	ElectricShapeDefinition,
	ElectricShapeMainFilter,
} from "../metadata";

import * as collections from "#/integrations/tanstack/db/collections";

import type {
	ElectricProxySession,
	ElectricShapeDefinition,
} from "../metadata";
import {
	getElectricShapeDefinition,
	isElectricShapeMetadataCarrier,
} from "../metadata";

export type AuthorizedElectricProxyContext = {
	shape: ElectricShapeDefinition;
	session?: ElectricProxySession;
};

const electricShapeDefinitions = Object.fromEntries(
	Object.values(collections).flatMap((value) => {
		if (!isElectricShapeMetadataCarrier(value)) {
			return [];
		}

		const definition = getElectricShapeDefinition(value.electric);

		if (!definition) {
			return [];
		}

		return [[value.electric.shape, definition]] as const;
	}),
) as Record<string, ElectricShapeDefinition>;

function createProxyErrorResponse(
	status: 401 | 404,
	error: string,
	headers?: HeadersInit,
) {
	return Response.json(
		{ error },
		{
			status,
			headers,
		},
	);
}

export async function authorizeElectricShapeRequest(options: {
	shapeName: string | undefined;
	getSession: () => Promise<ElectricProxySession | null | undefined>;
}) {
	const shape = options.shapeName
		? electricShapeDefinitions[options.shapeName]
		: undefined;

	if (!shape) {
		return createProxyErrorResponse(404, "Shape not found.");
	}

	if (!shape.requiresAuth) {
		return {
			shape,
		};
	}

	const session = await options.getSession();

	if (!session) {
		return createProxyErrorResponse(401, "Unauthorized.", {
			Vary: "Cookie",
		});
	}

	return {
		shape,
		session,
	};
}
