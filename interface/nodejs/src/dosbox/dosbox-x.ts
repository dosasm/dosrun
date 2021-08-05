import { DOSBox_core } from "./dosbox_core";
import * as api from '../api';
import { logger } from "../util";
import * as fs from 'fs';
import { resolve } from "path";

export interface dosboxXLaunchOptions extends api.commonLaunchOption {
    /**mount the file from the local fs to the emulator's fs */
    mount?: { from: string, to: string }[];
    /**the commands to run in the emulator after launching */
    run?: string[];
}

export class DOSBox_x extends DOSBox_core implements api.DosEmu {
    type = api.DOSBEMUTYPE.dosbox_x;

    launch(option: dosboxXLaunchOptions) {
        const mount = Array.isArray(option.mount) ? option.mount.map(val => {
            if (val.to.length > 1) {
                logger.warn(val.to, 'is not allowed');
                logger.warn('for dosbox-like emulators, we can only mount to disk named with charactors from a-z');
                return undefined;
            }
            return (
                {
                    disk: val.to,
                    path: val.from
                })
        }).filter(val => val) : []
        return this.runCommand(mount, option.run);
    }

    versionReg: RegExp = /DOSBox-X version (.*?),/g;
    /**get the version of the dosbox-x
     * for windows, as it will create another window, I can't find a good way
     * @return string: the version part of the output, or exitcode
    */
    async version(): Promise<string | number | undefined> {
        if (process.platform === 'win32') {
            const p = await this.run('-silent').catch(
                err => { }
            );
            if (p)
                return p.exitCode;
        } else {
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
    }

    static create(opt: { name?: string, path?: string, darwinApp?: boolean }) {
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
            DOSBox_x.create({ name })
        ];

        switch (process.platform) {
            case 'win32':
                const possibleFolders = [
                    'C:\\Program Files (x86)\\',
                    'D:\\Program Files (x86)\\',
                    'C:\\Program Files',
                    'D:\\Program Files'
                ];
                if (process.env.USERPROFILE) {
                    possibleFolders.push(resolve(process.env.USERPROFILE, '\Desktop'))
                }
                for (const d of possibleFolders) {
                    if (fs.existsSync(d)) {
                        const subs = fs.readdirSync(d);
                        const sub = subs.find(val => val.toLowerCase().includes('dosbox-x'));
                        if (sub) {
                            const db = DOSBox_x.create({ name });
                            db.cwd = resolve(d, sub);
                            list.push(db);
                        }
                    }
                }

                break;
            case 'darwin':
                list.push(DOSBox_x.create({ name, darwinApp: true }))
                break
        }

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