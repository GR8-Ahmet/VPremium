// services/stateService.js
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Engellenen Gruplar
const blockedGroupsFilePath = path.join(__dirname, '..', 'blocked_groups.json');
let blockedGroups = [];
function saveBlockedGroupsState() { try { fs.writeFileSync(blockedGroupsFilePath, JSON.stringify(blockedGroups, null, 2)); } catch (error) { console.error('Engellenen gruplar durumu kaydedilemedi:', error); } }
function loadBlockedGroupsState() { try { if (fs.existsSync(blockedGroupsFilePath)) { const data = fs.readFileSync(blockedGroupsFilePath, 'utf8'); if (data) { blockedGroups = JSON.parse(data); } console.log('Engellenen gruplar dosyadan yüklendi.'); } else { blockedGroups = [...config.BLOCKED_GROUPS]; saveBlockedGroupsState(); console.log('Engellenen gruplar için başlangıç durumu oluşturuldu.'); } } catch (error) { console.error('Engellenen gruplar durumu yüklenemedi:', error); blockedGroups = [...config.BLOCKED_GROUPS]; } }
function getBlockedGroups() { return blockedGroups; }
function addBlockedGroup(groupName) { const lowerGroupName = groupName.toLowerCase().trim(); if (!blockedGroups.includes(lowerGroupName)) { blockedGroups.push(lowerGroupName); saveBlockedGroupsState(); return true; } return false; }
function removeBlockedGroup(groupName) { const lowerGroupName = groupName.toLowerCase().trim(); const index = blockedGroups.indexOf(lowerGroupName); if (index > -1) { blockedGroups.splice(index, 1); saveBlockedGroupsState(); return true; } return false; }

// Adminler
const adminsFilePath = path.join(__dirname, '..', 'admins.json');
let admins = [];
function saveAdminsState() { try { fs.writeFileSync(adminsFilePath, JSON.stringify(admins, null, 2)); } catch (error) { console.error('Admin durumu kaydedilemedi:', error); } }
function loadAdminsState() { try { if (fs.existsSync(adminsFilePath)) { const data = fs.readFileSync(adminsFilePath, 'utf8'); if (data) { admins = JSON.parse(data); } console.log('Adminler dosyadan yüklendi.'); } else { admins = [config.ADMIN_TELEGRAM_ID.toString()]; saveAdminsState(); console.log('Adminler için başlangıç durumu oluşturuldu.'); } } catch (error) { console.error('Admin durumu yüklenemedi:', error); admins = [config.ADMIN_TELEGRAM_ID.toString()]; } }
function getAdmins() { return admins; }
function addAdmin(adminId) { const id = adminId.toString(); if (!admins.includes(id)) { admins.push(id); saveAdminsState(); return true; } return false; }
function removeAdmin(adminId) { const id = adminId.toString(); if (id === config.ADMIN_TELEGRAM_ID.toString()) return 'primary'; if (admins.length <= 1) return 'last'; const index = admins.indexOf(id); if (index > -1) { admins.splice(index, 1); saveAdminsState(); return 'success'; } return 'not_found'; }

// Koli Anahtar Kelimeleri
const koliKeywordsFilePath = path.join(__dirname, '..', 'koli_keywords.json');
let koliKeywords = [];
function saveKoliKeywordsState() { try { fs.writeFileSync(koliKeywordsFilePath, JSON.stringify(koliKeywords, null, 2)); } catch (error) { console.error('Koli anahtar kelimeleri durumu kaydedilemedi:', error); } }
function loadKoliKeywordsState() { try { if (fs.existsSync(koliKeywordsFilePath)) { const data = fs.readFileSync(koliKeywordsFilePath, 'utf8'); if (data) { koliKeywords = JSON.parse(data); } console.log('Koli anahtar kelimeleri dosyadan yüklendi.'); } else { koliKeywords = [...config.KOLI_KEYWORDS]; saveKoliKeywordsState(); console.log('Koli anahtar kelimeleri için başlangıç durumu oluşturuldu.'); } } catch (error) { console.error('Koli anahtar kelimeleri durumu yüklenemedi:', error); koliKeywords = [...config.KOLI_KEYWORDS]; } }
function getKoliKeywords() { return koliKeywords; }
function addKoliKeyword(keyword) { const lowerKeyword = keyword.toLowerCase().trim(); if (!koliKeywords.includes(lowerKeyword)) { koliKeywords.push(lowerKeyword); saveKoliKeywordsState(); return true; } return false; }
function removeKoliKeyword(keyword) { const lowerKeyword = keyword.toLowerCase().trim(); const index = koliKeywords.indexOf(lowerKeyword); if (index > -1) { koliKeywords.splice(index, 1); saveKoliKeywordsState(); return true; } return false; }

// Rota Yönetimi
const routeCacheFilePath = path.join(__dirname, '..', 'route_cache.json');
let routeCache = {};
let activeRoute = null;
function loadRouteCache() { try { if (fs.existsSync(routeCacheFilePath)) { const data = fs.readFileSync(routeCacheFilePath, 'utf8'); if (data) { routeCache = JSON.parse(data); } console.log('Rota önbelleği (cache) dosyadan yüklendi.'); } else { console.log('Rota önbellek dosyası bulunamadı, boş olarak başlatıldı.'); } } catch (error) { console.error('Rota önbelleği yüklenemedi:', error); routeCache = {}; } }
function saveRouteCache() { try { fs.writeFileSync(routeCacheFilePath, JSON.stringify(routeCache, null, 2)); } catch (error) { console.error('Rota önbelleği kaydedilemedi:', error); } }
function getRouteFromCache(startCity, endCity) { const key = `${startCity}-${endCity}`.toLowerCase(); return routeCache[key]; }
function saveRouteToCache(startCity, endCity, citiesOnRoute) { const key = `${startCity}-${endCity}`.toLowerCase(); routeCache[key] = citiesOnRoute; saveRouteCache(); }
function setActiveRoute(startCity, endCity, citiesOnRoute) { activeRoute = { start: startCity, end: endCity, cities: citiesOnRoute }; }
function getActiveRoute() { return activeRoute; }
function clearActiveRoute() { activeRoute = null; }

module.exports = {
    loadState: loadBlockedGroupsState, getBlockedGroups, addBlockedGroup, removeBlockedGroup,
    loadAdminsState, getAdmins, addAdmin, removeAdmin,
    loadKoliKeywordsState, getKoliKeywords, addKoliKeyword, removeKoliKeyword,
    loadRouteCache, getRouteFromCache, saveRouteToCache, setActiveRoute, getActiveRoute, clearActiveRoute
};