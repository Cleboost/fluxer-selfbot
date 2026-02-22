import { describe, expect, it } from "vitest";
import { parseOpusPacketBoundaries } from "./opusUtils.js";

describe("parseOpusPacketBoundaries", () => {
	it("returns null for buffer shorter than 2 bytes", () => {
		expect(parseOpusPacketBoundaries(new Uint8Array([]))).toBeNull();
		expect(parseOpusPacketBoundaries(new Uint8Array([0]))).toBeNull();
	});

	it("returns single frame for c=0 (one frame)", () => {
		const buf = new Uint8Array([0x78, 0x01, 0x02, 0x03]); // c=0
		const result = parseOpusPacketBoundaries(buf);
		expect(result).not.toBeNull();
		expect(result?.frames).toHaveLength(1);
		expect(result?.consumed).toBe(4);
	});

	it("returns null for c=1 when not enough data", () => {
		const buf = new Uint8Array([0x79, 0x05]); // c=1, L1=5, need 2+5+1=8 min
		expect(parseOpusPacketBoundaries(buf)).toBeNull();
	});

	it("handles c=2 (two frames CBR)", () => {
		const buf = new Uint8Array([0x7a, 0x00, 0x01, 0x02, 0x03, 0x04]); // c=2, 4 bytes data -> 2 per frame
		const result = parseOpusPacketBoundaries(buf);
		expect(result).not.toBeNull();
		expect(result?.frames).toHaveLength(2);
	});
});
