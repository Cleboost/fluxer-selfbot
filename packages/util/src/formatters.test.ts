import { describe, expect, it } from "vitest";
import {
	escapeMarkdown,
	formatColor,
	formatTimestamp,
	truncate,
} from "./formatters.js";

describe("formatColor", () => {
	it("formats color as hex", () => {
		expect(formatColor(0xff0000)).toBe("#ff0000");
		expect(formatColor(0)).toBe("#000000");
		expect(formatColor(0xffffff)).toBe("#ffffff");
	});
});

describe("escapeMarkdown", () => {
	it("escapes markdown characters", () => {
		expect(escapeMarkdown("*bold*")).toBe("\\*bold\\*");
		expect(escapeMarkdown("_italic_")).toBe("\\_italic\\_");
	});
});

describe("formatTimestamp", () => {
	it("formats timestamp", () => {
		const ts = 1609459200000; // 2021-01-01 00:00:00 UTC
		expect(formatTimestamp(ts)).toBe("<t:1609459200>");
		expect(formatTimestamp(ts, "R")).toBe("<t:1609459200:R>");
	});
});

describe("truncate", () => {
	it("returns unchanged if under limit", () => {
		expect(truncate("hello", 10)).toBe("hello");
	});

	it("truncates with suffix", () => {
		expect(truncate("hello world", 8)).toBe("hello...");
	});

	it("uses custom suffix", () => {
		expect(truncate("hello world", 9, "..")).toBe("hello w..");
	});

	it("handles exact length", () => {
		expect(truncate("hello", 5)).toBe("hello");
	});

	it("handles length smaller than suffix", () => {
		expect(truncate("hi", 1, "...")).toBe("...");
	});
});

describe("escapeMarkdown edge cases", () => {
	it("escapes backtick", () => {
		expect(escapeMarkdown("`code`")).toBe("\\`code\\`");
	});
	it("escapes pipe", () => {
		expect(escapeMarkdown("a|b")).toBe("a\\|b");
	});
	it("escapes tilde", () => {
		expect(escapeMarkdown("~strikethrough~")).toBe("\\~strikethrough\\~");
	});
});

describe("formatColor edge cases", () => {
	it("pads short hex", () => {
		expect(formatColor(0x000001)).toBe("#000001");
	});
});
