import React, { useRef, useEffect, useState } from "react";

import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";
import { CommandInterface, Emulators } from "emulators";
import { EmulatorsUi } from "emulators-ui";
import { Layers } from "emulators-ui/dist/types/dom/layers";

declare const emulators: Emulators;
declare const emulatorsUi: EmulatorsUi;

declare const Dos: DosFactoryType;

interface PlayerProps {
    bundle: Uint8Array;
}

let ci: CommandInterface | null = null;

export default function DosPlayer(props: PlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [layers, setlayers] = useState<Layers | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;
        const layers = emulatorsUi.dom.layers(root);
        setlayers(layers);
        layers.showLoadingLayer();

        return () => {
            if (ci) { ci.exit() }
        };
    }, [rootRef]);

    useEffect(() => {
        if (layers !== null) {
            emulators.dosboxWorker(props.bundle).then(
                _ci => {
                    ci = _ci;
                    layers.hideLoadingLayer();
                    emulatorsUi.graphics.webGl(layers, ci);
                    emulatorsUi.controls.keyboard(layers, ci, {});
                }
            );
        }
        return () => {
            if (ci) { ci.exit() }
        }
    }, [layers, props.bundle]);

    return <div ref={rootRef} style={{ width: "100%", height: "100%" }}>
    </div>;
}