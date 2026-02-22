import { describe, expect, it } from "vitest";
import { RateLimitError } from "./RateLimitError.js";

describe("RateLimitError", () => {
	it("extends FluxerAPIError with retryAfter and global", () => {
		const err = new RateLimitError(
			{ message: "Rate limited", code: "RATE_LIMITED", retry_after: 5 },
			429,
		);
		expect(err.message).toBe("Rate limited");
		expect(err.name).toBe("RateLimitError");
		expect(err.statusCode).toBe(429);
		expect(err.retryAfter).toBe(5);
		expect(err.global).toBe(false);
	});

	it("sets global from body when true", () => {
		const err = new RateLimitError(
			{
				message: "Global rate limit",
				code: "RATE_LIMITED",
				retry_after: 10,
				global: true,
			},
			429,
		);
		expect(err.global).toBe(true);
		expect(err.retryAfter).toBe(10);
	});

	it("defaults global to false when omitted", () => {
		const err = new RateLimitError(
			{ message: "Limited", code: "RATE_LIMITED", retry_after: 1 },
			429,
		);
		expect(err.global).toBe(false);
	});

	it("isRetryable returns true (inherited from FluxerAPIError)", () => {
		const err = new RateLimitError(
			{ message: "Limited", code: "RATE_LIMITED", retry_after: 1 },
			429,
		);
		expect(err.isRetryable).toBe(true);
	});
});
