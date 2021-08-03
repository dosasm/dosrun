/**@description: this file defines some interface for connection
 */

interface CiMessage1 {
    name: "ci";
    height: number;
    width: number;
    freq: number;
}
interface CiMessage2 {
    name: "ci";
    value: string;
}
interface FrameMessage {
    name: 'Frame';
    value: Uint8Array;
    height: number;
    width: number;
    count: number;
}
interface SoundMessage {
    name: 'SoundPush';
    value: Float32Array | undefined;
    freq: number;
}
interface ExitMessage {
    name: "Exit";
}
interface StdoutMessage {
    name: 'Stdout';
    value: string;
}
export type BoxOutMessage = CiMessage1 | CiMessage2 | FrameMessage | SoundMessage | ExitMessage | StdoutMessage;

interface KeyEventMessage {
    name: "KeyEvent";
    value: { keyCode: number; pressed: boolean };
}
interface StdinMessage {
    name: "Stdin";
    value: string;
}
export type BoxInMessage = KeyEventMessage | StdinMessage;