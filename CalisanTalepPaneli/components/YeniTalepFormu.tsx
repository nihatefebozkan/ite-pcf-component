import * as React from "react";
import { OncelikSeviyesi } from "../types";
import { Spinner } from "./Spinner";
import { cx } from "./theme";

export interface IYeniTalepFormuProps {
    /** Kaydı oluşturur; hata fırlatırsa form kullanıcıya gösterir. */
    onGonder: (metin: string, oncelik: OncelikSeviyesi) => Promise<void>;
    onGeri: () => void;
}

interface OncelikSecenegi {
    seviye: OncelikSeviyesi;
    ad: string;
    aciklama: string;
}

/** Etiketler teknik değil, çalışanın kendi diliyle yazıldı. */
const SECENEKLER: OncelikSecenegi[] = [
    { seviye: "dusuk", ad: "Düşük", aciklama: "Olsa iyi olur, acele değil" },
    { seviye: "orta", ad: "Orta", aciklama: "İşimi yavaşlatıyor" },
    { seviye: "yuksek", ad: "Yüksek", aciklama: "İşim tamamen duruyor" },
];

function hataMetni(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) {
        return String((err as { message: unknown }).message);
    }
    return "Bilinmeyen bir hata oluştu.";
}

export const YeniTalepFormu: React.FC<IYeniTalepFormuProps> = ({ onGonder, onGeri }) => {
    const [metin, setMetin] = React.useState("");
    const [oncelik, setOncelik] = React.useState<OncelikSeviyesi>("orta");
    const [gonderiliyor, setGonderiliyor] = React.useState(false);
    const [hata, setHata] = React.useState<string | null>(null);

    const gecerli = metin.trim().length >= 10;

    const handleGonder = React.useCallback(() => {
        if (!gecerli || gonderiliyor) return;

        setGonderiliyor(true);
        setHata(null);
        void onGonder(metin.trim(), oncelik)
            .catch((err: unknown) => {
                setHata(`Talep gönderilemedi: ${hataMetni(err)}`);
            })
            .finally(() => {
                setGonderiliyor(false);
            });
    }, [gecerli, gonderiliyor, metin, oncelik, onGonder]);

    return (
        <div className="ctp-form">
            <button type="button" className="ctp-geri" onClick={onGeri} disabled={gonderiliyor}>
                ← Vazgeç
            </button>

            <div className="ctp-panel">
                <div className="ctp-alan">
                    <label className="ctp-alan__etiket" htmlFor="ctp-metin">
                        Neye ihtiyacın var?
                    </label>
                    <span className="ctp-alan__yardim">
                        Ürün kodu bilmene gerek yok, sorunu kendi cümlelerinle anlat.
                    </span>
                    <textarea
                        id="ctp-metin"
                        className="ctp-metin-kutusu"
                        placeholder="Örnek: Mouse'um çift tıklıyor ve kablosu kopmak üzere. Docking station'la çalışan kablosuz bir mouse olsa yeterli."
                        value={metin}
                        onChange={(e) => setMetin(e.target.value)}
                        disabled={gonderiliyor}
                        rows={5}
                    />
                </div>

                <div className="ctp-alan">
                    <span className="ctp-alan__etiket">Ne kadar acil?</span>
                    <div className="ctp-oncelikler">
                        {SECENEKLER.map((secenek) => (
                            <button
                                key={secenek.seviye}
                                type="button"
                                className={cx(
                                    "ctp-oncelik",
                                    oncelik === secenek.seviye && "ctp-oncelik--secili"
                                )}
                                onClick={() => setOncelik(secenek.seviye)}
                                disabled={gonderiliyor}
                                aria-pressed={oncelik === secenek.seviye}
                            >
                                <span className="ctp-oncelik__ad">{secenek.ad}</span>
                                <span className="ctp-oncelik__aciklama">{secenek.aciklama}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {hata && (
                <p className="ctp-bildirim ctp-bildirim--hata" role="status">
                    {hata}
                </p>
            )}

            <div className="ctp-form__alt">
                <p className="ctp-form__not">
                    {gecerli
                        ? "Talebin müdürüne onaya gidecek."
                        : "Devam etmek için ihtiyacını birkaç cümleyle anlat."}
                </p>
                <button
                    type="button"
                    className="ctp-btn ctp-btn--primary"
                    onClick={handleGonder}
                    disabled={!gecerli || gonderiliyor}
                >
                    {gonderiliyor && <Spinner kucuk />}
                    {gonderiliyor ? "Gönderiliyor…" : "Onaya Gönder"}
                </button>
            </div>
        </div>
    );
};
