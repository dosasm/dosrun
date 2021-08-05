//methods for manipute jsdos-bundles
import * as fs from 'fs';
import { join, resolve, relative, basename } from 'path';
import * as JSZip from 'jszip';
import { BoxConf } from '../dosbox/dosbox_conf';
import { getTmpDir } from '../util';
import { join as posixjoin } from 'path/posix';

/**create a jsdos bundle file by add new files to the sample. powered by https://stuk.github.io/jszip/
 * 
 * @param conf: the dosbox config, the original one will be overwrited
 * @param copys: the files need to be add to the bundle
 * @param sample: the base jsdos bundle
*/
export async function createBundle(conf?: BoxConf, copys?: { from: string, to: string }[], sample?: string): Promise<string> {
    const zip = new JSZip();
    if (sample) {
        const zipdata = fs.readFileSync(sample);
        await zip.loadAsync(zipdata);
    }
    if (conf) {
        const data = conf.toString();
        zip.file('.jsdos/dosbox.conf', data);
    }
    if (Array.isArray(copys)) {
        for (const m of copys) {
            if (fs.existsSync(m.from)) {
                const s = fs.statSync(m.from);
                if (s.isDirectory()) {
                    for await (const f of getFiles(m.from)) {
                        const rel = relative(m.from, f);
                        const dst = posixjoin(m.to, rel)
                        //console.log(rel, dst)
                        const data = fs.readFileSync(f);
                        zip.file(dst, data);
                    }
                }
                else if (s.isFile()) {
                    const data = fs.readFileSync(m.from)
                    zip.file(m.to, data);
                }
            }
        }
    }
    return new Promise(
        resolve => {
            const filename = sample ? basename(sample, 'jsdos') : ""
            const dst = join(getTmpDir('jsdos-bundle'), filename + new Date().getTime().toString() + '.jsdos');

            zip
                .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(dst))
                .on('finish', function () {
                    // JSZip generates a readable stream with a "end" event,
                    // but is piped here in a writable stream which emits a "finish" event.
                    console.log(dst + " written.");
                    resolve(dst);
                });
        }
    )
}

const readdir = fs.promises.readdir;

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

