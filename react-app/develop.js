const fs = require('fs');
const path = require('path');

if (process.argv.includes('copy') || process.argv.includes('copy-emulators')) {
    copyDir(
        path.resolve(__dirname, 'node_modules', 'emulators', 'dist'),
        path.resolve(__dirname, 'public', 'emulators')
    );
    copyDir(
        path.resolve(__dirname, 'node_modules', 'emulators-ui', 'dist'),
        path.resolve(__dirname, 'public', 'emulators-ui')
    );
}

if (process.argv.includes('copy') || process.argv.includes('copy-bundles')) {
    copyDir(
        path.resolve(__dirname, '../', 'bundles', 'out'),
        path.resolve(__dirname, 'public', 'bundles')
    );
}

function copyDir(src, dst) {
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst, { recursive: true });
    }
    const iterms = fs.readdirSync(src);
    for (const i of iterms) {
        const file = path.resolve(src, i);
        const s = fs.statSync(file);
        if (s.isFile()) {
            const filedst = path.resolve(dst, i);
            fs.copyFileSync(file, filedst);
        }
    }
}