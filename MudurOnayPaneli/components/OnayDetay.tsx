import * as React from "react";
import { Karar, Talep } from "../types";
import { Spinner } from "./Spinner";
import {
    cx,
    oncelikTonu,
    tarihSaatFormatla,
    guvenSkoruFormatla,
    bekleyenGun,
} from "./theme";

export interface IOnayDetayProps {
    talep: Talep;
    /** Kararı yazar; hata fırlatırsa ekranda gösterilir. */
    onKarar: (karar: Karar, aciklama: string) => Promise<void>;
    onGeri: () => void;
}

function hataMetni(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) {
        return String((err as { message: unknown }).message);
    }
    return "Bilinmeyen bir hata oluştu.";
}

interface IKunyeProps {
    etiket: string;
    deger: string;
}

const Kunye: React.FC<IKunyeProps> = ({ etiket, deger }) => (
    <div className="mop-kunye__oge">
        <span className="mop-kunye__etiket">{etiket}</span>
        <span className="mop-kunye__deger">{deger}</span>
    </div>
);

export const OnayDetay: React.FC<IOnayDetayProps> = ({ talep, onKarar, onGeri }) => {
    // null iken iki karar butonu görünür; bir karar seçilince onay adımına geçilir.
    // Bu ara adım hem gerekçe almak hem de tek tıkla geri dönüşü olmayan karar
    // verilmesini engellemek için var.
    const [secilenKarar, setSecilenKarar] = React.useState<Karar | null>(null);
    const [aciklama, setAciklama] = React.useState("");
    const [gonderiliyor, setGonderiliyor] = React.useState(false);
    const [hata, setHata] = React.useState<string | null>(null);

    const gerekceZorunlu = secilenKarar === "reddet";
    const gecerli = !gerekceZorunlu || aciklama.trim().length > 0;
    const gun = bekleyenGun(talep.olusturulma);

    const handleOnayla = React.useCallback(() => {
        if (!gecerli || gonderiliyor || secilenKarar === null) return;

        setGonderiliyor(true);
        setHata(null);
        void onKarar(secilenKarar, aciklama.trim())
            .catch((err: unknown) => {
                setHata(hataMetni(err));
                setGonderiliyor(false);
            });
    }, [gecerli, gonderiliyor, secilenKarar, aciklama, onKarar]);

    const handleVazgec = React.useCallback(() => {
        setSecilenKarar(null);
        setAciklama("");
        setHata(null);
    }, []);

    return (
        <div className="mop-detay">
            <button type="button" className="mop-geri" onClick={onGeri} disabled={gonderiliyor}>
                ← Bekleyen taleplere dön
            </button>

            <div className="mop-panel">
                <span className="mop-panel__baslik">Talep</span>
                <p className="mop-detay__metin">{talep.metin ?? "(açıklama girilmemiş)"}</p>

                <div className="mop-kunye">
                    <Kunye etiket="Çalışan" deger={talep.calisan ?? "—"} />
                    <Kunye etiket="Kategori" deger={talep.urunTipi ?? "Belirlenmedi"} />
                    <Kunye
                        etiket="AI güveni"
                        deger={guvenSkoruFormatla(talep.aiGuvenSkoru)}
                    />
                    <Kunye
                        etiket="Bekleme"
                        deger={gun === null ? "—" : gun === 0 ? "Bugün" : `${gun} gün`}
                    />
                </div>

                <div className="mop-detay__satir">
                    {talep.oncelik && (
                        <span className={cx("mop-rozet", oncelikTonu(talep.oncelik))}>
                            {talep.oncelik}
                        </span>
                    )}
                    <span className="mop-karar__yardim">
                        Oluşturulma: {tarihSaatFormatla(talep.olusturulma)}
                    </span>
                </div>
            </div>

            <div className="mop-panel">
                <span className="mop-panel__baslik">Kararın</span>

                {secilenKarar === null ? (
                    <div className="mop-karar">
                        <span className="mop-karar__yardim">
                            Kararın çalışana bildirilecek. Reddedersen gerekçe yazman gerekiyor.
                        </span>
                        <div className="mop-karar__butonlar">
                            <button
                                type="button"
                                className="mop-btn mop-btn--onay"
                                onClick={() => setSecilenKarar("onayla")}
                            >
                                ✓ Onayla
                            </button>
                            <button
                                type="button"
                                className="mop-btn mop-btn--red"
                                onClick={() => setSecilenKarar("reddet")}
                            >
                                ✕ Reddet
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mop-karar">
                        <span className="mop-karar__baslik">
                            {secilenKarar === "onayla" ? "Talebi onaylıyorsun" : "Talebi reddediyorsun"}
                        </span>
                        <span className="mop-karar__yardim">
                            {secilenKarar === "onayla"
                                ? "İstersen bir not bırakabilirsin — zorunlu değil. Onaydan sonra talep satın almaya geçecek."
                                : "Gerekçe zorunlu ve çalışanın panelinde görünecek. Neyin eksik olduğunu yazarsan talebini düzeltip yeniden açabilir."}
                        </span>

                        <textarea
                            className="mop-metin-kutusu"
                            placeholder={
                                secilenKarar === "onayla"
                                    ? "Örnek: Bütçeye uygun, satın alma devralabilir."
                                    : "Örnek: Bu çeyrek için ekipman bütçesi doldu. Ekim ayında tekrar açabilirsin."
                            }
                            value={aciklama}
                            onChange={(e) => setAciklama(e.target.value)}
                            disabled={gonderiliyor}
                            rows={4}
                        />

                        {hata && (
                            <p className="mop-bildirim mop-bildirim--hata" role="status">
                                {hata}
                            </p>
                        )}

                        <div className="mop-karar__alt">
                            <p className="mop-karar__not">
                                {gerekceZorunlu && !gecerli
                                    ? "Reddetmek için gerekçe yazman gerekiyor."
                                    : "Bu işlem geri alınamaz."}
                            </p>
                            <button
                                type="button"
                                className="mop-btn mop-btn--sade"
                                onClick={handleVazgec}
                                disabled={gonderiliyor}
                            >
                                Vazgeç
                            </button>
                            <button
                                type="button"
                                className={cx(
                                    "mop-btn",
                                    secilenKarar === "onayla" ? "mop-btn--onay" : "mop-btn--red-dolu"
                                )}
                                onClick={handleOnayla}
                                disabled={!gecerli || gonderiliyor}
                            >
                                {gonderiliyor && <Spinner kucuk />}
                                {gonderiliyor
                                    ? "Kaydediliyor…"
                                    : secilenKarar === "onayla"
                                      ? "Onayı gönder"
                                      : "Reddi gönder"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
