//construct a pseudo socket in vscode to communicate between host and extsnsion

const vscode = acquireVsCodeApi();
//📥 listen message from extension Handle the message inside the webview
window.addEventListener('message', event => {
    const message = event.data;
    console.count(message.name);
});
const socket1 = {
    on: function (command, handle) {
        //📥 listen message from extension Handle the message inside the webview
        window.addEventListener('message', event => {
            const message = event.data;
            handle(message);
        });
    },
    emit: function (command, value) {
        vscode.postMessage(value);
    }
}
const io = () => socket1