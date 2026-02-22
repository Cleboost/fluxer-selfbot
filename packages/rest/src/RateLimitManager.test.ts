import { beforeEach, describe, expect, it } from "vitest";
import { RateLimitManager } from "./RateLimitManager.js";

describe("RateLimitManager", () => {
	let manager: RateLimitManager;

	beforeEach(() => {
		manager = new RateLimitManager();
	});

	it("getBucket returns undefined for unknown route", () => {
		expect(manager.getBucket("unknown")).toBeUndefined();
	});

	it("setBucket and getBucket", () => {
		manager.setBucket("/channels/:id", 5, 3, Date.now() + 60000);
		const bucket = manager.getBucket("/channels/:id");
		expect(bucket).toEqual({
			limit: 5,
			remaining: 3,
			resetAt: expect.any(Number),
		});
	});

	it("getWaitTime returns 0 when no limit", () => {
		expect(manager.getWaitTime("any")).toBe(0);
	});

	it("getWaitTime returns wait when bucket exhausted", () => {
		const resetAt = Date.now() + 5000;
		manager.setBucket("route", 5, 0, resetAt);
		const wait = manager.getWaitTime("route");
		expect(wait).toBeGreaterThan(0);
		expect(wait).toBeLessThanOrEqual(5000);
	});

	it("getWaitTime returns 0 when resetAt in past", () => {
		manager.setBucket("route", 5, 0, Date.now() - 1000);
		expect(manager.getWaitTime("route")).toBe(0);
	});

	it("setGlobalReset and getGlobalReset", () => {
		const resetAt = Date.now() + 10000;
		manager.setGlobalReset(resetAt);
		expect(manager.getGlobalReset()).toBe(resetAt);
	});

	it("getWaitTime considers global reset", () => {
		const resetAt = Date.now() + 3000;
		manager.setGlobalReset(resetAt);
		const wait = manager.getWaitTime("any-route");
		expect(wait).toBeGreaterThan(0);
	});

	it("updateFromHeaders parses X-RateLimit headers", () => {
		const resetSeconds = Math.floor(Date.now() / 1000) + 60;
		const headers = new Headers({
			"X-RateLimit-Limit": "5",
			"X-RateLimit-Remaining": "2",
			"X-RateLimit-Reset": String(resetSeconds),
		});
		manager.updateFromHeaders("/channels/123", headers);
		const bucket = manager.getBucket("/channels/123");
		expect(bucket?.limit).toBe(5);
		expect(bucket?.remaining).toBe(2);
	});

	it("updateFromHeaders handles Retry-After", () => {
		const headers = new Headers({ "Retry-After": "10" });
		manager.updateFromHeaders("/global", headers);
		const bucket = manager.getBucket("/global");
		expect(bucket?.limit).toBe(1);
		expect(bucket?.remaining).toBe(0);
	});
});
