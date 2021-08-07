import { DOSBox, DOSBox_x } from "../../api";
import * as assert from "assert";
import { existsSync, readFileSync } from "fs";
import path = require("path");
import { getTmpDir } from "../../util";

describe('run dosbox-x', async function () {
    it('open dosbox-x and exit', async function () {
        const dbs = await DOSBox_x.auto();
        console.log(`detected ${dbs.length.toString()}`)
        for (const db of dbs) {
            const ecp = await db.launch({ run: ['exit'] });
            assert.strictEqual(ecp.exitCode, 0, ecp.escapedCommand);
        }
    });
    it('mount files and set config', async function () {
        const dbs = await DOSBox.auto();
        console.log(`detected ${dbs.length.toString()}`);
        const dirname = getTmpDir("jsdos-test");
        const filename = new Date().getSeconds().toString() + '.txt';
        const testvalue = 3000;
        for (const db of dbs) {
            const options = {
                configuration: {
                    cpu: {
                        cycles: testvalue
                    }
                },
                mount: [{
                    from: dirname,
                    to: 'c'
                }],
                run: [
                    'c:',
                    'config -get "cpu cycles" >C:\\' + filename,
                    'exit'
                ]
            };
            const ecp = await db.launch(options);
            const file = path.resolve(dirname, filename);
            assert.ok(existsSync(file));
            const filetext = readFileSync(file, { encoding: 'utf-8' });
            assert.strictEqual(filetext, testvalue.toString());
            assert.strictEqual(ecp.exitCode, 0, ecp.escapedCommand)
        }
    });
})