import React, { useState } from 'react';
import { File, FilePlus, Trash2, Edit2 } from 'lucide-react';
import type { File as FileType } from '../hooks/useFileSystem';

interface FileExplorerProps {
    files: FileType[];
    activeFileId: string | null;
    onSelectFile: (fileId: string) => void;
    onCreateFile: (name: string, language: string) => void;
    onDeleteFile: (fileId: string) => void;
    onRenameFile: (fileId: string, newName: string) => void;
    readOnly?: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
    files,
    activeFileId,
    onSelectFile,
    onCreateFile,
    onDeleteFile,
    onRenameFile,
    readOnly = false
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFileName.trim()) {
            const ext = newFileName.split('.').pop();
            let lang = 'plaintext';
            if (ext === 'html') lang = 'html';
            else if (ext === 'css') lang = 'css';
            else if (ext === 'js') lang = 'javascript';
            else if (ext === 'py') lang = 'python';
            else if (ext === 'php') lang = 'php';
            else if (ext === 'json') lang = 'json';

            onCreateFile(newFileName, lang);
            setNewFileName('');
            setIsCreating(false);
        }
    };

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editName.trim() && editingFileId) {
            onRenameFile(editingFileId, editName);
            setEditingFileId(null);
            setEditName('');
        }
    };

    return (
        <div style={{ width: '250px', background: '#252526', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#bbb' }}>EXPLORER</span>
                {!readOnly && (
                    <button onClick={() => setIsCreating(true)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer' }} title="New File">
                        <FilePlus size={16} />
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreateSubmit} style={{ padding: '5px' }}>
                    <input
                        autoFocus
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="filename.ext"
                        style={{ width: '100%', background: '#3c3c3c', border: '1px solid #007fd4', color: 'white', padding: '4px', outline: 'none' }}
                        onBlur={() => setIsCreating(false)}
                    />
                </form>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {files.map(file => (
                    <div
                        key={file.id}
                        onClick={() => onSelectFile(file.id)}
                        style={{
                            padding: '5px 10px',
                            cursor: 'pointer',
                            background: activeFileId === file.id ? '#37373d' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            color: activeFileId === file.id ? 'white' : '#cccccc'
                        }}
                    >
                        {editingFileId === file.id ? (
                            <form onSubmit={handleRenameSubmit} onClick={e => e.stopPropagation()} style={{ flex: 1 }}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onBlur={() => setEditingFileId(null)}
                                    style={{ width: '100%', background: '#3c3c3c', border: '1px solid #007fd4', color: 'white', padding: '2px 5px', outline: 'none' }}
                                />
                            </form>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <File size={14} color={activeFileId === file.id ? '#fff' : '#888'} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                </div>
                                {!readOnly && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingFileId(file.id); setEditName(file.name); }}
                                            style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}
                                            title="Rename"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
                                            style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
