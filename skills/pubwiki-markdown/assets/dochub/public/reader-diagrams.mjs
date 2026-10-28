import { controlButton } from './reader-controls.mjs';
import { createMermaidViewport, setMermaidViewportScale, panMermaidViewport, pinchMermaidViewport,
  mermaidViewportKeyAction, MERMAID_ZOOM_STEP, MERMAID_PAN_STEP } from './mermaid-viewport.mjs';

let mermaidPromise, renderQueue = Promise.resolve();
function loadMermaid(entry = document.documentElement.dataset.mermaidEntry) {
  if (!entry) return Promise.reject(new Error('图表引擎不可用，请重新发布知识库'));
  mermaidPromise ??= import(entry).then(module => module.default).catch(() => {
    mermaidPromise = undefined;
    throw new Error('图表引擎加载失败，请刷新重试');
  });
  return mermaidPromise;
}

function renderDiagram(source, theme, id, entry) {
  const result = renderQueue.then(async () => {
    const mermaid = await loadMermaid(entry);
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true,
      theme: theme === 'dark' ? 'dark' : 'default' });
    return (await mermaid.render(id, source.trim())).svg;
  });
  renderQueue = result.then(() => {}, () => {});
  return result;
}

export async function renderShareDiagrams(document) {
  const entry = document.documentElement.dataset.mermaidEntry;
  const diagrams = [...document.querySelectorAll('#article-body pre.mermaid')];
  for (const [index, pre] of diagrams.entries()) {
    const figure = document.createElement('figure'); figure.dataset.wikiDiagram = '1';
    const source = document.createElement('pre'); source.dataset.diagramSource = '1';
    source.hidden = true; source.textContent = pre.textContent; figure.append(source);
    for (const theme of ['light', 'dark']) {
      const variant = document.createElement('div'); variant.dataset.diagramTheme = theme;
      variant.hidden = theme === 'dark';
      try { variant.innerHTML = await renderDiagram(source.textContent, theme, `pubwiki-share-${theme}-${index}`, entry); }
      catch (error) { throw new Error(`Unable to render Wiki diagram ${index + 1}: ${error.message || error}`); }
      if (!variant.querySelector('svg')) throw new Error(`Wiki diagram ${index + 1} did not produce SVG.`);
      figure.append(variant);
    }
    pre.replaceWith(figure);
  }
  return document.querySelector('#article-body').innerHTML;
}

function diagramCard(pre, index, source = pre.textContent) {
  const slot = document.createElement('div'); slot.className = 'diagram-slot';
  const block = document.createElement('section'); block.className = 'diagram-block'; block.setAttribute('aria-label', `Mermaid 图表 ${index + 1}`);
  const toolbar = document.createElement('div'); toolbar.className = 'diagram-toolbar';
  const label = document.createElement('span'); label.textContent = 'Mermaid';
  const actions = document.createElement('div'); actions.className = 'diagram-actions';
  const minus = controlButton('minus', '缩小图表'), plus = controlButton('plus', '放大图表');
  const reset = controlButton('reset', '重置图表视图'), expand = controlButton('expand', '展开图表');
  const close = controlButton('close', '关闭图表查看器'); close.hidden = true;
  const percent = document.createElement('span'); percent.className = 'diagram-scale'; percent.textContent = '100%';
  actions.append(minus, percent, plus, reset, expand, close); actions.hidden = true; toolbar.append(label, actions);
  const canvas = document.createElement('div'); canvas.className = 'diagram-canvas'; canvas.tabIndex = 0;
  canvas.setAttribute('role', 'region'); canvas.setAttribute('aria-label', '图表画布，可拖动平移，使用加减号缩放，0 重置');
  const content = document.createElement('div'); content.className = 'diagram-content';
  const status = document.createElement('div'); status.className = 'diagram-status'; status.setAttribute('role', 'status'); status.textContent = '图表加载中…';
  canvas.append(content, status); block.append(toolbar, canvas); pre.replaceWith(slot); slot.append(block);
  const sourceDetails = document.createElement('details'); sourceDetails.className = 'diagram-source';
  const sourceSummary = document.createElement('summary'); sourceSummary.textContent = '查看 Mermaid 源码';
  const sourceCode = document.createElement('pre'); sourceCode.textContent = source;
  sourceDetails.append(sourceSummary, sourceCode); sourceDetails.hidden = true; block.append(sourceDetails);
  let viewport = createMermaidViewport(), dialog, drag, pinch;
  const pointers = new Map();
  function apply(next) {
    viewport = next;
    content.style.transform = `translate(${next.offsetX}px, ${next.offsetY}px) scale(${next.scale})`;
    percent.textContent = `${Math.round(next.scale * 100)}%`;
  }
  function anchor(x, y) { const rect = canvas.getBoundingClientRect(); return { x: x - rect.left, y: y - rect.top }; }
  function zoom(direction, point = { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 }) {
    apply(setMermaidViewportScale(viewport, viewport.scale + direction * MERMAID_ZOOM_STEP, point));
  }
  function resetView() { drag = pinch = undefined; pointers.clear(); canvas.classList.remove('is-dragging'); apply(createMermaidViewport()); }
  minus.addEventListener('click', () => zoom(-1)); plus.addEventListener('click', () => zoom(1));
  reset.addEventListener('click', resetView);
  expand.addEventListener('click', () => {
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'diagram-dialog'; dialog.setAttribute('aria-label', 'Mermaid 图表查看器');
      document.body.append(dialog);
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => {
        slot.append(block); close.hidden = true; expand.hidden = false; resetView(); expand.focus();
      });
    }
    dialog.append(block); close.hidden = false; expand.hidden = true; resetView(); dialog.showModal(); close.focus();
  });
  close.addEventListener('click', () => dialog?.close());
  canvas.addEventListener('keydown', event => {
    const action = mermaidViewportKeyAction(event.key); if (!action) return;
    event.preventDefault();
    if (action === 'zoom-in') zoom(1);
    else if (action === 'zoom-out') zoom(-1);
    else if (action === 'reset') resetView();
    else apply(panMermaidViewport(viewport, action === 'pan-left' ? -MERMAID_PAN_STEP : action === 'pan-right' ? MERMAID_PAN_STEP : 0,
      action === 'pan-up' ? -MERMAID_PAN_STEP : action === 'pan-down' ? MERMAID_PAN_STEP : 0));
  });
  canvas.addEventListener('wheel', event => {
    if (!event.deltaY || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    event.preventDefault(); zoom(event.deltaY < 0 ? 1 : -1, anchor(event.clientX, event.clientY));
  }, { passive: false });
  const pair = () => [...pointers.values()].slice(0, 2);
  const distance = points => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const center = points => ({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
  canvas.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') {
      pointers.set(event.pointerId, anchor(event.clientX, event.clientY));
      if (pointers.size >= 2) {
        event.preventDefault(); drag = undefined;
        pinch = { viewport, distance: distance(pair()), center: center(pair()) };
        for (const id of pointers.keys()) canvas.setPointerCapture(id);
      } else if (dialog?.open) {
        event.preventDefault(); drag = { id: event.pointerId, x: event.clientX, y: event.clientY, viewport }; canvas.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (event.button !== 0) return;
    event.preventDefault(); canvas.focus(); canvas.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, viewport }; canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', event => {
    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, anchor(event.clientX, event.clientY));
    if (pinch && pointers.size >= 2) {
      event.preventDefault(); apply(pinchMermaidViewport(pinch.viewport, pinch.distance, pinch.center, distance(pair()), center(pair())));
    } else if (drag?.id === event.pointerId) {
      event.preventDefault(); apply(panMermaidViewport(drag.viewport, event.clientX - drag.x, event.clientY - drag.y));
    }
  });
  function endPointer(event) {
    pointers.delete(event.pointerId); pinch = undefined;
    if (drag?.id === event.pointerId) drag = undefined;
    canvas.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);
  return { node: slot, expanded: () => Boolean(dialog?.open), source, render(svg) {
    // Mermaid runs in strict mode; document Markdown never supplies this markup.
    content.innerHTML = svg; status.hidden = true; sourceDetails.hidden = true; canvas.classList.remove('diagram-failed');
    block.setAttribute('aria-busy', 'false'); actions.hidden = false; resetView();
  }, pending() { block.setAttribute('aria-busy', 'true'); if (!content.childElementCount) status.textContent = '正在渲染图表…'; }, fail(error) {
    if (dialog?.open) dialog.close();
    content.replaceChildren(); status.hidden = false; status.textContent = `图表无法渲染：${error.message || error}`;
    canvas.classList.add('diagram-failed'); sourceDetails.hidden = false; actions.hidden = true; block.setAttribute('aria-busy', 'false');
  } };
}

export function initializeDiagrams(themeMode) {
  const snapshots = [...document.querySelectorAll('.article-body [data-wiki-diagram]')].map((node, index) => {
    const variants = Object.fromEntries([...node.querySelectorAll(':scope > [data-diagram-theme]')]
      .map(variant => [variant.dataset.diagramTheme, variant.innerHTML]));
    const card = diagramCard(node, index, node.querySelector('[data-diagram-source]')?.textContent || '');
    return { card, variants };
  });
  const refreshSnapshots = () => {
    for (const { card, variants } of snapshots) {
      const svg = variants[themeMode() === 'dark' ? 'dark' : 'light'];
      if (svg) card.render(svg); else card.fail(new Error('静态图表缺少当前主题'));
    }
  };
  refreshSnapshots();
  const cards = [...document.querySelectorAll('.article-body pre.mermaid')].map((pre, index) => diagramCard(pre, index));
  if (!cards.length) return refreshSnapshots;
  const visible = new Set(), dirty = new Set(cards);
  let rendering = false, revision = 0;
  const active = card => visible.has(card) || card.expanded();
  async function renderVisible() {
    if (rendering || !cards.some(card => active(card) && dirty.has(card))) return;
    rendering = true;
    const currentRevision = revision;
    try {
      for (const [index, card] of cards.entries()) {
        if (revision !== currentRevision) break;
        if (!active(card) || !dirty.has(card)) continue;
        dirty.delete(card);
        card.pending();
        try {
          const svg = await renderDiagram(card.source, themeMode(), `pubwiki-diagram-${index}`);
          if (revision === currentRevision) card.render(svg); else dirty.add(card);
        }
        catch (error) { card.fail(error); }
        // Yield between graphs so scrolling and visibility updates stay responsive.
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (error) {
      for (const card of cards.filter(active)) { dirty.delete(card); card.fail(error); }
    } finally { rendering = false; renderVisible(); }
  }
  if (typeof IntersectionObserver === 'function') {
    const byNode = new Map(cards.map(card => [card.node, card]));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const card = byNode.get(entry.target);
        entry.isIntersecting ? visible.add(card) : visible.delete(card);
      }
      renderVisible();
    }, { rootMargin: '400px 0px' });
    cards.forEach(card => observer.observe(card.node));
  } else cards.forEach(card => visible.add(card));
  window.addEventListener('beforeprint', () => { cards.forEach(card => visible.add(card)); renderVisible(); });
  return function refreshDiagrams() {
    refreshSnapshots();
    revision++;
    cards.forEach(card => dirty.add(card));
    return renderVisible();
  };
}
