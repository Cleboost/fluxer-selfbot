/**
 * Response from GET /instance (unauthenticated).
 * Instance info and API/gateway endpoints.
 */
export interface APIInstance {
	api_code_version: string;
	endpoints: {
		api: string;
		gateway: string;
	};
	captcha?: Record<string, unknown>;
	features?: {
		voice_enabled?: boolean;
	};
	push?: Record<string, unknown>;
}
