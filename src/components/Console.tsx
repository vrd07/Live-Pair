import { useEffect, useRef } from 'react';
import type { LogEntry } from '../hooks/useConsole';
import { Trash2, Terminal } from 'lucide-react';

interface ConsoleProps {
    logs: LogEntry[];
    onClear: () => void;
}

export function Console({ logs, onClear }: ConsoleProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', background: '#252526', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Terminal size={14} />
                    <span>Console</span>
                </div>
                <button onClick={onClear} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Clear Console">
                    <Trash2 size={14} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {logs.length === 0 && (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>No logs yet...</div>
                )}
                {logs.map((log, index) => (
                    <div key={index} style={{
                        marginBottom: '4px',
                        borderBottom: '1px solid #333',
                        paddingBottom: '4px',
                        color: log.type === 'error' ? '#f14c4c' : log.type === 'warn' ? '#cca700' : '#d4d4d4'
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: '#666', fontSize: '11px', minWidth: '60px' }}>
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {log.message.join(' ')}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
