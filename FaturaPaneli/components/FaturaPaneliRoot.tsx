import * as React from "react";
import { Fatura, SiparisBilgisi, Suzgec } from "../types";
import { siparisTutarlariGetir } from "../services/siparisTutarlari";
import { FaturaKarti } from "./FaturaKarti";
import { cx, eslestir, islenmemisMi, odenmemisMi, paraFormatla } from "./theme";

export interface IFaturaPaneliProps {
    faturalar: Fatura[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

export const FaturaPaneliRoot: React.FC<IFaturaPaneliProps> = (props) => {
    const {
        faturalar,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        webAPI,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const [suzgec, setSuzgec] = React.useState<Suzgec>("tumu");
    const [siparisler, setSiparisler] = React.useState<Map<string, SiparisBilgisi>>(new Map());

    const siparisIdAnahtari = faturalar
        .map((f) => f.siparisId)
        .filter((id): id is string => id !== null)
        .join(",");

    React.useEffect(() => {
        if (siparisIdAnahtari.length === 0) {
            setSiparisler(new Map());
            return;
        }

        let iptal = false;
        void (async () => {
            const harita = await siparisTutarlariGetir(webAPI, siparisIdAnahtari.split(","));
            if (!iptal) setSiparisler(harita);
        })();

        return () => {
            iptal = true;
        };
    }, [webAPI, siparisIdAnahtari]);

    const sayilar = React.useMemo(() => {
        let islenmemis = 0;
        let uyusmayan = 0;
        let acikTutar = 0;

        for (const fatura of faturalar) {
            if (islenmemisMi(fatura.durumDegeri)) islenmemis++;
            if (odenmemisMi(fatura.durumDegeri)) acikTutar += fatura.tutar ?? 0;

            const siparis = fatura.siparisId ? siparisler.get(fatura.siparisId) : null;
            if (eslestir(fatura, siparis).tip === "uyusmuyor") uyusmayan++;
        }

        return { islenmemis, uyusmayan, acikTutar };
    }, [faturalar, siparisler]);

    const gorunenler = React.useMemo(() => {
        const suzulmus = faturalar.filter((fatura) => {
            if (suzgec === "islenmemis") return islenmemisMi(fatura.durumDegeri);
            if (suzgec === "odenmemis") return odenmemisMi(fatura.durumDegeri);
            if (suzgec === "uyusmayan") {
                const siparis = fatura.siparisId ? siparisler.get(fatura.siparisId) : null;
                return eslestir(fatura, siparis).tip === "uyusmuyor";
            }
            return true;
        });

        // Uyuşmayanlar en üstte — ödeme yapılmadan önce görülmesi gereken tek grup.
        return suzulmus.slice().sort((a, b) => {
            const au = eslestir(a, a.siparisId ? siparisler.get(a.siparisId) : null).tip;
            const bu = eslestir(b, b.siparisId ? siparisler.get(b.siparisId) : null).tip;
            if (au !== bu) {
                if (au === "uyusmuyor") return -1;
                if (bu === "uyusmuyor") return 1;
            }
            return (b.olusturulma?.getTime() ?? 0) - (a.olusturulma?.getTime() ?? 0);
        });
    }, [faturalar, siparisler, suzgec]);

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("fap", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "fap--dar");

    const suzgecler: { deger: Suzgec; etiket: string; uyari?: boolean }[] = [
        { deger: "tumu", etiket: `Tümü (${faturalar.length})` },
        { deger: "islenmemis", etiket: `İşlenmemiş (${sayilar.islenmemis})` },
        { deger: "uyusmayan", etiket: `Uyuşmayan (${sayilar.uyusmayan})`, uyari: true },
        { deger: "odenmemis", etiket: "Ödenmemiş" },
    ];

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="fap__bar">
                <h2 className="fap__baslik">Faturalar</h2>
                <button
                    type="button"
                    className="fap-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            <div className="fap-ozet">
                <div className="fap-ozet__oge">
                    <span className="fap-ozet__etiket">İşlenecek</span>
                    <span className="fap-ozet__deger">{sayilar.islenmemis}</span>
                </div>
                <div className="fap-ozet__oge">
                    <span className="fap-ozet__etiket">Tutar uyuşmayan</span>
                    <span
                        className={cx(
                            "fap-ozet__deger",
                            sayilar.uyusmayan > 0 && "fap-ozet__deger--uyari"
                        )}
                    >
                        {sayilar.uyusmayan}
                    </span>
                </div>
                <div className="fap-ozet__oge">
                    <span className="fap-ozet__etiket">Açık tutar</span>
                    <span className="fap-ozet__deger">{paraFormatla(sayilar.acikTutar)}</span>
                </div>
            </div>

            <div className="fap-suzgecler">
                {suzgecler.map((s) => (
                    <button
                        key={s.deger}
                        type="button"
                        className={cx(
                            "fap-cip",
                            s.uyari && "fap-cip--uyari",
                            suzgec === s.deger && "fap-cip--secili"
                        )}
                        onClick={() => setSuzgec(s.deger)}
                        aria-pressed={suzgec === s.deger}
                    >
                        {s.etiket}
                    </button>
                ))}
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="fap-bildirim fap-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, karşılaştırma eksik olabilir:{" "}
                    {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="fap-bildirim fap-bildirim--hata" role="status">
                    Faturalar yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && faturalar.length === 0 ? (
                <div className="fap-merkez">
                    <span className="fap-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="fap-merkez__metin">Faturalar yükleniyor…</p>
                </div>
            ) : gorunenler.length === 0 ? (
                <div className="fap-bos">
                    <span className="fap-bos__baslik">
                        {suzgec === "uyusmayan"
                            ? "Tutarı uyuşmayan fatura yok"
                            : "Bu süzgeçte fatura yok"}
                    </span>
                    <span className="fap-bos__metin">
                        {suzgec === "uyusmayan"
                            ? "Tüm faturalar sipariş tutarlarıyla örtüşüyor."
                            : "Satın alma sipariş verdiğinde fatura burada oluşacak."}
                    </span>
                </div>
            ) : (
                <div className="fap-liste">
                    {gorunenler.map((fatura) => (
                        <FaturaKarti
                            key={fatura.id}
                            fatura={fatura}
                            siparis={fatura.siparisId ? (siparisler.get(fatura.siparisId) ?? null) : null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
