import { CommandInterface, CommandInterfaceEvents } from "emulators";
import { logger } from "../util";
import str2code, { KeyPress, KeyPressType } from "./jsdosKeyCode";
import { BoxOutMessage, BoxInMessage } from "./message";

/**manage the JSDos command interface */
export class JsdosCi {
  pathprefix = "/home/web_user/";
  /**https://js-dos.com/v7/build/docs/command-interface */
  ci: CommandInterface;
  fs?: typeof FS;
  events: CommandInterfaceEvents;
  /**manage the queue of key events */
  codes: KeyPress[] = [];

  /**handle command message*/
  public handleInMsg(msg: BoxInMessage): void {
    logger.log(msg);
    switch (msg.name) {
      case 'KeyEvent':
        const { keyCode, pressed } = msg.value;
        if (pressed === undefined) {
          this.ci.simulateKeyPress(keyCode);
        } else {
          this.ci.sendKeyEvent(keyCode, pressed);
        }
        break;
      case 'Stdin':
        this.shell(msg.value);
        break;
    }
  }

  private _sendMsg: Array<(msg: BoxOutMessage) => void> = [];
  /**function called inside to send dosbox's state message */
  public handleOutMsg(handler: (msg: BoxOutMessage) => void): void {
    this._sendMsg.push(handler);
  }
  private sendMsg(msg: BoxOutMessage): void {
    if (this._sendMsg.length > 0) {
      for (const send of this._sendMsg) {
        send(msg);
      }
    }
  };

  public allstdout = "";
  constructor(ci: CommandInterface, opt: { disableStdin?: boolean, disableStdout?: boolean }) {
    this.ci = ci;
    this.fs = (ci as any).module?.FS;
    this.events = ci.events();
    setInterval(() => {
      if (this.ci && this.codes.length > 0) {
        const key = this.codes.shift();
        if (key) {
          if (key.type === KeyPressType.press) {
            this.ci.simulateKeyPress(key.keyCode);
          }
          if (key.type === KeyPressType.pressdown) {
            this.ci.sendKeyEvent(key.keyCode, true);
          }
          if (key.type === KeyPressType.pressup) {
            this.ci.sendKeyEvent(key.keyCode, false);
          }
        }
      }
    }, 60);
    let command: string[] = [];
    if (!opt.disableStdin) {
      process.stdin.on('data', (data) => {
        const str = data.toString().toLowerCase();
        command = str.split('');
        this.shell(str);
      });
    }
    ci.events().onStdout(msg => {
      //prevent the stdout which is the print of stdin
      if (msg === command[0]) {
        command.shift();
      } else {
        if (!opt.disableStdout) {
          const print = msg.replace(/\[/g, "\x1b[");
          process.stdout.write(print);
        }
      };
      this.allstdout += msg;
      this.sendMsg({
        name: "Stdout",
        value: msg
      });
    });
    const USE_ORIGIN_MSG = true;
    let FrameCount = 0;
    if (USE_ORIGIN_MSG) {
      this.events.onFrame(
        rgb => {
          this.sendMsg({
            name: 'Frame',
            value: rgb,
            width: ci.width(), height: ci.height(),
            count: FrameCount++
          });
        }
      );
    }
    this.events.onSoundPush(samples => {
      const allZero = samples.every(val => val === 0);
      this.sendMsg({
        name: 'SoundPush',
        value: allZero ? undefined : samples,
        freq: ci.soundFrequency()
      });
    });
    this.events.onExit(() => {
      this.sendMsg({ name: 'Exit' });
      process.exit();
    });
  }
  /**exec shell command in jsdos */
  shell(cmd: string): void {
    const codes = str2code(cmd.replace(/\r/g, ""));
    if (cmd.trim().toLowerCase() === 'exit') {
      logger.log('===EXIT cmd detect: run `ci.exit()` instead of sending this to dosbox===')
      this.ci.exit();
    }
    this.codes.push(...codes);
  }
  rescan(): boolean {
    if (this.ci) {
      (this.ci as any).module._rescanFilesystem();
      return true;
    }
    return false;
  }
}
