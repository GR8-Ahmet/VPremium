// services/logMonitor.js
const fs = require('fs');
const axios = require('axios');
const { TELEGRAM_TOKENS, TELEGRAM_LOG_ID, MESSAGE_TEMPLATE_LOG_ERROR } = require('../config/config');
const { analyzeErrorWithGemini } = require('./geminiService'); // YENİ: Yapay zeka analizcisi

let logBotIndex = 0;

function startMonitoring() {
    const logFile = require('../config/config').PM2_LOG_FILE_PATH;
    console.log("Yapay Zeka Destekli PM2 log dosyası izleniyor:", logFile);

    if (fs.existsSync(logFile)) {
        let lastSize = fs.statSync(logFile).size;

        fs.watchFile(logFile, async (curr, prev) => { // async eklendi
            try {
                if (curr.size <= lastSize) {
                    lastSize = curr.size;
                    return;
                }

                const stream = fs.createReadStream(logFile, { start: lastSize, end: curr.size, encoding: 'utf8' });
                let newData = '';
                stream.on('data', chunk => (newData += chunk));
                stream.on('end', async () => {
                    lastSize = curr.size;
                    const lastLine = newData.trim().split('\n').pop();

                    if (lastLine && /error|exception|fail|crash/i.test(lastLine)) {
                        const token = TELEGRAM_TOKENS[logBotIndex];
                        logBotIndex = (logBotIndex + 1) % TELEGRAM_TOKENS.length;

                        if (token && TELEGRAM_LOG_ID) {
                            const safeLine = (lastLine || 'Boş log').slice(0, 1500)
                              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            
                            // GÜNCELLENDİ: Hata analizi için Gemini'yi çağır
                            const diagnosis = await analyzeErrorWithGemini(lastLine);
                            
                            let text = MESSAGE_TEMPLATE_LOG_ERROR.replace(/{logMessage}/g, safeLine);

                            text += `\n\n➖➖➖➖➖➖➖➖➖➖\n\n` +
                                    `🧠 <b>Yapay Zeka Analizi:</b>\n\n` +
                                    `<b>Olası Neden:</b>\n` +
                                    `<i>${diagnosis.explanation}</i>\n\n` +
                                    `<b>Çözüm Önerisi:</b>\n` +
                                    `<i>${diagnosis.solution}</i>`;

                            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                                chat_id: TELEGRAM_LOG_ID, text, parse_mode: 'HTML',
                            });
                            console.log(`Yapay Zeka destekli PM2 hata logu Telegram'a gönderildi.`);
                        }
                    }
                });
            } catch (err) {
                console.error('Log izleme hatası:', err.message);
            }
        });
    } else {
        console.warn('PM2 log dosyası bulunamadı, log izleme pasif:', logFile);
    }
}

module.exports = { startMonitoring };