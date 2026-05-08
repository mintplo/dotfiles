import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_LINES,
	formatSize,
	truncateHead,
} from "@mariozechner/pi-coding-agent";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Type } from "typebox";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const LAZYWEB_MCP_URL = "https://www.lazyweb.com/mcp";
const TOKEN_PATH = join(homedir(), ".lazyweb", "lazyweb_mcp_token");
const LEGACY_CODEX_TOKEN_PATH = join(homedir(), ".codex", "lazyweb_mcp_token");
const REQUEST_TIMEOUT_MS = 30_000;

interface LazywebClientHandle {
	client: Client;
	close: () => Promise<void>;
}

const SearchParams = Type.Object({
	query: Type.String({ description: "What to search for, e.g. pricing page, onboarding checklist, settings screen" }),
	limit: Type.Optional(Type.Number({ description: "Maximum number of results to return" })),
	platform: Type.Optional(Type.String({ description: "Optional platform filter: desktop, mobile, or all" })),
	category: Type.Optional(Type.String({ description: "Optional Lazyweb category filter" })),
	company: Type.Optional(Type.String({ description: "Optional company/app filter, e.g. stripe" })),
	fields: Type.Optional(Type.String({ description: "Optional Lazyweb fields filter, e.g. high_design_bar" })),
});

const FindSimilarParams = Type.Object({
	screenshot_id: Type.Number({ description: "Lazyweb screenshot id to find similar screenshots for" }),
	limit: Type.Optional(Type.Number({ description: "Maximum number of results to return" })),
});

const CompareImageParams = Type.Object({
	image_url: Type.Optional(Type.String({ description: "Image URL to compare against Lazyweb screenshots" })),
	image_base64: Type.Optional(Type.String({ description: "Base64-encoded image data" })),
	mime_type: Type.Optional(Type.String({ description: "MIME type for image_base64, e.g. image/png" })),
	limit: Type.Optional(Type.Number({ description: "Maximum number of results to return" })),
});

function missingTokenMessage(): string {
	return [
		"Lazyweb MCP token is not configured.",
		"Set LAZYWEB_MCP_TOKEN or write the token to ~/.lazyweb/lazyweb_mcp_token.",
		"Do not commit the token to git.",
	].join("\n");
}

async function readTokenFile(path: string): Promise<string | undefined> {
	try {
		const token = (await readFile(path, "utf8")).trim();
		return token || undefined;
	} catch {
		return undefined;
	}
}

async function getToken(): Promise<string> {
	const token =
		process.env.LAZYWEB_MCP_TOKEN?.trim() ||
		(await readTokenFile(TOKEN_PATH)) ||
		(await readTokenFile(LEGACY_CODEX_TOKEN_PATH));

	if (!token) throw new Error(missingTokenMessage());
	return token;
}

async function connectLazyweb(signal?: AbortSignal): Promise<LazywebClientHandle> {
	const token = await getToken();
	const client = new Client(
		{ name: "pi-lazyweb", version: "1.0.0" },
		{ capabilities: {} },
	);
	const transport = new StreamableHTTPClientTransport(new URL(LAZYWEB_MCP_URL), {
		requestInit: {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	});

	await client.connect(transport, { signal, timeout: REQUEST_TIMEOUT_MS });
	return { client, close: () => client.close() };
}

function truncateText(text: string): string {
	const truncated = truncateHead(text, {
		maxBytes: DEFAULT_MAX_BYTES,
		maxLines: DEFAULT_MAX_LINES,
	});
	if (!truncated.truncated) return truncated.content;
	return `${truncated.content}\n\n[Output truncated: ${truncated.outputLines} of ${truncated.totalLines} lines (${formatSize(truncated.outputBytes)} of ${formatSize(truncated.totalBytes)}).]`;
}

function json(value: unknown): string {
	return truncateText(JSON.stringify(value, null, 2));
}

function normalizeArgs(args: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(args).filter(([, value]) => value !== undefined && value !== null && value !== ""),
	);
}

async function callLazywebTool(
	toolName: string,
	args: Record<string, unknown>,
	signal?: AbortSignal,
): Promise<{ content: Array<{ type: "text"; text: string }>; details: Record<string, unknown> }> {
	const handle = await connectLazyweb(signal);
	try {
		const result = await handle.client.callTool(
			{ name: toolName, arguments: normalizeArgs(args) },
			undefined,
			{ signal, timeout: REQUEST_TIMEOUT_MS, maxTotalTimeout: REQUEST_TIMEOUT_MS },
		);
		return {
			content: [{ type: "text", text: truncateText(formatMcpResult(result)) }],
			details: { toolName, isError: "isError" in result ? result.isError === true : false },
		};
	} finally {
		await handle.close().catch(() => undefined);
	}
}

function formatMcpResult(result: unknown): string {
	if (!result || typeof result !== "object") return String(result);
	const record = result as { content?: unknown; structuredContent?: unknown; toolResult?: unknown; isError?: unknown };

	const parts: string[] = [];
	if (record.isError === true) parts.push("MCP tool returned isError=true");

	if (Array.isArray(record.content)) {
		for (const item of record.content) {
			if (!item || typeof item !== "object") continue;
			const content = item as { type?: unknown; text?: unknown; mimeType?: unknown; data?: unknown; uri?: unknown };
			if (content.type === "text" && typeof content.text === "string") {
				parts.push(content.text);
			} else if (content.type === "image") {
				parts.push(`[image: ${typeof content.mimeType === "string" ? content.mimeType : "unknown mime type"}]`);
			} else if (content.type === "resource") {
				parts.push(`[resource: ${typeof content.uri === "string" ? content.uri : "unknown uri"}]`);
			} else {
				parts.push(json(content));
			}
		}
	}

	if (record.structuredContent) parts.push(`structuredContent:\n${json(record.structuredContent)}`);
	if (record.toolResult) parts.push(`toolResult:\n${json(record.toolResult)}`);

	return parts.length ? parts.join("\n\n") : json(result);
}

function err(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	return {
		content: [{ type: "text" as const, text: message }],
		details: {},
	};
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("lazyweb-verify", {
		description: "Verify Lazyweb MCP tools and run a sample pricing-page search",
		handler: async (_args, ctx) => {
			let handle: LazywebClientHandle | undefined;
			try {
				handle = await connectLazyweb(ctx.signal);
				const tools = await handle.client.listTools(undefined, { signal: ctx.signal, timeout: REQUEST_TIMEOUT_MS });
				const names = tools.tools.map((tool) => tool.name).sort();
				const health = await handle.client.callTool({ name: "lazyweb_health", arguments: {} }, undefined, {
					signal: ctx.signal,
					timeout: REQUEST_TIMEOUT_MS,
				});
				const search = await handle.client.callTool(
					{ name: "lazyweb_search", arguments: { query: "pricing page", limit: 3 } },
					undefined,
					{ signal: ctx.signal, timeout: REQUEST_TIMEOUT_MS },
				);
				ctx.ui.notify(
					`Lazyweb OK: ${names.join(", ")}\n\nHealth:\n${formatMcpResult(health)}\n\nSearch sample:\n${truncateText(formatMcpResult(search))}`,
					"info",
				);
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			} finally {
				await handle?.close().catch(() => undefined);
			}
		},
	});

	pi.registerTool({
		name: "lazyweb_list_tools",
		label: "Lazyweb List Tools",
		description: "List tools exposed by the hosted Lazyweb MCP server",
		promptSnippet: "List available Lazyweb MCP tools for UI reference research",
		parameters: Type.Object({}),
		async execute(_id, _params, signal) {
			let handle: LazywebClientHandle | undefined;
			try {
				handle = await connectLazyweb(signal);
				const result = await handle.client.listTools(undefined, { signal, timeout: REQUEST_TIMEOUT_MS });
				return {
					content: [{ type: "text", text: json(result.tools.map((tool) => ({ name: tool.name, description: tool.description }))) }],
					details: { tools: result.tools.map((tool) => tool.name) },
				};
			} catch (error) {
				return err(error);
			} finally {
				await handle?.close().catch(() => undefined);
			}
		},
	});

	pi.registerTool({
		name: "lazyweb_health",
		label: "Lazyweb Health",
		description: "Check connectivity and service health for Lazyweb MCP",
		promptSnippet: "Check whether Lazyweb MCP is reachable before design research",
		parameters: Type.Object({}),
		async execute(_id, _params, signal) {
			try {
				return await callLazywebTool("lazyweb_health", {}, signal);
			} catch (error) {
				return err(error);
			}
		},
	});

	pi.registerTool({
		name: "lazyweb_search",
		label: "Lazyweb Search",
		description: "Search real product screenshots and UI references through Lazyweb MCP",
		promptSnippet: "Search real product screenshots for pricing pages, onboarding, dashboards, settings, and other UI patterns",
		promptGuidelines: [
			"Use lazyweb_search before designing pricing pages, onboarding flows, dashboards, settings screens, or other UI where real references matter.",
			"Use lazyweb_health first if Lazyweb connectivity has not been verified in the session.",
		],
		parameters: SearchParams,
		async execute(_id, params, signal) {
			try {
				return await callLazywebTool("lazyweb_search", params, signal);
			} catch (error) {
				return err(error);
			}
		},
	});

	pi.registerTool({
		name: "lazyweb_find_similar",
		label: "Lazyweb Find Similar",
		description: "Find Lazyweb screenshots similar to a known Lazyweb screenshot id",
		promptSnippet: "Find more UI references similar to an existing Lazyweb screenshot",
		parameters: FindSimilarParams,
		async execute(_id, params, signal) {
			try {
				return await callLazywebTool("lazyweb_find_similar", params, signal);
			} catch (error) {
				return err(error);
			}
		},
	});

	pi.registerTool({
		name: "lazyweb_compare_image",
		label: "Lazyweb Compare Image",
		description: "Find Lazyweb screenshots visually similar to an image URL or base64 image",
		promptSnippet: "Compare an existing UI screenshot against real product screenshots",
		parameters: CompareImageParams,
		async execute(_id, params, signal) {
			try {
				return await callLazywebTool("lazyweb_compare_image", params, signal);
			} catch (error) {
				return err(error);
			}
		},
	});
}
