import { describe, expect, it } from "vitest";
import { Routes } from "./routes.js";

describe("Routes", () => {
	describe("channelMessageReaction", () => {
		it("encodes unicode emoji in URL", () => {
			const path = Routes.channelMessageReaction("123", "456", "❤");
			expect(path).toContain(encodeURIComponent("❤"));
			expect(path).toMatch(/reactions\/[^/]+\/?/);
		});

		it("encodes custom emoji name:id format", () => {
			const path = Routes.channelMessageReaction(
				"123",
				"456",
				"custom:123456789012345678",
			);
			expect(path).toContain(encodeURIComponent("custom:123456789012345678"));
		});

		it("does not double-encode already encoded input", () => {
			const encoded = encodeURIComponent("❤");
			const path = Routes.channelMessageReaction("123", "456", encoded);
			expect(path).toContain("%25E2%259D%25A4"); // double-encoded
		});
	});

	describe("channel", () => {
		it("builds channel path", () => {
			expect(Routes.channel("123456789012345678")).toBe(
				"/channels/123456789012345678",
			);
		});
	});

	describe("channelMessage", () => {
		it("builds message path", () => {
			expect(Routes.channelMessage("111", "222")).toBe(
				"/channels/111/messages/222",
			);
		});
	});

	describe("invite", () => {
		it("encodes invite code", () => {
			const path = Routes.invite("abc123");
			expect(path).toBe("/invites/abc123");
			expect(Routes.invite("code+with/special")).toContain(
				encodeURIComponent("code+with/special"),
			);
		});
	});

	describe("guild routes", () => {
		it("guild builds path", () => {
			expect(Routes.guild("123456789012345678")).toBe(
				"/guilds/123456789012345678",
			);
		});
		it("guildChannels builds path", () => {
			expect(Routes.guildChannels("123")).toBe("/guilds/123/channels");
		});
		it("guildMember builds path", () => {
			expect(Routes.guildMember("g1", "u1")).toBe("/guilds/g1/members/u1");
		});
		it("guildMemberRole builds path", () => {
			expect(Routes.guildMemberRole("g1", "u1", "r1")).toBe(
				"/guilds/g1/members/u1/roles/r1",
			);
		});
		it("guildBan builds path", () => {
			expect(Routes.guildBan("g1", "u1")).toBe("/guilds/g1/bans/u1");
		});
	});

	describe("webhook routes", () => {
		it("webhook builds path", () => {
			expect(Routes.webhook("123")).toBe("/webhooks/123");
		});
		it("webhookExecute builds path with token", () => {
			expect(Routes.webhookExecute("wid", "token123")).toBe(
				"/webhooks/wid/token123",
			);
		});
	});

	describe("application commands", () => {
		it("applicationCommands builds path", () => {
			expect(Routes.applicationCommands("app123")).toBe(
				"/applications/app123/commands",
			);
		});
		it("applicationCommand builds path", () => {
			expect(Routes.applicationCommand("app123", "cmd456")).toBe(
				"/applications/app123/commands/cmd456",
			);
		});
		it("interactionCallback builds path", () => {
			const path = Routes.interactionCallback("iid", "itoken");
			expect(path).toBe("/interactions/iid/itoken/callback");
		});
	});

	describe("user routes", () => {
		it("user builds path", () => {
			expect(Routes.user("123")).toBe("/users/123");
		});
		it("currentUser builds path", () => {
			expect(Routes.currentUser()).toBe("/users/@me");
		});
		it("userProfile without guild", () => {
			expect(Routes.userProfile("uid")).toBe("/users/uid/profile");
		});
		it("userProfile with guild", () => {
			expect(Routes.userProfile("uid", "gid")).toBe(
				"/users/uid/profile?guild_id=gid",
			);
		});
	});

	describe("gateway and instance", () => {
		it("gatewayBot builds path", () => {
			expect(Routes.gatewayBot()).toBe("/gateway/bot");
		});
		it("instance builds path", () => {
			expect(Routes.instance()).toBe("/instance");
		});
	});

	describe("stream preview", () => {
		it("encodes stream key", () => {
			const path = Routes.streamPreview("key+with/special");
			expect(path).toContain("/streams/");
			expect(path).toContain(encodeURIComponent("key+with/special"));
		});
	});

	describe("channel routes", () => {
		it("channelMessages builds path", () => {
			expect(Routes.channelMessages("c1")).toBe("/channels/c1/messages");
		});
		it("channelBulkDelete builds path", () => {
			expect(Routes.channelBulkDelete("c1")).toBe(
				"/channels/c1/messages/bulk-delete",
			);
		});
		it("channelTyping builds path", () => {
			expect(Routes.channelTyping("c1")).toBe("/channels/c1/typing");
		});
		it("channelPins builds path", () => {
			expect(Routes.channelPins("c1")).toBe("/channels/c1/messages/pins");
		});
		it("channelPinMessage builds path", () => {
			expect(Routes.channelPinMessage("c1", "m1")).toBe("/channels/c1/pins/m1");
		});
		it("channelPermission builds path", () => {
			expect(Routes.channelPermission("c1", "o1")).toBe(
				"/channels/c1/permissions/o1",
			);
		});
	});

	describe("oauth2 routes", () => {
		it("oauth2ApplicationBot builds path", () => {
			expect(Routes.oauth2ApplicationBot("app1")).toBe(
				"/oauth2/applications/app1/bot",
			);
		});
		it("oauth2ApplicationBotResetToken builds path", () => {
			expect(Routes.oauth2ApplicationBotResetToken("app1")).toBe(
				"/oauth2/applications/app1/bot/reset-token",
			);
		});
	});

	describe("user routes extended", () => {
		it("leaveGuild builds path", () => {
			expect(Routes.leaveGuild("g1")).toBe("/users/@me/guilds/g1");
		});
		it("userMeChannels builds path", () => {
			expect(Routes.userMeChannels()).toBe("/users/@me/channels");
		});
		it("currentUserGuilds builds path", () => {
			expect(Routes.currentUserGuilds()).toBe("/users/@me/guilds");
		});
	});
});
