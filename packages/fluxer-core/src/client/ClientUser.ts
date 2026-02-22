import { Client } from "./Client.js";
import { User } from "../structures/User.js";
import {
	APIGuild,
	APIUserPartial,
	GatewayPresenceUpdateData,
} from "@fluxer-selfbot/types";
import { Routes } from "@fluxer-selfbot/types";
import { Guild } from "../structures/Guild.js";
import { GatewayOpcodes } from "@fluxer-selfbot/types";

export class ClientUser extends User {
	declare readonly client: Client;

	constructor(client: Client, data: APIUserPartial) {
		super(client, { ...data });
	}

	/**
	 * Fetch guilds the bot is a member of.
	 * @returns Array of Guild objects (cached in client.guilds)
	 */
	async fetchGuilds(): Promise<Guild[]> {
		const data = await this.client.rest.get<
			APIGuild[] | { guilds?: APIGuild[] }
		>(Routes.currentUserGuilds());
		const list = Array.isArray(data) ? data : (data?.guilds ?? []);
		const guilds: Guild[] = [];
		for (const g of list) {
			const guild = new Guild(this.client, g);
			this.client.guilds.set(guild.id, guild);
			guilds.push(guild);
		}
		return guilds;
	}

	/**
	 * Leave a guild. Requires the bot to be a member.
	 * @param guildId - The guild ID to leave
	 */
	async leaveGuild(guildId: string): Promise<void> {
		await this.client.rest.delete(Routes.leaveGuild(guildId), { auth: true });
		this.client.guilds.delete(guildId);
	}

	/**
	 * Set the user's presence/status.
	 * For user accounts (selfbots), this also updates persistent settings via REST.
	 * @param data - Presence data (status, custom_status, etc.)
	 */
	async setPresence(data: GatewayPresenceUpdateData): Promise<void> {
		let customStatus = data.custom_status;
		if (!customStatus && data.activities && data.activities.length > 0) {
			customStatus = {
				text: data.activities[0].name,
			};
		}

		try {
			await this.client.rest.patch(Routes.currentUserSettings(), {
				body: {
					status: data.status || "online",
					status_resets_at: null,
					status_resets_to: null,
					custom_status: customStatus
						? {
								text: customStatus.text || null,
								expires_at: null,
								emoji_id: customStatus.emoji_id || null,
								emoji_name: customStatus.emoji_name || null,
								emoji_animated: null,
							}
						: null,
				},
				auth: true,
			});
		} catch (err) {
			this.client.emit(
				"error",
				err instanceof Error
					? err
					: new Error("Failed to update user settings"),
			);
		}

		// this.client.sendToGateway(0, {
		// 	op: GatewayOpcodes.PresenceUpdate,
		// 	d: {
		// 		status: data.status,
		// 		custom_status: customStatus,
		// 		activities: data.activities,
		// 		afk: data.afk,
		// 		since: data.since,
		// 	},
		// });
	}
}
