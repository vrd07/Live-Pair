import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import randomColor from 'randomcolor';

// We need to manage the doc and provider dynamically based on the room
export let doc = new Y.Doc();
export let provider: WebsocketProvider;
export let awareness: any;

export const initializeYjs = (roomCode: string, user: any, guestName?: string) => {
  if (provider) {
    // If room code changed, destroy old provider
    if (provider.roomname !== roomCode) {
      provider.destroy();
      doc.destroy();
      // Re-create doc for new room
      doc = new Y.Doc();
    } else {
      return { doc, provider, awareness: provider.awareness };
    }
  }

  // Ensure doc is alive (in case it was destroyed elsewhere)
  if (doc.isDestroyed) {
    doc = new Y.Doc();
  }

  // Use the room code in the WebSocket URL path
  provider = new WebsocketProvider(
    'ws://localhost:1234',
    roomCode,
    doc
  );

  awareness = provider.awareness;

  const color = user?.color || randomColor();
  const name = user?.username || guestName || 'Guest ' + Math.floor(Math.random() * 1000);
  const avatarUrl = user?.avatarUrl || null;

  awareness.setLocalStateField('user', {
    name,
    color,
    avatarUrl,
  });

  // Initialize default content if empty
  if (doc.getText('python').toString() === '') {
    doc.getText('python').insert(0, 'print("Hello from Python!")');
  }
  if (doc.getText('php').toString() === '') {
    doc.getText('php').insert(0, '<?php\n\necho "Hello from PHP!";');
  }

  // Initialize chat if needed (arrays don't strictly need init, but good to know it exists)
  // doc.getArray('chat'); 

  return { doc, provider, awareness };
};
