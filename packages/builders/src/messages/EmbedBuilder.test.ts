import { describe, expect, it } from "vitest";
import { EmbedBuilder } from "./EmbedBuilder.js";

describe("EmbedBuilder", () => {
	describe("setVideo", () => {
		it("sets video URL in toJSON output (type stays rich)", () => {
			const url = "https://example.com/video.mp4";
			const embed = new EmbedBuilder().setTitle("Video embed").setVideo(url);
			const json = embed.toJSON();

			expect(json.video).toEqual({ url });
			expect(json.type).toBe("rich");
		});

		it("clears video when passed null", () => {
			const embed = new EmbedBuilder()
				.setVideo("https://example.com/video.mp4")
				.setVideo(null);
			const json = embed.toJSON();

			expect(json.video).toBeUndefined();
		});

		it("accepts full EmbedMediaOptions with duration, width, height", () => {
			const options = {
				url: "https://example.com/video.mp4",
				duration: 120,
				width: 1920,
				height: 1080,
			};
			const embed = new EmbedBuilder().setTitle("Video").setVideo(options);
			const json = embed.toJSON();

			expect(json.video).toEqual({
				url: options.url,
				duration: 120,
				width: 1920,
				height: 1080,
			});
			expect(json.type).toBe("rich");
		});
	});

	describe("setAudio", () => {
		it("sets audio URL in toJSON output", () => {
			const url = "https://example.com/audio.mp3";
			const embed = new EmbedBuilder().setTitle("Audio embed").setAudio(url);
			const json = embed.toJSON();

			expect(json.audio).toEqual({ url });
			expect(json.type).toBe("rich");
		});

		it("clears audio when passed null", () => {
			const embed = new EmbedBuilder()
				.setAudio("https://example.com/audio.mp3")
				.setAudio(null);
			const json = embed.toJSON();

			expect(json.audio).toBeUndefined();
		});

		it("accepts full EmbedMediaOptions with duration", () => {
			const options = {
				url: "https://example.com/podcast.mp3",
				duration: 3600,
				content_type: "audio/mpeg",
			};
			const embed = new EmbedBuilder().setTitle("Podcast").setAudio(options);
			const json = embed.toJSON();

			expect(json.audio).toEqual({
				url: options.url,
				duration: 3600,
				content_type: "audio/mpeg",
			});
		});
	});

	describe("setImage and setThumbnail", () => {
		it("accept string URL (backward compatibility)", () => {
			const embed = new EmbedBuilder()
				.setImage("https://example.com/img.png")
				.setThumbnail("https://example.com/thumb.png");
			const json = embed.toJSON();

			expect(json.image).toEqual({ url: "https://example.com/img.png" });
			expect(json.thumbnail).toEqual({ url: "https://example.com/thumb.png" });
		});

		it("accept full EmbedMediaOptions with width and height", () => {
			const embed = new EmbedBuilder()
				.setImage({
					url: "https://example.com/img.png",
					width: 800,
					height: 600,
				})
				.setThumbnail({
					url: "https://example.com/thumb.png",
					width: 128,
					height: 128,
				});
			const json = embed.toJSON();

			expect(json.image).toEqual({
				url: "https://example.com/img.png",
				width: 800,
				height: 600,
			});
			expect(json.thumbnail).toEqual({
				url: "https://example.com/thumb.png",
				width: 128,
				height: 128,
			});
		});
	});

	describe("validation", () => {
		it("setTitle throws for over 256 chars", () => {
			const embed = new EmbedBuilder();
			expect(() => embed.setTitle("x".repeat(257))).toThrow(RangeError);
		});

		it("setDescription throws for over 4096 chars", () => {
			const embed = new EmbedBuilder();
			expect(() => embed.setDescription("x".repeat(4097))).toThrow(RangeError);
		});

		it("setURL throws for invalid URL", () => {
			const embed = new EmbedBuilder();
			expect(() => embed.setURL("not-a-valid-url")).toThrow(
				"Invalid embed URL",
			);
		});

		it("setImage throws for invalid media URL", () => {
			const embed = new EmbedBuilder();
			expect(() => embed.setImage({ url: "invalid", width: 100 })).toThrow(
				"Invalid embed media URL",
			);
		});

		it("toJSON throws when total length exceeds 6000", () => {
			const embed = new EmbedBuilder()
				.setTitle("x".repeat(256))
				.setDescription("y".repeat(2000))
				.addFields(
					{ name: "n".repeat(256), value: "v".repeat(600) },
					{ name: "n".repeat(256), value: "v".repeat(600) },
					{ name: "n".repeat(256), value: "v".repeat(600) },
					{ name: "n".repeat(256), value: "v".repeat(600) },
					{ name: "n".repeat(256), value: "v".repeat(500) },
				);
			expect(() => embed.toJSON()).toThrow(RangeError);
		});
	});

	describe("setAuthor and setFooter", () => {
		it("setAuthor with name, url, iconURL", () => {
			const embed = new EmbedBuilder().setAuthor({
				name: "Author",
				url: "https://example.com",
				iconURL: "https://example.com/icon.png",
			});
			const json = embed.toJSON();
			expect(json.author).toEqual({
				name: "Author",
				url: "https://example.com",
				icon_url: "https://example.com/icon.png",
			});
		});

		it("setFooter with text and iconURL", () => {
			const embed = new EmbedBuilder().setFooter({
				text: "Footer text",
				iconURL: "https://example.com/footer.png",
			});
			const json = embed.toJSON();
			expect(json.footer).toEqual({
				text: "Footer text",
				icon_url: "https://example.com/footer.png",
			});
		});

		it("setAuthor null clears author", () => {
			const embed = new EmbedBuilder().setAuthor({ name: "A" }).setAuthor(null);
			expect(embed.toJSON().author).toBeUndefined();
		});
	});

	describe("setColor and setTimestamp", () => {
		it("setColor accepts number, hex, RGB array", () => {
			const embed = new EmbedBuilder().setColor(0xff0000);
			expect(embed.toJSON().color).toBe(0xff0000);
			embed.setColor("#00ff00");
			expect(embed.toJSON().color).toBe(0x00ff00);
			embed.setColor([0, 0, 255]);
			expect(embed.toJSON().color).toBe(0x0000ff);
		});

		it("setColor null clears", () => {
			const embed = new EmbedBuilder().setColor(0xff0000).setColor(null);
			expect(embed.toJSON().color).toBeUndefined();
		});

		it("setTimestamp accepts Date and number", () => {
			const d = new Date("2021-01-01T00:00:00Z");
			const embed = new EmbedBuilder().setTitle("T").setTimestamp(d);
			expect(embed.toJSON().timestamp).toBe("2021-01-01T00:00:00.000Z");
			embed.setTimestamp(1609459200000);
			expect(embed.toJSON().timestamp).toBe("2021-01-01T00:00:00.000Z");
		});
	});

	describe("addFields and spliceFields", () => {
		it("addFields adds multiple", () => {
			const embed = new EmbedBuilder()
				.setTitle("T")
				.addFields(
					{ name: "A", value: "1" },
					{ name: "B", value: "2", inline: true },
				);
			const json = embed.toJSON();
			expect(json.fields).toHaveLength(2);
			expect(json.fields?.[0]).toEqual({
				name: "A",
				value: "1",
				inline: undefined,
			});
			expect(json.fields?.[1]).toEqual({ name: "B", value: "2", inline: true });
		});

		it("spliceFields replaces at index", () => {
			const embed = new EmbedBuilder()
				.setTitle("T")
				.addFields({ name: "A", value: "1" }, { name: "B", value: "2" })
				.spliceFields(1, 1, { name: "X", value: "replacement" });
			const json = embed.toJSON();
			expect(json.fields).toHaveLength(2);
			expect(json.fields?.[1].name).toBe("X");
		});
	});

	describe("EmbedBuilder.from", () => {
		it("restores video from existing embed (type always rich)", () => {
			const source = {
				video: { url: "https://media.tenor.com/videos/xyz.mp4" },
			};
			const rebuilt = EmbedBuilder.from(source);
			const json = rebuilt.toJSON();

			expect(json.video).toEqual(source.video);
			expect(json.type).toBe("rich");
		});

		it("preserves video and audio with full metadata", () => {
			const source = {
				video: {
					url: "https://example.com/video.mp4",
					duration: 90,
					width: 1280,
					height: 720,
					flags: 0,
				},
				audio: {
					url: "https://example.com/audio.mp3",
					duration: 180,
					content_type: "audio/mpeg",
					flags: 0,
				},
			};
			const rebuilt = EmbedBuilder.from(source);
			const json = rebuilt.toJSON();

			expect(json.video).toEqual(source.video);
			expect(json.audio).toEqual(source.audio);
		});
	});
});
