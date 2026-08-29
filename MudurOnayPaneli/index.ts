import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { OnayPaneli, IOnayPaneliProps } from "./components/OnayPaneli";
import { eksikSutunlar, talepleriEsle } from "./services/datasetMapper";

export class MudurOnayPaneli implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    /** init'te bir kez saklanır; updateView'da kimliği değişmeyen tek referans gerekir. */
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

        const props: IOnayPaneliProps = {
            talepler: dataset.loading ? [] : talepleriEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            webAPI: this.webAPI,
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(OnayPaneli, props);
    }

    /** Kontrol veriyi doğrudan Web API'ye yazıyor; forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
