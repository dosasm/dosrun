import { DOSBox } from "../../dosbox/dosbox";
import * as assert from "assert";

describe('run dosbox', async function () {
    it('open dosbox and exit', async function () {
        const dbs = await DOSBox.auto();
        console.log(`detected ${dbs.length.toString()}`)
        for (const db of dbs) {
            const ecp = await db.launch({ run: ['exit'] });
            assert.strictEqual(ecp.exitCode, 0, ecp.escapedCommand)
        }
    });
})