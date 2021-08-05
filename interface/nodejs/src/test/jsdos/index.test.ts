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
        assert.ok(height >= 0);
        assert.ok(ci.allstdout.includes('INDEX'), ci.allstdout)
    });

    it('test shell command', async function () {
        const db = new Jsdos();
        const ci = await db.launch({
            disableStdout: true,
            server: {
                port: 3000
            }
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