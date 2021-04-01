// require modules
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

function zipFolder(dir) {
    // create a file to stream archive data to.
    const dst = path.resolve(__dirname, `../public/${dir}.jsdos`);
    const src = path.resolve(__dirname, `./${dir}/`);
    const output = fs.createWriteStream(dst);
    const archive = archiver('zip');

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        console.log(`from ${src} tp ${dst}`)
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

    // append a file from string
    //archive.file(__dirname+'/code.bat', { name: 'tools/code.bat' });

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
}

const dirs = fs.readdirSync(__dirname);
console.log(dirs);
for (const dir of dirs) {
    const folder = path.resolve(__dirname, dir)
    const s = fs.statSync(folder);
    if (s.isDirectory()) {
        zipFolder(dir)
    }
}
