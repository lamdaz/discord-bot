// Register Discord Slash Commands
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const commands = [
  {
    name: 'play',
    description: 'Play a song or add it to the queue',
    options: [
      {
        name: 'query',
        description: 'Song name or URL (YouTube, Spotify, SoundCloud)',
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: 'skip',
    description: 'Skip the current song'
  },
  {
    name: 'queue',
    description: 'View the current music queue'
  },
  {
    name: 'stop',
    description: 'Stop the music and clear the queue'
  },
  {
    name: 'pause',
    description: 'Pause the current song'
  },
  {
    name: 'resume',
    description: 'Resume the paused song'
  },
  {
    name: 'nowplaying',
    description: 'Show the currently playing song'
  },
  {
    name: 'help',
    description: 'Show all available commands'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // GET - List commands
  if (req.method === 'GET') {
    return res.status(200).json({ commands });
  }

  // POST - Register commands
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = req.body?.guildId; // Optional: for guild-specific commands

    if (!token || !clientId) {
      return res.status(400).json({ 
        error: 'Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID environment variables' 
      });
    }

    const rest = new REST({ version: '10' }).setToken(token);

    let route;
    if (guildId) {
      // Register commands for specific guild (faster, for testing)
      route = Routes.applicationGuildCommands(clientId, guildId);
      console.log(`Registering commands to guild: ${guildId}`);
    } else {
      // Register global commands (takes up to 1 hour to propagate)
      route = Routes.applicationCommands(clientId);
      console.log('Registering global commands');
    }

    const data = await rest.put(route, { body: commands });

    return res.status(200).json({
      success: true,
      message: guildId 
        ? `Successfully registered ${data.length} commands to guild ${guildId}`
        : `Successfully registered ${data.length} global commands`,
      commands: data
    });

  } catch (error) {
    console.error('Error registering commands:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.rawError || null
    });
  }
}
