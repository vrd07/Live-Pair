import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
    interface Window {
        loadPyodide: any;
    }
}

export function usePyodide() {
    const [isLoading, setIsLoading] = useState(true);
    const pyodideRef = useRef<any>(null);

    useEffect(() => {
        const load = async () => {
            if (pyodideRef.current) {
                setIsLoading(false);
                return;
            }

            try {
                // Load Pyodide script
                if (!window.loadPyodide) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    script.async = true;
                    document.body.appendChild(script);
                    await new Promise((resolve) => {
                        script.onload = resolve;
                    });
                }

                // Initialize Pyodide
                const pyodide = await window.loadPyodide();
                pyodideRef.current = pyodide;
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load Pyodide:', err);
                setIsLoading(false);
            }
        };

        load();
    }, []);

    const runPython = useCallback(async (code: string, onOutput: (text: string) => void, onError: (text: string) => void) => {
        if (!pyodideRef.current) {
            onError('Pyodide is not loaded yet.');
            return;
        }

        try {
            // Redirect stdout/stderr
            pyodideRef.current.setStdout({ batched: (msg: string) => onOutput(msg) });
            pyodideRef.current.setStderr({ batched: (msg: string) => onError(msg) });

            await pyodideRef.current.runPythonAsync(code);
        } catch (err: any) {
            onError(err.toString());
        }
    }, []);

    return { isLoading, runPython };
}
