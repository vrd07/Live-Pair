import React, { useEffect, useRef } from 'react';
import type { File } from '../hooks/useFileSystem';

interface PreviewProps {
  files: File[];
  getContent: (fileId: string) => string;
  version: number;
}

export const Preview: React.FC<PreviewProps> = ({ files, getContent, version }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updatePreview = () => {
      const indexFile = files.find(f => f.name === 'index.html');
      if (!indexFile) {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = '<div style="color: #666; font-family: sans-serif; padding: 20px; text-align: center;"><h3>No index.html found</h3><p>Create an index.html file to see the preview.</p></div>';
        }
        return;
      }

      let html = getContent(indexFile.id);

      // Console interception script
      const consoleScript = `
          <script>
            (function() {
              const originalLog = console.log;
              const originalWarn = console.warn;
              const originalError = console.error;
              const originalInfo = console.info;

              function sendLog(type, args) {
                const safeArgs = args.map(arg => {
                    try {
                        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                        return String(arg);
                    }
                });
                window.parent.postMessage({ type: 'console', level: type, args: safeArgs }, '*');
              }

              console.log = function(...args) { originalLog.apply(console, args); sendLog('log', args); };
              console.warn = function(...args) { originalWarn.apply(console, args); sendLog('warn', args); };
              console.error = function(...args) { originalError.apply(console, args); sendLog('error', args); };
              console.info = function(...args) { originalInfo.apply(console, args); sendLog('info', args); };
              
              window.onerror = function(message, source, lineno, colno, error) {
                sendLog('error', [message]);
              };

              // Send ready message
              sendLog('info', ['Console Ready']);
            })();
          </script>
       `;

      // Inject console script into head or at the beginning
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${consoleScript}`);
      } else {
        html = `${consoleScript}${html}`;
      }

      // Resolve CSS links
      html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/g, (match, href) => {
        const fileName = href.replace(/^\.\//, ''); // Strip ./ prefix
        const cssFile = files.find(f => f.name === fileName);
        if (cssFile) {
          const cssContent = getContent(cssFile.id);
          return `<style>${cssContent}</style>`;
        }
        return match;
      });

      // Resolve JS scripts
      html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/g, (match, src) => {
        const fileName = src.replace(/^\.\//, ''); // Strip ./ prefix
        const jsFile = files.find(f => f.name === fileName);
        if (jsFile) {
          const jsContent = getContent(jsFile.id);
          // Wrap in try-catch to report errors to our console
          return `<script>try { ${jsContent} } catch(e) { console.error(e); }</script>`;
        }
        return match;
      });

      // console.log('Generated HTML:', html); // Debug log

      if (iframeRef.current) {
        iframeRef.current.srcdoc = html;
      }
    };

    const timeout = setTimeout(updatePreview, 300);
    return () => clearTimeout(timeout);
  }, [files, getContent, version]);

  return (
    <iframe
      ref={iframeRef}
      title="preview"
      style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
      sandbox="allow-scripts"
    />
  );
};
