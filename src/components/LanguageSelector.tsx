import { ChevronDown } from 'lucide-react';

export type LanguageMode = 'web' | 'python' | 'php';

interface LanguageSelectorProps {
    currentMode: LanguageMode;
    onModeChange: (mode: LanguageMode) => void;
}

export function LanguageSelector({ currentMode, onModeChange }: LanguageSelectorProps) {
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
                value={currentMode}
                onChange={(e) => onModeChange(e.target.value as LanguageMode)}
                style={{
                    appearance: 'none',
                    background: '#333',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '5px 30px 5px 10px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none'
                }}
            >
                <option value="web">Web (HTML/CSS/JS)</option>
                <option value="python">Python (Pyodide)</option>
                <option value="php">PHP (WASM)</option>
            </select>
            <ChevronDown
                size={14}
                style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#aaa'
                }}
            />
        </div>
    );
}
