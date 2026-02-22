import { describe, expect, it } from "vitest";
import { thumbnail } from "./streamPreviewPlaceholder.js";

describe("streamPreviewPlaceholder", () => {
	it("exports valid base64 string", () => {
		expect(typeof thumbnail).toBe("string");
		expect(thumbnail.length).toBeGreaterThan(0);
	});

	it("decodes to valid PNG header", () => {
		const decoded = Buffer.from(thumbnail, "base64");
		expect(decoded[0]).toBe(0x89);
		expect(decoded[1]).toBe(0x50);
		expect(decoded[2]).toBe(0x4e);
	});
});
