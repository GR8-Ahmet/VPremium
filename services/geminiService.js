// services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

// API anahtarı eksikse uyarı ver
if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'AIzaSyCClKvQifp_hdEfvX5SMOxYAevW78DDbAY') {
    console.warn("GEMINI_API_KEY .env dosyasında bulunamadı veya ayarlanmamış. Gelişmiş hata analizi ve test komutu pasif olacak.");
}

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// GÜNCELLENDİ: Daha stabil olan 'gemini-pro' modeline geçildi.
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

async function analyzeErrorWithGemini(logLine) {
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'AIzaSyCClKvQifp_hdEfvX5SMOxYAevW78DDbAY') {
        return {
            explanation: "Gemini API anahtarı yapılandırılmadığı için analiz yapılamadı.",
            solution: "Lütfen .env dosyanıza geçerli bir GEMINI_API_KEY ekleyin."
        };
    }

    const prompt = `Sen Node.js ve JavaScript konusunda uzman bir asistansın. Aşağıdaki Node.js hata çıktısını analiz et. Hatanın olası nedenini basit ve anlaşılır bir Türkçe ile açıkla. Ardından, bu hatayı çözmek için somut bir çözüm önerisi sun. Cevabını sadece şu formatta ver:
Olası Neden: [Buraya açıklaman gelecek]
Çözüm Önerisi: [Buraya çözümün gelecek]

Hata Çıktısı:
"${logLine}"`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const explanationMatch = text.match(/Olası Neden: (.*)/);
        const solutionMatch = text.match(/Çözüm Önerisi: (.*)/);

        const explanation = explanationMatch ? explanationMatch[1].trim() : "Gemini'den geçerli bir açıklama alınamadı.";
        const solution = solutionMatch ? solutionMatch[1].trim() : "Gemini'den geçerli bir çözüm önerisi alınamadı.";

        return { explanation, solution };

    } catch (error) {
        console.error("Gemini API ile iletişimde hata:", error);
        return {
            explanation: "Yapay zeka analiz servisine ulaşılamadı. API limitlerini veya anahtarını kontrol edin.",
            solution: "Sistem, standart hata takibine devam edecek."
        };
    }
}

async function runHealthCheck() {
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'BURAYA_API_ANAHTARINI_YAPIŞTIR') {
        return { success: false, error: "GEMINI_API_KEY ayarlanmamış." };
    }
    try {
        const prompt = "Sana 'test' yazdığımda, bana sadece ve sadece 'OK' diye cevap ver.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        if (text === 'OK') {
            return { success: true, response: text };
        } else {
            return { success: false, error: `Beklenmedik cevap: ${text}` };
        }
    } catch (error) {
        console.error("Gemini sağlık kontrolü sırasında hata:", error);
        return { success: false, error: error.message };
    }
}

module.exports = { analyzeErrorWithGemini, runHealthCheck };