import assert from 'node:assert/strict';
import test from 'node:test';

test('diagram zoom preserves its anchor, clamps scale and supports pinch and keyboard actions', async () => {
  const module = await import('../assets/dochub/public/mermaid-viewport.mjs').catch(() => ({}));
  assert.equal(typeof module.setMermaidViewportScale, 'function', 'diagram viewing must support WheelMaker viewport operations');
  const viewport = module.createMermaidViewport();
  assert.deepEqual(module.setMermaidViewportScale(viewport, 2, { x: 100, y: 50 }), { scale: 2, offsetX: -100, offsetY: -50 });
  assert.equal(module.setMermaidViewportScale(viewport, 100, { x: 0, y: 0 }).scale, 4);
  assert.equal(module.setMermaidViewportScale(viewport, 0, { x: 0, y: 0 }).scale, .5);
  assert.deepEqual(module.pinchMermaidViewport(viewport, 100, { x: 50, y: 50 }, 200, { x: 60, y: 70 }), { scale: 2, offsetX: -40, offsetY: -30 });
  assert.equal(module.mermaidViewportKeyAction('+'), 'zoom-in');
  assert.equal(module.mermaidViewportKeyAction('ArrowLeft'), 'pan-left');
  assert.equal(module.mermaidViewportKeyAction('Escape'), null);
});
