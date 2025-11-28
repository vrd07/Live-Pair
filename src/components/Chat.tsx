import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { Send, MessageSquare, X } from 'lucide-react';

interface ChatProps {
    yDoc: Y.Doc;
    user: any;
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    user: string;
    text: string;
    timestamp: number;
    color: string;
    avatarUrl?: string;
}

export function Chat({ yDoc, user, isOpen, onClose }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!yDoc) return;
        const chatArray = yDoc.getArray<Message>('chat');

        const updateHandler = () => {
            setMessages(chatArray.toArray());
        };

        chatArray.observe(updateHandler);
        updateHandler(); // Initial load

        return () => {
            chatArray.unobserve(updateHandler);
        };
    }, [yDoc]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const chatArray = yDoc.getArray<Message>('chat');
        const newMessage: Message = {
            user: user?.username || 'Guest',
            text: input.trim(),
            timestamp: Date.now(),
            color: user?.color || '#ccc',
            avatarUrl: user?.avatarUrl
        };

        chatArray.push([newMessage]);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            right: 0,
            top: '60px',
            bottom: 0,
            width: '300px',
            background: '#1e1e1e',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
        }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <MessageSquare size={16} /> Chat
                </span>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
                    <X size={16} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.user === (user?.username || 'Guest') ? 'flex-end' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>
                            {msg.avatarUrl && <img src={msg.avatarUrl} style={{ width: 16, height: 16, borderRadius: '50%' }} />}
                            <span style={{ color: msg.color }}>{msg.user}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{
                            background: msg.user === (user?.username || 'Guest') ? '#007acc' : '#333',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            borderTopRightRadius: msg.user === (user?.username || 'Guest') ? '2px' : '10px',
                            borderTopLeftRadius: msg.user === (user?.username || 'Guest') ? '10px' : '2px',
                            maxWidth: '85%',
                            wordBreak: 'break-word'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '10px', borderTop: '1px solid #333', display: 'flex', gap: '5px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#252526', color: 'white' }}
                />
                <button onClick={handleSend} style={{ background: '#007acc', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
