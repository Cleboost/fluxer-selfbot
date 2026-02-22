import { describe, expect, it } from "vitest";
import { SnowflakeUtil } from "./SnowflakeUtil.js";

describe("SnowflakeUtil", () => {
	it("timestampFromSnowflake converts correctly", () => {
		const ts = 1609459200000; // 2021-01-01
		const snowflake = SnowflakeUtil.snowflakeFromTimestamp(ts);
		const back = SnowflakeUtil.timestampFromSnowflake(snowflake);
		expect(back).toBe(ts);
	});

	it("isValid accepts valid snowflakes", () => {
		expect(SnowflakeUtil.isValid("1234567890123456789")).toBe(true);
		expect(SnowflakeUtil.isValid("0")).toBe(true);
	});

	it("isValid rejects invalid snowflakes", () => {
		expect(SnowflakeUtil.isValid("")).toBe(false);
		expect(SnowflakeUtil.isValid("abc")).toBe(false);
		expect(SnowflakeUtil.isValid("-1")).toBe(false);
	});

	it("deconstruct returns components", () => {
		const result = SnowflakeUtil.deconstruct("1234567890123456789");
		expect(result).toHaveProperty("timestamp");
		expect(result).toHaveProperty("date");
		expect(result).toHaveProperty("workerId");
		expect(result).toHaveProperty("processId");
		expect(result).toHaveProperty("increment");
	});

	it("snowflakeFromTimestamp round-trips", () => {
		const ts = Date.now();
		const snowflake = SnowflakeUtil.snowflakeFromTimestamp(ts);
		const back = SnowflakeUtil.timestampFromSnowflake(snowflake);
		expect(Math.floor(back / 1000)).toBe(Math.floor(ts / 1000));
	});

	it("dateFromSnowflake returns Date", () => {
		const ts = 1609459200000;
		const snowflake = SnowflakeUtil.snowflakeFromTimestamp(ts);
		const date = SnowflakeUtil.dateFromSnowflake(snowflake);
		expect(date).toBeInstanceOf(Date);
		expect(date.getTime()).toBe(ts);
	});

	it("deconstruct returns correct component values", () => {
		const sf = SnowflakeUtil.snowflakeFromTimestamp(1609459200000);
		const d = SnowflakeUtil.deconstruct(sf);
		expect(d.timestamp).toBe(1609459200000);
		expect(d.date).toBeInstanceOf(Date);
		expect(typeof d.workerId).toBe("number");
		expect(typeof d.processId).toBe("number");
		expect(typeof d.increment).toBe("number");
	});

	it("deconstruct throws for non-numeric string", () => {
		expect(() => SnowflakeUtil.deconstruct("abc")).toThrow(TypeError);
		expect(() => SnowflakeUtil.deconstruct("12.34")).toThrow(TypeError);
	});

	it("isValid rejects negative", () => {
		expect(SnowflakeUtil.isValid("-123")).toBe(false);
	});

	it("isValid rejects too long", () => {
		expect(SnowflakeUtil.isValid(`1${"0".repeat(20)}`)).toBe(false);
	});
});
