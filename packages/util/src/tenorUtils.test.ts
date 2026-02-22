import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveTenorToImageUrl } from "./tenorUtils.js";

describe("resolveTenorToImageUrl", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn((url: string) => {
				if (url.includes("tenor.com/view")) {
					const html = `<html><script class="dynamic" type="application/ld+json">
            {"@type":"VideoObject","contentUrl":"https://media.tenor.com/abc123/stressed.gif","thumbnailUrl":"https://media.tenor.com/abc123/stressed.png"}
          </script></html>`;
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(html),
					} as Response);
				}
				if (url.includes("oembed")) {
					return Promise.resolve({
						ok: true,
						json: () =>
							Promise.resolve({
								thumbnail_url: "https://media.tenor.com/xyz/stressed.png",
							}),
					} as Response);
				}
				return Promise.reject(new Error("Unexpected URL"));
			}),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns null for empty or non-tenor URL", async () => {
		expect(await resolveTenorToImageUrl("")).toBeNull();
		expect(await resolveTenorToImageUrl("https://example.com")).toBeNull();
		expect(
			await resolveTenorToImageUrl("https://giphy.com/view/123"),
		).toBeNull();
	});

	it("resolves GIF URL from tenor view page JSON-LD", async () => {
		const result = await resolveTenorToImageUrl(
			"https://tenor.com/view/stressed-gif-7048057395502071840",
		);
		expect(result).not.toBeNull();
		expect(result?.url).toContain(".gif");
		expect(result?.url).toContain("media.tenor.com");
	});

	it("falls back to oEmbed when page fetch fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn((url: string) => {
				if (url.includes("tenor.com/view")) {
					return Promise.resolve({ ok: false });
				}
				if (url.includes("oembed")) {
					return Promise.resolve({
						ok: true,
						json: () =>
							Promise.resolve({
								thumbnail_url: "https://media.tenor.com/fallback/image.png",
							}),
					} as Response);
				}
				return Promise.reject(new Error("Unexpected"));
			}),
		);
		const result = await resolveTenorToImageUrl(
			"https://tenor.com/view/test-123",
		);
		expect(result).not.toBeNull();
		expect(result?.url).toContain("media.tenor.com");
		expect(result?.url).toContain(".gif");
	});
});
