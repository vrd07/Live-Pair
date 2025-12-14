import { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { AuthPage } from './components/AuthPage';
import { Preview } from './components/Preview';
import { Console } from './components/Console';
import { Chat } from './components/Chat';
import { FileExplorer } from './components/FileExplorer';
import { useRoom } from './hooks/useRoom';
import { useConsole } from './hooks/useConsole';
import { usePyodide } from './hooks/usePyodide';
import { usePhp } from './hooks/usePhp';
import { useFormatter } from './hooks/useFormatter';
import { useFileSystem } from './hooks/useFileSystem';
import { Share2, LogIn, LogOut, User as UserIcon, Check, WifiOff, Play, MessageSquare, Wand2, Download, Settings, X, History, RotateCcw } from 'lucide-react';
import { initializeYjs, doc } from './lib/yjsSetup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserList } from './components/UserList';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function LivePairApp() {
  const { roomCode, createRoom, joinRoom } = useRoom();
  const { user, isLoading, login, logout } = useAuth();
  const { logs, addLog, clearLogs } = useConsole();
  const { runPython, isLoading: isPyodideLoading } = usePyodide();
  const { runPhp, isLoading: isPhpLoading } = usePhp();
  const { formatCode, isFormatting } = useFormatter();

  // File System Hook
  const { files, createFile, deleteFile, renameFile, getFileContent, isReady, fileSystemVersion, restoreSnapshot } = useFileSystem();

  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [awareness, setAwareness] = useState<any>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('livepair-theme') || 'vs-dark');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('livepair-fontsize') || '14'));
  const [isReadOnly, setIsReadOnly] = useState(false);

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Array<{ id: string; name: string; timestamp: number; files: any[] }>>([]);

  useEffect(() => {
    localStorage.setItem('livepair-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('livepair-fontsize', fontSize.toString());
  }, [fontSize]);

  // Initialize Yjs
  useEffect(() => {
    if (roomCode && !isLoading) {
      const { provider, awareness: yAwareness } = initializeYjs(roomCode, user, guestName);
      provider.connect();
      setAwareness(yAwareness);

      provider.on('status', (event: { status: string }) => {
        setIsConnected(event.status === 'connected');
      });

      return () => {
        provider.disconnect();
        setIsConnected(false);
        setAwareness(null);
      };
    }
  }, [roomCode, isLoading, user, guestName]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // console.log('App received message:', event.data); // Debug log
      if (event.data?.type === 'console') {
        addLog(event.data.level, event.data.args);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  // Select first file if none selected and files exist
  useEffect(() => {
    if (isReady && !activeFileId && files.length > 0) {
      // Prefer index.html
      const index = files.find(f => f.name === 'index.html');
      if (index) setActiveFileId(index.id);
      else setActiveFileId(files[0].id);
    }
  }, [isReady, files, activeFileId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getContentString = useCallback((fileId: string) => {
    const yText = getFileContent(fileId);
    return yText ? yText.toString() : '';
  }, [getFileContent, fileSystemVersion]);

  const handleDownload = async () => {
    const zip = new JSZip();
    files.forEach(file => {
      const content = getContentString(file.id);
      zip.file(file.name, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'livepair-project.zip');
  };

  const createSnapshot = () => {
    const snapshotFiles = files.map(f => ({
      ...f,
      content: getContentString(f.id)
    }));

    const newSnapshot = {
      id: Date.now().toString(),
      name: `Snapshot ${snapshots.length + 1}`,
      timestamp: Date.now(),
      files: snapshotFiles
    };

    setSnapshots([newSnapshot, ...snapshots]);
  };

  const handleRestore = (snapshot: any) => {
    if (window.confirm(`Are you sure you want to restore "${snapshot.name}"? Current changes will be lost.`)) {
      restoreSnapshot(snapshot.files);
      setIsHistoryOpen(false);
    }
  };

  const handleRun = async () => {
    clearLogs();
    if (!activeFileId) return;

    const file = files.find(f => f.id === activeFileId);
    if (!file) return;

    const code = getContentString(activeFileId);

    if (file.language === 'python') {
      addLog('info', ['Running Python...']);
      await runPython(
        code,
        (text) => addLog('log', [text]),
        (err) => addLog('error', [err])
      );
    } else if (file.language === 'php') {
      addLog('info', ['Running PHP...']);
      await runPhp(
        code,
        (text) => addLog('log', [text]),
        (err) => addLog('error', [err])
      );
    } else {
      addLog('warn', ['Run is only available for Python and PHP files.']);
    }
  };

  const handleFormat = async () => {
    if (!activeFileId) return;
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;

    const yText = getFileContent(activeFileId);
    if (!yText) return;

    const code = yText.toString();
    const formatted = await formatCode(code, file.language);

    if (formatted !== code) {
      doc.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, formatted);
      });
    }
  };

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e1e', color: 'white' }}>Loading...</div>;
  }

  if (!roomCode) {
    return (
      <AuthPage
        user={user}
        guestName={guestName}
        setGuestName={setGuestName}
        login={login}
        logout={logout}
        createRoom={createRoom}
        joinRoom={joinRoom}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
      />
    );
  }

  const activeFile = files.find(f => f.id === activeFileId);
  const activeYText = activeFileId ? getFileContent(activeFileId) : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: 'white' }}>
      {!isConnected && (
        <div style={{ background: '#f44336', color: 'white', textAlign: 'center', padding: '5px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <WifiOff size={16} /> Disconnected. Trying to reconnect...
        </div>
      )}
      <header style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#252526' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>LivePair</h1>
          <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>Room: {roomCode}</span>
          <div style={{ marginLeft: '20px' }}>
            <UserList />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="History / Time Travel"
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <History size={20} />
          </button>

          <button
            onClick={handleDownload}
            title="Download Project"
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <Download size={20} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={handleFormat}
            disabled={isFormatting || !activeFileId || isReadOnly}
            title="Format Code"
            style={{ background: 'transparent', border: 'none', color: (isFormatting || isReadOnly) ? '#555' : 'white', cursor: 'pointer' }}
          >
            <Wand2 size={20} />
          </button>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Toggle Chat"
            style={{ background: isChatOpen ? '#333' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px', borderRadius: '4px' }}
          >
            <MessageSquare size={20} />
          </button>

          {(activeFile?.language === 'python' || activeFile?.language === 'php') && (
            <button
              onClick={handleRun}
              disabled={activeFile.language === 'python' ? isPyodideLoading : isPhpLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: '#4caf50', color: 'white', border: 'none',
                padding: '5px 15px', borderRadius: '4px', cursor: 'pointer',
                opacity: (activeFile.language === 'python' ? isPyodideLoading : isPhpLoading) ? 0.5 : 1
              }}
            >
              <Play size={16} /> Run
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.avatarUrl ? <img src={user.avatarUrl} style={{ width: 24, height: 24, borderRadius: '50%' }} /> : <UserIcon size={20} />}
              <span style={{ fontSize: '0.9rem' }}>{user.username}</span>
            </div>
          ) : (
            <button onClick={login} style={{ background: 'transparent', border: '1px solid #555', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
              Login
            </button>
          )}

          <button
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid #555', color: copied ? '#4caf50' : 'white', borderColor: copied ? '#4caf50' : '#555', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onCreateFile={createFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
          readOnly={isReadOnly}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
          {activeYText && activeFile ? (
            <Editor
              yText={activeYText}
              language={activeFile.language}
              awareness={awareness}
              theme={theme}
              fontSize={fontSize}
              readOnly={isReadOnly}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Select a file to edit
            </div>
          )}
        </div>

        <div style={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '60%', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #333' }}>
            <div style={{ padding: '5px 10px', background: '#252526', borderBottom: '1px solid #333', fontSize: '0.9rem' }}>
              Preview (index.html)
            </div>
            <div style={{ flex: 1 }}>
              <Preview files={files} getContent={getContentString} version={fileSystemVersion} />
            </div>
          </div>
          <div style={{ height: '40%', display: 'flex', flexDirection: 'column' }}>
            <Console logs={logs} onClear={clearLogs} />
          </div>
        </div>

        <Chat yDoc={doc} user={user || { username: guestName || 'Guest' }} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* History Modal */}
        {isHistoryOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: '#252526', padding: '20px', borderRadius: '8px', width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid #444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Project History</h2>
                <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <button
                onClick={createSnapshot}
                style={{ marginBottom: '20px', padding: '10px', background: '#007fd4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Create Snapshot
              </button>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {snapshots.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No snapshots yet.</div>
                ) : (
                  snapshots.map(snap => (
                    <div key={snap.id} style={{ background: '#333', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{snap.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(snap.timestamp).toLocaleTimeString()}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{snap.files.length} files</div>
                      </div>
                      <button
                        onClick={() => handleRestore(snap)}
                        title="Restore this version"
                        style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: '#252526', padding: '20px', borderRadius: '8px', width: '300px', border: '1px solid #444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: '#3c3c3c', color: 'white', border: '1px solid #555', borderRadius: '4px' }}
                >
                  <option value="vs-dark">Dark (Visual Studio)</option>
                  <option value="light">Light (Visual Studio)</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="spectator-mode"
                  checked={isReadOnly}
                  onChange={(e) => setIsReadOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="spectator-mode" style={{ color: '#ccc', cursor: 'pointer' }}>Spectator Mode (Read-Only)</label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LivePairApp />
    </AuthProvider>
  );
}

export default App;
