import { Console } from 'console';
import * as path from 'path';
import * as os from 'os';
import { existsSync, mkdirSync } from 'fs';

export const projectFolder = path.resolve(__dirname, '../', '../');

export function getTmpDir(dir?: string) {
    const tmp = path.resolve(os.tmpdir(), "dosbox-nodejs-" + dir);
    if (!existsSync(tmp)) {
        mkdirSync(tmp, { recursive: true })
    }
    return tmp;
}

class Logger extends Console {
    public DEBUG = !!process.env.DEBUG
    public log(message?: any, ...optionalParams: any[]) {
        if (this.DEBUG) {
            super.log(message, ...optionalParams)
        }
    }
}
export const logger = new Logger(process.stdout, process.stderr)