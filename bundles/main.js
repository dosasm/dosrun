// require modules
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'out');

if (process.argv.includes('clean') && fs.existsSync(outDir)) {
    console.log(`===cleaning ${outDir}===`)
    const files = fs.readdirSync(outDir);
    for (const filename of files) {
        const file = path.join(outDir, filename);
        const s = fs.statSync(file);
        if (s.isFile()) {
            fs.rmSync(file)
        }
    }
    fs.rmdirSync(outDir)
}

if (process.argv.includes('gen')) {
    console.log(`===archieving ${srcDir}===`)
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }
    const dirs = fs.readdirSync(srcDir).filter(
        val => fs.statSync(path.resolve(srcDir, val)).isDirectory()
    );

    for (const name of dirs) {
        const folder = path.resolve(srcDir, name);
        const dstFile = path.resolve(outDir, name + '.jsdos')
        zipFolder(folder, dstFile);
    }
}


function zipFolder(src, dst) {
    // create a file to stream archive data to.
    const output = fs.createWriteStream(dst);
    const archive = archiver('zip');

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
        console.log(`
from ${src}
to ${dst}
${archive.pointer()} total bytes`);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function () {
        console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(src, false);
    // archive.directory(__dirname+'/tools', '/tools/');

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
}


