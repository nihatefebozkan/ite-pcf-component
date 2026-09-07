import { Fatura } from "../schema";

/**
 * PDF ekiyle ilgili işlemler.
 *
 * Düz bir `<a download>` bağlantısı bu barındırmada sessizce hiçbir şey
 * yapmıyordu; dosya içeriği okunup blob üzerinden işleniyor. Böylece
 * başarısızlık da sessiz kalmıyor, çağıran tarafa hata olarak dönüyor.
 */

function adres(faturaId: string): string {
    return `/api/data/v9.2/${Fatura.entitySet}(${faturaId})/${Fatura.pdfAlani}/$value`;
}

/**
 * İndirilecek dosya adı. Dataverse'te saklanan ad çoğu zaman uzantısız
 * ("FAT-SIP-00002"); uzantı olmadan tarayıcı dosyayı adsız/GUID'li kaydediyor.
 */
function pdfAdiDuzelt(dosyaAdi: string | null, faturaNo: string | null): string {
    const taban = (dosyaAdi ?? faturaNo ?? "fatura").trim().replace(/[\\/:*?"<>|]/g, "-");
    return /\.pdf$/i.test(taban) ? taban : `${taban}.pdf`;
}

async function pdfGetir(faturaId: string): Promise<Blob> {
    const cevap = await fetch(adres(faturaId), {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/octet-stream" },
    });

    if (!cevap.ok) {
        throw new Error(`Sunucu ${cevap.status} döndü`);
    }

    const veri = await cevap.blob();
    if (veri.size === 0) {
        throw new Error("Dosya boş geldi");
    }

    // Sunucu octet-stream döndüğünde tarayıcı PDF olarak göstermiyor.
    return veri.type === "application/pdf"
        ? veri
        : new Blob([veri], { type: "application/pdf" });
}

export async function pdfIndir(
    faturaId: string,
    dosyaAdi: string | null,
    faturaNo: string | null
): Promise<void> {
    const veri = await pdfGetir(faturaId);
    const nesneUrl = URL.createObjectURL(veri);

    const bag = document.createElement("a");
    bag.href = nesneUrl;
    bag.download = pdfAdiDuzelt(dosyaAdi, faturaNo);
    bag.style.display = "none";
    document.body.appendChild(bag);
    bag.click();
    bag.remove();

    // Hemen iptal edilirse bazı tarayıcılar indirmeyi yarıda kesiyor.
    window.setTimeout(() => URL.revokeObjectURL(nesneUrl), 30_000);
}

/**
 * PDF'i yeni sekmede açar.
 *
 * Sekme, `fetch` beklenmeden önce açılıyor: tarayıcılar kullanıcı hareketinden
 * kopmuş `window.open` çağrılarını açılır pencere sayıp engelliyor.
 */
export async function pdfAc(faturaId: string): Promise<void> {
    const sekme = window.open("", "_blank");
    if (!sekme) {
        throw new Error("Tarayıcı yeni sekmeyi engelledi");
    }

    try {
        const veri = await pdfGetir(faturaId);
        const nesneUrl = URL.createObjectURL(veri);
        sekme.location.href = nesneUrl;
        window.setTimeout(() => URL.revokeObjectURL(nesneUrl), 60_000);
    } catch (hata) {
        sekme.close();
        throw hata;
    }
}
