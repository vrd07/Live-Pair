import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { doc } from '../lib/yjsSetup';
import { nanoid } from 'nanoid';

export interface File {
    id: string;
    name: string;
    language: string;
    content?: string; // For snapshots
}

export const useFileSystem = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [fileSystemVersion, setFileSystemVersion] = useState(0);

    useEffect(() => {
        const filesMap = doc.getMap('files');

        const updateFiles = () => {
            const fileList: File[] = [];
            // Y.Map.forEach callback signature: (value, key, map)
            filesMap.forEach((fileData: any, key: string) => {
                if (fileData instanceof Y.Map) {
                    fileList.push({
                        id: key,
                        name: fileData.get('name') as string,
                        language: fileData.get('language') as string,
                    });
                }
            });
            // Sort files alphabetically, but keep index.html on top if possible or just alpha
            fileList.sort((a, b) => a.name.localeCompare(b.name));
            setFiles(fileList);
        };

        filesMap.observe(updateFiles);
        updateFiles();
        setIsReady(true);

        return () => {
            filesMap.unobserve(updateFiles);
        };
    }, []);

    useEffect(() => {
        const filesMap = doc.getMap('files');
        const observer = () => {
            setFileSystemVersion(v => v + 1);
        };
        filesMap.observeDeep(observer);
        return () => filesMap.unobserveDeep(observer);
    }, []);

    // Migration and Initialization Logic
    useEffect(() => {
        if (!isReady) return;

        const filesMap = doc.getMap('files');

        doc.transact(() => {
            // 1. Cleanup Duplicates
            const seenNames = new Map<string, string>(); // name -> id
            const toDelete: string[] = [];

            filesMap.forEach((fileData: any, key: string) => {
                if (fileData instanceof Y.Map) {
                    const name = fileData.get('name') as string;
                    if (seenNames.has(name)) {
                        toDelete.push(key);
                    } else {
                        seenNames.set(name, key);
                    }
                }
            });

            toDelete.forEach(id => filesMap.delete(id));

            // 2. Initialize if empty (or missing critical files)
            const hasIndex = seenNames.has('index.html');

            if (filesMap.size === 0 && !hasIndex) {
                // Check for legacy content
                const htmlText = doc.getText('html');
                const cssText = doc.getText('css');
                const jsText = doc.getText('js');
                const pythonText = doc.getText('python');
                const phpText = doc.getText('php');

                let hasLegacy = false;

                const create = (id: string, name: string, lang: string, content: string) => {
                    if (filesMap.has(id)) return;
                    const newFileMap = new Y.Map();
                    newFileMap.set('name', name);
                    newFileMap.set('language', lang);
                    const contentText = new Y.Text(content);
                    newFileMap.set('content', contentText);
                    filesMap.set(id, newFileMap);
                };

                if (htmlText.length > 0) {
                    create('legacy-index', 'index.html', 'html', htmlText.toString());
                    hasLegacy = true;
                }
                if (cssText.length > 0) {
                    create('legacy-style', 'style.css', 'css', cssText.toString());
                    hasLegacy = true;
                }
                if (jsText.length > 0) {
                    create('legacy-script', 'script.js', 'javascript', jsText.toString());
                    hasLegacy = true;
                }
                if (pythonText.length > 0) {
                    create('legacy-python', 'main.py', 'python', pythonText.toString());
                    hasLegacy = true;
                }
                if (phpText.length > 0) {
                    create('legacy-php', 'index.php', 'php', phpText.toString());
                    hasLegacy = true;
                }

                if (!hasLegacy) {
                    create('default-index', 'index.html', 'html', `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Welcome to LivePair</h1>
  <p>Check the console for a message!</p>
  <script src="script.js"></script>
</body>
</html>`);
                    create('default-style', 'style.css', 'css', 'body { font-family: sans-serif; padding: 20px; }');
                    create('default-script', 'script.js', 'javascript', 'console.log("Hello from LivePair!");');
                }
            }
        });
    }, [isReady]);

    const createFile = useCallback((name: string, language: string, initialContent: string = '') => {
        const filesMap = doc.getMap('files');
        const id = nanoid();
        const newFileMap = new Y.Map();

        doc.transact(() => {
            newFileMap.set('name', name);
            newFileMap.set('language', language);
            const contentText = new Y.Text(initialContent);
            newFileMap.set('content', contentText);
            filesMap.set(id, newFileMap);
        });

        return id;
    }, []);

    const deleteFile = useCallback((fileId: string) => {
        const filesMap = doc.getMap('files');
        doc.transact(() => {
            filesMap.delete(fileId);
        });
    }, []);

    const renameFile = useCallback((fileId: string, newName: string) => {
        const filesMap = doc.getMap('files');
        const fileMap = filesMap.get(fileId);
        if (fileMap instanceof Y.Map) {
            doc.transact(() => {
                fileMap.set('name', newName);
                const ext = newName.split('.').pop();
                let lang = 'plaintext';
                if (ext === 'html') lang = 'html';
                else if (ext === 'css') lang = 'css';
                else if (ext === 'js') lang = 'javascript';
                else if (ext === 'py') lang = 'python';
                else if (ext === 'php') lang = 'php';
                else if (ext === 'json') lang = 'json';
                fileMap.set('language', lang);
            });
        }
    }, []);

    const getFileContent = useCallback((fileId: string): Y.Text | null => {
        const filesMap = doc.getMap('files');
        const fileMap = filesMap.get(fileId);
        if (fileMap instanceof Y.Map) {
            return fileMap.get('content') as Y.Text;
        }
        return null;
    }, []);

    const restoreSnapshot = useCallback((snapshotFiles: File[]) => {
        doc.transact(() => {
            const filesMap = doc.getMap('files');

            // 1. Update or Create files from snapshot
            snapshotFiles.forEach(snapshotFile => {
                let fileMap = filesMap.get(snapshotFile.id) as Y.Map<any>;
                if (!(fileMap instanceof Y.Map)) {
                    fileMap = new Y.Map();
                    filesMap.set(snapshotFile.id, fileMap);
                }

                fileMap.set('name', snapshotFile.name);
                fileMap.set('language', snapshotFile.language);

                // Restore content
                let contentText = fileMap.get('content') as Y.Text;
                if (!(contentText instanceof Y.Text)) {
                    contentText = new Y.Text();
                    fileMap.set('content', contentText);
                }

                contentText.delete(0, contentText.length);
                if (snapshotFile.content) {
                    contentText.insert(0, snapshotFile.content);
                }
            });

            // 2. Delete files not in snapshot (Strict restore)
            const currentFileIds = Array.from(filesMap.keys());
            const snapshotFileIds = new Set(snapshotFiles.map(f => f.id));

            currentFileIds.forEach(id => {
                if (!snapshotFileIds.has(id)) {
                    filesMap.delete(id);
                }
            });
        });
    }, []);

    return {
        files,
        createFile,
        deleteFile,
        renameFile,
        getFileContent,
        restoreSnapshot,
        isReady,
        fileSystemVersion
    };
};
