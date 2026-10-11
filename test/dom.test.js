import test from 'node:test';
import assert from 'node:assert/strict';

class Node {
  constructor() { this.children = []; this.style = {}; this.dataset = {}; this.textContent = ''; this.className = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}
globalThis.document = { createElement: () => new Node(), createTextNode: (text) => ({ textContent:text }) };
const { renderChecklist } = await import('../app.js');

test('renderChecklist updates percentage text and progress width', () => {
  const container = new Node(); const text = new Node(); const bar = new Node();
  renderChecklist(container, text, bar, [true, true, false, false]);
  assert.equal(container.children.length, 4);
  assert.equal(text.textContent, '50% ready');
  assert.equal(bar.style.width, '50%');
});
