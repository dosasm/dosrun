const fs = require('fs');
const path = require('path');

const emulators_list = [
    "node_modules/emulators/dist/emulators.js",
    "node_modules/emulators/dist/emulators.js.map",
    "node_modules/emulators/dist/wdosbox.js",
    "node_modules/emulators/dist/wdosbox.js.symbols",
    "node_modules/emulators/dist/wdosbox.wasm",
    "node_modules/emulators/dist/wlibzip.js",
    "node_modules/emulators/dist/wlibzip.js.symbols",
    "node_modules/emulators/dist/wlibzip.wasm"
];

const emulators_ui_list = [
    "node_modules/emulators-ui/dist/emulators-ui-loader.gif",
    "node_modules/emulators-ui/dist/emulators-ui.css",
    "node_modules/emulators-ui/dist/emulators-ui.js",
    "node_modules/emulators-ui/dist/emulators-ui.js.map"
]

if (process.argv.includes('copy')) {
    for (const f of emulators_list) {
        const src = path.join(__dirname, f)
        const dst = path.join(__dirname, "nodejs/dist/", path.basename(src))
        fs.copyFileSync(src, dst);
    }
    for (const f of emulators_ui_list) {
        const src = path.join(__dirname, f)
        const dst = path.join(__dirname, "web/dist/", path.basename(src))
        fs.copyFileSync(src, dst);
    }
}

if (process.argv.includes('copy-bin')) {
    const src = path.join(__dirname, 'nodejs/src/dbx')
    const dst = path.join(__dirname, "nodejs/out/dbx")
    fs.copyFileSync(src, dst);
}

const dirs = [
    path.resolve(__dirname, "nodejs/dist/"),
    path.resolve(__dirname, "nodejs/out/"),
    path.resolve(__dirname, "web/dist")
];
if (process.argv.includes('clean')) {
    for (const dir of dirs) {
        fs.rmSync(dir, { force: true, recursive: true })
    }
}