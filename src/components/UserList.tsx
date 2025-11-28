import { useEffect, useState } from 'react';
import { awareness } from '../lib/yjsSetup';
import { User } from 'lucide-react';

interface ConnectedUser {
    id: number;
    user: {
        name: string;
        color: string;
        avatarUrl?: string;
    };
}

export function UserList() {
    const [users, setUsers] = useState<ConnectedUser[]>([]);

    useEffect(() => {
        if (!awareness) return;

        const updateUsers = () => {
            const states = awareness.getStates();
            const activeUsers: ConnectedUser[] = [];
            states.forEach((state: any, clientId: number) => {
                if (state.user) {
                    activeUsers.push({
                        id: clientId,
                        user: state.user,
                    });
                }
            });
            setUsers(activeUsers);
        };

        updateUsers();

        awareness.on('change', updateUsers);

        return () => {
            awareness.off('change', updateUsers);
        };
    }, []);

    if (users.length === 0) return null;

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {users.map((u) => (
                <div
                    key={u.id}
                    style={{
                        position: 'relative',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: `2px solid ${u.user.color}`,
                        overflow: 'hidden',
                        background: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'help'
                    }}
                    title={u.user.name}
                >
                    {u.user.avatarUrl ? (
                        <img src={u.user.avatarUrl} alt={u.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                            {u.user.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
