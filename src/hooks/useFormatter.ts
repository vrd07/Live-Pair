import { useState, useCallback } from 'react';

export function useFormatter() {
    const [isFormatting, setIsFormatting] = useState(false);

    const formatCode = useCallback(async (code: string, language: string) => {
        setIsFormatting(true);
        try {
            // Dynamic import of Prettier and plugins
            // @ts-ignore
            const prettier = await import(/* @vite-ignore */ 'https://unpkg.com/prettier@3.2.5/standalone.mjs');

            // Make prettier available globally for the PHP plugin (UMD)
            // @ts-ignore
            window.prettier = prettier.default;

            // @ts-ignore
            const parserHtml = await import(/* @vite-ignore */ 'https://unpkg.com/prettier@3.2.5/plugins/html.mjs');
            // @ts-ignore
            const parserCss = await import(/* @vite-ignore */ 'https://unpkg.com/prettier@3.2.5/plugins/postcss.mjs');
            // @ts-ignore
            const parserBabel = await import(/* @vite-ignore */ 'https://unpkg.com/prettier@3.2.5/plugins/babel.mjs');
            // @ts-ignore
            const parserEstree = await import(/* @vite-ignore */ 'https://unpkg.com/prettier@3.2.5/plugins/estree.mjs');
            // @ts-ignore
            const parserPhp = await import(/* @vite-ignore */ 'https://unpkg.com/@prettier/plugin-php@0.22.2/standalone.js');

            // Python plugin is tricky via CDN, let's skip for now or try a specific one if needed.
            // Prettier Python plugin often requires native modules or complex setup.
            // We'll focus on HTML/CSS/JS/PHP first.

            let parser = 'babel';
            let plugins = [parserBabel.default, parserEstree.default];

            if (language === 'html') {
                parser = 'html';
                plugins = [parserHtml.default];
            } else if (language === 'css') {
                parser = 'css';
                plugins = [parserCss.default];
            } else if (language === 'javascript') {
                parser = 'babel';
                plugins = [parserBabel.default, parserEstree.default];
            } else if (language === 'php') {
                parser = 'php';
                plugins = [parserPhp.default];
            } else {
                // Unsupported language for formatting
                return code;
            }

            const formatted = await prettier.default.format(code, {
                parser,
                plugins,
                printWidth: 80,
                tabWidth: 2,
                semi: true,
                singleQuote: true,
            });

            return formatted;
        } catch (err) {
            console.error('Formatting failed:', err);
            return code; // Return original code on error
        } finally {
            setIsFormatting(false);
        }
    }, []);

    return { formatCode, isFormatting };
}
