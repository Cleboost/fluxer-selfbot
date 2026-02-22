# 🧪 Fluxer SDK Examples

This directory contains a collection of example scripts to help you get started with the Fluxer SDK. Whether you're building a traditional bot or a modern self-bot, you'll find inspiration here.

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Bun](https://bun.sh) installed.

### 2. Installation & Build
From the repository root:
```bash
bun i
bun run build:prod
```

### 3. Configuration
Copy `.env.example` to `.env` and add your token:
```bash
cp .env.example .env
```

---

## 📂 Featured Examples

### 🕵️ Self-bot (New!)
- **[litle-selbot.ts](./litle-selbot.ts)**: A minimal, stealthy self-bot that uses the production bundle (`dist/index.js`). Demonstrates how to edit your own messages and use zero-config defaults.
- **[status-selfbot.ts](./status-selfbot.ts)**: Automatically rotates your custom status every 3 seconds to keep your profile dynamic.
  ```bash
  TOKEN=your_user_token bun examples/status-selfbot.ts
  ```

### 🤖 Standard Bots
- **[minimal-bot.js](./minimal-bot.js)**: Basic ping-pong implementation.
- **[first-steps-bot.js](./first-steps-bot.js)**: Intro to commands, avatars, and embeds.
- **[ping-bot.js](./ping-bot.js)**: Advanced usage including voice and media.
- **[moderation-bot.js](./moderation-bot.js)**: Handling bans, kicks, and permissions.

### 🛠️ Utilities & Webhooks
- **[webhook-bot.js](./webhook-bot.js)**: Sending messages via webhooks without the gateway.
- **[reaction-bot.js](./reaction-bot.js)**: Handling message reactions.

---

## 🔑 Environment Variables

| Variable | Description |
| :--- | :--- |
| `TOKEN` | Your user or bot token. |
| `FLUXER_API_URL` | (Optional) Custom API endpoint. |
| `VOICE_DEBUG` | (Optional) Enable voice connection logs. |

---

## 📄 Documentation

For the full API reference, visit the [Fluxer SDK Documentation](https://fluxerjs.blstmo.com).
