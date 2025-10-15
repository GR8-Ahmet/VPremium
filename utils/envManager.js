// utils/envManager.js
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function addTokenToEnv(token) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        
        let lastTokenIndex = 0;
        lines.forEach(line => {
            if (line.startsWith('TELEGRAM_TOKEN')) {
                const match = line.match(/^TELEGRAM_TOKEN(\d+)=/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    if (index > lastTokenIndex) {
                        lastTokenIndex = index;
                    }
                }
            }
        });

        const newTokenIndex = lastTokenIndex + 1;
        const newTokenKey = `TELEGRAM_TOKEN${newTokenIndex}`;
        const newLine = `\n${newTokenKey}=${token}`;

        fs.appendFileSync(envPath, newLine);
        
        console.log(`${newTokenKey} .env dosyasına eklendi.`);
        return { success: true, newTokenKey };

    } catch (error) {
        console.error('.env dosyasına yazılırken hata oluştu:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { addTokenToEnv };