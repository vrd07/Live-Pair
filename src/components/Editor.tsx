import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import { useATA } from '../hooks/useATA';

import { Undo, Redo } from 'lucide-react';

interface EditorProps {
    yText: Y.Text;
    language: string;
    awareness?: any;
    theme?: string;
    fontSize?: number;
    readOnly?: boolean;
}

export const Editor: React.FC<EditorProps> = ({
    yText,
    language,
    awareness,
    theme = 'vs-dark',
    fontSize = 14,
    readOnly = false
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const undoManagerRef = useRef<Y.UndoManager | null>(null);
    const { createATA } = useATA();

    useEffect(() => {
        if (editorRef.current) {
            monacoRef.current = monaco.editor.create(editorRef.current, {
                value: yText.toString(), // Initialize with current Yjs text
                language,
                theme,
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize,
                tabSize: 2,
                scrollBeyondLastLine: false,
                readOnly,
            });

            // Bind Yjs text to Monaco editor
            const binding = new MonacoBinding(
                yText,
                monacoRef.current.getModel()!,
                new Set([monacoRef.current]),
                awareness
            );
            bindingRef.current = binding;

            // Initialize UndoManager
            undoManagerRef.current = new Y.UndoManager(yText, {
                trackedOrigins: new Set([binding, null]) // Track changes from binding and local changes
            });

            // Initialize ATA
            const ata = createATA((path, content) => {
                // @ts-ignore
                monaco.languages.typescript.javascriptDefaults.addExtraLib(content, path);
                // @ts-ignore
                monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path);
            });

            // Trigger ATA on content change (debounced)
            let timeout: NodeJS.Timeout;
            const model = monacoRef.current.getModel();
            if (model) {
                model.onDidChangeContent(() => {
                    if (language === 'javascript' || language === 'typescript') {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            ata(model.getValue());
                        }, 2000);
                    }
                });
                // Initial run
                if (language === 'javascript' || language === 'typescript') {
                    ata(model.getValue());
                }
            }
        }

        return () => {
            bindingRef.current?.destroy();
            monacoRef.current?.dispose();
            undoManagerRef.current?.destroy();
        };
    }, [yText]); // Re-run if yText instance changes (should be stable usually)

    useEffect(() => {
        if (monacoRef.current) {
            monaco.editor.setModelLanguage(monacoRef.current.getModel()!, language);
        }
    }, [language]);

    useEffect(() => {
        if (monacoRef.current) {
            monaco.editor.setTheme(theme);
        }
    }, [theme]);

    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.updateOptions({ fontSize, readOnly });
        }
    }, [fontSize, readOnly]);

    const handleUndo = () => {
        undoManagerRef.current?.undo();
    };

    const handleRedo = () => {
        undoManagerRef.current?.redo();
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
            {!readOnly && (
                <div style={{ position: 'absolute', top: '10px', right: '20px', display: 'flex', gap: '5px', zIndex: 10 }}>
                    <button
                        onClick={handleUndo}
                        title="Undo"
                        style={{ background: '#333', border: '1px solid #555', color: '#ccc', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        <Undo size={16} />
                    </button>
                    <button
                        onClick={handleRedo}
                        title="Redo"
                        style={{ background: '#333', border: '1px solid #555', color: '#ccc', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        <Redo size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};
