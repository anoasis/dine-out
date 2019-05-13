
import app from "./app";
import * as http from 'http';
import * as WebSocket from 'ws';
import { PlaceSearchStreamingService } from './services/placeSearchStreamingService'

const PORT = 8080;
const WS_PORT = 8081;
const BATCH_FEATURE_FLAG = false;

app.listen(PORT, () => {
    console.log(`HTTP Server started on port ${PORT} :)`);
})

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

export interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

wss.on('connection', (ws: WebSocket) => {

    const extWs = ws as ExtWebSocket;
    extWs.isAlive = true;

    ws.on('pong', () => { extWs.isAlive = true; });

    ws.on('message', (req: string) => {
        const streamingService = new PlaceSearchStreamingService(ws, BATCH_FEATURE_FLAG);
        streamingService.search(req)
    });

    ws.on('error', (err) => { console.warn(`Client disconnected - reason: ${err}`); })
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {

        const extWs = ws as ExtWebSocket;

        if (!extWs.isAlive) return ws.terminate();

        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);

server.listen(process.env.PORT || WS_PORT, () => {
    console.log(`WS Server started on port ${WS_PORT} :)`);
});