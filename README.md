# Discord Music Bot for Vercel

A serverless Discord music bot that runs on Vercel using HTTP Interactions. This bot uses Discord's slash commands and can be deployed entirely on Vercel's free tier.

## Features

- 🎵 **Play Music** - Search and play songs from YouTube
- 📋 **Queue System** - Add multiple songs to a queue
- ⏯️ **Playback Controls** - Pause, resume, skip songs
- 📊 **View Queue** - See what's playing next
- 🌐 **Web Dashboard** - Manage your bot from a web interface
- ⚡ **Serverless** - Runs on Vercel's edge network

## Architecture

This bot uses Discord's **HTTP Interactions** instead of WebSocket Gateway, making it perfect for serverless deployment:

- **Traditional bots**: Maintain a persistent WebSocket connection (not suitable for serverless)
- **This bot**: Uses HTTP webhooks for slash commands (perfect for Vercel)

> **Note**: For full voice channel functionality (actually playing audio), you'll need a separate WebSocket server or use a service like Lavalink. The HTTP interactions handle commands, but voice connections require persistent connections.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/discord-music-bot)

## Setup Guide

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Note down the **Application ID** (Client ID)
4. Go to "General Information" and copy the **Public Key**

### 2. Get Bot Token

1. In the left sidebar, click "Bot"
2. Click "Reset Token" and copy the token
3. **Keep this secret!** Never commit it to git

### 3. Deploy to Vercel

1. Fork/clone this repository
2. Connect to Vercel and deploy
3. Add environment variables (see below)

### 4. Configure Environment Variables

In your Vercel project settings, add:

```
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_PUBLIC_KEY=your_public_key_here
```

### 5. Set Interactions Endpoint URL

1. In Discord Developer Portal, go to "General Information"
2. Find "Interactions Endpoint URL"
3. Set it to: `https://your-domain.vercel.app/api/discord/interactions`
4. Discord will verify the endpoint

### 6. Register Slash Commands

After deployment, visit your dashboard and click "Register Slash Commands" or make a POST request to:

```
POST https://your-domain.vercel.app/api/discord/commands
```

### 7. Invite Bot to Your Server

Use this URL (replace `YOUR_CLIENT_ID`):

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3145728&scope=bot%20applications.commands
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/play <query>` | Search and play a song |
| `/skip` | Skip current song |
| `/queue` | View the music queue |
| `/stop` | Stop and clear queue |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/nowplaying` | Show current song |
| `/help` | Show help message |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discord/interactions` | POST | Discord webhook handler |
| `/api/discord/commands` | GET/POST | List/register commands |
| `/api/music/search?q=query` | GET | Search for music |
| `/api/music/info?url=url` | GET | Get song info |
| `/api/health` | GET | Health check |

## Web Dashboard

The dashboard provides:
- Bot status monitoring
- Command registration
- Music search
- Setup instructions

Access it at your deployed Vercel URL.

## Voice Channel Limitations

Since Vercel uses serverless functions, **persistent WebSocket connections for voice channels are not supported**. The bot handles commands via HTTP, but to actually play audio in voice channels, you have these options:

### Option 1: Hybrid Setup (Recommended)
- Use Vercel for command handling (slash commands)
- Host a small WebSocket server elsewhere (Railway, Fly.io) for voice
- Commands on Vercel communicate with voice server via API

### Option 2: External Voice Service
- Use a service like [Lavalink](https://github.com/lavalink-devs/Lavalink)
- Bot sends play requests to Lavalink server
- Lavalink handles the actual audio streaming

### Option 3: Discord Activities (Experimental)
- Use Discord's new Activities feature for audio
- Doesn't require bot voice connections

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build
```

## Project Structure

```
├── api/                    # Serverless API routes
│   ├── discord/
│   │   ├── interactions.js # Discord webhook handler
│   │   └── commands.js     # Command registration
│   ├── music/
│   │   ├── search.js       # Music search API
│   │   └── info.js         # Song info API
│   └── health.js           # Health check
├── src/
│   ├── App.tsx             # Main dashboard UI
│   ├── App.css             # Custom styles
│   └── main.tsx            # Entry point
├── vercel.json             # Vercel configuration
└── package.json
```

## Troubleshooting

### "Invalid request signature"
- Make sure `DISCORD_PUBLIC_KEY` is set correctly
- Check that the Interactions Endpoint URL matches your deployment

### "Unknown interaction"
- Commands need to be registered first
- Use the dashboard or POST to `/api/discord/commands`

### "Application did not respond"
- Discord requires a response within 3 seconds
- The bot sends immediate acknowledgments for long operations

## License

MIT License - feel free to use and modify!

## Credits

Built with:
- [Discord.js](https://discord.js.org/)
- [Discord Interactions](https://github.com/discord/discord-interactions-js)
- [Vercel](https://vercel.com)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
