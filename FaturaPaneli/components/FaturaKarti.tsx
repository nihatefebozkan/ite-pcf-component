import * as React from "react";
import { Fatura, SiparisBilgisi } from "../types";
import { pdfAc, pdfIndir } from "../services/pdfIndir";
import {
    cx,
    durumTonu,
    eslesmeEtiketi,
    eslesmeTonu,
    eslestir,
    kdvKirilimi,
    paraFormatla,
    siparisEtiketi,
    tarihFormatla,
} from "./theme";

export interface IFaturaKartiProps {
    fatura: Fatura;
    /** Toplu sorgudan gelen sipariş bilgisi; henüz yüklenmediyse null. */
    siparis: SiparisBilgisi | null;
}

export const FaturaKarti: React.FC<IFaturaKartiProps> = ({ fatura, siparis }) => {
    const sonuc = eslestir(fatura, siparis);
    const uyusmuyor = sonuc.tip === "uyusmuyor";

    const [iniyor, setIniyor] = React.useState(false);
    const [indirmeHatasi, setIndirmeHatasi] = React.useState<string | null>(null);

    const indir = React.useCallback(
        (olay: React.MouseEvent) => {
            // Kartın kendisi de tıklanabilir; düğme onun yerine geçmesin.
            olay.stopPropagation();
            if (!fatura.pdfAdi) return;

            setIniyor(true);
            setIndirmeHatasi(null);

            void pdfIndir(fatura.id, fatura.pdfAdi, fatura.faturaNo)
                .catch((hata: unknown) => {
                    setIndirmeHatasi(hata instanceof Error ? hata.message : "Bilinmeyen hata");
                })
                .finally(() => setIniyor(false));
        },
        [fatura.id, fatura.pdfAdi, fatura.faturaNo]
    );

    const ac = React.useCallback(() => {
        if (!fatura.pdfAdi) return;

        setIndirmeHatasi(null);
        void pdfAc(fatura.id).catch((hata: unknown) => {
            setIndirmeHatasi(hata instanceof Error ? hata.message : "Bilinmeyen hata");
        });
    }, [fatura.id, fatura.pdfAdi]);

    // Eşleştirme faturanın KDV dahil mi olduğunu söylüyor; kırılım da ona göre.
    const kirilim = kdvKirilimi(fatura.tutar, fatura.kdvOrani, sonuc.tip === "kdvDahil");

    const pdfVar = Boolean(fatura.pdfAdi);

    return (
        <div
            className={cx(
                "fap-kart",
                uyusmuyor && "fap-kart--uyusmuyor",
                pdfVar && "fap-kart--acilir"
            )}
            onClick={pdfVar ? ac : undefined}
            onKeyDown={
                pdfVar
                    ? (olay) => {
                          if (olay.key === "Enter" || olay.key === " ") {
                              olay.preventDefault();
                              ac();
                          }
                      }
                    : undefined
            }
            role={pdfVar ? "button" : undefined}
            tabIndex={pdfVar ? 0 : undefined}
            title={pdfVar ? "PDF'i yeni sekmede aç" : undefined}
        >
            <div className="fap-kart__ust">
                <div className="fap-kart__baslik-blok">
                    <p className="fap-kart__no">{fatura.faturaNo ?? "(numara yok)"}</p>
                    <span className="fap-kart__siparis">{siparisEtiketi(fatura, siparis)}</span>
                </div>
                <span className="fap-kart__tutar">{paraFormatla(fatura.tutar)}</span>
            </div>

            <div className={cx("fap-eslesme", uyusmuyor && "fap-eslesme--uyusmuyor")}>
                <span className="fap-eslesme__baslik">Sipariş karşılaştırması</span>
                <p className="fap-eslesme__metin">
                    {sonuc.tip === "uyusmuyor" ? (
                        <>
                            Sipariş {paraFormatla(siparis?.tutar ?? null)}, fatura{" "}
                            {paraFormatla(fatura.tutar)} —{" "}
                            <strong>
                                {paraFormatla(Math.abs(sonuc.fark))}{" "}
                                {sonuc.fark > 0 ? "fazla" : "eksik"}
                            </strong>
                            .
                        </>
                    ) : sonuc.tip === "bilinmiyor" ? (
                        sonuc.sebep
                    ) : (
                        <>
                            Sipariş {paraFormatla(siparis?.tutar ?? null)} ile{" "}
                            {sonuc.tip === "kdvDahil" ? "KDV dahil olarak" : "birebir"} tutuyor.
                        </>
                    )}
                </p>
            </div>

            {kirilim && (
                <div className="fap-kdv">
                    <span>
                        KDV hariç <strong>{paraFormatla(kirilim.net)}</strong>
                    </span>
                    <span>
                        KDV (%{fatura.kdvOrani}) <strong>{paraFormatla(kirilim.kdv)}</strong>
                    </span>
                    <span>
                        Toplam <strong>{paraFormatla(kirilim.brut)}</strong>
                    </span>
                </div>
            )}

            <div className="fap-kart__alt">
                {fatura.durumEtiketi && (
                    <span className={cx("fap-rozet", durumTonu(fatura.durumDegeri))}>
                        {fatura.durumEtiketi}
                    </span>
                )}
                <span className={cx("fap-rozet", eslesmeTonu(sonuc))}>
                    {eslesmeEtiketi(sonuc)}
                </span>
                {fatura.pdfAdi ? (
                    <button
                        type="button"
                        className={cx("fap-pdf", indirmeHatasi && "fap-pdf--hata")}
                        onClick={indir}
                        disabled={iniyor}
                        title={indirmeHatasi ?? fatura.pdfAdi}
                    >
                        {iniyor
                            ? "İndiriliyor…"
                            : indirmeHatasi
                              ? "İndirilemedi · tekrar dene"
                              : "↓ PDF indir"}
                    </button>
                ) : (
                    <span className="fap-pdf fap-pdf--yok">PDF eki yok</span>
                )}
                <span className="fap-kart__tarih">{tarihFormatla(fatura.olusturulma)}</span>
            </div>
        </div>
    );
};
