/** Uçuştaki tek bir sipariş. */
export interface Siparis {
    id: string;
    /** SIP-00042 gibi; eski kayıtlarda boş olabilir. */
    siparisNo: string | null;
    /** İlgili talebin id'si — durumu ve metni bununla çekiliyor. */
    talepId: string | null;
    tedarikci: string | null;
    tutar: number | null;
    /** Agent bir e-postadan emin olamadığında işaretlenir. */
    kontrolGerekli: boolean;
    /** Agent'ın neden emin olamadığını anlattığı not. */
    agentNotu: string | null;
    /** Bu siparişe dair son işlenen e-postanın tarihi. */
    sonEpostaTarihi: Date | null;
    olusturulma: Date | null;
}

/** Toplu sorguyla çekilen talep bilgisi. */
export interface TalepBilgisi {
    metin: string | null;
    durumDegeri: number | null;
    durumEtiketi: string | null;
}

/** Listede uygulanabilecek süzgeçler. */
export type Suzgec = "ucusta" | "kontrol" | "tumu";
