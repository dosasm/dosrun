import React, { useRef, useEffect, useState } from "react";

import { CommandInterface, Emulators } from "emulators";
import { EmulatorsUi } from "emulators-ui";
import { Layers } from "emulators-ui/dist/types/dom/layers";

declare const emulators: Emulators;
declare const emulatorsUi: EmulatorsUi;

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
            const ciP=emulators.dosboxWorker(props.bundle)
            ciP.then(
                _ci => {
                    ci = _ci;
                    layers.hideLoadingLayer();
                    emulatorsUi.graphics.webGl(layers, ci);
                    emulatorsUi.controls.mouse(layers, ci);
                    emulatorsUi.sound.audioNode(ci);
                    emulatorsUi.controls.options(layers, ["default"], () => {/**/ }, 54, 54 / 4, 0)
                }
            );
        }
        return () => {
            if (ci) { ci.exit() }
        }
    }, [layers, props.bundle]);

    return <div ref={rootRef} tabIndex={0}
        onBlur={
            e => {
                if (layers && ci) {
                    //use a psedo ci to prevent the key events to emulators
                    //@see https://github.com/caiiiycuk/js-dos/issues/94
                    const pseudo = { sendKeyEvent: () => { } }
                    emulatorsUi.controls.keyboard(layers, pseudo as any as CommandInterface, {});
                }
            }
        }
        onFocus={
            event => {
                if (layers && ci) {
                    emulatorsUi.controls.keyboard(layers, ci, {});
                }
            }
        }
    >
    </div>;
}