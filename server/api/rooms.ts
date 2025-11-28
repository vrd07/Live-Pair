import express from 'express';
import { nanoid } from 'nanoid';
import prisma from '../db.ts';

const router = express.Router();

// Create a new room
router.post('/', async (req, res) => {
    try {
        const code = nanoid(8);
        const room = await prisma.room.create({
            data: {
                code,
            },
        });
        res.json({ roomCode: room.code });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Get room metadata
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const room = await prisma.room.findUnique({
            where: { code },
        });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

export default router;
