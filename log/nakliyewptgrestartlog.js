require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.TELEGRAM_TOKEN1;
const LOG_ID = process.env.TELEGRAM_LOG_ID;

async function main() {
  await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    chat_id: LOG_ID,
    text: 
    "🔱 ~~~~NKCN GRUBU LOG~~~~ 🔱 \n💎 VPremium[xxx] Botlar Yeniden Başlatılıyor... \n⌛ 1-2 Dakika Kadar Sürebilir..."
  });
}

main();