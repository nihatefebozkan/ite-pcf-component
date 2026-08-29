import * as React from "react";
import { Siparis, TalepBilgisi } from "../types";
import {
    cx,
    durumTonu,
    gunFarki,
    ilkSatir,
    paraFormatla,
    sessizMi,
    tarihFormatla,
    SESSIZLIK_ESIGI_GUN,
} from "./theme";

export interface ISiparisKartiProps {
    siparis: Siparis;
    /** Toplu sorgudan gelen talep bilgisi; henüz yüklenmediyse null. */
    talep: TalepBilgisi | null;
    paraBirimi: string;
}

export const SiparisKarti: React.FC<ISiparisKartiProps> = ({ siparis, talep, paraBirimi }) => {
    const sessiz = sessizMi(siparis.sonEpostaTarihi, siparis.olusturulma);
    const sessizGun = gunFarki(siparis.sonEpostaTarihi ?? siparis.olusturulma);

    return (
        <div className={cx("stp-kart", siparis.kontrolGerekli && "stp-kart--kontrol")}>
            <div className="stp-kart__ust">
                <div className="stp-kart__baslik-blok">
                    <span className="stp-kart__no">{siparis.siparisNo ?? "Numara atanmamış"}</span>
                    <p className="stp-kart__ozet">{ilkSatir(talep?.metin ?? null)}</p>
                </div>
                <span className="stp-kart__tutar">{paraFormatla(siparis.tutar, paraBirimi)}</span>
            </div>

            {siparis.kontrolGerekli && (
                <div className="stp-agent">
                    <span className="stp-agent__baslik">Kontrol gerekiyor</span>
                    <p className="stp-agent__metin">
                        {siparis.agentNotu ??
                            "Agent bir e-postayı sınıflandıramadı ama gerekçe yazmamış. Gelen kutusunu kontrol edin."}
                    </p>
                </div>
            )}

            <div className="stp-kart__alt">
                <span className={cx("stp-rozet", durumTonu(talep?.durumDegeri ?? null))}>
                    {talep?.durumEtiketi ?? "Durum okunamadı"}
                </span>
                {siparis.tedarikci && (
                    <span className="stp-kart__tedarikci">{siparis.tedarikci}</span>
                )}
                {sessiz && sessizGun !== null && (
                    <span className="stp-rozet stp-tone--amber">
                        {sessizGun} gündür ses yok
                    </span>
                )}
                <span className="stp-kart__tarih">
                    {siparis.sonEpostaTarihi
                        ? `Son haber ${tarihFormatla(siparis.sonEpostaTarihi)}`
                        : `Açılış ${tarihFormatla(siparis.olusturulma)}`}
                </span>
            </div>
        </div>
    );
};

/** Eşik değeri dışarıdan da okunabilsin diye yeniden dışa aktarılıyor. */
export { SESSIZLIK_ESIGI_GUN };
