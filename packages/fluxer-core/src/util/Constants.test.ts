import { describe, expect, it } from "vitest";
import { CDN_URL, DEFAULT_USER_AGENT, STATIC_CDN_URL } from "./Constants.js";

describe("Constants", () => {
	it("CDN_URL points to fluxerusercontent", () => {
		expect(CDN_URL).toBe("https://fluxerusercontent.com");
	});

	it("STATIC_CDN_URL points to fluxerstatic", () => {
		expect(STATIC_CDN_URL).toBe("https://fluxerstatic.com");
	});

	it("DEFAULT_USER_AGENT is fluxerjs", () => {
		expect(DEFAULT_USER_AGENT).toBe("fluxerjs");
	});
});
