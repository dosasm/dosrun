import assert = require("assert");
import { Jsdos } from "../../jsdos";

describe('js-dos test', async function () {
    it('mount files and autoexec', async function () {
        const db = new Jsdos();
        const ci = await db.launch({
            disableStdout: true,
            disableStdin: true,
            confStr: {
                cpu: {
                    cycles: 2000
                }
            },
            mount: [
                {
                    from: __dirname,
                    to: "c"
                }
            ],
            autoexec: [
                "c:",
                "dir",
                "exit"
            ]
        });
        const height = ci.ci.height();
        assert.ok(height, JSON.stringify(height));
        assert.ok(ci.allstdout.includes('INDEX'), ci.allstdout)
    });

    it('test shell command', async function () {
        const db = new Jsdos();
        const ci = await db.launch({
        });
        ci.shell('ver');
        ci.shell('exit');
        console.log(ci.allstdout)
    })
})