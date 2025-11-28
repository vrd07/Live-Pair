import { useState, useCallback } from 'react';

export type LogType = 'log' | 'warn' | 'error' | 'info';

export interface LogEntry {
    type: LogType;
    message: string[];
    timestamp: number;
}

export function useConsole() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = useCallback((type: LogType, args: any[]) => {
        setLogs((prev) => [
            ...prev,
            {
                type,
                message: args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ),
                timestamp: Date.now(),
            },
        ]);
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    return { logs, addLog, clearLogs };
}
