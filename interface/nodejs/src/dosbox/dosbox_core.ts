import * as fs from 'fs';
import * as path from 'path';
import { BoxConf } from './dosbox_conf';
import * as execa from 'execa';
import { logger, getTmpDir } from '../util';

/**defines the option to do with dosbox's console message **in windows system**.
 * - For **windows**, if with parameter **noconsole** ,
 * the dosbox will redirect the console message to files in the *dosbox.exe*'s folder named 'stdout' and 'stderr'.
 * so we can read the message from these files **after dosbox exit**.
 * If without `noconsole` parameter, the dosbox will create a console window
 * - For **other OS**, dosbox will put it's console message in shell's stdout and stderr.
 */
export enum WINCONSOLEOPTION {
    /**For windos, dosbox will create a console window.*/
    normal,
    /**for windows using `start /min dosbox`
     * this will create and minimize the console window*/
    min,
    /**for windows using `dosbox -noconsole`
     * dosbox will redirect the console message to files
     * NOTE: for the extension, it will try to redirect the message to outputchannel*/
    noconsole,
}

export interface dosboxLaunchOptions {
    /**mount the file from the local fs to the emulator's fs */
    mount?: { from: string, to: string }[];
    /**the commands to run in the emulator after launching */
    run?: string[];
}

export class DOSBox_core {
    /**the maximum of dosbox commands 
     * if the cmds you pass over this limit
     * the cmds will be write to conf files's `AUTOEXEC` section
    */
    static MAX_DOSBOX_COMMAND = 10;
    /**read the dosbox's console std information for win32
   * @param folder the folder to store stdout and stderr, usually the folder of dosbox.exe
   */
    static winReadConsole(folder: string) {
        const names = ['stdout', 'stderr'];
        const output: { [id: string]: string } = {};
        for (const n of names) {
            const file = path.resolve(folder, n + '.txt')
            if (fs.existsSync(file)) {
                output[n] = fs.readFileSync(file, { encoding: 'utf-8' })
            }
        }
        return output;
    }

    /**The command for launch DOSBox
     * - use `${args}` to pass [parameters](https://www.dosbox.com/DOSBoxManual.html#Parameters)
     * - now we will use [execa](https://www.npmjs.com/package/execa) to launch DOSBox
    */
    public readonly launchCommand: string;
    public command(args: string[]) {
        if (this.launchCommand.includes('${args}')) {
            return this.launchCommand.replace(/\$\{args\}/g, args.join(' '));
        }
        return this.launchCommand + ' ' + args.join(' ');
    }

    /**the Current Work Diractory for child_process*/
    public cwd?: string = process.cwd();
    /**the config file's path
     * the program will read it and create a new file with other config to use
     */
    public conf?: string | BoxConf = new BoxConf({
        cpu: {
            cycles: '1000'
        },
        sdl: {
            windowresolution: '1024x640',
            output: 'opengl'
        }
    });
    /**count the time of run */
    private _count = 0;
    /**streams destination for piping stdout and stderr */
    public pipedst: {
        stdout?: NodeJS.WritableStream
        stderr?: NodeJS.WritableStream
    } = {}

    toString() {
        return `Dosbox from ${this.launchCommand}
\trun time count: ${this._count}
\tcwd: ${this.cwd}
\tconf:
\t\t${this.conf.toString().replace(/[\r\n]+/g, '\n\t\t')}
        `
    }

    constructor(command: string) {
        this.launchCommand = command;
    }

    public async run(args: string[] | string) {
        let command = ""
        if (Array.isArray(args)) {
            command = this.command(args)
        } else {
            command = this.command([args])
        }
        this._count++;
        const p = execa.command(command, { cwd: this.cwd });
        if (this.pipedst.stdout) p.stdout.pipe(this.pipedst.stdout)
        const r = await p;
        logger.log(`exec command ${r.escapedCommand} at ${this.cwd}`);
        if (process.platform === 'win32' && command.includes('-noconsole') && this.cwd) {
            const stdmsg = DOSBox_core.winReadConsole(this.cwd);
            if (stdmsg.stdout) {
                r.stdout = stdmsg.stdout;
            }
            if (stdmsg.stderr) {
                r.stderr = stdmsg.stderr
            }
        }
        return r;
    }

    /**run dosbox commands
     * 
     * dobsox's note for mount in [the end of 3. Command Line Parameters](https://www.dosbox.com/DOSBoxManual.html)
     * > If a name/command/configfilelocation/languagefilelocation contains a space, put the whole name/command/configfilelocation/languagefilelocation between quotes ("command or file name"). If you need to use quotes within quotes (most likely with -c and mount):
     * > Windows and OS/2 users can use single quotes inside the double quotes.
     * > Other people should be able to use escaped double quotes inside the double quotes.
     * > Windows: -c "mount c 'c:\My folder with DOS games\'"
     * > Linux: -c "mount c \"/tmp/name with space\""
     * @param boxcmd: the commands to exec in dosbox
    */
    public runCommand(mount?: { disk: string, path: string }[], boxcmd?: string[] | string, args?: string[]) {
        const param = args ? args : [];
        if (typeof boxcmd === 'string') {
            boxcmd = [boxcmd];
        } else if (boxcmd === undefined) {
            boxcmd = [];
        }
        boxcmd = boxcmd.filter(val => val)

        //read the specified config file or construct an empty config
        let config: undefined | BoxConf = undefined;
        if (typeof this.conf === 'string') {
            const text = fs.readFileSync(this.conf, { encoding: 'utf-8' });
            config = BoxConf.parse(text);
        } else if (this.conf) {
            config = this.conf;
        } else {
            config = new BoxConf();
        }

        //add commands to args or config based on commands length
        if (boxcmd.length < DOSBox_core.MAX_DOSBOX_COMMAND) {
            const mapper = (val: string): string => `-c ${val}`;
            param.push(...boxcmd.map(mapper));
        } else {
            config.autoexec = config.autoexec.concat(boxcmd);
        }

        if (mount) {
            const mountCmds = mount.map(val => `mount ${val.disk} "${val.path}"`);
            config.autoexec.unshift(...mountCmds);
        }

        //write config to a temporary file

        const tmpdir = getTmpDir('dosbox-conf-file');
        const _configPath = path.join(tmpdir, new Date().getTime().toString() + '.conf');
        const data = BoxConf.stringfy(config);
        fs.writeFileSync(_configPath, data);

        param.push(`-conf ${_configPath}`);

        return this.run(param);
    }
}

