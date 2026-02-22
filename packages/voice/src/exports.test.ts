import { describe, expect, it } from "vitest";
import {
	getVoiceManager,
	LiveKitRtcConnection,
	VoiceConnection,
	VoiceManager,
} from "./index.js";

describe("@fluxer-selfbot/voice exports", () => {
	it("exports VoiceManager class", () => {
		expect(VoiceManager).toBeDefined();
		expect(typeof VoiceManager).toBe("function");
	});

	it("exports VoiceConnection class", () => {
		expect(VoiceConnection).toBeDefined();
		expect(typeof VoiceConnection).toBe("function");
	});

	it("exports LiveKitRtcConnection class", () => {
		expect(LiveKitRtcConnection).toBeDefined();
		expect(typeof LiveKitRtcConnection).toBe("function");
	});

	it("exports getVoiceManager function", () => {
		expect(getVoiceManager).toBeDefined();
		expect(typeof getVoiceManager).toBe("function");
	});

	it("getVoiceManager returns VoiceManager for mock client", () => {
		const mockClient = { on: () => {} };
		const manager = getVoiceManager(mockClient);
		expect(manager).toBeInstanceOf(VoiceManager);
		expect(typeof manager.join).toBe("function");
	});

	it("getVoiceManager returns same instance for same client", () => {
		const mockClient = { on: () => {} };
		const m1 = getVoiceManager(mockClient);
		const m2 = getVoiceManager(mockClient);
		expect(m1).toBe(m2);
	});
});
