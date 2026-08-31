import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { ButcePaneliRoot, IButcePaneliProps } from "./components/ButcePaneliRoot";
import { butceleriEsle, eksikSutunlar } from "./services/datasetMapper";

export class ButcePaneli implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        context.mode.trackContainerResize(true);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const dataset = context.parameters.butceler;

        const props: IButcePaneliProps = {
            donemler: dataset.loading ? [] : butceleriEsle(dataset),
            yukleniyor: dataset.loading,
            datasetHatasi: dataset.error ? dataset.errorMessage : null,
            eksikSutunlar: dataset.loading ? [] : eksikSutunlar(dataset),
            allocatedWidth: context.mode.allocatedWidth > 0 ? context.mode.allocatedWidth : null,
            allocatedHeight: context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : null,
            onRefresh: () => dataset.refresh(),
        };

        return React.createElement(ButcePaneliRoot, props);
    }

    /** Salt okunur ekran; Web API kullanmıyor, forma dönen çıktısı yok. */
    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React ağacını platform söker.
    }
}
