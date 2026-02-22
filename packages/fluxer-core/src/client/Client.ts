import { EventEmitter } from "node:events";
import { REST } from "@fluxer-selfbot/rest";
import {
	type APIApplicationCommandInteraction,
	type APIChannel,
	type APIEmbed,
	type APIGuild,
	type APIInstance,
	type APIUser,
	type APIUserPartial,
	type GatewayChannelPinsUpdateDispatchData,
	type GatewayGuildEmojisUpdateDispatchData,
	type GatewayGuildIntegrationsUpdateDispatchData,
	type GatewayGuildRoleCreateDispatchData,
	type GatewayGuildRoleDeleteDispatchData,
	type GatewayGuildRoleUpdateDispatchData,
	type GatewayGuildScheduledEventCreateDispatchData,
	type GatewayGuildScheduledEventDeleteDispatchData,
	type GatewayGuildScheduledEventUpdateDispatchData,
	type GatewayGuildStickersUpdateDispatchData,
	type GatewayInviteDeleteDispatchData,
	type GatewayMessageDeleteBulkDispatchData,
	type GatewayMessageReactionRemoveAllDispatchData,
	type GatewayMessageReactionRemoveEmojiDispatchData,
	type GatewayPresenceUpdateDispatchData,
	type GatewayReactionEmoji,
	type GatewayReceivePayload,
	type GatewaySendPayload,
	type GatewayTypingStartDispatchData,
	type GatewayUserUpdateDispatchData,
	type GatewayVoiceServerUpdateDispatchData,
	type GatewayVoiceStateUpdateDispatchData,
	type GatewayWebhooksUpdateDispatchData,
	Routes,
} from "@fluxer-selfbot/types";
import {
	emitDeprecationWarning,
	formatEmoji,
	getUnicodeFromShortcode,
	parseEmoji,
} from "@fluxer-selfbot/util";
import { WebSocketManager } from "@fluxer-selfbot/ws";
import { ErrorCodes } from "../errors/ErrorCodes.js";
import { FluxerError } from "../errors/FluxerError.js";
import { Channel, type GuildChannel } from "../structures/Channel.js";
import { Guild } from "../structures/Guild.js";
import type { GuildBan } from "../structures/GuildBan";
import type { GuildMember } from "../structures/GuildMember";
import type { Invite } from "../structures/Invite";
import { Message } from "../structures/Message";
import type { MessageReaction } from "../structures/MessageReaction";
import type { PartialMessage } from "../structures/PartialMessage";
import { User } from "../structures/User.js";
import { Events } from "../util/Events.js";
import { normalizeGuildPayload } from "../util/guildUtils";
import type { ClientOptions } from "../util/Options.js";
import { ChannelManager } from "./ChannelManager.js";
import { ClientUser } from "./ClientUser.js";
import { eventHandlers } from "./EventHandlerRegistry.js";
import { GuildManager } from "./GuildManager.js";
import { UsersManager } from "./UsersManager.js";

/**
 * Callback parameter types for client events. Use with client.on(Events.X, handler).
 * @see Events
 */
export interface ClientEvents {
	[Events.Ready]: [];
	[Events.MessageCreate]: [message: Message];
	[Events.MessageUpdate]: [oldMessage: Message | null, newMessage: Message];
	[Events.MessageDelete]: [message: PartialMessage];
	[Events.MessageReactionAdd]: [
		reaction: MessageReaction,
		user: User,
		messageId: string,
		channelId: string,
		emoji: GatewayReactionEmoji,
		userId: string,
	];
	[Events.MessageReactionRemove]: [
		reaction: MessageReaction,
		user: User,
		messageId: string,
		channelId: string,
		emoji: GatewayReactionEmoji,
		userId: string,
	];
	[Events.MessageReactionRemoveAll]: [
		data: GatewayMessageReactionRemoveAllDispatchData,
	];
	[Events.MessageReactionRemoveEmoji]: [
		data: GatewayMessageReactionRemoveEmojiDispatchData,
	];
	[Events.InteractionCreate]: [interaction: APIApplicationCommandInteraction];
	[Events.GuildCreate]: [guild: Guild];
	[Events.GuildUpdate]: [oldGuild: Guild, newGuild: Guild];
	[Events.GuildDelete]: [guild: Guild];
	[Events.ChannelCreate]: [channel: GuildChannel];
	[Events.ChannelUpdate]: [oldChannel: Channel, newChannel: Channel];
	[Events.ChannelDelete]: [channel: Channel];
	[Events.GuildMemberAdd]: [member: GuildMember];
	[Events.GuildMemberUpdate]: [oldMember: GuildMember, newMember: GuildMember];
	[Events.GuildMemberRemove]: [member: GuildMember];
	[Events.VoiceStateUpdate]: [data: GatewayVoiceStateUpdateDispatchData];
	[Events.VoiceServerUpdate]: [data: GatewayVoiceServerUpdateDispatchData];
	[Events.VoiceStatesSync]: [
		data: {
			guildId: string;
			voiceStates: Array<{ user_id: string; channel_id: string | null }>;
		},
	];
	[Events.MessageDeleteBulk]: [data: GatewayMessageDeleteBulkDispatchData];
	[Events.GuildBanAdd]: [ban: GuildBan];
	[Events.GuildBanRemove]: [ban: GuildBan];
	[Events.GuildEmojisUpdate]: [data: GatewayGuildEmojisUpdateDispatchData];
	[Events.GuildStickersUpdate]: [data: GatewayGuildStickersUpdateDispatchData];
	[Events.GuildIntegrationsUpdate]: [
		data: GatewayGuildIntegrationsUpdateDispatchData,
	];
	[Events.GuildRoleCreate]: [data: GatewayGuildRoleCreateDispatchData];
	[Events.GuildRoleUpdate]: [data: GatewayGuildRoleUpdateDispatchData];
	[Events.GuildRoleDelete]: [data: GatewayGuildRoleDeleteDispatchData];
	[Events.GuildScheduledEventCreate]: [
		data: GatewayGuildScheduledEventCreateDispatchData,
	];
	[Events.GuildScheduledEventUpdate]: [
		data: GatewayGuildScheduledEventUpdateDispatchData,
	];
	[Events.GuildScheduledEventDelete]: [
		data: GatewayGuildScheduledEventDeleteDispatchData,
	];
	[Events.ChannelPinsUpdate]: [data: GatewayChannelPinsUpdateDispatchData];
	[Events.InviteCreate]: [invite: Invite];
	[Events.InviteDelete]: [data: GatewayInviteDeleteDispatchData];
	[Events.TypingStart]: [data: GatewayTypingStartDispatchData];
	[Events.UserUpdate]: [data: GatewayUserUpdateDispatchData];
	[Events.PresenceUpdate]: [data: GatewayPresenceUpdateDispatchData];
	[Events.WebhooksUpdate]: [data: GatewayWebhooksUpdateDispatchData];
	[Events.Resumed]: [];
	[Events.Error]: [error: Error];
	[Events.Debug]: [message: string];
}

/** Typed event handler methods. Use client.events.MessageReactionAdd((reaction, user, messageId, channelId, emoji, userId) => {...}) or client.on(Events.MessageReactionAdd, ...). */
export type ClientEventMethods = {
	[K in keyof typeof Events]: (
		cb: (...args: ClientEvents[(typeof Events)[K]]) => void,
	) => Client;
};

function createEventMethods(client: Client): ClientEventMethods {
	const result: Record<string, (cb: (...args: unknown[]) => void) => Client> =
		{};
	for (const key of Object.keys(Events) as (keyof typeof Events)[]) {
		const eventName = Events[key];
		result[key] = (cb) => {
			client.on(eventName, cb as (...args: unknown[]) => void);
			return client;
		};
	}
	return result as ClientEventMethods;
}

/** Main Fluxer bot client. Connects to the gateway, emits events, and provides REST access. */
export interface Client extends EventEmitter {
	on<K extends keyof ClientEvents>(
		event: K,
		listener: (...args: ClientEvents[K]) => void,
	): this;
	on(event: string | symbol, listener: (...args: any[]) => void): this;

	once<K extends keyof ClientEvents>(
		event: K,
		listener: (...args: ClientEvents[K]) => void,
	): this;
	once(event: string | symbol, listener: (...args: any[]) => void): this;

	emit<K extends keyof ClientEvents>(
		event: K,
		...args: ClientEvents[K]
	): boolean;
	emit(event: string | symbol, ...args: any[]): boolean;

	off<K extends keyof ClientEvents>(
		event: K,
		listener: (...args: ClientEvents[K]) => void,
	): this;
	off(event: string | symbol, listener: (...args: any[]) => void): this;

	removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
	removeAllListeners(event?: string | symbol): this;
}

export class Client extends EventEmitter {
	readonly rest: REST;
	readonly guilds = new GuildManager(this);
	readonly channels = new ChannelManager(this);
	readonly users = new UsersManager(this);
	/** Typed event handlers. Use client.events.MessageReactionAdd((reaction, user, messageId, channelId, emoji, userId) => {...}) or client.on(Events.MessageReactionAdd, ...). */
	readonly events: ClientEventMethods;
	/** The authenticated bot user. Null until READY is received. */
	user: ClientUser | null = null;
	/** Timestamp when the client became ready. Null until READY is received. */
	readyAt: Date | null = null;
	private _ws: WebSocketManager | null = null;
	/** When waitForGuilds, set of guild IDs we're waiting for GUILD_CREATE on. Null when not waiting. */
	_pendingGuildIds: Set<string> | null = null;
	/** Whether the client is authenticated with a user token (empty prefix). */
	get isUserBot(): boolean {
		return (this.options.rest?.authPrefix ?? "") === "";
	}

	/** @param options - Token, REST config, WebSocket, presence, etc. */
	constructor(public readonly options: ClientOptions = {}) {
		super();
		this.events = createEventMethods(this);
		Object.defineProperty(this.channels, "cache", {
			get: () => this.channels,
			configurable: true,
		});
		Object.defineProperty(this.guilds, "cache", {
			get: () => this.guilds,
			configurable: true,
		});
		Object.defineProperty(this.users, "cache", {
			get: () => this.users,
			configurable: true,
		});
		this.rest = new REST({
			api: options.rest?.api ?? "https://api.fluxer.app",
			version: options.rest?.version ?? "1",
			...options.rest,
		});
	}

	/**
	 * Resolve an emoji argument to the API format (unicode or "name:id").
	 * Supports: <:name:id>, :name:, name:id, { name, id }, unicode.
	 * When id is missing (e.g. :name:), fetches guild emojis if guildId provided.
	 * When reacting in a guild channel, custom emojis must be from that guild.
	 * @param emoji - Emoji string or object
	 * @param guildId - Guild ID for resolving custom emoji by name (required when id is missing)
	 * @returns API-formatted string for reactions
	 */
	async resolveEmoji(
		emoji: string | { name: string; id?: string; animated?: boolean },
		guildId?: string | null,
	): Promise<string> {
		if (typeof emoji === "object" && emoji.id) {
			if (guildId) {
				await this.assertEmojiInGuild(emoji.id, guildId);
			}
			return formatEmoji({
				name: emoji.name,
				id: emoji.id as string,
				animated: emoji.animated,
			});
		}
		const parsed = parseEmoji(
			typeof emoji === "string"
				? emoji
				: emoji.id
					? `:${emoji.name}:`
					: emoji.name,
		);
		if (!parsed) throw new Error("Invalid emoji");
		if (parsed.id) {
			if (guildId) {
				await this.assertEmojiInGuild(parsed.id, guildId);
			}
			return formatEmoji(parsed);
		}
		// Unicode emoji: name has non-ASCII or isn't a custom shortcode — return raw, route will encode
		if (!/^\w+$/.test(parsed.name)) return parsed.name;
		// Known Unicode shortcode (e.g. :red_square:, :light_blue_heart:) — resolve and return raw unicode
		const unicodeFromShortcode = getUnicodeFromShortcode(parsed.name);
		if (unicodeFromShortcode) return unicodeFromShortcode;
		if (guildId) {
			const emojis = await this.rest.get(Routes.guildEmojis(guildId));
			const list = (
				Array.isArray(emojis) ? emojis : Object.values(emojis ?? {})
			) as Array<{
				id: string;
				name?: string;
				animated?: boolean;
			}>;
			const found = list.find(
				(e) => e.name && e.name.toLowerCase() === parsed?.name.toLowerCase(),
			);
			if (found)
				return formatEmoji({
					...parsed,
					id: found.id,
					animated: found.animated,
				});
			throw new Error(
				`Custom emoji ":${parsed.name}:" not found in guild. Use name:id or <:name:id> format.`,
			);
		}
		if (/^\w+$/.test(parsed.name)) {
			throw new Error(
				`Custom emoji ":${parsed.name}:" requires guild context. Use message.react() in a guild channel, or pass guildId to client.resolveEmoji().`,
			);
		}
		return parsed.name;
	}

	/**
	 * Asserts that a custom emoji (by id) belongs to the given guild.
	 * Used when reacting in guild channels to reject emojis from other servers.
	 * @throws FluxerError with EMOJI_NOT_IN_GUILD if the emoji is not in the guild
	 */
	private async assertEmojiInGuild(
		emojiId: string,
		guildId: string,
	): Promise<void> {
		const emojis = await this.rest.get(Routes.guildEmojis(guildId));
		const list = (
			Array.isArray(emojis) ? emojis : Object.values(emojis ?? {})
		) as Array<{
			id: string;
		}>;
		const found = list.some((e) => e.id === emojiId);
		if (!found) {
			throw new FluxerError(
				"Custom emoji is from another server. Use an emoji from this server.",
				{
					code: ErrorCodes.EmojiNotInGuild,
				},
			);
		}
	}

	/**
	 * Fetch instance info (API URL, gateway URL, features). GET /instance.
	 * Does not require authentication.
	 */
	async fetchInstance(): Promise<APIInstance> {
		return this.rest.get<APIInstance>(Routes.instance(), { auth: false });
	}

	/**
	 * Fetch a message by channel and message ID. Use when you have IDs (e.g. from a DB).
	 * @param channelId - Snowflake of the channel
	 * @param messageId - Snowflake of the message
	 * @returns The message
	 * @throws FluxerError with MESSAGE_NOT_FOUND if the message does not exist
	 * @deprecated Use channel.messages.fetch(messageId). For IDs-only: (await client.channels.resolve(channelId))?.messages?.fetch(messageId)
	 * @example
	 * const channel = await client.channels.resolve(channelId);
	 * const message = await channel?.messages?.fetch(messageId);
	 */
	async fetchMessage(channelId: string, messageId: string): Promise<Message> {
		emitDeprecationWarning(
			"Client.fetchMessage()",
			"Use channel.messages.fetch(messageId). For IDs-only: (await client.channels.resolve(channelId))?.messages?.fetch(messageId)",
		);
		return this.channels.fetchMessage(channelId, messageId);
	}

	/**
	 * Send a message to any channel by ID. Shorthand for client.channels.send().
	 * Works even when the channel is not cached.
	 */
	async sendToChannel(
		channelId: string,
		content: string | { content?: string; embeds?: APIEmbed[] },
	): Promise<Message> {
		const payload = await Message._createMessageBody(content);
		return this.channels.send(channelId, payload);
	}

	/**
	 * Get or create a User from API data. Caches in client.users.
	 * Updates existing user's username, avatar, etc. when fresh data is provided.
	 */
	getOrCreateUser(data: APIUserPartial): User {
		const existing = this.users.get(data.id);
		if (existing) {
			existing._patch(data);
			return existing;
		}
		const user = new User(this, data);
		this.users.set(user.id, user);
		return user;
	}

	/** WebSocket manager. Throws if not logged in. */
	get ws(): WebSocketManager {
		if (!this._ws) throw new Error("Client is not logged in");
		return this._ws;
	}

	/**
	 * Send a payload to the gateway (e.g. Voice State Update).
	 * @param shardId - Shard ID (use 0 for single-shard)
	 * @param payload - Gateway payload to send
	 */
	sendToGateway(shardId: number, payload: GatewaySendPayload): void {
		this.ws.send(shardId, payload);
	}

	private async handleDispatch(payload: GatewayReceivePayload): Promise<void> {
		if (payload.op !== 0 || !payload.t) return;
		const { t: event, d } = payload;
		try {
			const handler = eventHandlers.get(event);
			if (handler) await handler(this, d);
		} catch (err) {
			this.emit(
				Events.Error,
				err instanceof Error ? err : new Error(String(err)),
			);
		}
	}

	/**
	 * Connect to the Fluxer gateway and authenticate.
	 * @param token - Bot token (e.g. from FLUXER_BOT_TOKEN)
	 */
	async login(token: string): Promise<string> {
		if (this._ws) {
			throw new FluxerError(
				"Client is already logged in. Call destroy() first.",
				{
					code: ErrorCodes.AlreadyLoggedIn,
				},
			);
		}
		this.rest.setToken(token);
		let intents = this.options.intents ?? 0;
		if (intents !== 0) {
			if (!this.options.suppressIntentWarning) {
				if (typeof process !== "undefined" && process.emitWarning) {
					process.emitWarning(
						"Fluxer does not support intents yet. Value has been set to 0.",
						{
							type: "FluxerIntents",
						},
					);
				} else {
					console.warn(
						"Fluxer does not support intents yet. Value has been set to 0.",
					);
				}
			}
			intents = 0;
		}
		this._ws = new WebSocketManager({
			token,
			intents,
			presence: this.options.presence,
			properties: this.options.properties,
			isUserBot: (this.options.rest?.authPrefix ?? "") === "",
			rest: { get: (route: string) => this.rest.get(route) },
			version: this.options.rest?.version ?? "1",
			WebSocket: this.options.WebSocket,
		});
		this._ws.on(
			"dispatch",
			({ payload }: { payload: GatewayReceivePayload }) => {
				this.handleDispatch(payload).catch((err: unknown) =>
					this.emit(
						Events.Error,
						err instanceof Error ? err : new Error(String(err)),
					),
				);
			},
		);
		this._ws.on(
			"ready",
			async ({
				data,
			}: {
				data: {
					user: APIUser;
					guilds: Array<APIGuild & { unavailable?: boolean }>;
				};
			}) => {
				this.user = new ClientUser(this, data.user);
				const waitForGuilds = this.options.waitForGuilds === true;
				const pending = waitForGuilds ? new Set<string>() : null;
				for (const g of data.guilds ?? []) {
					if (g.unavailable === true) {
						if (pending !== null && g.id) pending.add(g.id);
						continue;
					}
					const guildData = normalizeGuildPayload(g as unknown);
					if (!guildData) continue;
					const guild = new Guild(this, guildData);
					this.guilds.set(guild.id, guild);
					const withCh = g as APIGuild & {
						channels?: APIChannel[];
						voice_states?: Array<{
							user_id: string;
							channel_id: string | null;
						}>;
					};
					for (const ch of withCh.channels ?? []) {
						const channel = Channel.from(this, ch);
						if (channel) {
							this.channels.set(channel.id, channel);
							guild.channels.set(channel.id, channel as GuildChannel);
						}
					}
					if (withCh.voice_states?.length) {
						this.emit(Events.VoiceStatesSync, {
							guildId: guild.id,
							voiceStates: withCh.voice_states,
						});
					}
				}
				if (pending !== null && pending.size > 0) {
					this._pendingGuildIds = pending;
					return;
				}
				this._finalizeReady();
			},
		);
		this._ws.on("error", ({ error }: { error: Error }) =>
			this.emit(Events.Error, error),
		);
		this._ws.on("debug", (msg: string) => this.emit(Events.Debug, msg));
		await this._ws.connect();
		return token;
	}

	/**
	 * Called when all guilds have been received (or immediately if not waiting).
	 * Sets readyAt, emits Ready, clears pending state.
	 */
	_finalizeReady(): void {
		this._pendingGuildIds = null;
		this.readyAt = new Date();
		this.emit(Events.Ready);
	}

	/**
	 * Called by GUILD_CREATE handler when waitForGuilds is enabled.
	 * Removes guild from pending set; when empty, finalizes ready.
	 */
	_onGuildReceived(guildId: string): void {
		const pending = this._pendingGuildIds;
		if (pending === null) return;
		pending.delete(guildId);
		if (pending.size === 0) this._finalizeReady();
	}

	/** Disconnect from the gateway and clear cached data. */
	async destroy(): Promise<void> {
		if (this._ws) {
			this._ws.destroy();
			this._ws = null;
		}
		this.rest.setToken(null);
		this.user = null;
		this.readyAt = null;
		this._pendingGuildIds = null;
		this.guilds.clear();
		this.channels.clear();
		this.users.clear();
	}

	/** Returns true if the client has received Ready and `user` is set. */
	isReady(): this is Client & { user: NonNullable<Client["user"]> } {
		return this.readyAt !== null && this.user !== null;
	}

	/**
	 * Throws if the client is not ready. Use before accessing client.user or other post-ready state.
	 * @throws FluxerError with CLIENT_NOT_READY if client has not received Ready yet
	 */
	assertReady(): asserts this is Client & {
		user: NonNullable<Client["user"]>;
	} {
		if (!this.isReady()) {
			throw new FluxerError(
				"Client is not ready yet. Wait for the Ready event before accessing client.user.",
				{
					code: ErrorCodes.ClientNotReady,
				},
			);
		}
	}

	static get Routes(): typeof Routes {
		return Routes;
	}
}
