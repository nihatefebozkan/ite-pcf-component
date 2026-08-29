import * as React from "react";
import { OnayDurumDegerleri } from "../schema";
import { Karar, TalepOzeti } from "../types";
import { cx, ilkSatir, kararEtiketi, kararTonu, tarihFormatla } from "./theme";

export interface IKararKartiProps {
    karar: Karar;
    /** Toplu sorgudan gelen talep özeti; henüz yüklenmediyse null. */
    ozet: TalepOzeti | null;
}

function kartTonu(durumDegeri: number | null): string {
    if (durumDegeri === OnayDurumDegerleri.onaylandi) return "mkg-kart--onay";
    if (durumDegeri === OnayDurumDegerleri.reddedildi) return "mkg-kart--red";
    return "mkg-kart--gri";
}

export const KararKarti: React.FC<IKararKartiProps> = ({ karar, ozet }) => {
    // Talep metni çekilemediyse lookup'ın görünen adına düşülür — kart yine
    // anlamlı kalsın diye.
    const baslik = ozet?.metin ? ilkSatir(ozet.metin) : (karar.talepAdi ?? "(talep okunamadı)");
    const reddedildi = karar.durumDegeri === OnayDurumDegerleri.reddedildi;

    return (
        <div className={cx("mkg-kart", kartTonu(karar.durumDegeri))}>
            <div className="mkg-kart__ust">
                <p className="mkg-kart__ozet">{baslik}</p>
                <span className={cx("mkg-rozet", kararTonu(karar.durumDegeri))}>
                    {kararEtiketi(karar.durumDegeri, karar.durumEtiketi)}
                </span>
            </div>

            {karar.aciklama ? (
                <p className="mkg-gerekce">{karar.aciklama}</p>
            ) : (
                reddedildi && (
                    <p className="mkg-gerekce mkg-gerekce--yok">
                        Gerekçe yazılmamış — bu karar panel öncesinde verilmiş olabilir.
                    </p>
                )
            )}

            <div className="mkg-kart__alt">
                {ozet?.calisan && <span className="mkg-kart__calisan">{ozet.calisan}</span>}
                {ozet?.urunTipi && <span className="mkg-etiket">{ozet.urunTipi}</span>}
                <span className="mkg-kart__tarih">{tarihFormatla(karar.kararTarihi)}</span>
            </div>
        </div>
    );
};
