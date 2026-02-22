import { describe, expect, it } from "vitest";
import {
	cdnAvatarURL,
	cdnBannerURL,
	cdnDefaultAvatarURL,
	cdnDisplayAvatarURL,
	cdnMemberAvatarURL,
	cdnMemberBannerURL,
} from "./cdn.js";

describe("cdnAvatarURL", () => {
	it("returns null for null hash", () => {
		expect(cdnAvatarURL("123", null)).toBeNull();
	});

	it("builds avatar URL with default extension", () => {
		const url = cdnAvatarURL("123456789012345678", "abc123hash");
		expect(url).toContain(
			"fluxerusercontent.com/avatars/123456789012345678/abc123hash.png",
		);
	});

	it("uses gif for a_ prefix (animated)", () => {
		const url = cdnAvatarURL("123", "a_animatedhash");
		expect(url).toContain(".gif");
	});

	it("appends size when provided", () => {
		const url = cdnAvatarURL("123", "hash", { size: 256 });
		expect(url).toContain("?size=256");
	});

	it("uses custom extension", () => {
		const url = cdnAvatarURL("123", "hash", { extension: "webp" });
		expect(url).toContain(".webp");
	});
});

describe("cdnDisplayAvatarURL", () => {
	it("returns default avatar when hash is null", () => {
		const url = cdnDisplayAvatarURL("123", null);
		expect(url).toContain("fluxerstatic.com/avatars/");
		expect(url).toContain(".png");
	});

	it("returns custom avatar when hash present", () => {
		const url = cdnDisplayAvatarURL("123", "abc");
		expect(url).toContain("fluxerusercontent.com/avatars/");
	});
});

describe("cdnBannerURL", () => {
	it("returns null for null hash", () => {
		expect(cdnBannerURL("123", null)).toBeNull();
	});

	it("builds banner URL", () => {
		const url = cdnBannerURL("123456789012345678", "bannerhash");
		expect(url).toContain(
			"fluxerusercontent.com/banners/123456789012345678/bannerhash.png",
		);
	});

	it("uses gif for a_ prefix", () => {
		const url = cdnBannerURL("123", "a_banner");
		expect(url).toContain(".gif");
	});
});

describe("cdnMemberAvatarURL", () => {
	it("returns null for null hash", () => {
		expect(cdnMemberAvatarURL("g1", "u1", null)).toBeNull();
	});

	it("builds member avatar URL", () => {
		const url = cdnMemberAvatarURL("guild123", "user456", "memberhash");
		expect(url).toContain(
			"fluxerusercontent.com/guilds/guild123/users/user456/avatars/memberhash.png",
		);
	});
});

describe("cdnMemberBannerURL", () => {
	it("returns null for null hash", () => {
		expect(cdnMemberBannerURL("g1", "u1", null)).toBeNull();
	});

	it("builds member banner URL", () => {
		const url = cdnMemberBannerURL("guild123", "user456", "bannerhash");
		expect(url).toContain(
			"fluxerusercontent.com/guilds/guild123/users/user456/banners/bannerhash.png",
		);
	});
});

describe("cdnDefaultAvatarURL", () => {
	it("returns URL with index 0-5 from user ID", () => {
		const url = cdnDefaultAvatarURL("0");
		expect(url).toContain("fluxerstatic.com/avatars/");
		expect(url).toContain(".png");
	});

	it("accepts numeric index", () => {
		const url = cdnDefaultAvatarURL(3);
		expect(url).toContain("/avatars/3.png");
	});

	it("handles negative index by taking abs and mod", () => {
		const url = cdnDefaultAvatarURL(-1);
		expect(url).toContain("/avatars/1.png");
	});
});
