import * as os from 'os';
import * as ini from 'ini';

type ConfObj = { [section: string]: { [key: string]: any } }

/**works with dosbox conf file,see https://www.dosbox.com/wiki/Dosbox.conf */
export class BoxConf {
    /**the main part of the configuration */
    public configu: ConfObj = {};
    /**the autoexec section of the configuration */
    public autoexec: string[] = [];

    constructor(conf?: ConfObj, autoexec?: string[]) {
        if (conf) {
            this.configu = conf;
        }
        if (autoexec) {
            this.autoexec = autoexec;
        }
    }

    updateConf(section: string, key: string, value: any) {
        if (Object.keys(this.configu).includes(section)) {
            const sec = this.configu[section];
            if (Object.keys(sec).includes(key)) {
                sec[key] = value
            } else {
                this.configu[section] = {
                    [key]: value
                }
            }
        } else {
            this.configu[section] = {
                [key]: value
            };
        }
    }

    toString() {
        return BoxConf.stringfy(this);
    }

    toJSON() {

    }

    static create(target: string | { [id: string]: { [id: string]: boolean | string | number } }) {
        switch (typeof target) {
            case 'string':
                return BoxConf.parse(target);
            case 'object':
                return new BoxConf(target);
            default:
                return new BoxConf();
        }
    }

    static parse(str: string) {
        const obj = ini.parse(str);
        const section = Object.keys(obj).find(val => val.toLowerCase() === 'autoexec');
        let autoexec = undefined;
        if (section) {
            autoexec = Object.keys(obj[section])
            delete obj[section];
        }
        return new BoxConf(obj, autoexec);
    }

    static stringfy(conf: BoxConf) {
        let str = ini.stringify(conf.configu, { section: '', whitespace: true });
        const nl = os.EOL;
        if (conf.autoexec && conf.autoexec.length > 0) {
            str += `${nl}[autoexec]${nl}${conf.autoexec.join(nl)}`
        }
        return str;
    }
}
