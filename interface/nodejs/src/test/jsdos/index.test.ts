import assert = require("assert");
import { Jsdos } from "../../jsdos";

describe('js-dos test', async function () {
    it('mount files and autoexec', async function () {
        const db = new Jsdos();
        const testvalue = 2000;
        const ci = await db.launch({
            disableStdout: true,
            disableStdin: true,
            configuration: {
                cpu: {
                    cycles: testvalue
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
                'config -get "cpu cycles"',
                "exit"
            ]
        });
        const height = ci.ci.height();
        assert.ok(height >= 0);
        assert.ok(ci.allstdout.includes('INDEX'), 'mount file error\n' + ci.allstdout);
        assert.ok(ci.allstdout.includes(testvalue.toString()), 'set config error\n' + ci.allstdout)
    });

    it('test shell command', async function () {
        this.skip();
        const db = new Jsdos();
        const ci = await db.launch({
            disableStdout: true,
        });
        ci.shell('ver');
        ci.shell('exit');

        const p = new Promise<string>(
            (resolve) => {
                ci.events.onStdout(
                    val => {
                        if (val.toLowerCase().includes('ver')) {
                            resolve(val)
                        }
                    }
                )
            }
        )
        const r = await p;
        assert.ok(ci.allstdout.includes('VER'), ci.allstdout)
    })
})