import { DurumDegerleri } from "../schema";
import { AdimDurumu, ZamanCizelgesiAdimi } from "../types";

/**
 * Durum seçenek değerini zaman çizelgesindeki konuma çevirir.
 *
 * Eşleştirme etiket metnine değil sayısal seçenek değerine dayanıyor; etiketler
 * yeniden adlandırıldığında ya da dil değiştiğinde çizelge kırılmaz.
 *
 * Çizelge, Dataverse'deki sekiz durumun tamamını karşılar. Reddedilme bir adım
 * değil, üçüncü adımın alternatif sonucu olduğu için ayrı satır açılmıyor.
 */

const ADIM_ETIKETLERI = [
    "Talep Oluşturuldu",
    "Onay Bekliyor",
    "Onaylandı",
    "Satın Almada",
    "Sipariş Verildi",
    "Kargoda",
    "Teslim Edildi",
] as const;

/** Onay adımının reddedilmiş hâli. */
const RED_ETIKETI = "Reddedildi";

/** Seçenek değeri → çizelge adımı indeksi. */
const ADIM_INDEKSI: Record<number, number> = {
    [DurumDegerleri.talepOlusturuldu]: 0,
    [DurumDegerleri.onayBekliyor]: 1,
    [DurumDegerleri.onaylandi]: 2,
    [DurumDegerleri.reddedildi]: 2,
    [DurumDegerleri.satinAlmada]: 3,
    [DurumDegerleri.siparisVerildi]: 4,
    [DurumDegerleri.kargoda]: 5,
    [DurumDegerleri.teslimEdildi]: 6,
    // Faturalandı, çalışan açısından teslimattan sonraki bir muhasebe adımı.
    // Ayrı bir satır açmak yerine son adıma eşleniyor: ekipman elinde,
    // "fatura işlendi" bilgisi ona bir şey söylemiyor.
    [DurumDegerleri.faturalandi]: 6,
};

export interface DurumKonumu {
    /** Çizelge adımı; tanınmayan bir değerde null. */
    indeks: number | null;
    reddedildi: boolean;
}

export function durumKonumu(durumDegeri: number | null): DurumKonumu {
    if (durumDegeri === null) return { indeks: null, reddedildi: false };

    return {
        indeks: ADIM_INDEKSI[durumDegeri] ?? null,
        reddedildi: durumDegeri === DurumDegerleri.reddedildi,
    };
}

/** Durum rozetinin renk sınıfı. */
export function durumTonu(durumDegeri: number | null): string {
    if (durumDegeri === DurumDegerleri.reddedildi) return "ctp-tone--red";
    if (
        durumDegeri === DurumDegerleri.teslimEdildi ||
        durumDegeri === DurumDegerleri.faturalandi
    ) {
        return "ctp-tone--yesil";
    }
    if (durumDegeri === DurumDegerleri.onayBekliyor) return "ctp-tone--amber";
    if (durumDegeri === DurumDegerleri.talepOlusturuldu) return "ctp-tone--gri";
    if (durumDegeri === null) return "ctp-tone--gri";
    // Onaylandı, Satın Almada, Sipariş Verildi, Kargoda — hepsi "yolda".
    return "ctp-tone--mavi";
}

/**
 * Zaman çizelgesini kurar: mevcut adım "aktif", öncekiler "tamamlandi",
 * sonrakiler "bekliyor". Reddedilmiş talepte onay adımı kırmızıya döner ve
 * sonrası soluk kalır — o talep artık ilerlemeyecek.
 */
export function zamanCizelgesi(durumDegeri: number | null): ZamanCizelgesiAdimi[] {
    const { indeks, reddedildi } = durumKonumu(durumDegeri);
    const konum = indeks ?? 0;

    return ADIM_ETIKETLERI.map((etiket, i) => {
        const gorunenEtiket = i === 2 && reddedildi ? RED_ETIKETI : etiket;

        let adimDurumu: AdimDurumu;
        if (reddedildi && i === 2) {
            adimDurumu = "reddedildi";
        } else if (i < konum) {
            adimDurumu = "tamamlandi";
        } else if (i === konum) {
            adimDurumu = "aktif";
        } else {
            adimDurumu = "bekliyor";
        }

        return { etiket: gorunenEtiket, durum: adimDurumu };
    });
}
