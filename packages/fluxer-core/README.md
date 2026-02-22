# @fluxer-selfbot/core

Main client for the Fluxer bot SDK.

## Install

```bash
npm install @fluxer-selfbot/core
```

## Usage

```javascript
import { Client, Events } from '@fluxer-selfbot/core';

const client = new Client({ intents: 0 });

client.on(Events.Ready, () => console.log('Ready'));
client.on(Events.MessageCreate, async (m) => {
  if (m.content === '!ping') await m.reply('Pong');
});

await client.login(process.env.FLUXER_BOT_TOKEN);
```

For voice, add `@fluxer-selfbot/voice`. For embeds, use `EmbedBuilder`.
