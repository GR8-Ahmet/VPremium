// services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('../config/config');
const { enqueueMessage } = require('./telegramService');
const state = require('./stateService');
const locationService = require('./locationService');

let clientInstance; // client'ı dışarıdan erişilebilir yapıyoruz
let processedMessages = 0;
let isConnected = false;
const recentMessagesCache = new Set();
setInterval(() => {
    recentMessagesCache.clear();
    console.log('Dakikalık mesaj önbelleği (cache) temizlendi.');
}, 5 * 60 * 1000);

// --- YENİ VERİ DEPOLAMA ALANLARI ---
const groupStats = {}; // { 'grup_adı': mesaj_sayısı }
const messageHistory = []; // { groupName, body, timestamp }
const HISTORY_LIMIT = 200; // Son 200 mesajı hafızada tut

function findPhoneNumbers(text) {
    if (!text) return 'Yok';
    const regex = /(\+90\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}|0?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2})/g;
    const matches = text.match(regex);
    return matches ? matches.join(', ') : 'Yok';
}

function initialize() {
    const client = new Client({ authStrategy: new LocalAuth() });
    clientInstance = client; // Referansı dışarıya ata
    const botStartTime = Date.now();
    
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        console.log('QR Kodu oluşturuldu, lütfen telefonunuzdan tarayın.');
    });

    client.on('ready', () => {
        isConnected = true;
        console.log('WhatsApp bağlantısı başarılı. Mesajlar dinleniyor.');
        if (config.TELEGRAM_LOG_ID) {
            enqueueMessage(config.TELEGRAM_LOG_ID, config.MESSAGE_TEMPLATE_LOG_START, true);
        }
    });

    client.on('disconnected', (reason) => {
        isConnected = false;
        console.log('WhatsApp bağlantısı kesildi:', reason);
        const disconnectMessage = `🚨 <b>KRİTİK UYARI!</b> 🚨\n\nWhatsApp oturumu kapandı!`;
        enqueueMessage(config.TELEGRAM_LOG_ID, disconnectMessage, true);
    });

    client.on('message', async msg => {
        try {
            if (msg.timestamp * 1000 < botStartTime) return;
            const chat = await msg.getChat();
            if (!chat.isGroup || !msg.body) return;
            
            const messageBody = msg.body.trim();
            const currentMinute = new Date().toISOString().slice(0, 16); 
            const cacheKey = `${currentMinute}:${messageBody}`;
            if (recentMessagesCache.has(cacheKey)) { return; }
            recentMessagesCache.add(cacheKey);

            // --- İSTATİSTİK VE HAFIZA GÜNCELLEME ---
            const groupNameForStats = chat.name.trim();
            groupStats[groupNameForStats] = (groupStats[groupNameForStats] || 0) + 1;
            messageHistory.push({ groupName: groupNameForStats, body: messageBody, timestamp: new Date() });
            if (messageHistory.length > HISTORY_LIMIT) {
                messageHistory.shift(); // Hafıza limitini aşarsak en eski mesajı sil
            }

            // ROTA FİLTRELEME MANTIĞI
            const activeRoute = state.getActiveRoute();
            if (activeRoute && config.TELEGRAM_ROTA_CHAT_ID) {
                const locationsInMessage = locationService.findLocationsInText(messageBody);
                const isMatch = locationsInMessage.some(loc => activeRoute.cities.includes(loc));

                if (isMatch) {
                    console.log(`Rota ile eşleşen mesaj bulundu: ${messageBody.slice(0, 50)}`);
                    const routeMessage = `📍 <b>Rota Fırsatı (${activeRoute.start} -> ${activeRoute.end})</b>\n\n` +
                                         `<b>Grup:</b> ${chat.name}\n` +
                                         `<b>Mesaj:</b>\n${msg.body}`;
                    enqueueMessage(config.TELEGRAM_ROTA_CHAT_ID, routeMessage);
                }
            }
            
            // NORMAL MESAJ YÖNLENDİRME
            processedMessages++;
            const groupName = chat.name.trim().toLowerCase();
            if (state.getBlockedGroups().includes(groupName)) return;
            if (config.WATCHED_GROUPS.length > 0 && !config.WATCHED_GROUPS.includes(groupName)) return;

            const phoneNumbers = findPhoneNumbers(msg.body);
            const finalMessage = config.MESSAGE_TEMPLATE_DEFAULT
                .replace(/{groupName}/g, chat.name.trim())
                .replace(/{messageBody}/g, msg.body)
                .replace(/{phoneNumbers}/g, phoneNumbers);
            
            enqueueMessage(config.TELEGRAM_CHAT_ID, finalMessage);

            const koliKeywords = state.getKoliKeywords();
            if (config.TELEGRAM_KOLI_CHAT_ID && koliKeywords.some(word => msg.body.toLowerCase().includes(word))) {
                enqueueMessage(config.TELEGRAM_KOLI_CHAT_ID, finalMessage);
            }
        } catch (error) {
            console.error('Mesaj işlenirken bir hata oluştu:', error.message || error);
        }
    });

    client.initialize();
}

// --- GÜNCELLENMİŞ ve YENİ DIŞA AKTARILAN FONKSİYONLAR ---
function getStats() {
    return { processedMessages, groupStats }; // groupStats eklendi
}

function getStatus() {
    return { isConnected };
}

async function sendMessageToGroup(groupName, message) {
    if (!clientInstance || !isConnected) {
        return { success: false, error: 'WhatsApp istemcisi bağlı değil.' };
    }
    try {
        const chats = await clientInstance.getChats();
        // Grup adını bulurken büyük/küçük harf duyarsız ve boşlukları temizleyerek karşılaştırma yapalım
        const targetChat = chats.find(chat => chat.isGroup && chat.name.trim().toLowerCase() === groupName.trim().toLowerCase());

        if (targetChat) {
            await targetChat.sendMessage(message);
            return { success: true, groupName: targetChat.name };
        } else {
            return { success: false, error: 'Grup bulunamadı.' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function searchHistory(query) {
    const lowerQuery = query.toLowerCase();
    return messageHistory.filter(msg => msg.body.toLowerCase().includes(lowerQuery));
}

// WATCHED_GROUPS listesindeki tüm grup isimlerini döndüren bir yardımcı fonksiyon
async function getAllWatchedGroups() {
    if (!clientInstance || !isConnected) {
        console.warn('getAllWatchedGroups: WhatsApp istemcisi bağlı değil.');
        return [];
    }
    // Eğer WATCHED_GROUPS boşsa, tüm grupları hedef almak tehlikeli olabilir, bu yüzden sadece WATCHED_GROUPS'u temel alalım.
    return config.WATCHED_GROUPS;
}


module.exports = { initialize, getStats, getStatus, sendMessageToGroup, searchHistory, getAllWatchedGroups };