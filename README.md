# 🤖 fluxer-selfbot

<div align="center">
  <p><b>A simple, all-in-one SDK for building self-bots on <a href="https://fluxer.app">Fluxer</a>.</b></p>
  <p>
    <a href="https://www.npmjs.com/package/fluxer-selfbot"><img src="https://img.shields.io/npm/v/fluxer-selfbot.svg?style=flat-square&color=5865F2" alt="npm version"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square" alt="License"></a>
    <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bundled%20with-Bun-f9f1e1?style=flat-square&logo=bun" alt="Bun"></a>
  </p>
</div>

---

## 💡 What is fluxer-selfbot?

`fluxer-selfbot` is a fork of the FluxerJS core, specifically adjusted for self-bot development. It bundles everything you need (REST, WebSockets, Builders, and Voice) into a single package to make it easier to get started without complex configurations.

### �️ Key Features

- **📦 All-in-One**: Access core logic, REST, and Gateway from a single import.
- **🕵️ Basic Stealth**: Includes automatic client spoofing to help mimic a standard browser or desktop client.
- **🎙️ Voice Support**: Support for joining channels and playing audio is included by default.
- **⚡ Bun friendly**: Designed to run smoothly on Bun, but compatible with other runtimes.
- **🛡️ Typed**: Fully written in TypeScript for better developer experience.

---

## 🚀 Getting Started

### Installation

You can install it using **Bun**:

```bash
bun add fluxer-selfbot
```

### Simple Example

```typescript
import { Client, Events } from 'fluxer-selfbot';

const client = new Client();

client.on(Events.Ready, () => {
    console.log(`Connected as ${client.user?.username}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!ping') {
        await message.edit({ content: '🏓 **Pong!**' });
    }
});

await client.login('YOUR_USER_TOKEN');
```

---

## 📚 Resources

- **📖 [Documentation](https://fluxerjs.blstmo.com)**: Full API reference and guides.
- **🧪 [Examples](./examples)**: Simple scripts and patterns to learn from.
- **📦 [Internal Packages](./packages)**: The modular parts under the hood.

---

## ⚠️ Important Disclaimer

**Self-botting is against the Terms of Service of most messaging platforms.** 
Using this SDK is at your own risk. The developers are not responsible for any account bans or other consequences. Please use responsibly.

---

<p align="center">
  Built with ❤️ for the community.
</p>



