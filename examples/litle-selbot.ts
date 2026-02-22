import { Client, Events } from "../packages/fluxer-core/dist/index.js";

const client = new Client();

client.on(Events.Ready, () => {
	console.log(
		`\n🚀 Selfbot prêt ! Connecté en tant que : ${client.user?.username}`,
	);
	console.log(`--------------------------------------------------`);
});

client.on(Events.Error, (err) => console.error(`[WS ERROR]`, err));

client.on(Events.MessageCreate, async (message) => {
	if (message.content === "!self") {
		await message.edit("Ceci est un test de selfbot avec **FluxerJS** ! 🚀");
	}
});

await client.login(process.env.TOKEN!);
