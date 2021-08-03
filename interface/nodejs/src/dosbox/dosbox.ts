import * as api from '../api';
import * as fs from 'fs';
import { logger } from "../util";
import { DOSBox_core, WINCONSOLEOPTION } from "./dosbox_core";
import path = require("path");

export class DOSBox extends DOSBox_core implements api.DosEmu {
    type = api.DOSBEMUTYPE.dosbox;

    public versionReg: RegExp = /DOSBox version (.*?),/
    /**get the version of the dosbox
     * @return the version part of the output
    */
    public async version() {
        const info = await this.run('-version');
        const re = this.versionReg.exec(info.stdout);
        if (re?.length === 2) {
            return re[1]
        };
        return info.exitCode;
    }
    static fromDir(opt: { name?: string, path?: string, console?: WINCONSOLEOPTION, darwinApp?: boolean }) {
        const name = opt.name ? opt.name : 'dosbox';
        const path = opt.path;
        const console = opt.console;
        //command for open dosbox
        let command = name;
        //for windows,using different command according to dosbox's path and the choice of the console window
        switch (process.platform) {
            case 'win32':
                switch (console) {
                    case WINCONSOLEOPTION.min:
                        command = `start/min/wait "" ${name}`;
                        break;
                    case WINCONSOLEOPTION.normal:
                        command = name
                        break;
                    case WINCONSOLEOPTION.noconsole:
                    default:
                        command = `${name} -noconsole`
                        break;
                }
                break;
            case 'darwin':
                if (opt.darwinApp)
                    command = `open -a ${name} --wait --args`;
                break;
        }
        const db = new DOSBox(command);
        db.cwd = path;
        return db;
    }

    static async auto(name: string = 'dosbox', conn?: WINCONSOLEOPTION): Promise<DOSBox[]> {
        let list = [DOSBox.fromDir({ name }),];
        switch (process.platform) {
            case 'win32':
                const possibleFolders = [
                    'C:\\Program Files (x86)\\',
                    'D:\\Program Files (x86)\\',
                    'C:\\Program Files',
                    'D:\\Program Files'
                ]
                for (const d of possibleFolders) {
                    if (fs.existsSync(d)) {
                        const subs = fs.readdirSync(d);
                        const sub = subs.find(val => val.toLowerCase().includes('dosbox'));
                        if (sub) {
                            const db = DOSBox.fromDir({ name });
                            db.cwd = path.resolve(d, sub);
                            list.push(db);
                        }
                    }
                }

                break;
            case 'darwin':
                list.push(DOSBox.fromDir({ name, darwinApp: true }))
                break
        }

        const result: DOSBox[] = [];
        for (const idx in list) {
            const db = list[idx];
            const v = await db.version().catch(
                e => {
                    logger.log(e);
                }
            );
            if (typeof v === 'string' || v === 0) {
                result.push(db);
                logger.log(`detected runable Dosbox version: ${v}\n`)
                logger.log(db.toString())
            }
        }
        return result
    }
}