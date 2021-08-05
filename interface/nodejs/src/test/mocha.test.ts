import * as assert from 'assert';
import 'mocha';
import * as api from '../api';

describe('open emulators', async function () {
    describe('run jsdos', async function () {
        it('get jsdos command interface', async function () {
            const db = new api.Jsdos();
            const ci = await db.launch({
                disableStdout: true
            });
            const height = ci.ci.height();
            assert.ok(true, JSON.stringify(height));
            ci.shell('exit');
        });
    })
});
