import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FluxerAPIError, HTTPError } from "./errors/index.js";
import { RequestManager } from "./RequestManager.js";

describe("RequestManager", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("constructor uses defaults", () => {
		const rm = new RequestManager({});
		expect(rm.baseUrl).toBe("https://api.fluxer.app/v1");
	});

	it("constructor accepts overrides", () => {
		const rm = new RequestManager({ api: "https://test", version: "2" });
		expect(rm.baseUrl).toBe("https://test/v2");
	});

	it("request succeeds with JSON body", async () => {
		const rm = new RequestManager({ retries: 0 });
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			text: () => Promise.resolve('{"id":"123"}'),
			headers: new Headers(),
		});
		const result = await rm.request("GET", "/channels/123");
		expect(result).toEqual({ id: "123" });
	});

	it("request returns undefined for 204", async () => {
		const rm = new RequestManager({ retries: 0 });
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 204,
			text: () => Promise.resolve(""),
			headers: new Headers(),
		});
		const result = await rm.request("DELETE", "/channels/123");
		expect(result).toBeUndefined();
	});

	it("request throws FluxerAPIError for non-ok with JSON body", async () => {
		const rm = new RequestManager({ retries: 0 });
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 404,
			text: () => Promise.resolve('{"code":10003,"message":"Unknown Channel"}'),
			headers: new Headers(),
		});
		await expect(rm.request("GET", "/channels/999")).rejects.toThrow(
			FluxerAPIError,
		);
	});

	it("request throws HTTPError for non-JSON error body", async () => {
		const rm = new RequestManager({ retries: 0 });
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 500,
			text: () => Promise.resolve("Internal Server Error"),
			headers: new Headers(),
		});
		await expect(rm.request("GET", "/channels/1")).rejects.toThrow(HTTPError);
	});

	it("request uses full URL when route starts with http", async () => {
		const rm = new RequestManager({ retries: 0 });
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			text: () => Promise.resolve("{}"),
			headers: new Headers(),
		});
		await rm.request("GET", "https://cdn.example.com/asset/123");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://cdn.example.com/asset/123",
			expect.objectContaining({ method: "GET" }),
		);
	});
});
