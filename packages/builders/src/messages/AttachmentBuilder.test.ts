import { describe, expect, it } from "vitest";
import { AttachmentBuilder } from "./AttachmentBuilder.js";

describe("AttachmentBuilder", () => {
	it("creates with required id and filename", () => {
		const att = new AttachmentBuilder(0, "image.png");
		expect(att.id).toBe(0);
		expect(att.filename).toBe("image.png");
		expect(att.spoiler).toBe(false);
		expect(att.description).toBeUndefined();
	});

	it("creates with description and spoiler options", () => {
		const att = new AttachmentBuilder(1, "photo.jpg", {
			description: "A nice photo",
			spoiler: true,
		});
		expect(att.id).toBe(1);
		expect(att.filename).toBe("SPOILER_photo.jpg");
		expect(att.description).toBe("A nice photo");
		expect(att.spoiler).toBe(true);
	});

	it("throws for empty filename", () => {
		expect(() => new AttachmentBuilder(0, "")).toThrow("Filename is required");
		expect(() => new AttachmentBuilder(0, "   ")).toThrow(
			"Filename is required",
		);
	});

	it("setName updates filename", () => {
		const att = new AttachmentBuilder(0, "file.png");
		att.setName("renamed.png");
		expect(att.filename).toBe("renamed.png");
	});

	it("setName adds SPOILER_ prefix when spoiler is true", () => {
		const att = new AttachmentBuilder(0, "file.png", { spoiler: true });
		att.setName("other.png");
		expect(att.filename).toBe("SPOILER_other.png");
	});

	it("setName throws for empty", () => {
		const att = new AttachmentBuilder(0, "file.png");
		expect(() => att.setName("")).toThrow("Filename is required");
	});

	it("setDescription updates description", () => {
		const att = new AttachmentBuilder(0, "file.png");
		att.setDescription("Alt text");
		expect(att.description).toBe("Alt text");
		att.setDescription(null);
		expect(att.description).toBeUndefined();
	});

	it("setSpoiler adds SPOILER_ prefix", () => {
		const att = new AttachmentBuilder(0, "file.png");
		att.setSpoiler(true);
		expect(att.spoiler).toBe(true);
		expect(att.filename).toBe("SPOILER_file.png");
	});

	it("setSpoiler removes prefix when false", () => {
		const att = new AttachmentBuilder(0, "file.png", { spoiler: true });
		att.setSpoiler(false);
		expect(att.spoiler).toBe(false);
		expect(att.filename).toBe("file.png");
	});

	it("toJSON returns API format", () => {
		const att = new AttachmentBuilder(2, "doc.pdf", {
			description: "PDF document",
		});
		const json = att.toJSON();
		expect(json).toEqual({
			id: 2,
			filename: "doc.pdf",
			description: "PDF document",
		});
	});

	it("toJSON omits description when undefined", () => {
		const att = new AttachmentBuilder(0, "image.png");
		const json = att.toJSON();
		expect(json).toEqual({
			id: 0,
			filename: "image.png",
			description: undefined,
		});
	});
});
