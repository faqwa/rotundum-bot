const cron = require('node-cron');
const { getFullDailyMessage } = require('./rotundum');

module.exports = function scheduleDailyMessage(client) {
  async function postMessage(channelId, prefix = '') {
    const channel = await client.channels.fetch(channelId);
    const message = await getFullDailyMessage();
    channel.send(`${prefix}${message}`);
  }

  // 🌞 Morning - 10AM
  cron.schedule('0 10 * * *', () => {
    postMessage(process.env.CHANNEL_ID);
  }, {
    timezone: process.env.TIMEZONE
  });

  // 🌙 Night - 10PM
  cron.schedule('0 22 * * *', () => {
    postMessage(process.env.CHANNEL_ID);
  }, {
    timezone: process.env.TIMEZONE
  });

  // 💬 Manual .test command handler
  client.on('messageCreate', async (message) => {
    if (message.content === '.test' && !message.author.bot) {
      const testMsg = await getFullDailyMessage();
      message.channel.send(`🧪 **Test Message**:\n\n${testMsg}`);
    }
  });
};
