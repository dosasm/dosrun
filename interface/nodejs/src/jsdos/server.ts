import * as express from 'express';
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import * as path from 'path';
import { BoxInMessage } from './message';
import { JsdosCi } from './JsdosCi';
import { projectFolder } from '../util';


export function startServer(jsdosCi: JsdosCi, emuUiDist: string, serverPort?: number) {
    const app = express();
    const port = serverPort ? serverPort : 3000;
    const httpServer = createServer(app);
    const io = new Server(httpServer, { serveClient: false });

    app.use('/resources', express.static(path.resolve(projectFolder, './web/resources')));
    app.use('/dist', express.static(path.resolve(projectFolder, './web/dist')));
    app.use('/jsdos', express.static(emuUiDist));

    app.get('/', function (_, res) {
        res.sendFile('/web/index.html', { root: projectFolder });
    });

    httpServer.listen(port, () => {
        console.log(`jsdos showing at http://localhost:${port}`);
    });

    io.on("connection", (socket: Socket) => {
        socket.on("jsdos", val => {
            const msg = val as BoxInMessage;
            jsdosCi.handleInMsg(msg);
        });

        jsdosCi.handleOutMsg(msg => {
            io.emit("jsdos", msg);
        });
    });
}