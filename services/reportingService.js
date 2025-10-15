// services/reportingService.js
const cron = require('node-cron');
const config = require('../config/config');
const { getStatus, getStats } = require('./whatsappService');
const { enqueueMessage } = require('./telegramService');

function initialize() {
    console.log('Raporlama servisi zamanlayıcıları kuruluyor...');

    // 1. Her Sabah 08:00'de Çalışma Durumu Kontrolü
    // Cron formatı: 'Dakika Saat Gün Ay HaftanınGünü'
    // '0 8 * * *' -> Her gün saat 08:00'de çalışır.
    cron.schedule('0 8 * * *', () => {
        console.log('Sabah 8 kontrolü çalıştırılıyor...');
        const waStatus = getStatus();
        const uptimeHours = (process.uptime() / 3600).toFixed(2);

        const statusMessage = waStatus.isConnected 
            ? `☀️ <b>Günaydın!</b>\n\nBot servisleri aktif ve çalışır durumda.\n\n- <b>WhatsApp Bağlantısı:</b> 🟢 Bağlı\n- <b>Çalışma Süresi:</b> ${uptimeHours} saat`
            : `🚨 <b>DİKKAT!</b>\n\nBot servisleri aktif ancak WhatsApp bağlantısı kopmuş görünüyor! Lütfen kontrol edin.\n\n- <b>WhatsApp Bağlantısı:</b> 🔴 Bağlı Değil`;

        if (config.TELEGRAM_LOG_ID) {
            enqueueMessage(config.TELEGRAM_LOG_ID, statusMessage);
        }
    }, {
        timezone: "Europe/Istanbul" // Sunucunuz farklı bir saat diliminde olsa bile Türkiye saatine göre çalışır.
    });

    // 2. Gün İçinde Detaylı Raporlama (12:00, 16:00, 20:00)
    // '0 12,16,20 * * *' -> Her gün saat 12:00, 16:00 ve 20:00'de çalışır.
    cron.schedule('0 12,16,20 * * *', () => {
        console.log('Detaylı raporlama görevi çalıştırılıyor...');
        const waStatus = getStatus();
        const stats = getStats();
        const uptimeHours = (process.uptime() / 3600).toFixed(2);
        
        const reportMessage = `📊 <b>Detaylı Durum Raporu</b>\n\n` +
                              `<b>Genel Durum:</b>\n` +
                              `- WhatsApp Bağlantısı: ${waStatus.isConnected ? '🟢 Bağlı' : '🔴 Bağlı Değil'}\n` +
                              `- Toplam Çalışma Süresi: ${uptimeHours} saat\n\n` +
                              `<b>İstatistikler:</b>\n` +
                              `- Başlangıçtan Beri İşlenen Mesaj: ${stats.processedMessages} adet`;

        if (config.TELEGRAM_LOG_ID) {
            enqueueMessage(config.TELEGRAM_LOG_ID, reportMessage);
        }
    }, {
        timezone: "Europe/Istanbul"
    });

    console.log('Raporlama servisi başarıyla başlatıldı ve görevler zamanlandı.');
}

module.exports = { initialize };