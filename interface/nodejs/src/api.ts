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

/**Common Launch options supported by all emulators
 * 
*/
export interface commonLaunchOption {

    /**mount the files from the local filesystem to the emulator's filesystem
     * 
     * for example: `{from:'C:\dosbox\test',to:'d'}`
     * 
     * - this is equivalent to run command `mount d C:\dosbox\test` in dosbox and dosbox-x
     * - for jsdos, a new jsdos bunle with following structure will be generated, 
     * and the `/mnt/c` will be mounted to disk c
     *    - $prefix
     *        - /.jsdos
     *        - /mnt/c
     *        - ......
     */
    mount?: { from: string, to: string }[];

    /**the commands to run in the emulator after launching
     * This is usually a part of dosbox conf. 
     * If set this, the `AUTOEXEC` section in `confStr` will be **ignored**
    */
    autoexec?: string[];

    /**The parameters when opening DOSBox
     * will be ignored when using jsdos
     */
    parameters?: string;

    /** The dosbox configurations file
     * For simplicity, the `AUTOEXEC` section will be ignored is set autoexec
     * pass the **CONTENT** of your configuration here
     *
     * - for **js-dos** and **dosbox**, see https://www.dosbox.com/wiki/Dosbox.conf
     * - for **dosbox-x**, see https://github.com/joncampbell123/dosbox-x/blob/master/dosbox-x.reference.full.conf and https://dosbox-x.com/wiki/
     */
    confStr?: string | { [id: string]: { [id: string]: any } };
}

export type launchOptions = dosboxLaunchOptions | jsdosOption

/**The abstract class for dos emulators
 * - the main part is the static method `create` and `Launch`,
 * - more methods and options are exposed for the huge differences between emulators
 */
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
    abstract launch(option: commonLaunchOption): any;

    /**create Dosbox according to given path and more args*/
    static create(path: string, ...args: any[]): DosEmu | Promise<DosEmu> | undefined { return undefined }
    /**automatically scan the system and create possible DOSBOx */
    static auto(): DosEmu[] | Promise<DosEmu[]> { return [] };
}

export function getDosbox(type: DOSBEMUTYPE, path?: string, darwinApp?: boolean) {
    switch (type) {
        case DOSBEMUTYPE.jsdos:
            return new Jsdos(path);
        case DOSBEMUTYPE.dosbox:
            return DOSBox.create({ path, darwinApp });
        case DOSBEMUTYPE.dosbox_x:
            return DOSBox_x.create({ path, darwinApp });
    }
}

export { DOSBox, DOSBox_x, Jsdos }