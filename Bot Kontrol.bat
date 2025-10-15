@echo off
chcp 65001
:anamenu
CLS
color 70
ECHO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ECHO ~~~~NAKLIYE BOTLARI YÖNETİM MERKEZİ~~~~
ECHO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ECHO.
ECHO  1. Nakliye
ECHO  2. Nakliye WP-TG
ECHO  3. Tüm Botları Başlat
ECHO  4. Tüm Botları Durdur
ECHO  5. Tüm Botları Yeniden Başlat
ECHO  6. PM2 Bot Listelerini Göster
echo.

set /p op= Hangi Bot İle İşlem Yapacaksınız? : 
if %op%==1 goto nakliye
if %op%==2 goto nakliyewptg
if %op%==3 goto startbots
if %op%==4 goto stopbots
if %op%==5 goto restartbots
if %op%==6 goto pm2list
goto %choice

:pm2list
start cmd /k "pm2 list"
goto anamenu

:startbots
CLS
start cmd /c "pm2 start wpsedat"
start cmd /c "pm2 start wpcan"
start cmd /c "cd log && node startbots.js"
goto :anamenu

:stopbots
CLS
start cmd /c "pm2 stop wpsedat"
start cmd /c "pm2 stop wpcan"
start cmd /c "cd log && node stopbots.js"
goto :anamenu

:restartbots
CLS
start cmd /c "pm2 restart wpsedat"
start cmd /c "pm2 restart wpcan"
start cmd /c "cd log && node restartbots.js"
goto :anamenu

:nakliye
CLS
ECHO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ECHO ~~~~NAKLIYE GRUBU BOT YÖNETİM MERKEZİ~~~~
ECHO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ECHO.
ECHO  1. Botu Başlat
ECHO  2. Botu Durdur
ECHO  3. Botu Yeniden Başlat
ECHO  4. Logları aç
ECHO  5. Ana Menüye Dön
echo.

set /p op= Hangi İşlemi Yapacaksınız? :
if %op%==1 goto startnakliye
if %op%==2 goto stopnakliye
if %op%==3 goto restartnakliye
if %op%==4 goto lognakliye
if %op%==5 goto anamenu


:nakliyewptg
CLS
ECHO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ECHO ~~~~NAKLIYE WP-TG GRUBU BOT YÖNETİM MERKEZİ~~~~
ECHO ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
echo.
ECHO  1. Botu Başlat
ECHO  2. Botu Durdur
ECHO  3. Botu Yeniden Başlat
ECHO  4. Logları aç
ECHO  5. Ana Menüye Dön
echo.

set /p op= Hangi İşlemi Yapacaksınız? :
if %op%==1 goto startnakliyewptg
if %op%==2 goto stopnakliyewptg
if %op%==3 goto restartnakliyewptg
if %op%==4 goto lognakliyewptg
if %op%==5 goto anamenu

:startnakliye
start cmd /c "pm2 start wpsedat"
start cmd /c "cd log && node nakliyestartlog.js"
goto :anamenu

:stopnakliye
start cmd /c "pm2 stop wpsedat"
start cmd /c "cd log && node nakliyestoplog.js"
goto :anamenu

:restartnakliye
start cmd /c "pm2 restart wpsedat"
start cmd /c "cd log && node nakliyerestartlog.js"
goto :anamenu

:lognakliye
start cmd /k "color 8f && pm2 log wpsedat"
goto :anamenu

:startnakliyewptg
start cmd /c "pm2 start wpcan"
start cmd /c "cd log && node nakliyewptgstartlog.js"
goto :anamenu

:stopnakliyewptg
start cmd /c "pm2 stop wpcan"
start cmd /c "cd log && node nakliyewptgstoplog.js"
goto :anamenu

:restartnakliyewptg
start cmd /c "pm2 restart wpcan"
start cmd /c "cd log && node nakliyewptgrestartlog.js"
goto :anamenu

:lognakliyewptg
start cmd /k "color 8f && pm2 log wpcan"
goto :anamenu
