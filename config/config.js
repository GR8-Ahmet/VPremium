// config/config.js
require('dotenv').config();

const TELEGRAM_TOKENS = Object.keys(process.env).filter(key => key.startsWith('TELEGRAM_TOKEN')).map(key => process.env[key]).filter(Boolean);

const { 
  TELEGRAM_CHAT_ID, 
  TELEGRAM_KOLI_CHAT_ID, 
  TELEGRAM_LOG_ID,
  TELEGRAM_ROTA_CHAT_ID,
  ADMIN_TELEGRAM_ID,
  GEMINI_API_KEY, // YENİ
  WATCHED_GROUPS: WATCHED_GROUPS_ENV,
  KOLI_KEYWORDS: KOLI_KEYWORDS_ENV
} = process.env;

const BLOCKED_GROUPS = (process.env.BLOCKED_GROUPS || '').split(',').map(g => g.trim().toLowerCase()).filter(Boolean);
const WATCHED_GROUPS = (WATCHED_GROUPS_ENV || '').split(',').map(g => g.trim().toLowerCase()).filter(Boolean);
const KOLI_KEYWORDS = (KOLI_KEYWORDS_ENV || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
const DELAY = parseInt(process.env.DELAY || "300", 10);

const replaceNewlines = (template) => template.replace(/\|\|/g, '\n');
const MESSAGE_TEMPLATE_DEFAULT = replaceNewlines(process.env.MESSAGE_TEMPLATE_DEFAULT || "📥 <b>{groupName}</b>\n\n{messageBody}\n\n☎️ {phoneNumbers}");
const MESSAGE_TEMPLATE_LOG_START = replaceNewlines(process.env.MESSAGE_TEMPLATE_LOG_START || "🔱 ~~~~NKSD GRUBU LOG~~~~ 🔱\n✅ Bot servisleri başlatıldı ve aktif.");
const MESSAGE_TEMPLATE_LOG_ERROR = replaceNewlines(process.env.MESSAGE_TEMPLATE_LOG_ERROR || "🔱 <b>~~~~NKSD GRUBU LOG~~~~</b> 🔱\n⚠️ PM2 Hatası Tespit Edildi:\n<pre>{logMessage}</pre>");

const PM2_LOG_FILE_PATH = require('path').join(process.env.USERPROFILE || process.env.HOMEPATH || 'C:\\Users\\Administrator', '.pm2', 'logs', 'wpsedat-error.log');

module.exports = {
  TELEGRAM_TOKENS, TELEGRAM_CHAT_ID, TELEGRAM_KOLI_CHAT_ID, TELEGRAM_LOG_ID, TELEGRAM_ROTA_CHAT_ID, ADMIN_TELEGRAM_ID, GEMINI_API_KEY, KOLI_KEYWORDS, WATCHED_GROUPS, BLOCKED_GROUPS, DELAY, PM2_LOG_FILE_PATH, MESSAGE_TEMPLATE_DEFAULT, MESSAGE_TEMPLATE_LOG_START, MESSAGE_TEMPLATE_LOG_ERROR
};