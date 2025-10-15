#!/bin/bash

# Renk kodları (terminali daha okunaklı yapmak için)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Renk yok

# --- KONTROLLER ---
# 1. Commit mesajı girilmiş mi diye kontrol et.
if [ -z "$1" ]; then
  echo -e "${RED}HATA: Lütfen tırnak içinde bir commit mesajı girmeyi unutma.${NC}"
  echo -e "${YELLOW}ÖRNEK KULLANIM: bash gonder.sh \"Kullanıcı girişi tamamlandı\"${NC}"
  exit 1
fi

# --- İŞLEMLER ---
echo -e "\n${YELLOW}>> 1. Adım: Değişiklikler hazırlanıyor...${NC}"
echo "(.gitignore dosyasındaki listeye göre istenmeyen dosyalar ATLANDI)"
# İşte sihirli an burası! git add komutu .gitignore'ı otomatik olarak okur.
git add .
echo -e "${GREEN}Hazırlık tamamlandı.${NC}"


echo -e "\n${YELLOW}>> 2. Adım: Değişiklikler kaydediliyor...${NC}"
# Değişiklikleri senin mesajınla kaydediyoruz.
git commit -m "$1"
echo -e "${GREEN}Kayıt tamamlandı.${NC}"


echo -e "\n${YELLOW}>> 3. Adım: Değişiklikler GitHub'a gönderiliyor...${NC}"
# Kayıtlı değişiklikleri GitHub'a gönderiyoruz.
git push origin main # DİKKAT: Eğer ana dalının adı 'master' ise bunu 'master' olarak değiştir.
echo -e "${GREEN}Gönderme tamamlandı.${NC}"


echo -e "\n${GREEN}--- İŞLEM BAŞARIYLA TAMAMLANDI! ---${NC}\n"
