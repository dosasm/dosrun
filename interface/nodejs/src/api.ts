import { Jsdos, jsdosOption } from "./jsdos";
import { DOSBox } from "./dosbox/dosbox";
import { DOSBox_x } from "./dosbox/dosbox-x";
import { dosboxLaunchOptions } from "./dosbox/dosbox_core";

/** different emulators for emulating DOS enviremonent
 */
export enum DOSBEMUTYPE {
    /** `DOSBox` the original dosbox software
     * @homepage: https://www.dosbox.com/
     */
    dosbox = 'dosbox',
    /** `DOSBox-X` Cross-platform DOS emulation package.
     * Complete, accurate emulation and more
     * @homepage: https://dosbox-x.com/
     * @github: https://github.com/joncampbell123/dosbox-x
     */
    dosbox_x = 'dosbox-x',
    /** `js-dos v7` The simpliest API to run DOS games in browser
     * @homepage: https://js-dos.com/v7/build/
     * @github: https://github.com/caiiiycuk/js-dos
     */
    jsdos = 'js-dos'
}

export type launchOptions = dosboxLaunchOptions | jsdosOption

export abstract class DosEmu {
    /**The type of the emulator */
    public readonly type: DOSBEMUTYPE;
    /**The path for the emulator
     * pass `undefined` if your dosbox has been added to path
     * if using `DOSBEMUTYPE.jsdos` put the path of the `dist` folder of jsdos emulators here
     */
    public readonly path?: string;
    /**the name of the emulator maybe be different from its type */
    public readonly name?: string;

    /** check the version of the emulator */
    abstract version(): string | Promise<string> | any;
    /**launch the emulator*/
    abstract launch(option: launchOptions): any;
    static auto(): DosEmu[] | Promise<DosEmu[]> { return [] };
}

export function getDosbox(type: DOSBEMUTYPE, path?: string, darwinApp?: boolean) {
    switch (type) {
        case DOSBEMUTYPE.jsdos:
            return new Jsdos(path);
        case DOSBEMUTYPE.dosbox:
            return DOSBox.fromDir({ path, darwinApp });
        case DOSBEMUTYPE.dosbox_x:
            return DOSBox_x.fromDir({ path, darwinApp });
    }
}

export { DOSBox, DOSBox_x, Jsdos }