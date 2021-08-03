import { EmulatorsUi } from 'emulators-ui';
import { CI } from './pseudoCI';

declare const emulatorsUi: EmulatorsUi;

const status = {
    frame: 0, sound: 0,
    soundEnabled: false
};

const ci = new CI();

const layers = emulatorsUi.dom.layers(document.getElementById("root") as HTMLDivElement);
layers.hideLoadingLayer();
emulatorsUi.graphics.webGl(layers, ci);
emulatorsUi.controls.keyboard(layers, ci, {});
document.getElementById('soundControl').addEventListener(
    'change', e => {
        let checked = (e.currentTarget as any).checked;
        if (checked === true) {
            ci.mute()
        } else if (checked === false) {
            ci.unmute()
        }
        if (status.soundEnabled === false && checked === false && ci !== null) {
            emulatorsUi.sound.audioNode(ci);
            status.soundEnabled = true;
        }
    }
)

