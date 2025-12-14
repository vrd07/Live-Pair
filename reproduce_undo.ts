
import * as Y from 'yjs';

const doc = new Y.Doc();
const filesMap = doc.getMap('files');
const fileMap = new Y.Map();
filesMap.set('file1', fileMap);
const content = new Y.Text('initial');
fileMap.set('content', content);

const undoManager = new Y.UndoManager(content);

console.log('Initial content:', content.toString());

// Simulate user typing
doc.transact(() => {
    content.insert(content.length, ' updated');
}); // Origin is null by default

console.log('After update:', content.toString());
console.log('Undo stack size:', undoManager.undoStack.length);

undoManager.undo();

console.log('After undo:', content.toString());

if (content.toString() === 'initial') {
    console.log('Undo worked!');
} else {
    console.log('Undo failed!');
}
