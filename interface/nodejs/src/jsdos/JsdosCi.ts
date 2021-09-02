import { CommandInterface, CommandInterfaceEvents } from "emulators";
import { logger } from "../util";
import str2code, { KeyPress, KeyPressType } from "./jsdosKeyCode";
import { BoxOutMessage, BoxInMessage } from "./message";
import { EventEmitter, Readable, Writable } from "stream";

/**provide a more easy to JSDOS commandInterface
 * 
 * - for nodejs environment
 * - use stream to manage events
 */
export class JsdosCi {
  pathprefix = "/home/web_user/";

  eventEmitter = new EventEmitter();

  /**manage the queue of key events */
  private codes: KeyPress[] = [];
  public allstdout = "";
  public stdin: Writable;
  public stdout: Readable;

  constructor(public ci: CommandInterface) {
    this.ci = ci;
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

    this.events.onStdout(val => { this.eventEmitter.emit('stdout', val); this.allstdout += val; });
    this.events.onFrame(val => this.eventEmitter.emit('frame', val));
    this.events.onFrameSize((width, height) => this.eventEmitter.emit('stdout', { width, height }));
    this.events.onMessage(val => this.eventEmitter.emit('message', val));
    this.events.onSoundPush(val => this.eventEmitter.emit('soundPush', val));
    this.events.onExit(() => { this.eventEmitter.emit('exit') });
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

  bindToStream(stdin?: NodeJS.ReadStream, stdout?: NodeJS.WriteStream) {
    let command: string[] = [];
    if (stdin) {
      stdin.on('data', (data) => {
        const str = data.toString().toLowerCase();
        command = str.split('');
        this.shell(str);
      });
    }
    if (stdout) {
      stdout.write(this.allstdout);
      this.eventEmitter.on('stdout', val => { stdout.write(val) })
    }
  }

  public get events(): CommandInterfaceEvents {
    return this.ci.events();
  };

  //accessing wasmmodule like filesystem
  //https://js-dos.com/v7/build/docs/dosbox-direct#accessing-file-system
  private get module() {
    return (this.ci as any).transport.module
  }
  public get fs(): typeof FS {
    if ((this.ci as any).transport) {
      return this.module.FS;
    }
  };
  rescan() {
    return this.module._rescanFilesystem();;
  };
  memory(copyDosMemory: boolean) {
    this.module._dumpMemory(copyDosMemory);
    return this.module.memoryContents
  }

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
  /**function called inside to send dosbox's state message */
  public handleOutMsg(handler: (msg: BoxOutMessage) => void): void {
    let count = 0;
    this.eventEmitter.on('stdout', value => handler({ name: 'Stdout', value }));
    this.eventEmitter.on('frame', value => handler({ name: 'Frame', value, width: this.ci.width(), height: this.ci.height(), count: count++ }));
    this.eventEmitter.on('soundPush', value => handler({ name: 'SoundPush', value, freq: this.ci.soundFrequency() }));
    this.eventEmitter.on('exit', () => handler({ name: 'Exit' }));
  }
}