import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { TakipPaneli, ITakipPaneliProps } from "./components/TakipPaneli";
import { eksikSutunlar, siparisleriEsle } from "./services/datasetMapper";

/** Tutar alanı Money tipinde; ortamın para birimi bilinmiyorsa varsayılan. */
const VARSAYILAN_PARA_BIRIMI = "TRY";

export class SiparisTakipPaneli implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private webAPI: ComponentFramework.WebApi;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.webAPI = context.webAPI;
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const dataset = context.parameters.siparisler;

        const props: ITakipPaneliProps = {
            siparisler: dataset.loading ? [] : siparisleriEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            paraBirimi: VARSAYILAN_PARA_BIRIMI,
            webAPI: this.webAPI,
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(TakipPaneli, props);
    }

    /** Salt okunur ekran; forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
