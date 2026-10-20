// Adapted from WheelMaker's mermaidViewport.ts; kept independent of the app.
export const MERMAID_MIN_SCALE = .5;
export const MERMAID_MAX_SCALE = 4;
export const MERMAID_ZOOM_STEP = .2;
export const MERMAID_PAN_STEP = 40;
export const createMermaidViewport = () => ({ scale: 1, offsetX: 0, offsetY: 0 });

export function setMermaidViewportScale(viewport, requestedScale, anchor) {
  const scale = Number.isFinite(requestedScale) ? Math.min(MERMAID_MAX_SCALE, Math.max(MERMAID_MIN_SCALE, requestedScale)) : 1;
  if (scale === viewport.scale) return viewport;
  const ratio = scale / viewport.scale;
  return { scale, offsetX: anchor.x - (anchor.x - viewport.offsetX) * ratio,
    offsetY: anchor.y - (anchor.y - viewport.offsetY) * ratio };
}
export const panMermaidViewport = (viewport, x, y) => ({ ...viewport, offsetX: viewport.offsetX + x, offsetY: viewport.offsetY + y });

export function pinchMermaidViewport(viewport, startDistance, startCenter, distance, center) {
  if (![startDistance, distance, startCenter.x, startCenter.y, center.x, center.y].every(Number.isFinite)
    || startDistance <= 0 || distance <= 0) return viewport;
  const scaled = setMermaidViewportScale(viewport, viewport.scale * distance / startDistance, startCenter);
  return panMermaidViewport(scaled, center.x - startCenter.x, center.y - startCenter.y);
}
export function mermaidViewportKeyAction(key) {
  return ({ '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', '0': 'reset',
    ArrowLeft: 'pan-left', ArrowRight: 'pan-right', ArrowUp: 'pan-up', ArrowDown: 'pan-down' })[key] || null;
}
