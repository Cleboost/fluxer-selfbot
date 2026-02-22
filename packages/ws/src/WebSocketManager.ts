import { EventEmitter } from "node:events";
import {
	type APIGatewayBotResponse,
	type GatewayPresenceUpdateData,
	Routes,
} from "@fluxer-selfbot/types";
import { getDefaultWebSocket } from "./utils/getWebSocket.js";
import type { WebSocketConstructor as WSConstructor } from "./WebSocketShard";
import { WebSocketShard } from "./WebSocketShard.js";

export type WebSocketConstructor = WSConstructor;

const RETRY_INITIAL_MS = 1000;
const RETRY_MAX_MS = 45000;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface WebSocketManagerOptions {
	token: string;
	intents: number;
	rest: { get: (route: string) => Promise<unknown> };
	version?: string;
	isUserBot?: boolean;
	presence?: GatewayPresenceUpdateData;
	properties?: { os: string; browser: string; device: string };
	shardIds?: number[];
	shardCount?: number;
	WebSocket?: WebSocketConstructor;
}

export class WebSocketManager extends EventEmitter {
	private readonly options: WebSocketManagerOptions;
	private shards = new Map<number, WebSocketShard>();
	private gatewayUrl: string | null = null;
	private shardCount = 1;
	private _aborted = false;

	constructor(options: WebSocketManagerOptions) {
		super();
		this.options = options;
	}

	async connect(): Promise<void> {
		this._aborted = false;

		let WS = this.options.WebSocket;
		let delayMs = RETRY_INITIAL_MS;

		if (!WS) {
			while (!this._aborted) {
				try {
					WS = await getDefaultWebSocket();
					break;
				} catch (err) {
					const e = err instanceof Error ? err : new Error(String(err));
					this.emit("error", { shardId: -1, error: e });
					await sleep(delayMs);
					delayMs = Math.min(RETRY_MAX_MS, Math.floor(delayMs * 1.5));
				}
			}
			if (this._aborted) throw new Error("Connection aborted");
			if (!WS) throw new Error("Failed to load WebSocket");
		}

		let gateway: APIGatewayBotResponse | null = null;

		if (this.options.isUserBot) {
			gateway = {
				url: "wss://gateway.fluxer.app",
				shards: 1,
				session_start_limit: {
					total: 1,
					remaining: 1,
					reset_after: 0,
					max_concurrency: 1,
				},
			};
		} else {
			while (!this._aborted) {
				try {
					gateway = (await this.options.rest.get(
						Routes.gatewayBot(),
					)) as APIGatewayBotResponse;
					break;
				} catch (err) {
					const e = err instanceof Error ? err : new Error(String(err));
					this.emit("error", { shardId: -1, error: e });
					await sleep(delayMs);
					delayMs = Math.min(RETRY_MAX_MS, Math.floor(delayMs * 1.5));
				}
			}
		}

		if (this._aborted) throw new Error("Connection aborted");
		if (!gateway) throw new Error("Failed to fetch gateway");

		this.gatewayUrl = gateway.url;
		this.shardCount = this.options.shardCount ?? gateway.shards ?? 1;

		const ids = this.options.shardIds ?? [...Array(this.shardCount).keys()];

		const version = this.options.version ?? "1";

		for (const id of ids) {
			const shard = new WebSocketShard({
				url: this.gatewayUrl ?? gateway.url,
				token: this.options.token,
				intents: this.options.intents,
				presence: this.options.presence,
				properties: this.options.properties,
				shardId: id,
				numShards: this.shardCount,
				version,
				WebSocket: WS,
			});

			shard.on("ready", (data) => this.emit("ready", { shardId: id, data }));
			shard.on("resumed", () => this.emit("resumed", id));
			shard.on("dispatch", (payload) =>
				this.emit("dispatch", { shardId: id, payload }),
			);
			shard.on("close", (code) => this.emit("close", { shardId: id, code }));
			shard.on("error", (err) =>
				this.emit("error", { shardId: id, error: err }),
			);
			shard.on("debug", (msg) => this.emit("debug", msg));

			this.shards.set(id, shard);
			try {
				shard.connect();
			} catch (err) {
				this.emit("error", {
					shardId: id,
					error: err instanceof Error ? err : new Error(String(err)),
				});
			}
		}
	}

	send(shardId: number, payload: Parameters<WebSocketShard["send"]>[0]): void {
		this.shards.get(shardId)?.send(payload);
	}

	destroy(): void {
		this._aborted = true;
		for (const shard of this.shards.values()) shard.destroy();
		this.shards.clear();
		this.gatewayUrl = null;
	}

	getShardCount(): number {
		return this.shardCount;
	}
}
