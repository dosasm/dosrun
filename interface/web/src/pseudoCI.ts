import { CommandInterface, CommandInterfaceEvents } from 'emulators';
import { DosConfig } from 'emulators/dist/types/dos/bundle/dos-conf';
import { io } from 'socket.io-client';
//import { BoxOutMessage } from '../../nodejs/src/message';
export type BoxOutMessage = any;

const socket = io();
export class CI implements CommandInterface {
    config: () => Promise<DosConfig>;
    screenshot: () => Promise<ImageData>;
    pause: () => void;
    resume: () => void;

    exit: () => Promise<void>;
    simulateKeyPress: (...keyCodes: number[]) => void;
    sendMouseMotion: (x: number, y: number) => void;
    sendMouseButton: (button: number, pressed: boolean) => void;
    persist(): Promise<Uint8Array> {
        throw new Error('Method not implemented.');
    }
    _Soundpush = false;
    mute() {
        this._Soundpush = false;
    };
    unmute() {
        this._Soundpush = true;
    };
    _consumers = {
        FrameSize: (w, h) => undefined,
        Frame: (val) => undefined,
        SoundPush: (val) => undefined,
        Exit: (val) => undefined
    };
    _events: CommandInterfaceEvents = {
        onStdout: () => { },
        onFrameSize: consumer => { this._consumers.FrameSize = consumer; },
        onFrame: consumer => this._consumers.Frame = consumer,
        onSoundPush: consumer => this._consumers.SoundPush = consumer,
        onExit: consumer => this._consumers.Exit = msg => { consumer(); },
        onMessage: (consumer) => { }
    };
    constructor() {
        socket.on('jsdos', val => {
            const msg = val as BoxOutMessage;
            switch (msg.name) {
                case 'Frame':
                    if (this._width !== msg.width || this._height !== msg.height) {
                        this._width = msg.width;
                        this._height = msg.height;
                        this._consumers.FrameSize(this._width, this._height);
                    }
                    const rgb = new Uint8Array(msg.value);
                    this._consumers.Frame(rgb);
                    break;
                case 'SoundPush':
                    this._freq = msg.freq;
                    const samples = new Float32Array(msg.value);
                    if (this._Soundpush) {
                        this._consumers.SoundPush(samples);
                    }
                    break;
                case 'Exit':
                    this._consumers.Exit(msg);
                    break;
            }
        });
    }
    sendMouseRelativeMotion: (x: number, y: number) => void;
    sendMouseSync: () => void;
    _width = 0;
    _height = 0;
    _freq = 0;
    _frameResize = (w, h) => undefined;
    width = () => this._width;
    height = () => this._height;
    soundFrequency = () => this._freq;
    events(): CommandInterfaceEvents {
        return this._events;
    }
    simulateKeyEvent = (keyCode) => {
        socket.emit('jsdos', { name: 'KeyEvent', value: { keyCode } });
    };
    sendKeyEvent = (keyCode, pressed) => {
        socket.emit('jsdos', { name: 'KeyEvent', value: { keyCode, pressed } });
    };
}
