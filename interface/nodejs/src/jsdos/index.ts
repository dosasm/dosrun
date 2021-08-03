import * as fs from "fs";
import { JsdosCi } from "./JsdosCi";
import { startServer } from "./server";
import { join } from 'path';
import * as emu from 'emulators';
import { BoxInMessage } from "./message";
import { logger, projectFolder } from "../util";
import { DOSBEMUTYPE, DosEmu } from "../api";

export interface jsdosOption {
    /**The jsdos bundle to run*/
    bundle: string,
    disableStdin?: boolean,
    disableStdout?: boolean,
    run?: string[],

    server?: {
        port: number,
        /**The `dist` folder of emulators-ui */
        emuUiDist?: string,
    }
    /**if process.send exist send message via this */
    sendToParent?: boolean
}

export class Jsdos implements DosEmu {
    static auto() {
        return [new Jsdos()];
    }
    public type = DOSBEMUTYPE.jsdos;
    private emulators: emu.Emulators;
    constructor(path?: string) {
        const emuDist = path !== undefined ? path : join(projectFolder, "node_modules/emulators/dist/");
        //load jsdos emulators
        require(join(emuDist, 'emulators.js'));
        this.emulators = (global as any).emulators as emu.Emulators;
        this.emulators.pathPrefix = emuDist;
    }
    version() {
        const pack = join(this.emulators.pathPrefix, '../package.json');
        if (fs.existsSync(pack)) {
            const data = fs.readFileSync(pack, { encoding: 'utf8' });
            const o = JSON.parse(data);
            if (Object.keys(o).includes('version')) {
                return o['version'];
            }
        }
        return undefined
    }
    async launch(opt: jsdosOption) {
        logger.log(opt)
        //read jsdos bundle and get Command Interface of jsdos
        const bundle = fs.readFileSync(opt.bundle);
        const ci = await this.emulators.dosboxDirect(bundle);
        const jsdosCi = new JsdosCi(ci, opt);

        //start a server (express app) to show the dosbox
        if (opt.server) {
            const emuUiDist: string = typeof opt.server.emuUiDist === 'string' ? opt.server.emuUiDist : join(__dirname, '../../node_modules/emulators-ui/dist/')
            startServer(jsdosCi, emuUiDist, opt.server.port);
        }

        //send message to parent process
        if (opt.sendToParent && process.send) {
            jsdosCi.handleOutMsg(msg => {
                if (process.send) {
                    process.send(msg);
                }
            });
            process.on('message', msg => {
                jsdosCi.handleInMsg(msg as BoxInMessage);
            });
        }

        if (Array.isArray(opt.run)) jsdosCi.shell(opt.run.join('\n'))
        return jsdosCi;
    }
}