import { describe, expect, it } from "vitest";
import {
	formatEmoji,
	parseEmoji,
	parsePrefixCommand,
	parseRoleMention,
	parseUserMention,
	resolveColor,
} from "./resolvers.js";

describe("parseEmoji", () => {
	it("returns null for null/undefined/non-string", () => {
		expect(parseEmoji(null as unknown as string)).toBeNull();
		expect(parseEmoji(undefined as unknown as string)).toBeNull();
		expect(parseEmoji(123 as unknown as string)).toBeNull();
	});

	it("returns null for empty or whitespace-only string", () => {
		expect(parseEmoji("")).toBeNull();
		expect(parseEmoji("   ")).toBeNull();
	});

	it("parses <:name:id> mention format", () => {
		const r = parseEmoji("<:custom:123456789012345678>");
		expect(r).toEqual({
			id: "123456789012345678",
			name: "custom",
			animated: false,
		});
	});

	it("parses <a:name:id> animated mention format", () => {
		const r = parseEmoji("<a:wiggle:987654321098765432>");
		expect(r).toEqual({
			id: "987654321098765432",
			name: "wiggle",
			animated: true,
		});
	});

	it("parses name:id API format", () => {
		const r = parseEmoji("CustomEmoji:123456789012345678");
		expect(r).toEqual({ id: "123456789012345678", name: "CustomEmoji" });
	});

	it("parses :name: shortcode format (unicode or guild lookup)", () => {
		const r = parseEmoji(":heart:");
		expect(r).toEqual({ id: null, name: "heart" });
	});

	it("parses :name: with surrounding whitespace", () => {
		const r = parseEmoji("  :heart:  ");
		expect(r).toEqual({ id: null, name: "heart" });
	});

	it("returns plain unicode as name when no pattern matches", () => {
		const r = parseEmoji("❤️");
		expect(r).toEqual({ id: null, name: "❤️" });
	});

	it("rejects name:id with short id (less than 17 digits)", () => {
		const r = parseEmoji("emoji:123456");
		expect(r?.id).toBeNull();
		expect(r?.name).toBe("emoji:123456"); // falls through to plain
	});
});

describe("formatEmoji", () => {
	it("formats custom emoji as name:id", () => {
		expect(formatEmoji({ id: "123456789012345678", name: "custom" })).toBe(
			":custom:123456789012345678",
		);
	});

	it("formats animated custom emoji with a prefix", () => {
		expect(
			formatEmoji({ id: "123456789012345678", name: "wiggle", animated: true }),
		).toBe("a:wiggle:123456789012345678");
	});

	it("encodes unicode emoji for API (id null)", () => {
		const r = formatEmoji({ id: null, name: "❤" });
		expect(r).toBe(encodeURIComponent("❤"));
	});
});

describe("parseUserMention", () => {
	it("extracts user ID from <@id> mention", () => {
		expect(parseUserMention("<@123456789012345678>")).toBe(
			"123456789012345678",
		);
	});

	it("extracts user ID from <@!id> mention", () => {
		expect(parseUserMention("<@!123456789012345678>")).toBe(
			"123456789012345678",
		);
	});

	it("returns raw snowflake when valid 17–19 digits", () => {
		expect(parseUserMention("123456789012345678")).toBe("123456789012345678");
	});

	it("returns null for invalid formats", () => {
		expect(parseUserMention("<@&123>")).toBeNull();
		expect(parseUserMention("invalid")).toBeNull();
		expect(parseUserMention("")).toBeNull();
	});

	it("trims whitespace", () => {
		expect(parseUserMention("  <@!123456789012345678>  ")).toBe(
			"123456789012345678",
		);
	});
});

describe("parsePrefixCommand", () => {
	it("parses command with no args", () => {
		expect(parsePrefixCommand("!ping", "!")).toEqual({
			command: "ping",
			args: [],
		});
	});

	it("parses command with args", () => {
		expect(parsePrefixCommand("!hello world", "!")).toEqual({
			command: "hello",
			args: ["world"],
		});
		expect(parsePrefixCommand("!ban 123 reason here", "!")).toEqual({
			command: "ban",
			args: ["123", "reason", "here"],
		});
	});

	it("returns null when content does not start with prefix", () => {
		expect(parsePrefixCommand("hello", "!")).toBeNull();
	});

	it("returns null for prefix only with no command", () => {
		expect(parsePrefixCommand("!", "!")).toBeNull();
		expect(parsePrefixCommand("!  ", "!")).toBeNull();
	});

	it("handles multiple spaces between args", () => {
		expect(parsePrefixCommand("!cmd   a   b", "!")).toEqual({
			command: "cmd",
			args: ["a", "b"],
		});
	});

	it("lowercases command", () => {
		expect(parsePrefixCommand("!PING", "!")).toEqual({
			command: "ping",
			args: [],
		});
	});

	it("returns null for null or non-string content", () => {
		expect(parsePrefixCommand(null as unknown as string, "!")).toBeNull();
		expect(parsePrefixCommand(123 as unknown as string, "!")).toBeNull();
	});
});

describe("parseRoleMention", () => {
	it("extracts role ID from valid mention", () => {
		expect(parseRoleMention("<@&123456789012345678>")).toBe(
			"123456789012345678",
		);
	});

	it("returns null for invalid formats", () => {
		expect(parseRoleMention("<@123>")).toBeNull();
		expect(parseRoleMention("@&123")).toBeNull();
		expect(parseRoleMention("")).toBeNull();
		expect(parseRoleMention("  ")).toBeNull();
	});

	it("returns null for null or non-string", () => {
		expect(parseRoleMention(null as unknown as string)).toBeNull();
		expect(parseRoleMention(undefined as unknown as string)).toBeNull();
		expect(parseRoleMention(123 as unknown as string)).toBeNull();
	});

	it("trims whitespace", () => {
		expect(parseRoleMention("  <@&123456789012345678>  ")).toBe(
			"123456789012345678",
		);
	});
});

describe("resolveColor", () => {
	it("accepts valid number 0-16777215", () => {
		expect(resolveColor(0)).toBe(0);
		expect(resolveColor(0xff0000)).toBe(0xff0000);
		expect(resolveColor(0xffffff)).toBe(0xffffff);
	});

	it("throws for number out of range", () => {
		expect(() => resolveColor(-1)).toThrow(RangeError);
		expect(() => resolveColor(0x1000000)).toThrow(RangeError);
	});

	it("parses hex string", () => {
		expect(resolveColor("#ff0000")).toBe(0xff0000);
		expect(resolveColor("#FFFFFF")).toBe(0xffffff);
		expect(resolveColor("000000")).toBe(0);
	});

	it("throws for invalid hex", () => {
		expect(() => resolveColor("#gggggg")).toThrow(RangeError);
		expect(() => resolveColor("#fff")).toThrow(RangeError);
	});

	it("parses RGB array", () => {
		expect(resolveColor([255, 0, 0])).toBe(0xff0000);
		expect(resolveColor([0, 0, 0])).toBe(0);
		expect(resolveColor([255, 255, 255])).toBe(0xffffff);
	});

	it("throws for non-color types", () => {
		expect(() => resolveColor({} as unknown as number)).toThrow(TypeError);
		expect(() => resolveColor(true as unknown as number)).toThrow(TypeError);
	});
});
