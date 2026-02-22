// Re-export builders for convenience
export {
	AttachmentBuilder,
	EmbedBuilder,
	MessagePayload,
} from "@fluxer-selfbot/builders";
export { Collection } from "@fluxer-selfbot/collection";
// Re-export Routes, GatewayOpcodes, MessageAttachmentFlags for REST/gateway API calls
export {
	GatewayOpcodes,
	MessageAttachmentFlags,
	Routes,
} from "@fluxer-selfbot/types";
// Re-export Tenor URL resolver and mention parsers for embeds and moderation
// Re-export permission helpers for role/member permission checks
export {
	PermissionFlags,
	type PermissionResolvable,
	type PermissionString,
	PermissionsBitField,
	parsePrefixCommand,
	parseUserMention,
	resolvePermissionsToBitfield,
	resolveTenorToImageUrl,
	UserFlagsBitField,
	UserFlagsBits,
	type UserFlagsResolvable,
	type UserFlagsString,
} from "@fluxer-selfbot/util";
export { ChannelManager } from "./client/ChannelManager.js";
export {
	Client,
	type ClientEventMethods,
	type ClientEvents,
} from "./client/Client.js";
export { ClientUser } from "./client/ClientUser.js";
export { GuildMemberManager } from "./client/GuildMemberManager.js";
export { MessageManager } from "./client/MessageManager.js";
export {
	type FetchedUserWithProfile,
	UsersManager,
} from "./client/UsersManager.js";
export { ErrorCodes } from "./errors/ErrorCodes.js";
export { FluxerError, type FluxerErrorOptions } from "./errors/FluxerError.js";
export { Base } from "./structures/Base.js";
export {
	CategoryChannel,
	Channel,
	DMChannel,
	GuildChannel,
	LinkChannel,
	TextChannel,
	VoiceChannel,
} from "./structures/Channel.js";
export { Guild } from "./structures/Guild.js";
export { GuildBan } from "./structures/GuildBan.js";
export { GuildEmoji } from "./structures/GuildEmoji.js";
export { GuildMember } from "./structures/GuildMember.js";
export {
	GuildMemberRoleManager,
	type RoleResolvable,
} from "./structures/GuildMemberRoleManager.js";
export { GuildSticker } from "./structures/GuildSticker.js";
export { Invite } from "./structures/Invite.js";
export {
	Message,
	type MessageEditOptions,
	type MessageSendOptions,
} from "./structures/Message.js";
export { MessageReaction } from "./structures/MessageReaction.js";
export type { PartialMessage } from "./structures/PartialMessage.js";
export { Role } from "./structures/Role.js";
export { User } from "./structures/User.js";
export { Webhook, type WebhookSendOptions } from "./structures/Webhook.js";
// CDN URL helpers for avatars, banners, etc. (works with raw API data or User objects)
export { CDN_URL, STATIC_CDN_URL } from "./util/Constants.js";
export type { CdnUrlOptions } from "./util/cdn.js";
export {
	cdnAvatarURL,
	cdnBannerURL,
	cdnDefaultAvatarURL,
	cdnDisplayAvatarURL,
	cdnMemberAvatarURL,
	cdnMemberBannerURL,
} from "./util/cdn.js";
export { Events } from "./util/Events.js";
export {
	MessageCollector,
	type MessageCollectorEndReason,
	type MessageCollectorOptions,
} from "./util/MessageCollector.js";
export {
	type CollectedReaction,
	ReactionCollector,
	type ReactionCollectorEndReason,
	type ReactionCollectorOptions,
} from "./util/ReactionCollector.js";
