import * as React from "react";
import { Suzgec, Talep } from "../types";
import { piyasaSayilariGetir } from "../services/piyasaSayilari";
import { TalepKarti } from "./TalepKarti";
import { cx } from "./theme";

export interface ISatinAlmaPaneliProps {
    talepler: Talep[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    /** Talebin formunu açar — tedarikçi seçimi orada yapılıyor. */
    onAc: (talepId: string) => void;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

export const SatinAlmaPaneli: React.FC<ISatinAlmaPaneliProps> = (props) => {
    const {
        talepler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        webAPI,
        allocatedWidth,
        allocatedHeight,
        onAc,
        onRefresh,
    } = props;

    const [suzgec, setSuzgec] = React.useState<Suzgec>("tumu");
    const [piyasaSayilari, setPiyasaSayilari] = React.useState<Map<string, number>>(new Map());

    // Bağımlılık dizi kimliği değil id listesinin kendisi olsun diye
    // birleştirilmiş metin kullanılıyor.
    const talepIdAnahtari = talepler.map((t) => t.id).join(",");

    React.useEffect(() => {
        if (talepIdAnahtari.length === 0) {
            setPiyasaSayilari(new Map());
            return;
        }

        let iptal = false;
        void (async () => {
            const harita = await piyasaSayilariGetir(webAPI, talepIdAnahtari.split(","));
            if (!iptal) setPiyasaSayilari(harita);
        })();

        return () => {
            iptal = true;
        };
    }, [webAPI, talepIdAnahtari]);

    const arastirmasizSayisi = React.useMemo(
        () => talepler.filter((t) => piyasaSayilari.get(t.id) === 0).length,
        [talepler, piyasaSayilari]
    );

    const gorunenler = React.useMemo(() => {
        const suzulmus =
            suzgec === "arastirmasiz"
                ? talepler.filter((t) => piyasaSayilari.get(t.id) === 0)
                : talepler;

        // En eski talep başta — sırada bekleyen işte önemli olan budur.
        return suzulmus
            .slice()
            .sort((a, b) => (a.olusturulma?.getTime() ?? 0) - (b.olusturulma?.getTime() ?? 0));
    }, [talepler, piyasaSayilari, suzgec]);

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("sap", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "sap--dar");

    const suzgecler: { deger: Suzgec; etiket: string; uyari?: boolean }[] = [
        { deger: "tumu", etiket: `Tümü (${talepler.length})` },
        {
            deger: "arastirmasiz",
            etiket: `Araştırması yok (${arastirmasizSayisi})`,
            uyari: true,
        },
    ];

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="sap__bar">
                <div>
                    <h2 className="sap__baslik">Sipariş Bekleyen Talepler</h2>
                    <p className="sap__ozet">
                        <strong>{talepler.length}</strong> talep tedarikçi seçimi bekliyor
                        {arastirmasizSayisi > 0 && (
                            <>
                                {" · "}
                                <strong>{arastirmasizSayisi}</strong> tanesinin piyasa araştırması
                                yok
                            </>
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    className="sap-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            <div className="sap-suzgecler">
                {suzgecler.map((s) => (
                    <button
                        key={s.deger}
                        type="button"
                        className={cx(
                            "sap-cip",
                            s.uyari && "sap-cip--uyari",
                            suzgec === s.deger && "sap-cip--secili"
                        )}
                        onClick={() => setSuzgec(s.deger)}
                        aria-pressed={suzgec === s.deger}
                    >
                        {s.etiket}
                    </button>
                ))}
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="sap-bildirim sap-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="sap-bildirim sap-bildirim--hata" role="status">
                    Talepler yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && talepler.length === 0 ? (
                <div className="sap-merkez">
                    <span className="sap-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="sap-merkez__metin">Talepler yükleniyor…</p>
                </div>
            ) : gorunenler.length === 0 ? (
                <div className="sap-bos">
                    <span className="sap-bos__baslik">
                        {suzgec === "arastirmasiz"
                            ? "Hepsinin piyasa araştırması var"
                            : "Bekleyen talep yok"}
                    </span>
                    <span className="sap-bos__metin">
                        {suzgec === "arastirmasiz"
                            ? "Tedarikçi seçimine geçebilirsin."
                            : "Müdür yeni bir talep onayladığında burada görünecek."}
                    </span>
                </div>
            ) : (
                <div className="sap-liste">
                    {gorunenler.map((talep) => (
                        <TalepKarti
                            key={talep.id}
                            talep={talep}
                            piyasaSayisi={piyasaSayilari.get(talep.id) ?? null}
                            onAc={onAc}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
