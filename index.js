// index.js (All-in-One Rotundum Bot – Lunar, Solar & Energetic Layers)
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const cron = require('node-cron');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const tarotCards = {
  1: { name: 'The Magician', meaning: 'You have the tools to manifest your vision. Create the grid. The blueprint' },
  2: { name: 'The High Priestess', meaning: 'Mystery, intuition, and inner knowledge guide your path. Insert the currents' },
  3: { name: 'The Empress', meaning: 'Creativity and abundance flow freely. Manifesting the creation' },
  4: { name: 'The Emperor', meaning: 'Stand firm in structure, order, and leadership. Give it action potentials' },
  5: { name: 'The Hierophant', meaning: 'Tradition and spiritual wisdom are your keys. Add direction' },
  6: { name: 'The Lovers', meaning: 'Union, choices, and alignment of values. Make the intention' },
  7: { name: 'The Chariot', meaning: 'You’re in motion — drive forward with willpower. Set it into movement' },
  8: { name: 'Strength', meaning: 'Inner calm and patience are greater than force. See how it works' },
  9: { name: 'The Hermit', meaning: 'Seek solitude and reflect inward. Let the creation take a life of its own' },
  10: { name: 'Wheel of Fortune', meaning: 'Cycles shift — destiny turns in your favor. The result is shown' },
  11: { name: 'Justice', meaning: 'Balance and truth must be restored. The impact on the program. The result of personal efforts' },
  12: { name: 'The Hanged Man', meaning: 'Pause and reframe your perspective. Acceptance of the creation' },
  13: { name: 'Death', meaning: 'Endings clear the path for sacred renewal. Let go of the old levels. New ones can grow' },
  14: { name: 'Temperance', meaning: 'Harmony is found through moderation. Await the new. Towards growth and change' },
  15: { name: 'The Devil', meaning: 'Confront attachments and reclaim freedom. Does the creation bind you to the ISP?' },
  16: { name: 'The Tower', meaning: 'Disruption paves the way to clarity. The fall of old creations' },
  17: { name: 'The Star', meaning: 'Hope, inspiration, and healing light your way. The new creation can unfold' },
  18: { name: 'The Moon', meaning: 'Navigate illusion with intuition. The polarity of the creation is dealt with' },
  19: { name: 'The Sun', meaning: 'Joy, clarity, and growth radiate outward. COmplete the creation in its fullest' },
  20: { name: 'Judgement', meaning: 'Awakening and inner calling arrive. The rise of powers that follows creation' },
  21: { name: 'The World', meaning: 'Completion — you’ve come full circle. The mastery' },
  22: { name: 'The Fool', meaning: 'A new beginning calls — trust the unknown. Take the first step' }
};

function getSolarDayWeek(date = new Date()) {
  const equinox = new Date(date.getFullYear(), 2, 21);
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
  const y = date.getFullYear();
  const physical = d;
  const vibrational = d + m;
  const mentalRaw = d + m + y + 9;
  const mental = mentalRaw % 22 || 22;
  return { formatted: `${physical}-${vibrational}-${mentalRaw}`, physical, vibrational, mental };
}

function getTarotMeaning(number) {
  return tarotCards[number] || { name: 'Unknown', meaning: 'Energy undefined.' };
}

async function getHijriDate(date = new Date()) {
  const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
  try {
    const res = await axios.get(`https://api.aladhan.com/v1/gToH?date=${d}-${m}-${y}`);
    const hijri = res.data.data.hijri;
    return `${hijri.day} ${hijri.month.en} ${hijri.year}`;
  } catch (err) {
    console.error('Hijri API error:', err);
    return 'Hijri date unavailable';
  }
}

async function getMoonPhaseAndSign() {
  try {
    const res = await axios.get('https://api.farmsense.net/v1/moonphases/?d=' + Math.floor(Date.now() / 1000));
    const moon = res.data[0];
    return `${moon.Phase} (${moon.Illumination}%)`;
  } catch (err) {
    console.error('Moon API error:', err);
    return 'Moon data unavailable';
  }
}

async function getPlanetaryPositions() {
  return [
    { planet: 'Sun', degree: '25° Aries', house: '8th House' },
    { planet: 'Moon', degree: '18° Sagittarius', house: '4th House' },
    { planet: 'Mercury', degree: '29° Aries → Taurus @ 02:33 AM', house: '8th → 9th House' },
    { planet: 'Venus', degree: '14° Pisces', house: '7th House' },
    { planet: 'Mars', degree: '3° Leo', house: '12th House' },
    { planet: 'Jupiter', degree: '20° Taurus', house: '9th House' },
    { planet: 'Saturn', degree: '8° Pisces', house: '7th House' },
    { planet: 'Uranus', degree: '23° Taurus', house: '9th House' },
    { planet: 'Neptune', degree: '27° Pisces', house: '7th House' },
    { planet: 'Pluto', degree: '1° Aquarius', house: '6th House' }
  ];
}

async function getFullDailyMessage() {
  const today = new Date();
  const { solarDay, solarWeek } = getSolarDayWeek(today);
  const gregWeek = getGregorianWeek(today);
  const rotundum = getRotundumDate(today);
  const hijriDate = await getHijriDate(today);
  const moonInfo = await getMoonPhaseAndSign();
  const planetaryData = await getPlanetaryPositions();
  const physicalTarot = getTarotMeaning(rotundum.physical);
  const vibrationalTarot = getTarotMeaning(rotundum.vibrational);
  const mentalTarot = getTarotMeaning(rotundum.mental);
  const mentalFull = rotundum.physical + rotundum.vibrational + today.getFullYear() + 9;

  const planetarySection = planetaryData.map(p => `${p.planet} — ${p.degree} (${p.house})`).join('\n');

  return `✨ Hey Ali

🍍 **Hijri Date:** ${hijriDate}
🗓️ **Gregorian:** ${today.toDateString()} (Week ${gregWeek})
🌙 **Moon:** ${moonInfo}

**Solar Day:** ${solarDay}  
**Solar Week:** ${solarWeek}

🧬 **Rotundum Energies:**  
Physical = ${rotundum.physical} — **${physicalTarot.name}**  
> ${physicalTarot.meaning}

Vibrational = ${rotundum.vibrational} — **${vibrationalTarot.name}**  
> ${vibrationalTarot.meaning}

Mental = ${rotundum.mental} — **${mentalTarot.name}**  
> ${mentalTarot.meaning}

📜 **This Month’s Theme:**  
To be added soon...

🔁 **Rotundum Date Breakdown:**  
Physical = ${rotundum.physical}  
Emotional = ${rotundum.vibrational}  
Mental = ${mentalFull}

🪐 **Planetary Positions:**  
${planetarySection}`;
}

function scheduleDailyMessage(client) {
  async function postMessage() {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const message = await getFullDailyMessage();
    await channel.send(message);
  }

  cron.schedule('0 10 * * *', postMessage, { timezone: process.env.TIMEZONE });
  cron.schedule('0 22 * * *', postMessage, { timezone: process.env.TIMEZONE });

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
