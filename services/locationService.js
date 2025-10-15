// services/locationService.js
const fs = require('fs');
const path = require('path');

const cityDataPath = path.join(__dirname, '..', 'cities_data.json');
const allLocations = []; // { name, lat, lon } objelerini tutar
const locationMap = new Map(); // isimden koordinata hızlı erişim için
let allLocationNames = new Set(); // metin içinde arama için

function loadLocationData() {
    try {
        if (fs.existsSync(cityDataPath)) {
            const data = fs.readFileSync(cityDataPath, 'utf8');
            const provinces = JSON.parse(data);
            
            provinces.forEach(province => {
                const provinceName = province.il_adi.toLowerCase();
                if (province.latitude && province.longitude) {
                    const provinceCoords = { lat: parseFloat(province.latitude), lon: parseFloat(province.longitude) };
                    allLocations.push({ name: provinceName, ...provinceCoords });
                    locationMap.set(provinceName, provinceCoords);
                }

                (province.ilceler || []).forEach(district => {
                    const districtName = district.ilce_adi.toLowerCase();
                    if (district.latitude && district.longitude) {
                        const districtCoords = { lat: parseFloat(district.latitude), lon: parseFloat(district.longitude) };
                        allLocations.push({ name: districtName, ...districtCoords });
                        locationMap.set(districtName, districtCoords);
                    }
                });
            });
            allLocationNames = new Set(locationMap.keys());
            console.log(`${locationMap.size} konum verisi (il/ilçe) başarıyla yüklendi.`);
        } else {
            console.error('`cities_data.json` dosyası bulunamadı! Rota özelliği çalışmayacak.');
        }
    } catch (error) {
        console.error('Konum verileri yüklenirken hata oluştu:', error);
    }
}

// İki koordinat arasındaki mesafeyi (km) hesaplayan Haversine formülü
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

// Bir konumun, başlangıç ve bitiş noktaları arasındaki "düz çizgi koridorunda" olup olmadığını kontrol eder
function isLocationOnRoute(locationCoords, startCoords, endCoords) {
    const toleranceFactor = 1.15; // %15'lik bir sapma payı
    const distStartToEnd = getDistance(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);
    const distStartToLoc = getDistance(startCoords.lat, startCoords.lon, locationCoords.lat, locationCoords.lon);
    const distLocToEnd = getDistance(locationCoords.lat, locationCoords.lon, endCoords.lat, endCoords.lon);
    
    // Eğer A->C + C->B mesafesi, A->B mesafesinden çok sapmıyorsa, C noktası rota üzerindedir.
    return (distStartToLoc + distLocToEnd) < (distStartToEnd * toleranceFactor);
}

function getLocationCoords(name) {
    return locationMap.get(name.toLowerCase().trim());
}

function getAllLocations() {
    return allLocations;
}

function findLocationsInText(text) {
    const found = new Set();
    const cleanText = text.toLowerCase().replace(/,/g, ' ').replace(/\./g, ' ');
    // Metni kelimelere ayır ve her kelimenin şehir listesinde olup olmadığını kontrol et
    cleanText.split(/\s+/).forEach(word => {
        if (allLocationNames.has(word)) {
            found.add(word);
        }
    });
    return Array.from(found);
}

module.exports = {
    loadLocationData,
    isLocationOnRoute,
    getLocationCoords,
    getAllLocations,
    findLocationsInText
};