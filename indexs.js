// indexs.js
const config = require('./config/config');
const stateService = require('./services/stateService');
const whatsappService = require('./services/whatsappService');
const logMonitor = require('./services/logMonitor');
const commandService = require('./services/commandService');
const reportingService = require('./services/reportingService');
const locationService = require('./services/locationService');

console.log('============================================');
console.log('     WhatsApp -> Telegram Aktarım Botu');
console.log('============================================');

if (!config.TELEGRAM_TOKENS.length || !config.TELEGRAM_CHAT_ID) {
  console.error('[HATA] Lütfen .env dosyasındaki TELEGRAM_TOKEN1 ve TELEGRAM_CHAT_ID değerlerini kontrol edin.');
  process.exit(1);
}

if (!config.ADMIN_TELEGRAM_ID) {
    console.error('[HATA] Lütfen .env dosyasındaki ADMIN_TELEGRAM_ID değerini ayarlayın.');
    process.exit(1);
}

console.log(`Aktif Telegram botu sayısı: ${config.TELEGRAM_TOKENS.length}`);
console.log('Servisler başlatılıyor...');

locationService.loadLocationData();
stateService.loadState();
stateService.loadAdminsState();
stateService.loadKoliKeywordsState();
stateService.loadRouteCache();

whatsappService.initialize();
logMonitor.startMonitoring();
commandService.initialize(); // Burası artık hatasız çalışacak
reportingService.initialize();

console.log('Tüm servisler başarıyla başlatıldı.');