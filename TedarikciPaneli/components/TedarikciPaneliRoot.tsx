import * as React from "react";
import { Suzgec, Tedarikci } from "../types";
import { TedarikciKarti } from "./TedarikciKarti";
import { cx } from "./theme";

export interface ITedarikciPaneliProps {
    tedarikciler: Tedarikci[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

export const TedarikciPaneliRoot: React.FC<ITedarikciPaneliProps> = (props) => {
    const {
        tedarikciler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const [suzgec, setSuzgec] = React.useState<Suzgec>("tumu");

    const sayilar = React.useMemo(() => {
        let anlasmali = 0;
        let epostasiz = 0;
        for (const t of tedarikciler) {
            if (t.anlasmali) anlasmali++;
            if (!t.email) epostasiz++;
        }
        return { anlasmali, epostasiz };
    }, [tedarikciler]);

    const gorunenler = React.useMemo(() => {
        const suzulmus = tedarikciler.filter((t) => {
            if (suzgec === "anlasmali") return t.anlasmali;
            if (suzgec === "epostasiz") return !t.email;
            return true;
        });

        // E-postası eksik olanlar en üstte — düzeltilmesi gereken tek grup onlar.
        return suzulmus
            .slice()
            .sort((a, b) => {
                const ae = a.email ? 1 : 0;
                const be = b.email ? 1 : 0;
                if (ae !== be) return ae - be;
                return a.ad.localeCompare(b.ad, "tr-TR");
            });
    }, [tedarikciler, suzgec]);

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("tdp", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "tdp--dar");

    const suzgecler: { deger: Suzgec; etiket: string; uyari?: boolean }[] = [
        { deger: "tumu", etiket: `Tümü (${tedarikciler.length})` },
        { deger: "anlasmali", etiket: `Anlaşmalı (${sayilar.anlasmali})` },
        { deger: "epostasiz", etiket: `E-postası yok (${sayilar.epostasiz})`, uyari: true },
    ];

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="tdp__bar">
                <div>
                    <h2 className="tdp__baslik">Tedarikçiler</h2>
                    <p className="tdp__ozet">
                        <strong>{tedarikciler.length}</strong> tedarikçi ·{" "}
                        <strong>{sayilar.anlasmali}</strong> anlaşmalı
                    </p>
                </div>

                <button
                    type="button"
                    className="tdp-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            {sayilar.epostasiz > 0 && (
                <p className="tdp-bildirim tdp-bildirim--hata" role="status">
                    <strong>{sayilar.epostasiz} tedarikçinin e-posta adresi yok.</strong> Bunlar
                    seçilirse otomatik sipariş e-postası gönderilemez ve sipariş sessizce askıda
                    kalır.
                </p>
            )}

            <div className="tdp-suzgecler">
                {suzgecler.map((s) => (
                    <button
                        key={s.deger}
                        type="button"
                        className={cx(
                            "tdp-cip",
                            s.uyari && "tdp-cip--uyari",
                            suzgec === s.deger && "tdp-cip--secili"
                        )}
                        onClick={() => setSuzgec(s.deger)}
                        aria-pressed={suzgec === s.deger}
                    >
                        {s.etiket}
                    </button>
                ))}
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="tdp-bildirim tdp-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="tdp-bildirim tdp-bildirim--hata" role="status">
                    Tedarikçiler yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && tedarikciler.length === 0 ? (
                <div className="tdp-merkez">
                    <span className="tdp-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="tdp-merkez__metin">Tedarikçiler yükleniyor…</p>
                </div>
            ) : gorunenler.length === 0 ? (
                <div className="tdp-bos">
                    <span className="tdp-bos__baslik">Bu süzgeçte tedarikçi yok</span>
                    <span className="tdp-bos__metin">Başka bir süzgeç deneyebilirsin.</span>
                </div>
            ) : (
                <div className="tdp-liste">
                    {gorunenler.map((tedarikci) => (
                        <TedarikciKarti key={tedarikci.id} tedarikci={tedarikci} />
                    ))}
                </div>
            )}
        </div>
    );
};
