import React from 'react';
import { LogIn, LogOut, User as UserIcon, Code2, ArrowRight, Users } from 'lucide-react';

interface AuthPageProps {
    user: any;
    guestName: string;
    setGuestName: (name: string) => void;
    login: () => void;
    logout: () => void;
    createRoom: () => void;
    joinRoom: (code: string) => void;
    joinCode: string;
    setJoinCode: (code: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
    user,
    guestName,
    setGuestName,
    login,
    logout,
    createRoom,
    joinRoom,
    joinCode,
    setJoinCode
}) => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Accents */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '50%',
                height: '50%',
                background: 'radial-gradient(circle, rgba(100, 108, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '50%',
                height: '50%',
                background: 'radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 0
            }} />

            <div style={{
                background: 'rgba(30, 30, 30, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '40px',
                width: '450px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #646cff 0%, #9c27b0 100%)',
                        borderRadius: '16px',
                        marginBottom: '20px',
                        boxShadow: '0 10px 20px -5px rgba(100, 108, 255, 0.4)'
                    }}>
                        <Code2 size={32} color="white" />
                    </div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>LivePair</h1>
                    <p style={{ margin: 0, color: '#888', fontSize: '1rem' }}>Real-time collaborative code editor</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* User Section */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #646cff' }} />
                                    ) : (
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{user.username}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#4caf50' }}>Logged in</div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    title="Logout"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        color: '#ccc',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Enter your name (Guest)"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    onClick={login}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '12px',
                                        background: '#24292e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <LogIn size={18} /> Login with GitHub
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button
                            onClick={createRoom}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #646cff 0%, #4c51bf 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 15px rgba(100, 108, 255, 0.3)',
                                transition: 'transform 0.1s'
                            }}
                        >
                            <Code2 size={20} /> Create New Room
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>or join existing</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Enter Room Code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    textAlign: 'center',
                                    letterSpacing: '1px'
                                }}
                            />
                            <button
                                onClick={() => joinRoom(joinCode)}
                                disabled={!joinCode.trim()}
                                style={{
                                    padding: '0 24px',
                                    background: !joinCode.trim() ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.2)',
                                    color: !joinCode.trim() ? '#666' : '#4caf50',
                                    border: '1px solid',
                                    borderColor: !joinCode.trim() ? 'transparent' : 'rgba(76, 175, 80, 0.3)',
                                    borderRadius: '12px',
                                    cursor: !joinCode.trim() ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
