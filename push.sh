#!/usr/bin/env bash
# Projedeki tüm PCF kontrollerini derleyip ortama aktarır.
#
# `pac pcf push` kullanılmıyor çünkü iki sebeple uygun değil:
#   1. Projede birden fazla ControlManifest.Input.xml varsa reddediyor.
#   2. Her zaman development modunda derliyor (büyük, sıkıştırılmamış bundle).
# Çözüm yolu hepsini tek pakette toplar ve Release'de production bundle üretir.
#
# Yeni bir kontrol eklediğinde manifestini aşağıdaki MANIFESTS dizisine ekle,
# yoksa sürümü artmaz ve Dataverse değişikliği sessizce yok sayar.
set -euo pipefail
cd "$(dirname "$0")"

SOLUTION_DIR="TedarikciKarsilastirmaSolution"
UNMANAGED_ZIP="$SOLUTION_DIR/bin/Release/TedarikciKarsilastirmaSolution.zip"

MANIFESTS=(
    "TedarikciKarsilastirma/ControlManifest.Input.xml"
    "CalisanTalepPaneli/ControlManifest.Input.xml"
    "MudurOnayPaneli/ControlManifest.Input.xml"
    "MudurKararGecmisi/ControlManifest.Input.xml"
    "SiparisTakipPaneli/ControlManifest.Input.xml"
    "TedarikciPaneli/ControlManifest.Input.xml"
    "ButcePaneli/ControlManifest.Input.xml"
    "SatinAlmaTalepPaneli/ControlManifest.Input.xml"
    "PiyasaPaneli/ControlManifest.Input.xml"
    "FaturaPaneli/ControlManifest.Input.xml"
)

echo "→ GitHub'dan çekiliyor..."
git pull origin main

# Sürüm artırımı zorunlu: sürümü değişmeyen bir kontrolün kaynaklarını Dataverse
# güncellemiyor, içe aktarım "başarılı" der ama ekranda hiçbir şey değişmez.
for manifest in "${MANIFESTS[@]}"; do
    current=$(grep -oE '<control[^>]*version="[0-9]+\.[0-9]+\.[0-9]+"' "$manifest" \
              | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

    if [ -z "$current" ]; then
        echo "HATA: $manifest içinde üç parçalı sürüm bulunamadı." >&2
        exit 1
    fi

    IFS='.' read -r major minor patch <<< "$current"
    next="$major.$minor.$((patch + 1))"

    # Üç parçalı sürüm aranıyor ki XML bildirimindeki version="1.0" etkilenmesin.
    sed -i -E "s/version=\"$current\"/version=\"$next\"/" "$manifest"
    echo "→ $(basename "$(dirname "$manifest")"): $current → $next"
done

echo "→ Çözüm derleniyor (production)..."
dotnet build "$SOLUTION_DIR" -c Release --nologo -v minimal

echo "→ Ortama aktarılıyor..."
pac solution import --path "$UNMANAGED_ZIP" --publish-changes

echo
echo "Bitti. Tarayıcıda Ctrl+Shift+R ile yenile."
echo "Müşteriye teslim için: $SOLUTION_DIR/bin/Release/TedarikciKarsilastirmaSolution_managed.zip"
