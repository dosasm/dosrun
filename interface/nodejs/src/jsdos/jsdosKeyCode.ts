import { Keys } from './jsdosKey'

export type KeyInfo = [string, ...number[]]

const keyInfo: KeyInfo[] = [
    ['0', Keys.KBD_0],
    ['1', Keys.KBD_1],
    ['2', Keys.KBD_2],
    ['3', Keys.KBD_3],
    ['4', Keys.KBD_4],
    ['5', Keys.KBD_5],
    ['6', Keys.KBD_6],
    ['7', Keys.KBD_7],
    ['8', Keys.KBD_8],
    ['9', Keys.KBD_9],
    ['a', Keys.KBD_a],
    ['b', Keys.KBD_b],
    ['c', Keys.KBD_c],
    ['d', Keys.KBD_d],
    ['e', Keys.KBD_e],
    ['f', Keys.KBD_f],
    ['g', Keys.KBD_g],
    ['h', Keys.KBD_h],
    ['i', Keys.KBD_i],
    ['j', Keys.KBD_j],
    ['k', Keys.KBD_k],
    ['l', Keys.KBD_l],
    ['m', Keys.KBD_m],
    ['n', Keys.KBD_n],
    ['o', Keys.KBD_o],
    ['p', Keys.KBD_p],
    ['q', Keys.KBD_q],
    ['r', Keys.KBD_r],
    ['s', Keys.KBD_s],
    ['t', Keys.KBD_t],
    ['u', Keys.KBD_u],
    ['v', Keys.KBD_v],
    ['w', Keys.KBD_w],
    ['x', Keys.KBD_x],
    ['y', Keys.KBD_y],
    ['z', Keys.KBD_z],
    ['\t', Keys.KBD_tab],
    ['\n', Keys.KBD_enter],
    [' ',Keys.KBD_space],
    ['-', Keys.KBD_minus],
    ['=', Keys.KBD_equals],
    ['\\', Keys.KBD_backslash],
    ['[', Keys.KBD_leftbracket],
    [']', Keys.KBD_rightbracket],
    [';', Keys.KBD_semicolon],
    [':', Keys.KBD_semicolon, Keys.KBD_leftshift],
    ["'", Keys.KBD_quote],
    ['.', Keys.KBD_period],
    [',', Keys.KBD_comma],
    ['/', Keys.KBD_slash],
]

export enum KeyPressType {
    pressup,
    pressdown,
    press
}
export class KeyPress {
    type: KeyPressType = KeyPressType.press;
    constructor(public keyCode: number, type?: KeyPressType) {
        if (type) {
            this.type = type
        }
    }
}

function char2code(char: string): KeyPress[] {
    const output: KeyPress[] = []
    for (const val of keyInfo) {
        if (val[0] === char.toLowerCase()) {
            if (val.length >= 2) {
                output.push(new KeyPress(val[1]))
            }
            if (val.length > 2) {
                const sub=val.slice(2);
                sub.forEach(
                    code=>{
                        output.unshift(new KeyPress(code as number,KeyPressType.pressdown))
                        output.push(new KeyPress(code as number,KeyPressType.pressup))
                    }
                )
            }
            return output;     
        }
    }
    return output;
}

/**map char to js-dos keyCode [link](https://github.com/caiiiycuk/js-dos/issues/120) */
export default function str2code(str: string) {
    const output: KeyPress[] = [];
    str.split('').forEach(
        val => {
            const code = char2code(val)
            if (code) {
                output.push(...code)
            }
        }
    );
    return output
}