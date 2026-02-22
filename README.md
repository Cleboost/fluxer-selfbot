# 🚀 fluxer-selfbot

**fluxer-selfbot** is a premium, all-in-one bundle of the FluxerJS SDK, specifically optimized for building self-bots on [Fluxer](https://fluxer.app). It is an optimized fork of [fluxerjs/core](https://github.com/fluxerjs/core) that provides zero-config defaults, stealth client properties, and includes all necessary tools (builders, rest, ws) in a single, lightweight package.

[![npm version](https://img.shields.io/npm/v/fluxer-selfbot.svg?style=flat-square)](https://www.npmjs.com/package/fluxer-selfbot)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)

---

## ✨ Features

- **📦 All-in-One**: Includes `core`, `rest`, `ws`, `builders`, `collection`, and `util` in a single bundle.
- **🕵️ Stealth by Default**: Mimics the official Discord Client properties (OS, Browser, Device) to avoid detection..
- **🤏 Lightweight**: Minified and optimized bundle (~0.45MB).
- **💪 Fully Typed**: High-quality TypeScript declarations included for a perfect developer experience.

---

## 🚀 Quick Start

### Installation

```bash
# Using Bun (Recommended)
bun add fluxer-selfbot

# Using npm
npm install fluxer-selfbot
```

### Basic Self-bot Example

```typescript
import { Client, Events, EmbedBuilder } from 'fluxer-selfbot';

// Zero configuration needed for self-bots!
const client = new Client();

client.on(Events.Ready, () => {
    console.log(`🚀 Connected as ${client.user?.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!ping') {
        // Self-bot behavior: edit your own message instead of replying
        await message.edit('🏓 **Pong!** My first self-bot message.');
    }
});

// Use your user token
await client.login('YOUR_USER_TOKEN');
```

---

## 🛠️ Included Tools

No need to install multiple packages. Everything is re-exported from `fluxer-selfbot`:

- **`EmbedBuilder`**: Create beautiful rich embeds.
- **`Collection`**: Powerful data structures for caching.
- **`Events`**: Typed gateway event constants.
- **`PermissionsBitField`**: Easy permission handling.
- **`Routes`**: Full REST API route map.

---

## ⚠️ Disclaimer

**Self-bots are against the Terms of Service of most messaging platforms.** 
Using this library for self-botting on Fluxer or any other platform is at your own risk. The authors are not responsible for any account termination or consequences resulting from the use of this software.

---

## 📄 License

Apache-2.0
