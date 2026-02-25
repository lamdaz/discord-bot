// Discord Interactions Endpoint - Serverless Function for Vercel
import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

// Music queue storage (use Redis/DB in production)
const musicQueues = new Map();

// Verify Discord request signature
function verifyDiscordRequest(body, signature, timestamp) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  return verifyKey(body, signature, timestamp, publicKey);
}

// Search and get audio info (using play-dl or similar)
async function getAudioInfo(query) {
  try {
    // For production, use a proper audio extraction service
    // This is a simplified version - in production, use Lavalink or similar
    const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
    const text = await response.text();
    
    // Extract video ID (simplified)
    const match = text.match(/"videoId":"([^"]+)"/);
    if (match) {
      const videoId = match[1];
      return {
        id: videoId,
        title: `Search: ${query}`,
        url: `https://youtube.com/watch?v=${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        duration: 'Unknown'
      };
    }
    return null;
  } catch (error) {
    console.error('Audio search error:', error);
    return null;
  }
}

// Handle slash commands
async function handleCommand(interaction) {
  const { name, options } = interaction.data;
  const guildId = interaction.guild_id;
  const userId = interaction.member?.user?.id;

  switch (name) {
    case 'play': {
      const query = options?.find(opt => opt.name === 'query')?.value;
      if (!query) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Please provide a song name or URL!',
            flags: 64
          }
        };
      }

      const audioInfo = await getAudioInfo(query);
      if (!audioInfo) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Could not find the song. Please try a different query.',
            flags: 64
          }
        };
      }

      // Add to queue
      if (!musicQueues.has(guildId)) {
        musicQueues.set(guildId, []);
      }
      const queue = musicQueues.get(guildId);
      queue.push({
        ...audioInfo,
        requestedBy: interaction.member?.user?.username || 'Unknown'
      });

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: '🎵 Added to Queue',
            description: `[${audioInfo.title}](${audioInfo.url})`,
            thumbnail: { url: audioInfo.thumbnail },
            fields: [
              { name: 'Position', value: `#${queue.length}`, inline: true },
              { name: 'Requested by', value: `<@${userId}>`, inline: true }
            ],
            color: 0x5865F2,
            timestamp: new Date().toISOString()
          }]
        }
      };
    }

    case 'skip': {
      const queue = musicQueues.get(guildId);
      if (!queue || queue.length === 0) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ The queue is empty!',
            flags: 64
          }
        };
      }

      const skipped = queue.shift();
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: '⏭️ Skipped',
            description: `Skipped: [${skipped.title}](${skipped.url})`,
            color: 0x5865F2,
            timestamp: new Date().toISOString()
          }]
        }
      };
    }

    case 'queue': {
      const queue = musicQueues.get(guildId);
      if (!queue || queue.length === 0) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '📭 The queue is empty! Use `/play` to add songs.',
            flags: 64
          }
        };
      }

      const queueList = queue.slice(0, 10).map((song, index) => 
        `${index + 1}. [${song.title}](${song.url}) - <@${song.requestedBy}>`
      ).join('\n');

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: '📋 Music Queue',
            description: queueList,
            footer: { text: `Total: ${queue.length} songs` },
            color: 0x5865F2,
            timestamp: new Date().toISOString()
          }]
        }
      };
    }

    case 'stop': {
      musicQueues.delete(guildId);
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: '🛑 Stopped',
            description: 'Music stopped and queue cleared!',
            color: 0xED4245,
            timestamp: new Date().toISOString()
          }]
        }
      };
    }

    case 'pause': {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '⏸️ Music paused! (Note: Full voice connection requires WebSocket - see dashboard for setup)'
        }
      };
    }

    case 'resume': {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '▶️ Music resumed! (Note: Full voice connection requires WebSocket - see dashboard for setup)'
        }
      };
    }

    case 'nowplaying': {
      const queue = musicQueues.get(guildId);
      if (!queue || queue.length === 0) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Nothing is playing right now!',
            flags: 64
          }
        };
      }

      const current = queue[0];
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: '🎶 Now Playing',
            description: `[${current.title}](${current.url})`,
            thumbnail: { url: current.thumbnail },
            fields: [
              { name: 'Requested by', value: `<@${current.requestedBy}>`, inline: true },
              { name: 'Duration', value: current.duration, inline: true }
            ],
            color: 0x57F287,
            timestamp: new Date().toISOString()
          }]
        }
      };
    }

    case 'help': {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [{
            title: '🎵 Discord Music Bot - Commands',
            description: 'Here are all available commands:',
            fields: [
              { name: '/play <query>', value: 'Play a song or add to queue', inline: false },
              { name: '/skip', value: 'Skip the current song', inline: false },
              { name: '/queue', value: 'View the music queue', inline: false },
              { name: '/stop', value: 'Stop music and clear queue', inline: false },
              { name: '/pause', value: 'Pause the music', inline: false },
              { name: '/resume', value: 'Resume the music', inline: false },
              { name: '/nowplaying', value: 'Show current song', inline: false },
              { name: '/help', value: 'Show this help message', inline: false }
            ],
            footer: { text: 'For full voice support, configure the bot dashboard' },
            color: 0x5865F2,
            timestamp: new Date().toISOString()
          }]
        }
      };
    }

    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Unknown command!',
          flags: 64
        }
      };
  }
}

// Main handler
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing signature headers' });
  }

  const rawBody = JSON.stringify(req.body);
  
  // Verify request is from Discord
  const isValid = verifyDiscordRequest(rawBody, signature, timestamp);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid request signature' });
  }

  const interaction = req.body;

  // Handle ping (verification)
  if (interaction.type === InteractionType.PING) {
    return res.status(200).json({
      type: InteractionResponseType.PONG
    });
  }

  // Handle slash commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const response = await handleCommand(interaction);
    return res.status(200).json(response);
  }

  // Handle component interactions (buttons, select menus)
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    return res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Button clicked!'
      }
    });
  }

  return res.status(400).json({ error: 'Unknown interaction type' });
}

// Config for Vercel
export const config = {
  api: {
    bodyParser: false
  }
};
