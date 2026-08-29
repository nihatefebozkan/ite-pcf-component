import * as React from "react";
import { Siparis, Suzgec, TalepBilgisi } from "../types";
import { talepDurumlariGetir } from "../services/talepDurumlari";
import { SiparisKarti } from "./SiparisKarti";
import { cx, ucustaMi } from "./theme";

export interface ITakipPaneliProps {
    siparisler: Siparis[];
    yukleniyor: boolean;
    datasetHatasi: string | null;
    eksikSutunlar: string[];
    paraBirimi: string;
    webAPI: ComponentFramework.WebApi;
    allocatedWidth: number | null;
    allocatedHeight: number | null;
    onRefresh: () => void;
}

const DAR_ESIK = 720;

export const TakipPaneli: React.FC<ITakipPaneliProps> = (props) => {
    const {
        siparisler,
        yukleniyor,
        datasetHatasi,
        eksikSutunlar,
        paraBirimi,
        webAPI,
        allocatedWidth,
        allocatedHeight,
        onRefresh,
    } = props;

    const [suzgec, setSuzgec] = React.useState<Suzgec>("ucusta");
    const [talepler, setTalepler] = React.useState<Map<string, TalepBilgisi>>(new Map());

    // Bağımlılık dizi kimliği değil id listesinin kendisi olsun diye
    // birleştirilmiş metin kullanılıyor; aksi halde her render sorgu atardı.
    const talepIdAnahtari = siparisler
        .map((s) => s.talepId)
        .filter((id): id is string => id !== null)
        .join(",");

    React.useEffect(() => {
        if (talepIdAnahtari.length === 0) {
            setTalepler(new Map());
            return;
        }

        let iptal = false;
        void (async () => {
            const harita = await talepDurumlariGetir(webAPI, talepIdAnahtari.split(","));
            if (!iptal) setTalepler(harita);
        })();

        return () => {
            iptal = true;
        };
    }, [webAPI, talepIdAnahtari]);

    const sayilar = React.useMemo(() => {
        let ucusta = 0;
        let kontrol = 0;
        for (const s of siparisler) {
            if (s.kontrolGerekli) kontrol++;
            const bilgi = s.talepId ? talepler.get(s.talepId) : undefined;
            if (ucustaMi(bilgi?.durumDegeri ?? null)) ucusta++;
        }
        return { ucusta, kontrol };
    }, [siparisler, talepler]);

    const gorunenler = React.useMemo(() => {
        const suzulmus = siparisler.filter((s) => {
            if (suzgec === "kontrol") return s.kontrolGerekli;
            if (suzgec === "ucusta") {
                const bilgi = s.talepId ? talepler.get(s.talepId) : undefined;
                return ucustaMi(bilgi?.durumDegeri ?? null);
            }
            return true;
        });

        // Kontrol bekleyenler her zaman en üstte — gözden kaçmamaları gereken
        // tek grup onlar.
        return suzulmus.slice().sort((a, b) => {
            if (a.kontrolGerekli !== b.kontrolGerekli) return a.kontrolGerekli ? -1 : 1;
            const at = a.sonEpostaTarihi ?? a.olusturulma;
            const bt = b.sonEpostaTarihi ?? b.olusturulma;
            return (at?.getTime() ?? 0) - (bt?.getTime() ?? 0);
        });
    }, [siparisler, talepler, suzgec]);

    const rootStyle: React.CSSProperties =
        allocatedHeight && allocatedHeight > 0 ? { height: `${allocatedHeight}px` } : {};
    const rootClass = cx("stp", allocatedWidth !== null && allocatedWidth < DAR_ESIK && "stp--dar");

    const suzgecler: { deger: Suzgec; etiket: string; uyari?: boolean }[] = [
        { deger: "ucusta", etiket: `Uçuşta (${sayilar.ucusta})` },
        { deger: "kontrol", etiket: `Kontrol bekleyen (${sayilar.kontrol})`, uyari: true },
        { deger: "tumu", etiket: "Tümü" },
    ];

    return (
        <div className={rootClass} style={rootStyle}>
            <div className="stp__bar">
                <div>
                    <h2 className="stp__baslik">Sipariş Takibi</h2>
                    <p className="stp__ozet">
                        <strong>{sayilar.ucusta}</strong> sipariş uçuşta
                        {sayilar.kontrol > 0 && (
                            <>
                                {" · "}
                                <strong className="stp__uyari">{sayilar.kontrol}</strong> kontrol
                                bekliyor
                            </>
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    className="stp-btn-ikon"
                    onClick={onRefresh}
                    title="Yenile"
                    aria-label="Listeyi yenile"
                >
                    ⟳
                </button>
            </div>

            <div className="stp-suzgecler">
                {suzgecler.map((s) => (
                    <button
                        key={s.deger}
                        type="button"
                        className={cx(
                            "stp-cip",
                            s.uyari && "stp-cip--uyari",
                            suzgec === s.deger && "stp-cip--secili"
                        )}
                        onClick={() => setSuzgec(s.deger)}
                        aria-pressed={suzgec === s.deger}
                    >
                        {s.etiket}
                    </button>
                ))}
            </div>

            {eksikSutunlar.length > 0 && (
                <p className="stp-bildirim stp-bildirim--uyari" role="status">
                    Görünümde şu sütunlar yok, kartlarda eksik bilgi olabilir:{" "}
                    {eksikSutunlar.join(", ")}.
                </p>
            )}

            {datasetHatasi ? (
                <p className="stp-bildirim stp-bildirim--hata" role="status">
                    Siparişler yüklenemedi: {datasetHatasi}
                </p>
            ) : yukleniyor && siparisler.length === 0 ? (
                <div className="stp-merkez">
                    <span className="stp-spinner" role="progressbar" aria-label="Yükleniyor" />
                    <p className="stp-merkez__metin">Siparişler yükleniyor…</p>
                </div>
            ) : gorunenler.length === 0 ? (
                <div className="stp-bos">
                    <span className="stp-bos__baslik">
                        {suzgec === "kontrol"
                            ? "Kontrol bekleyen sipariş yok"
                            : "Uçuşta sipariş yok"}
                    </span>
                    <span className="stp-bos__metin">
                        {suzgec === "kontrol"
                            ? "Agent tüm tedarikçi e-postalarını sınıflandırabilmiş."
                            : "Tedarikçi seçilen talepler burada takip edilecek."}
                    </span>
                </div>
            ) : (
                <div className="stp-liste">
                    {gorunenler.map((siparis) => (
                        <SiparisKarti
                            key={siparis.id}
                            siparis={siparis}
                            talep={siparis.talepId ? (talepler.get(siparis.talepId) ?? null) : null}
                            paraBirimi={paraBirimi}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
