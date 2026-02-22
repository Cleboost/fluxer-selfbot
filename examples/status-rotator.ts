import { Client, Events } from "../dist/index.js";

/**
 * Self-bot Status Rotator Example.
 * Rotates through a list of custom statuses every 3 seconds.
 */
const client = new Client();

const STATUSES = [
	"Working with Fluxer-Selfbot 🚀",
	"Building the future... 💻",
	"Self-botting safely 🕵️",
	"Coding with Bun ⚡",
];

let currentIndex = 0;

client.on(Events.Ready, () => {
	console.log(
		`\n🚀 Status Rotator prêt ! Connecté en tant que : ${client.user?.username}`,
	);
	console.log(`--------------------------------------------------`);

	setInterval(() => {
		const text = STATUSES[currentIndex]
		client.user?.setPresence({
			status: "online",
			custom_status: {
				text: text,
				emoji_name: "🚀",
			},
		});

		console.log(`✨ Status mis à jour : ${text}`);
		currentIndex = (currentIndex + 1) % STATUSES.length;
	}, 3000);
});
await client.login(process.env.TOKEN!);
