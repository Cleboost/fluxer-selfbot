import { EventEmitter } from "node:events";
import { Events } from "@fluxer-selfbot/core";
import { describe, expect, it } from "vitest";
import { VoiceManager } from "./VoiceManager.js";

/** Minimal Client mock - VoiceManager only needs .on() for voice events. */
function createMockClient(): EventEmitter & { user?: { id: string } } {
	const client = new EventEmitter() as EventEmitter & { user?: { id: string } };
	return client;
}

describe("VoiceManager", () => {
	it("getVoiceChannelId returns null for unknown guild", () => {
		const client = createMockClient();
		const vm = new VoiceManager(client);
		expect(vm.getVoiceChannelId("guild1", "user1")).toBeNull();
	});

	it("getVoiceChannelId returns channel after VoiceStatesSync", () => {
		const client = createMockClient();
		const vm = new VoiceManager(client);
		client.emit(Events.VoiceStatesSync, {
			guildId: "guild1",
			voiceStates: [
				{ user_id: "user1", channel_id: "channel1" },
				{ user_id: "user2", channel_id: null },
			],
		});
		expect(vm.getVoiceChannelId("guild1", "user1")).toBe("channel1");
		expect(vm.getVoiceChannelId("guild1", "user2")).toBeNull();
		expect(vm.getVoiceChannelId("guild1", "user3")).toBeNull();
	});

	it("getVoiceChannelId returns null for user not in guild map", () => {
		const client = createMockClient();
		const vm = new VoiceManager(client);
		client.emit(Events.VoiceStatesSync, {
			guildId: "guild1",
			voiceStates: [{ user_id: "user1", channel_id: "channel1" }],
		});
		expect(vm.getVoiceChannelId("guild1", "user2")).toBeNull();
		expect(vm.getVoiceChannelId("guild2", "user1")).toBeNull();
	});
});
