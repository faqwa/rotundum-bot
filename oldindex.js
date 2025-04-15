require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { getFullDailyMessage } = require('./rotundum');
const scheduleDailyMessage = require('./scheduler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // 👈 required for .test to work
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL'] // 👈 required to handle DMs
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  scheduleDailyMessage(client);
});

client.login(process.env.DISCORD_TOKEN);
