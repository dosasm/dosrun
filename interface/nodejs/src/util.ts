import { Console } from 'console';
import * as path from 'path'
export const projectFolder = path.resolve(__dirname, '../', '../');
class Logger extends Console {
    public DEBUG = !!process.env.DEBUG
    public log(message?: any, ...optionalParams: any[]) {
        if (this.DEBUG) {
            super.log(message, ...optionalParams)
        }
    }
}
export const logger = new Logger(process.stdout, process.stderr)