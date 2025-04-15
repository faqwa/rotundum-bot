const { getHijriDate } = require('./hijri-api');
const { getSolarDayWeek, getGregorianWeek } = require('./calendar');
const { getRotundumDate, getTarotMeaning } = require('./tarot');

async function getFullDailyMessage() {
  const today = new Date();
//  const hijri = await getHijriDate(today);
  const { solarDay, solarWeek } = getSolarDayWeek(today);
  const gregWeek = getGregorianWeek(today);
  const rotundum = getRotundumDate(today);
  const tarot = getTarotMeaning(rotundum.energy);

  return `🌞 Hey Ali

**Solar Day:** ${solarDay}  
**Solar Week:** ${solarWeek}

📅 **Gregorian:** ${today.toDateString()} (Week ${gregWeek})  
🕌 **Hijri:** ${hijri}

🔮 **Rotundum Date:** ${rotundum.formatted}  
Energy = ${rotundum.energy} — **${tarot.name}**  
"${tarot.meaning}"

📜 **This Month’s Theme:**  
To be added soon...
`;
}

module.exports = getFullDailyMessage; // 👈 This is key
