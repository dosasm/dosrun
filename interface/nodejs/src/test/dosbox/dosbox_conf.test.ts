import { BoxConf } from "../../dosbox/dosbox_conf";
import 'mocha';
import * as assert from "assert";


describe('test dosbox conf handle', function () {
    it('dosbox conf add property', function () {
        const conf = new BoxConf();
        conf.updateConf('sdl', 'fullscreen', true);
        const testCommand = "test command";
        conf.autoexec.push(testCommand);
        assert.ok(conf.configu.sdl.fullscreen === true);
        assert.ok(conf.autoexec.includes(testCommand));
    });

    it('dosbox conf parse and stringfy', function () {
        const data = `[sdl]
        fullscreen        = false
        fulldouble        = false

[autoexec]
        ver`
        const conf = BoxConf.parse(data);
        conf.updateConf('sdl', 'fullscreen', true);
        const testCommand = "test command";
        conf.autoexec.push(testCommand);
        assert.ok(conf.configu.sdl.fullscreen === true);
        assert.ok(conf.autoexec.includes(testCommand));
        const str = conf.toString();
        console.log(str)
        assert.ok(str.includes('ver'));
        assert.ok(str.includes(testCommand))
    })
})

