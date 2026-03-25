import "@tanstack/react-start/server-only";
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";

import type {
	AuthorizedElectricProxyContext,
	ElectricProxySession,
	ElectricShapeDefinition,
} from "./shapes";

type ElectricProxyOptions = {
	electricUrl: string;
	sourceId?: string;
	secret?: string;
	fetchImpl?: typeof fetch;
};

type BunRequestWithServerTimeout = Request & {
	runtime?: {
		bun?: {
			server?: {
				timeout?: (request: Request, seconds: number) => void;
			};
		};
	};
};

export function disableBunRequestIdleTimeout(request: Request) {
	const server = (request as BunRequestWithServerTimeout).runtime?.bun?.server;

	if (typeof server?.timeout === "function") {
		server.timeout(request, 60);
		return true;
	}

	return false;
}

function appendVaryHeader(headers: Headers, value: string) {
	const current = headers.get("vary");

	if (!current) {
		headers.set("vary", value);
		return;
	}

	const values = current
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	if (!values.includes(value)) {
		values.push(value);
		headers.set("vary", values.join(", "));
	}
}

export function buildElectricShapeUrl(
	request: Request,
	options: {
		electricUrl: string;
		shape: ElectricShapeDefinition;
		session?: ElectricProxySession;
		sourceId?: string;
		secret?: string;
	},
) {
	const requestUrl = new URL(request.url);
	const upstreamUrl = new URL("/v1/shape", options.electricUrl);

	requestUrl.searchParams.forEach((value, key) => {
		if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
			upstreamUrl.searchParams.set(key, value);
		}
	});

	upstreamUrl.searchParams.set("table", options.shape.table);

	if (options.shape.buildMainFilter) {
		if (!options.session) {
			throw new Error("Protected Electric shapes require a session.");
		}

		const mainFilter = options.shape.buildMainFilter(options.session);

		upstreamUrl.searchParams.set("where", mainFilter.where);

		Object.entries(mainFilter.params ?? {}).forEach(([key, value]) => {
			upstreamUrl.searchParams.set(`params[${key}]`, value);
		});
	}

	if (options.sourceId) {
		upstreamUrl.searchParams.set("source_id", options.sourceId);
	}

	if (options.secret) {
		upstreamUrl.searchParams.set("secret", options.secret);
	}

	return upstreamUrl;
}

export function createElectricProxyHandler({
	electricUrl,
	sourceId,
	secret,
	fetchImpl = fetch,
}: ElectricProxyOptions) {
	return async function handleElectricProxyRequest(
		request: Request,
		proxyContext: AuthorizedElectricProxyContext,
	) {
		disableBunRequestIdleTimeout(request);

		const upstreamUrl = buildElectricShapeUrl(request, {
			electricUrl,
			shape: proxyContext.shape,
			session: proxyContext.session,
			sourceId,
			secret,
		});

		const upstreamResponse = await fetchImpl(upstreamUrl, {
			method: "GET",
			signal: request.signal,
		});

		const headers = new Headers(upstreamResponse.headers);
		headers.delete("content-encoding");
		headers.delete("content-length");
		headers.delete("access-control-allow-origin");
		headers.delete("access-control-allow-credentials");

		if (proxyContext.shape.requiresAuth) {
			appendVaryHeader(headers, "Cookie");
		}

		return new Response(upstreamResponse.body, {
			status: upstreamResponse.status,
			statusText: upstreamResponse.statusText,
			headers,
		});
	};
}
