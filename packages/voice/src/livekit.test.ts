import { describe, expect, it } from "vitest";
import { buildLiveKitUrlForRtcSdk, isLiveKitEndpoint } from "./livekit.js";

describe("isLiveKitEndpoint", () => {
	it("returns false for null, undefined, empty", () => {
		expect(isLiveKitEndpoint(null)).toBe(false);
		expect(isLiveKitEndpoint(undefined)).toBe(false);
		expect(isLiveKitEndpoint("")).toBe(false);
	});

	it("returns true when access_token in URL", () => {
		expect(
			isLiveKitEndpoint("https://ferret.fluxer.media?access_token=abc"),
		).toBe(true);
	});

	it("returns true when /rtc and query params", () => {
		expect(isLiveKitEndpoint("wss://host/rtc?token=xyz")).toBe(true);
	});

	it("returns true when token provided and endpoint has no query", () => {
		expect(isLiveKitEndpoint("ferret.iad.fluxer.media", "token123")).toBe(true);
	});

	it("returns false for plain host without token", () => {
		expect(isLiveKitEndpoint("ferret.iad.fluxer.media")).toBe(false);
	});
});

describe("buildLiveKitUrlForRtcSdk", () => {
	it("strips scheme and path, keeps host", () => {
		const url = buildLiveKitUrlForRtcSdk("wss://ferret.fluxer.media/rtc");
		expect(url).toMatch(/wss:\/\/ferret\.fluxer\.media/);
	});

	it("uses wss when endpoint has wss", () => {
		const url = buildLiveKitUrlForRtcSdk("wss://host.com");
		expect(url).toBe("wss://host.com");
	});

	it("uses ws when endpoint has ws", () => {
		const url = buildLiveKitUrlForRtcSdk("ws://host.com");
		expect(url).toBe("ws://host.com");
	});

	it("defaults to wss for host without scheme", () => {
		const url = buildLiveKitUrlForRtcSdk("host.example.com");
		expect(url).toContain("wss://");
	});
});
