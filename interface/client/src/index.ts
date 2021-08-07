import { Emulators } from 'emulators';
import { EmulatorsUi } from 'emulators-ui';

import * as JSZip from 'jszip';

declare const emulators: Emulators
declare const emulatorsUi: EmulatorsUi

const zip = new JSZip();
zip.file('.jsdos/dosbox.conf', '   ');

var promise = null;
if (JSZip.support.uint8array) {
    promise = zip.generateAsync({ type: "uint8array" });
}
if (promise) {
    loadandRun(promise)
}

async function loadandRun(bundleP: Promise<Uint8Array>) {
    const bundle = await bundleP;
    const ci = await emulators.dosboxDirect(bundle);
    const ele = document.getElementById("root");
    const layers = emulatorsUi.dom.layers(ele as HTMLDivElement, {});
    layers.hideLoadingLayer();
    emulatorsUi.graphics.webGl(layers, ci);
    emulatorsUi.controls.keyboard(layers, ci, {});
}