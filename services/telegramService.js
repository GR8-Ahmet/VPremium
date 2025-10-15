// services/telegramService.js
const axios = require('axios');
const config = require('../config/config');

const botPool = config.TELEGRAM_TOKENS.map((token, index) => ({
    id: index + 1,
    token: token,
    active: true,
    failures: 0,
    lastFailureTime: null
}));

const messageQueue = [];
let isSending = false;
let lastUsedBotIndex = -1;
const DEACTIVATION_COOLDOWN = 10 * 60 * 1000;

function findNextActiveBotIndex() {
    const activeBots = botPool.filter(bot => bot.active);
    if (activeBots.length === 0) return -1;
    let currentIndex = (lastUsedBotIndex + 1) % botPool.length;
    while (!botPool[currentIndex].active) {
        currentIndex = (currentIndex + 1) % botPool.length;
    }
    lastUsedBotIndex = currentIndex;
    return currentIndex;
}

async function processQueue() {
    if (isSending || messageQueue.length === 0) return;
    const activeBotIndex = findNextActiveBotIndex();
    if (activeBotIndex === -1) {
        setTimeout(processQueue, 5000);
        return;
    }
    isSending = true;
    const { chatId, text, isCriticalAlert = false } = messageQueue.shift();
    const bot = botPool[activeBotIndex];
    try {
        await axios.post(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
            chat_id: chatId, text, parse_mode: 'HTML'
        });
        bot.failures = 0;
    } catch (error) {
        console.error(`BOT HATA VERDİ (Bot ID: ${bot.id}):`, error.message || error);
        bot.active = false;
        bot.failures++;
        bot.lastFailureTime = new Date();
        if (isCriticalAlert && botPool.filter(b => b.active).length > 0) {
            messageQueue.unshift({ chatId, text, isCriticalAlert: true });
        } else if (!isCriticalAlert) {
            messageQueue.unshift({ chatId, text });
        }
        const alertMessage = `🚨 <b>BOT DEVRE DIŞI!</b> 🚨\n\n- <b>Bot ID:</b> ${bot.id}\n- <b>Sebep:</b> Mesaj gönderilemedi.\n- Bot, 10 dakika sonra yeniden denenecek.`;
        enqueueMessage(config.TELEGRAM_LOG_ID, alertMessage, true);
        setTimeout(() => {
            bot.active = true;
            console.log(`Bot ID ${bot.id} otomatik olarak yeniden etkinleştirildi.`);
            const reactivationMessage = `✅ <b>BOT YENİDEN AKTİF!</b>\n\n- <b>Bot ID:</b> ${bot.id}\n- Bot havuza geri eklendi.`;
            enqueueMessage(config.TELEGRAM_LOG_ID, reactivationMessage, true);
        }, DEACTIVATION_COOLDOWN);
    } finally {
        setTimeout(() => {
            isSending = false;
            processQueue();
        }, config.DELAY);
    }
}

function enqueueMessage(chatId, text, isCriticalAlert = false) {
    if (!chatId || !text) {
        console.warn('Geçersiz chatId veya text ile mesaj kuyruğa eklenemedi.');
        return;
    }
    messageQueue.push({ chatId, text, isCriticalAlert });
    processQueue();
}

function getBotPoolStatus() {
    return botPool;
}

// YENİ FONKSİYON: Çalışma anında havuza yeni bot ekler
function addBotToPool(token) {
    if (!token || typeof token !== 'string') return false;
    
    // Zaten var mı diye kontrol et
    if (botPool.some(bot => bot.token === token)) {
        return false;
    }

    const newBot = {
        id: botPool.length + 1,
        token: token,
        active: true,
        failures: 0,
        lastFailureTime: null
    };
    botPool.push(newBot);
    console.log(`Yeni bot (ID: ${newBot.id}) canlı olarak havuza eklendi.`);
    return true;
}

module.exports = { enqueueMessage, getBotPoolStatus, addBotToPool };