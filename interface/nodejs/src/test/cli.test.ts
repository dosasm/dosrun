import * as assert from 'assert';
import * as execa from 'execa';
import path = require('path');
import { setTimeout } from 'timers/promises';
import { projectFolder } from '../util';

describe('open emulators', async function () {
    describe('run jsdos', async function () {
        it('get jsdos command interface', async function () {
            const bin = path.resolve(projectFolder, 'nodejs', 'out', 'dbx');
            const p = execa('node', [bin, 'j']);
            await setTimeout();
            p.stdin.write('exit');
            const r = await p;
            assert.ok(r.stdout.includes('http://www.dosbox.com'), r.stdout);
        });
    })
});
