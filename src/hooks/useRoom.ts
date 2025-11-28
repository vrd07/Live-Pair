import { useState, useEffect } from 'react';

export function useRoom() {
    const [roomCode, setRoomCode] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('room');
        if (code) {
            setRoomCode(code);
        }
    }, []);

    const createRoom = async () => {
        try {
            const response = await fetch('http://localhost:1234/api/rooms', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.roomCode) {
                setRoomCode(data.roomCode);
                window.history.pushState({}, '', `/?room=${data.roomCode}`);
            }
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    const joinRoom = (code: string) => {
        if (code.trim()) {
            setRoomCode(code.trim());
            window.history.pushState({}, '', `/?room=${code.trim()}`);
        }
    };

    return { roomCode, createRoom, joinRoom };
}
