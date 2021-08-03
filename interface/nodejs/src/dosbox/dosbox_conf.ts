import * as os from 'os';
import * as ini from 'ini';

/**works with dosbox conf file,see https://www.dosbox.com/wiki/Dosbox.conf */
export class BoxConf {
    target = {}
    autoexec = [];
    constructor(o?: { [id: string]: any }) {
        if (o) {
            this.target = o;
            if (!Object.keys(o).includes('AUTOEXEC') && Array.isArray(o['AUTOEXEC'])) {
                this.autoexec = o['AUTOEXEC'];
            }
        }
    }

    toString() {
        return BoxConf.stringfy(this)
    }
    static stringfy(conf: BoxConf) {
        let str = ini.stringify(conf.target);
        str = str.replace(/AUTOEXEC\[\]=(.*)\n/g, "")
        const nl = os.EOL;
        if (conf.autoexec && conf.autoexec.length > 0) {
            str += `${nl}[AUTOEXEC]${nl}${conf.autoexec.join(nl)}`
        }
        return str;
    }
    static parse(str: string) {
        const obj = ini.parse(str);
        const res = new BoxConf(obj);
        return res
    }
}


