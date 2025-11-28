import { useState, useCallback } from 'react';

export function usePhp() {
    const [isLoading, setIsLoading] = useState(false);

    const runPhp = useCallback(async (code: string, onOutput: (text: string) => void, onError: (text: string) => void) => {
        setIsLoading(true);
        try {
            // Dynamic import from CDN (specific version)
            // @ts-ignore
            const { PhpWeb } = await import(/* @vite-ignore */ 'https://unpkg.com/php-wasm@0.0.8/PhpWeb.mjs');

            const php = new PhpWeb;

            // Add event listeners for output
            php.addEventListener('output', (event: any) => {
                onOutput(event.detail);
            });

            php.addEventListener('error', (event: any) => {
                onError(event.detail);
            });

            // Run the code
            await php.run(code);

        } catch (err: any) {
            onError(err.toString());
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, runPhp };
}
