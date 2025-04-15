// index.js (All-in-One Rotundum Bot)
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL']
});

// --- Core Utility Functions ---
function getSolarDayWeek(date = new Date()) {
  const equinox = new Date(date.getFullYear(), 2, 21); // March 21
  const dayDiff = Math.floor((date - equinox) / (1000 * 60 * 60 * 24)) + 1;
  const solarDay = Math.min(dayDiff, 30);
  const solarWeek = Math.ceil(dayDiff / 7);
  return { solarDay, solarWeek };
}

function getGregorianWeek(date = new Date()) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (1000 * 60 * 60 * 24));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

function getRotundumDate(date = new Date()) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear() + 9;
  const energy = (d + m + y) % 22 || 22;
  return {
    formatted: `${d}-${d + m}-${d + m + y}`,
    energy
  };
}

function getTarotMeaning(energy) {
  const cards = {
    13: { name: 'Death', meaning: 'Endings clear the path for sacred renewal.' },
    1: { name: 'The Magician', meaning: 'You have the tools to manifest your vision.' },
    22: { name: 'The Fool', meaning: 'A new beginning calls — trust the unknown.' },
    // ... Add more as needed
  };
  return cards[energy] || { name: 'Unknown', meaning: 'Energy undefined.' };
}

async function getFullDailyMessage() {
  const today = new Date();
  const { solarDay, solarWeek } = getSolarDayWeek(today);
  const gregWeek = getGregorianWeek(today);
  const rotundum = getRotundumDate(today);
  const tarot = getTarotMeaning(rotundum.energy);

  return `✨ Hey Ali

**Solar Day:** ${solarDay}  
**Solar Week:** ${solarWeek}

🗓️ **Gregorian:** ${today.toDateString()} (Week ${gregWeek})

🔮 **Rotundum Date:** ${rotundum.formatted}  
Energy = ${rotundum.energy} — **${tarot.name}**  
"${tarot.meaning}"

📜 **This Month’s Theme:**  
To be added soon...`;
}

// --- Schedule + Manual Command Logic ---
function scheduleDailyMessage(client) {
  async function postMessage() {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const message = await getFullDailyMessage();
    await channel.send(message);
  }

  // Morning 10AM
  cron.schedule('0 10 * * *', postMessage, { timezone: process.env.TIMEZONE });

  // Night 10PM
  cron.schedule('0 22 * * *', postMessage, { timezone: process.env.TIMEZONE });

  // Manual command handler
  client.on('messageCreate', async (message) => {
    if (message.content === '.test' && !message.author.bot) {
      const msg = await getFullDailyMessage();
      await message.channel.send(`🔮 **Test Message:**\n\n${msg}`);
    }
  });
}

client.once('ready', () => {
  console.log(`🌌 Logged in as ${client.user.tag}`);
  scheduleDailyMessage(client);
});

client.login(process.env.DISCORD_TOKEN);
