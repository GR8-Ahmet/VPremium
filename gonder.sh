#!/bin/bash

# Eğer kullanıcı bir commit mesajı girmemişse, hata ver ve çık.
if [ -z "$1" ]; then
  echo "HATA: Lütfen tırnak içinde bir commit mesajı girin."
  echo "ÖRNEK KULLANIM: bash gonder.sh \"Yeni özellik eklendi\""
  exit 1
fi

# Adım 1: Tüm değişiklikleri Git'e ekle (.gitignore'dakiler hariç)
echo "--> 1. Adım: Değişiklikler hazırlanıyor (git add .)"
git add .

# Adım 2: Değişiklikleri kullanıcının mesajıyla kaydet (commit)
echo "--> 2. Adım: Değişiklikler kaydediliyor (git commit)"
git commit -m "$1"

# Adım 3: Kaydedilen değişiklikleri GitHub'a gönder (push)
echo "--> 3. Adım: GitHub'a gönderiliyor (git push)"
git push origin master

echo ""
echo "İşlem başarıyla tamamlandı!"
