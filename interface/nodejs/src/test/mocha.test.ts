import * as assert from 'assert';
import 'mocha';
import * as api from '../api';

describe('open emulators', async function () {
    describe('run dosbox', async function () {
        it('open dosbox and exit successfully', async function () {
            const dbs = await api.DOSBox.auto();
            for (const db of dbs) {
                const ecp = await db.launch({ run: ['exit'] });
                assert.ok(ecp.exitCode === 0, db.toString())
            }
        });
    })
    describe('run dosbox-x', async function () {
        it('open dosbox-x and exit successfully', async function () {
            const dbs = await api.DOSBox_x.auto();
            for (const db of dbs) {
                const ecp = await db.launch({ run: ['exit'] });
                assert.ok(ecp.exitCode === 0, db.toString())
            }
        });
    })
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
