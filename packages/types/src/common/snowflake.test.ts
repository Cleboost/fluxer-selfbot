import { describe, expect, it } from "vitest";
import { FLUXER_EPOCH } from "./snowflake.js";

describe("snowflake common", () => {
	it("FLUXER_EPOCH is 2015-01-01", () => {
		expect(FLUXER_EPOCH).toBe(1420070400000);
		expect(new Date(FLUXER_EPOCH).toISOString()).toBe(
			"2015-01-01T00:00:00.000Z",
		);
	});
});
