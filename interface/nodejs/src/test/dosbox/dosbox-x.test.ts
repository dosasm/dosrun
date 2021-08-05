import { DOSBox_x } from "../../api";
import * as assert from "assert";

describe('run dosbox-x', async function () {
    it('open dosbox-x and exit', async function () {
        const dbs = await DOSBox_x.auto();
        console.log(`detected ${dbs.length.toString()}`)
        for (const db of dbs) {
            const ecp = await db.launch({ run: ['exit'] });
            assert.strictEqual(ecp.exitCode, 0, ecp.escapedCommand);
        }
    });
})