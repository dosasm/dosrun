import * as emu from 'emulators';
import * as fs from "fs";
import * as path from "path";
import { join } from 'path';
import watch from 'node-watch';
import { commonCreateOption, commonLaunchOption, DOSBEMUTYPE, DosEmu } from "../api";
import { BoxConf } from "../dosbox/dosbox_conf";
import { logger, projectFolder } from "../util";
import { createBundle } from "./bundles";
import { JsdosCi } from "./JsdosCi";
import { BoxInMessage } from "./message";
import { startServer } from "./server";

export interface jsdosCreateOption extends commonCreateOption {

}

export interface jsdosOption extends commonLaunchOption {
    /**The jsdos bundle to run*/
    bundle?: string,
    disableStdin?: boolean,
    disableStdout?: boolean,
    autoexec?: string[],

    watchMounts?: boolean,
    mount?: { from: string, to: string, watch?: boolean }[];

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
    static create(opt: commonCreateOption) {
        return new Jsdos(opt.path);
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
        logger.log(opt);
        let bundlePath = opt.bundle;
        let copys: { from: string, to: string }[] = [];
        let conf = new BoxConf();

        if (typeof opt.confStr === 'string') {
            conf = BoxConf.parse(opt.confStr);
        } else {
            conf = new BoxConf(opt.confStr);
        }
        if (opt.autoexec) {
            conf.autoexec = opt.autoexec;
        }

        if (opt.mount) {
            copys = opt.mount.map(val => {
                return { from: val.from, to: 'mnt/' + val.to };
            });
            const mountCmd = opt.mount.map(val => `mount ${val.to} ./mnt/${val.to}`);
            conf.autoexec.unshift(...mountCmd);
        }

        bundlePath = await createBundle(conf, copys, opt.bundle);

        //read jsdos bundle and get Command Interface of jsdos
        const bundle = fs.readFileSync(bundlePath);
        const ci = await this.emulators.dosboxDirect(bundle);
        const jsdosCi = new JsdosCi(ci, opt);

        //TODO: implement a file watcher to write changes for local file system to the jsdos bundle
        //Need help: why no module I can get 
        //- https://discord.com/channels/732544419189882890/786612599164895243/811775548002664458
        //- https://github.com/caiiiycuk/js-dos/issues/130
        if (jsdosCi.fs) {
            for (const c of copys) {
                let watcher = watch(c.from, { recursive: true });

                watcher.on('change', function (evt, name: string) {
                    const rel = path.relative(c.from, name);
                    const dst = join(c.to, rel);
                    const data = fs.readFileSync(name);
                    logger.log('changed ', name)
                    jsdosCi.fs.writeFile(dst, data);
                    jsdosCi.rescan();
                });

                watcher.on('error', function (err) {
                    // handle error
                });

                watcher.on('ready', function () {
                    // the watcher is ready to respond to changes
                });
            }
        }


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

        return jsdosCi;
    }
}