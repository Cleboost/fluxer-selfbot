import { Client, Events, EmbedBuilder } from "../dist/index.js";

const client = new Client();

client.on(Events.Ready, () => {
	console.log(
		`\n🚀 Selfbot prêt ! Connecté en tant que : ${client.user?.username}`,
	);
	console.log(`--------------------------------------------------`);
	client.user?.setPresence({
		status: "online",
		activities: [
			{
				name: "coucou",
				type: 0,
			},
		],
	});
});

client.on(Events.Error, (err) => console.error(`[WS ERROR]`, err));

client.on(Events.MessageCreate, async (message) => {
	if (message.content === "!self") {
		await message.edit({
			embeds: [
				new EmbedBuilder().addFields({ name: "coucou", value: "coucou" }),
			],
		});
	}
});

await client.login(process.env.TOKEN!);
