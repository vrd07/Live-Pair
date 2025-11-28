
/* eslint-disable no-undef */
import { WebSocketServer } from 'ws';
import * as http from 'http';
import { setupWSConnection } from 'y-websocket/bin/utils';

const port = process.env.PORT || 1234;
const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('okay');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
    setupWSConnection(conn, req, { gc: true });
});

server.listen(port, () => {
    console.log(`listening on port: ${port}`);
});
