import * as React from "react";
import { OnayDurumDegerleri } from "../schema";
import { Karar, Suzgec, TalepOzeti } from "../types";
import { talepMetinleriGetir } from "../services/talepMetinleri";
import { KararKarti } from "./KararKarti";
import { cx } from "./theme";

export interface IKararGecmisiProps {
    kararlar: Karar[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

const SUZGECLER: { deger: Suzgec; etiket: string }[] = [
    { deger: "tumu", etiket: "Tümü" },
    { deger: "onaylanan", etiket: "Onayladıklarım" },
    { deger: "reddedilen", etiket: "Reddettiklerim" },
];

export const KararGecmisi: React.FC<IKararGecmisiProps> = (props) => {
    const {
        kararlar,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        webAPI,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const [suzgec, setSuzgec] = React.useState<Suzgec>("tumu");
    const [ozetler, setOzetler] = React.useState<Map<string, TalepOzeti>>(new Map());

    // Sayfadaki talep id'leri değiştikçe metinleri tek sorguda çek. Bağımlılık
    // dizi kimliği değil id listesinin kendisi olsun diye birleştirilmiş metin
    // kullanılıyor; aksi halde her render yeniden sorgu atardı.
    const talepIdAnahtari = kararlar
        .map((k) => k.talepId)
        .filter((id): id is string => id !== null)
        .join(",");

    React.useEffect(() => {
        if (talepIdAnahtari.length === 0) {
            setOzetler(new Map());
            return;
        }

        let iptal = false;
        void (async () => {
            const harita = await talepMetinleriGetir(webAPI, talepIdAnahtari.split(","));
            if (!iptal) setOzetler(harita);
        })();

        return () => {
            iptal = true;
        };
    }, [webAPI, talepIdAnahtari]);

    const sayilar = React.useMemo(() => {
        let onay = 0;
        let red = 0;
        for (const k of kararlar) {
            if (k.durumDegeri === OnayDurumDegerleri.onaylandi) onay++;
            else if (k.durumDegeri === OnayDurumDegerleri.reddedildi) red++;
        }
        return { onay, red };
    }, [kararlar]);

    const gorunenler = React.useMemo(() => {
        if (suzgec === "onaylanan") {
            return kararlar.filter((k) => k.durumDegeri === OnayDurumDegerleri.onaylandi);
        }
        if (suzgec === "reddedilen") {
            return kararlar.filter((k) => k.durumDegeri === OnayDurumDegerleri.reddedildi);
        }
        return kararlar;
    }, [kararlar, suzgec]);

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("mkg", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "mkg--dar");

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="mkg__bar">
                <div>
                    <h2 className="mkg__baslik">Kararlarım</h2>
                    <p className="mkg__ozet">
                        <strong>{sayilar.onay}</strong> onay · <strong>{sayilar.red}</strong> ret
                    </p>
                </div>

                <button
                    type="button"
                    className="mkg-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            <div className="mkg-suzgecler">
                {SUZGECLER.map((s) => (
                    <button
                        key={s.deger}
                        type="button"
                        className={cx("mkg-cip", suzgec === s.deger && "mkg-cip--secili")}
                        onClick={() => setSuzgec(s.deger)}
                        aria-pressed={suzgec === s.deger}
                    >
                        {s.etiket}
                    </button>
                ))}
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="mkg-bildirim mkg-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="mkg-bildirim mkg-bildirim--hata" role="status">
                    Kararlar yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && kararlar.length === 0 ? (
                <div className="mkg-merkez">
                    <span className="mkg-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="mkg-merkez__metin">Kararlar yükleniyor…</p>
                </div>
            ) : gorunenler.length === 0 ? (
                <div className="mkg-bos">
                    <span className="mkg-bos__baslik">
                        {kararlar.length === 0 ? "Henüz karar vermedin" : "Bu süzgeçte kayıt yok"}
                    </span>
                    <span className="mkg-bos__metin">
                        {kararlar.length === 0
                            ? "Onayladığın ve reddettiğin talepler burada birikecek."
                            : "Başka bir süzgeç deneyebilirsin."}
                    </span>
                </div>
            ) : (
                <div className="mkg-liste">
                    {gorunenler.map((karar) => (
                        <KararKarti
                            key={karar.id}
                            karar={karar}
                            ozet={karar.talepId ? (ozetler.get(karar.talepId) ?? null) : null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
