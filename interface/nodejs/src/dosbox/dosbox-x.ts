import { DOSBox_core } from "./dosbox_core";
import * as api from '../api';

export class DOSBox_x extends DOSBox_core implements api.DosEmu {
    type = api.DOSBEMUTYPE.dosbox_x;
    versionReg: RegExp = /DOSBox-X version (.*?),/g;
    /**get the version of the dosbox
     * @return the version part of the output
    */
    version(): Promise<string | number> {
        const p = this.run('-version');

        return new Promise(
            (r, x) => {
                p.catch(
                    e => {
                        const er = this.versionReg.exec(e.stderr);
                        if (er) {
                            r(er[1])
                        } else {
                            r(undefined)
                        }
                    }
                );
                setTimeout(() => { x('Time out') }, 3000)
            }
        )

    }
    static fromDir(opt: { name?: string, path?: string, darwinApp?: boolean }) {
        const name = opt.name ? opt.name : 'dosbox-x';
        const path = opt.path;
        //command for open dosbox
        let command = name;
        //for windows,using different command according to dosbox's path and the choice of the console window
        switch (process.platform) {
            case 'win32':
                break;
            case 'darwin':
                if (opt.darwinApp)
                    command = `open -a ${name} --wait --args`;
                break;
        }
        const db = new DOSBox_x(command);
        db.cwd = path;
        return db;
    }
    static async auto(name: string = 'dosbox-x'): Promise<DOSBox_x[]> {
        const list = [
            DOSBox_x.fromDir({ name }),
            DOSBox_x.fromDir({ name, darwinApp: true })
        ];


        const result: DOSBox_x[] = [];
        for (const idx in list) {
            const db = list[idx];
            const v = await db.version()
            if (typeof v === 'string' || v === 0) {
                result.push(db);
            }
        }
        return result
    }
}