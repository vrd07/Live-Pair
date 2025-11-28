import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import session from 'express-session';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/bin/utils';
import roomRoutes from './api/rooms.ts';
import authRoutes from './api/auth.ts';
import prisma from './db.ts';
import passport from './auth.ts';
import * as Y from 'yjs';

const app = express();
const port = process.env.PORT || 1234;

// Session config
app.use(session({
    secret: 'your-secret-key', // In production, use a secure env var
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(cors({
    origin: 'http://localhost:5173', // Allow frontend origin
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/rooms', roomRoutes);
app.use('/auth', authRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Persistence logic
const getYDoc = (docname: string, gc: boolean = true): Y.Doc => {
    // This is a simplified way to hook into y-websocket's doc creation.
    // In a real production setup with y-websocket, we might need to use the 'setPersistence' utility
    // or manage docs manually. For this MVP, we will load state on connection.
    return new Y.Doc({ gc });
}

wss.on('connection', async (conn, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const roomCode = url.pathname.replace('/', '') || 'default'; // Use path as room code

    // Setup Yjs connection
    setupWSConnection(conn, req, {
        docName: roomCode,
        gc: true,
    });

    // We need to access the document to load/save state.
    // y-websocket keeps docs in a global map (in utils.js).
    // Since we can't easily access that internal map from here without modifying y-websocket,
    // we will implement a basic persistence strategy:
    // 1. On connection, we don't need to do anything special if y-websocket handles it,
    //    BUT y-websocket doesn't know about our Prisma DB.
    //    We need to bind persistence.
});

// NOTE: y-websocket's default persistence is LevelDB. To use Prisma/Postgres,
// we usually implement a custom persistence adapter.
// However, y-websocket exports `setPersistence`.
// Let's try to use that if possible, or build a custom sync mechanism.

// For this MVP, to keep it simple and robust:
// We will use a custom approach to save snapshots.
// The client will send a "snapshot" API request periodically, OR
// we can try to hook into the doc updates here if we can get the doc reference.

// Let's stick to the plan: Client sends snapshots for now, or we refine the server to use y-websocket's persistence callback.
// Better approach: Use `y-websocket/bin/utils`'s `setPersistence`.

import { setPersistence } from 'y-websocket/bin/utils';

setPersistence({
    bindState: async (docName, ydoc) => {
        try {
            // Load from DB
            const room = await prisma.room.findUnique({ where: { code: docName } });
            if (room && room.yjsState) {
                Y.applyUpdate(ydoc, room.yjsState);
            }
        } catch (error) {
            console.error('Error loading room state:', error);
        }

        // Save to DB on update
        ydoc.on('update', async (update) => {
            try {
                const state = Y.encodeStateAsUpdate(ydoc);
                await prisma.room.upsert({
                    where: { code: docName },
                    update: {
                        yjsState: Buffer.from(state),
                        lastActiveAt: new Date()
                    },
                    create: {
                        code: docName,
                        yjsState: Buffer.from(state),
                    }
                });
            } catch (error) {
                console.error('Error saving room state:', error);
            }
        });
    },
    writeState: async (docName, ydoc) => {
        try {
            const state = Y.encodeStateAsUpdate(ydoc);
            await prisma.room.upsert({
                where: { code: docName },
                update: {
                    yjsState: Buffer.from(state),
                    lastActiveAt: new Date()
                },
                create: {
                    code: docName,
                    yjsState: Buffer.from(state),
                }
            });
        } catch (error) {
            console.error('Error writing room state:', error);
        }
    },
    provider: null // Required by type definition
});

console.log('Starting server...');
try {
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
}
