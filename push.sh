#!/usr/bin/env bash
# Ajanın commit'ini al, manifest sürümünü artır, ortama yayınla.
#
# Sürüm artırımı zorunlu: Dataverse, sürümü değişmeyen bir kontrolün
# kaynaklarını güncellemiyor. Push "başarılı" der ama ekranda hiçbir şey
# değişmez.
set -euo pipefail

MANIFEST="TedarikciKarsilastirma/ControlManifest.Input.xml"
PREFIX="ite"

cd "$(dirname "$0")"

echo "→ GitHub'dan çekiliyor..."
git pull origin main

# <control> etiketindeki üç parçalı sürümü bul (XML bildirimindeki
# iki parçalı version="1.0" ile karışmasın diye üç parça arıyoruz).
current=$(grep -oE '<control[^>]*version="[0-9]+\.[0-9]+\.[0-9]+"' "$MANIFEST" \
          | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

if [ -z "$current" ]; then
    echo "HATA: $MANIFEST içinde üç parçalı sürüm bulunamadı." >&2
    exit 1
fi

IFS='.' read -r major minor patch <<< "$current"
next="$major.$minor.$((patch + 1))"

sed -i -E "s/version=\"$current\"/version=\"$next\"/" "$MANIFEST"
echo "→ Manifest sürümü: $current → $next"

echo "→ Yayınlanıyor..."
pac pcf push --publisher-prefix "$PREFIX"

echo
echo "Bitti. Formda Ctrl+Shift+R ile yenile."
