import { program } from 'commander';
import * as path from 'path';
import { existsSync } from 'fs';

import * as api from './api';
import { join } from 'path';
import { projectFolder } from './util';

const pkg = require('../../package.json');

module.exports = function (_argv: string[]): void {
    program.version(pkg.version)
    program
        .description('Run DOS emulators including DOSBox, JSDos...')

        .arguments('<emulators>')

        //construct options
        .option('-f,--emu-dir=[path]', "The folder of the emulator")
        .option('-F,--use-darwin-app', "use darwin App in Applicatins for macOs")

        //launch options
        .option('-r,--autoexec [cmds...]', 'the commands to run inside dosbox')
        .option('-m,--mount [pairs...]', '`pairs` is strings between A and B seperated like `A:B`,`c:./`,`d:C:\\dos`. For jsdos: watch files in local filesytem A and apply changes to B in jsdos.For DOSBox: mount B to A, A should be a-z')
        .option("-b,--bundle [bundle]", "The jsdos bundle to run inside jsdos")
        .option("-a,--disable-stdout", "disable redirect jsdos stdout to process")
        .option("-b,--disable-stdin", "disable redirect process stdin to jsdos")
        .option("-p,--port [number]", "start a server to show jsdos's video and audio in port")
        .action((_emu, opt) => {
            const emu = arg2emuType(_emu);
            const folder = PathValidfy(opt.folder);
            const db = api.getDosbox(emu, folder, opt.useDarwinApp);
            const options = opt;
            if (opt.mount) {
                opt.mount = opt.mount.map(
                    (val: string) => {
                        const idx = val.indexOf(':');
                        const to = val.substring(0, idx);
                        const from = val.substring(idx + 1);
                        console.log(from, to)
                        return {
                            from: PathValidfy(from), to
                        }
                    }
                )
            }

            if (emu === api.DOSBEMUTYPE.jsdos) {
                options.server = opt.port ? { port: opt.port } : undefined;
                const bundle = PathValidfy(opt.bundle);
                opt.bundle = bundle ? bundle : join(projectFolder, 'test', 'empty.jsdos')
            }

            db.launch(options)
        })
    program.parse(process.argv);
}

function PathValidfy(val) {
    if (val === undefined) {
        return undefined
    }
    if (path.isAbsolute(val)) {
        if (existsSync(val)) {
            return val
        }
    } else {
        const join = path.join(process.cwd(), val)
        if (existsSync(join)) {
            return join;
        }
    }
    return undefined
}

function arg2emuType(arg: string): api.DOSBEMUTYPE {
    switch (arg.toLowerCase()) {
        case 'd':
        case 'dosbox':
            return api.DOSBEMUTYPE.dosbox;
        case 'x':
        case 'dosbox-x':
        case 'dosbox_x':
            return api.DOSBEMUTYPE.dosbox_x;
        case 'j':
        case 'jsdos':
            return api.DOSBEMUTYPE.jsdos;
    }
}