import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { SatinAlmaPaneli, ISatinAlmaPaneliProps } from "./components/SatinAlmaPaneli";
import { eksikSutunlar, talepleriEsle } from "./services/datasetMapper";

export class SatinAlmaTalepPaneli implements ComponentFramework.ReactControl<IInputs, IOutputs> {
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
        const dataset = context.parameters.talepler;

        const props: ISatinAlmaPaneliProps = {
            talepler: dataset.loading ? [] : talepleriEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            webAPI: this.webAPI,
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            // Kart tıklaması talebin formunu açar; tedarikçi karşılaştırma
            // bileşeni orada yaşıyor. openDatasetItem uygulamanın kendi
            // gezinme davranışını kullanır.
            onAc: (talepId: string) => {
                const kayit = dataset.records[talepId];
                if (kayit) dataset.openDatasetItem(kayit.getNamedReference());
            },
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(SatinAlmaPaneli, props);
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
