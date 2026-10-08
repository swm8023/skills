import { Fragment, h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

// Lucide outline icons share a 24px viewBox and 2px stroke.
function ChromeIcon({ name }) {
  const shapes = {
    menu: [h("rect", { x: 3, y: 3, width: 18, height: 18, rx: 2 }), h("path", { d: "M9 3v18" })],
    directory: h("path", { d: "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Zm0 11a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1ZM3 5a2 2 0 0 0 2 2h3M3 3v13a2 2 0 0 0 2 2h3" }),
    tags: [h("path", { d: "M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1zM2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193" }), h("circle", { cx: 10.5, cy: 6.5, r: 0.5, fill: "currentColor" })],
    toc: h("path", { d: "M8 5h13m-8 7h8m-8 7h8M3 10a2 2 0 0 0 2 2h3M3 5v12a2 2 0 0 0 2 2h3" }),
    search: [h("path", { d: "m21 21-4.34-4.34" }), h("circle", { cx: 11, cy: 11, r: 8 })],
    home: h("path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  }
  return h("svg", {
    viewBox: "0 0 24 24", width: 20, height: 20, fill: "none",
    stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round",
    "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false",
  }, shapes[name])
}

export function MobileChrome({ fileData = {} }) {
  const home = resolveRelative(fileData.slug || "index", "index")
  return h(Fragment, null, [
    h("button", { type: "button", class: "knowledge-mobile-capsule", "aria-label": "打开知识库导航", "aria-controls": "knowledge-mobile-panel", "aria-expanded": "false", "aria-haspopup": "dialog" }, h(ChromeIcon, { name: "menu" })),
    h("dialog", { id: "knowledge-mobile-panel", class: "knowledge-mobile-dialog", "aria-label": "知识库导航" }, [
      h("header", { class: "knowledge-mobile-dialog-header" }, [
        h("div", { class: "knowledge-mobile-tabs", role: "tablist", "aria-label": "导航功能" },
          [["directory", "目录"], ["tags", "标签"], ["toc", "大纲"], ["search", "搜索"]].map(([name, label]) =>
            h("button", { type: "button", role: "tab", id: `knowledge-pane-${name}`, "data-knowledge-pane": name, "aria-label": label, title: label, "aria-controls": `knowledge-panel-${name}`, "aria-selected": "false", tabindex: -1 }, h(ChromeIcon, { name })))),
      ]),
      ...["directory", "tags", "toc", "search"].map(name => h("section", { id: `knowledge-panel-${name}`, role: "tabpanel", "aria-labelledby": `knowledge-pane-${name}`, "data-knowledge-panel": name, hidden: true, tabindex: 0 }, name === "tags" ? [
        h("div", { "data-knowledge-slot": "tags" }),
        h("section", { class: "knowledge-mobile-article-tags", hidden: true }, [h("h3", null, "本文标签"), h("div", { "data-knowledge-slot": "article-tags" })]),
      ] : h("div", { "data-knowledge-slot": name }))),
      h("footer", { class: "knowledge-mobile-settings" }, [
        h("a", { class: "knowledge-mobile-home internal", href: home }, [h(ChromeIcon, { name: "home" }), h("span", null, "全部文章")]),
        h("div", { class: "knowledge-mobile-theme-control" }, [h("span", { "data-knowledge-theme-label": "" }), h("div", { "data-knowledge-slot": "theme" })]),
      ]),
    ]),
  ])
}

export const mobileCSS = `
.knowledge-mobile-capsule, .knowledge-mobile-dialog { display: none; }
.knowledge-mobile-settings .darkmode:active { background: var(--highlight); }
.knowledge-mobile-dialog {
  --motion-emphasized: 280ms;
  --motion-standard: 200ms;
  --motion-exit: 180ms;
  position: fixed; inset: auto; top: var(--knowledge-viewport-top, 0px); left: 0;
  box-sizing: border-box;
  width: min(440px, calc(100vw - 3.5rem - env(safe-area-inset-right)));
  height: min(var(--knowledge-viewport-height, 100dvh), 100dvh);
  max-width: none; max-height: none; margin: 0;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom) env(safe-area-inset-left);
  border: 0; border-right: 1px solid var(--knowledge-sidebar-divider, var(--lightgray)); border-radius: 0;
  background: var(--knowledge-sidebar-surface, var(--light)); color: var(--darkgray);
  box-shadow: 8px 0 28px rgb(0 0 0 / 24%); overflow: hidden;
  font-family: var(--knowledge-ui-font); transform: translateX(0);
}
.knowledge-mobile-dialog[open] { display: flex; flex-direction: column; }
.knowledge-mobile-dialog::backdrop { background: rgb(4 9 16 / 40%); backdrop-filter: blur(2px); opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  .knowledge-mobile-dialog[data-knowledge-motion="true"]::backdrop { transition: opacity var(--motion-standard) var(--knowledge-ease-out); }
  .knowledge-mobile-dialog[data-knowledge-closing="true"]::backdrop { opacity: 0; transition-duration: var(--motion-exit); }
  @starting-style { .knowledge-mobile-dialog[data-knowledge-motion="true"][open]::backdrop { opacity: 0; } }
}
.knowledge-mobile-tabs {
  display: grid;
  flex: 1;
  min-width: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 0.25rem;
}
.knowledge-mobile-tabs button {
  display: inline-flex; align-items: center; justify-content: center; justify-self: center;
  width: 2.75rem; min-width: 2.75rem; height: 2.75rem; padding: 0; border: 0; border-radius: 0.625rem;
  background: transparent; color: var(--darkgray); cursor: pointer; touch-action: manipulation;
}
.knowledge-mobile-tabs button svg { flex-shrink: 0; width: 20px; height: 20px; }
.knowledge-mobile-tabs button[aria-selected="true"] { background: var(--highlight); color: var(--secondary); }
.knowledge-mobile-tabs button:disabled { opacity: 0.35; cursor: default; }
.knowledge-mobile-tabs button:focus-visible { outline: 2px solid var(--secondary); outline-offset: -2px; }
.knowledge-mobile-tabs button:not(:disabled):active { background: var(--highlight); }
@media (hover: hover) and (pointer: fine) {
  .knowledge-mobile-tabs button:not(:disabled):hover,
  .knowledge-mobile-dialog :is(.knowledge-mobile-home, .toc-content a):hover { background: var(--highlight); }
}
[data-knowledge-panel] { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0.5rem; scrollbar-width: thin; }
[data-knowledge-panel][hidden] { display: none; }
.knowledge-mobile-dialog .toc { display: block; overflow: visible; }
.knowledge-mobile-dialog .toc-header { display: none; }
.knowledge-mobile-dialog .toc-content { display: block; overflow: visible; }
.knowledge-mobile-dialog .toc-content { margin: 0; }
.knowledge-mobile-dialog .toc-content a { display: flex; align-items: center; min-height: 2.25rem; padding: 0.25rem 0.75rem; border-radius: 0.375rem; opacity: 1; text-decoration: none; font-size: 0.875rem; line-height: 1.4; }
.knowledge-mobile-dialog .toc-content a.in-view { color: var(--secondary); }
.knowledge-mobile-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 3.75rem;
  padding: 0.5rem;
  position: relative;
  flex-shrink: 0;
}
.knowledge-mobile-dialog-header::after,
.page > #quartz-body .knowledge-mobile-settings::before {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--knowledge-sidebar-divider, var(--lightgray));
  content: "";
  pointer-events: none;
}
.knowledge-mobile-dialog-header::after { bottom: 0; }
.page > #quartz-body .knowledge-mobile-settings::before { top: 0; }
.knowledge-mobile-home.internal {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  background: none;
  color: var(--darkgray);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 0.5rem;
}
.knowledge-mobile-home.internal[aria-current] { color: var(--dark); background: var(--highlight); }
.knowledge-mobile-home svg { color: var(--secondary); flex-shrink: 0; }
.knowledge-mobile-dialog .explorer { height: auto; width: 100%; margin: 0; }
.knowledge-mobile-dialog .explorer[data-knowledge-visible="true"] { display: block; }
.knowledge-mobile-dialog .explorer .explorer-toggle,
.knowledge-mobile-dialog .knowledge-tags-sidebar > h2 { display: none; }
.knowledge-mobile-dialog .explorer .explorer-content {
  position: static;
  width: 100%;
  height: auto;
  max-height: none;
  padding: 0;
  margin: 0;
  overflow: visible;
  transform: none;
  visibility: visible;
  transition: none;
}
.knowledge-mobile-dialog .explorer-ul { overflow: visible; max-height: none; }
.knowledge-mobile-dialog .folder-container > a {
  display: flex;
  align-items: center;
  min-height: 2.75rem;
  overflow-wrap: anywhere;
}
.knowledge-mobile-article-tags { margin-top: 1.5rem; padding: 0.75rem; border-top: 1px solid var(--lightgray); }
.knowledge-mobile-article-tags h3 { margin: 0 0 0.5rem; font-size: 0.8125rem; font-weight: 500; color: var(--darkgray); }
.knowledge-mobile-article-tags .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.knowledge-mobile-article-tags .tags a { display: inline-flex; align-items: center; min-height: 2.75rem; padding: 0 0.75rem; border-radius: 0.5rem; background: var(--highlight); color: var(--secondary); text-decoration: none; font-size: 0.875rem; }
.page > #quartz-body .knowledge-mobile-settings {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  min-width: 0;
  margin: 0;
  padding: 0.5rem 1rem;
  border-top: 0;
  opacity: 1;
  flex-shrink: 0;
  font-size: 0.875rem;
}
.knowledge-mobile-settings .darkmode { width: 2.75rem; height: 2.75rem; padding: 0; border: 0; background: transparent; cursor: pointer; }
.knowledge-mobile-theme-control { display: flex; align-items: center; gap: 0.5rem; }
[data-knowledge-theme-label] { font-size: 0.8125rem; color: var(--darkgray); }
[data-knowledge-panel="search"] {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem;
}
[data-knowledge-panel="search"] .search { width: 100%; max-width: none; }
[data-knowledge-panel="search"] .search-button { display: none; }
[data-knowledge-panel="search"] .search > .search-container {
  position: static;
  width: 100%;
  height: auto;
  overflow: visible;
  backdrop-filter: none;
}
[data-knowledge-panel="search"] .search > .search-container > .search-space { width: 100%; margin: 0; }
[data-knowledge-panel="search"] .search-space > * { box-shadow: none !important; }
[data-knowledge-panel="search"] .search > .search-container > .search-space > input {
  min-height: 3rem;
  margin-bottom: 1rem;
  border-color: var(--secondary);
  font-size: 1rem;
}
[data-knowledge-panel="search"] .search .search-container .search-space .search-layout,
[data-knowledge-panel="search"] .search .search-container .search-space .results-container {
  height: auto;
  max-height: none;
  overflow: visible;
}
[data-knowledge-panel="search"] .search .search-container .search-space .search-layout {
  border: 0;
}
[data-knowledge-panel="search"] .search .search-container .search-space .search-layout .results-container .result-card {
  padding: 1rem 0;
  border: 0;
  border-bottom: 1px solid var(--lightgray);
  border-radius: 0;
  background: transparent;
}
[data-knowledge-panel="search"] .search .search-container .search-space .search-layout .results-container .result-card.focus {
  background: var(--highlight);
}
[data-knowledge-panel="search"] .search .search-container .search-space .search-layout .results-container .result-card > h3 {
  margin: 0;
  color: var(--dark);
  font-size: 1.125rem;
  line-height: 1.4;
}
[data-knowledge-panel="search"] .search .search-container .search-space .search-layout .results-container .result-card > p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin: 0.5rem 0 0;
  color: var(--darkgray);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.sidebar.left:has(.knowledge-mobile-capsule) > :not(.knowledge-mobile-capsule):not(.knowledge-mobile-dialog) { display: none !important; }
.page > #quartz-body .sidebar.right { display: none; }
[data-knowledge-panel="search"] .search .preview-container { display: none; }
[data-knowledge-panel="search"] .search .results-container { flex-basis: 100%; }
@media (min-width: 801px) {
  .knowledge-mobile-dialog-header::after,
  .page > #quartz-body .knowledge-mobile-settings::before {
    left: calc(-1 * var(--knowledge-desktop-page-gutter, 1.5rem));
    right: 0;
  }
  .page > #quartz-body .sidebar.left:has(.knowledge-mobile-capsule) {
    display: block; position: sticky; top: 0; height: 100dvh; padding: 0; margin: 0;
  }
  .knowledge-mobile-dialog[open] {
    position: static; width: 100%; height: 100dvh; padding: 0; border: 0; overflow: visible;
    box-shadow: none; transform: none;
  }
}
@media (max-width: 800px) {
  html {
    scroll-behavior: auto;
    scroll-padding-top: calc(3.75rem + env(safe-area-inset-top));
    text-size-adjust: 100%;
  }
  html:has(.knowledge-mobile-dialog[open]) { overflow: hidden; }
  body { font-family: var(--bodyFont), system-ui, sans-serif; }
  .page:has(.knowledge-mobile-capsule) > #quartz-body {
    --knowledge-page-inset-start: max(1rem, env(safe-area-inset-left));
    --knowledge-page-inset-end: max(1rem, env(safe-area-inset-right));
    display: block;
    padding-inline: var(--knowledge-page-inset-start) var(--knowledge-page-inset-end);
  }
  .page > #quartz-body .sidebar.left:has(.knowledge-mobile-capsule) {
    display: block; position: static; height: 0; min-height: 0; padding: 0; margin: 0; z-index: auto;
  }
  .knowledge-mobile-capsule {
    position: fixed; top: max(0.5rem, env(safe-area-inset-top)); right: max(0.75rem, env(safe-area-inset-right));
    z-index: 10; display: inline-flex; align-items: center; justify-content: center;
    width: 2.75rem; height: 2.75rem; padding: 0; border: 1px solid var(--lightgray); border-radius: 0.875rem;
    background: var(--light); color: var(--dark); font: 500 0.875rem var(--knowledge-ui-font);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%); cursor: pointer; touch-action: manipulation;
  }
  .knowledge-mobile-capsule:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }
  .knowledge-mobile-dialog .toc-content a { min-height: 2.75rem; padding: 0.375rem 0.75rem; font-size: 0.9375rem; }
  .page > #quartz-body .center { min-width: 0; width: 100%; }
  .page > #quartz-body .page-header { margin-top: max(0.5rem, env(safe-area-inset-top)); }
  .page > #quartz-body .page-header:has(> .popover-hint:empty) { margin-top: 0; }
  .page-header .article-title, .center:not(:has(.article-title)) > article > h1:first-child,
  .center :is(.knowledge-home, .knowledge-directory, .knowledge-tag-page) .knowledge-page-title {
    padding-inline: 0; min-height: 2.75rem;
  }
  .page-header .article-title::before, .center:not(:has(.article-title)) > article > h1:first-child::before,
  .center :is(.knowledge-home, .knowledge-directory, .knowledge-tag-page) .knowledge-page-title::before {
    content: ""; float: right; width: 3.25rem; height: 2.75rem;
  }
  .center .knowledge-home > .knowledge-page-heading { padding-inline-end: 3.25rem; }
  .center .knowledge-home .knowledge-mobile-list-title { padding-inline: 0; min-height: 2.75rem; display: flex; align-items: center; }
  .center :is(.knowledge-home, .knowledge-directory, .knowledge-tag-page) > .knowledge-page-heading { padding-top: max(0.5rem, env(safe-area-inset-top)); }
  .page-header .article-title,
  .center article :is(h1, h2, h3, h4) { overflow-wrap: anywhere; text-wrap: balance; }
  .page-header .article-title { margin-top: 0; font-size: 1.75rem; line-height: 1.25; }
  .page-header .content-meta { margin: 0.5rem 0 1.25rem; font-size: 0.8125rem; }
  .center article { line-height: 1.75; overflow-wrap: anywhere; }
  .center article pre { max-width: 100%; overscroll-behavior-x: contain; }
  .center article img { max-width: 100%; height: auto; }
  .page > #quartz-body > footer,
  .page > #quartz-body .center:has(> .knowledge-home) > hr { display: none; }
}

`


// One set of reader nodes serves a nonmodal wide sidebar and a modal narrow drawer.
function installMobile() {
  if (window.__wheelmakerMobileBound) return
  window.__wheelmakerMobileBound = true
  const mobile = matchMedia("(max-width: 800px)")
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
  let dialog, capsule, observer, activePane, savedScroll, bodyStyle
  let motion = null
  let placements = []
  const viewport = () => {
    if (!dialog) return
    dialog.style.setProperty("--knowledge-viewport-height", (window.visualViewport?.height || innerHeight) + "px")
    dialog.style.setProperty("--knowledge-viewport-top", (window.visualViewport?.offsetTop || 0) + "px")
  }
  const clearSearch = () => {
    const search = dialog?.querySelector(".search-container")
    search?.classList.remove("active")
    const input = search?.querySelector("input")
    if (input) { input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true })) }
  }
  const cancelMotion = () => {
    motion?.animation.cancel()
    motion = null
    if (dialog) delete dialog.dataset.knowledgeClosing
  }
  const animateDrawer = (opening, complete) => {
    // Retarget from the visible position when a close interrupts entry or reverses.
    const from = motion ? getComputedStyle(dialog).transform : opening ? "translateX(-100%)" : "translateX(0)"
    cancelMotion()
    if (!opening) dialog.dataset.knowledgeClosing = "true"
    const style = getComputedStyle(dialog)
    // CSS minification may normalize milliseconds to seconds; WAAPI needs milliseconds.
    const cssDuration = style.getPropertyValue(opening ? "--motion-emphasized" : "--motion-exit").trim()
    const duration = parseFloat(cssDuration) * (cssDuration.endsWith("ms") ? 1 : 1000)
    const animation = dialog.animate([
      { transform: from }, { transform: opening ? "translateX(0)" : "translateX(-100%)" },
    ], {
      duration,
      easing: style.getPropertyValue("--knowledge-ease-out").trim(), fill: "both",
    })
    const finish = () => {
      if (motion?.animation !== animation) return
      cancelMotion()
      complete?.()
    }
    motion = { animation, finish }
    animation.onfinish = finish
  }
  const close = (focus = true, clear = true, animate = false) => {
    if (!dialog?.matches(":modal")) return
    const finish = () => {
      cancelMotion()
      activePane = null
      dialog.close()
      capsule?.setAttribute("aria-expanded", "false")
      if (bodyStyle === null) document.body.removeAttribute("style")
      else document.body.setAttribute("style", bodyStyle)
      if (savedScroll) window.scrollTo(savedScroll.x, savedScroll.y)
      if (focus) capsule?.focus({ preventScroll: true })
      if (clear) clearSearch()
    }
    if (animate && !reducedMotion.matches && typeof dialog.animate === "function") {
      if (dialog.dataset.knowledgeClosing === "true") return
      dialog.dataset.knowledgeMotion = "true"
      animateDrawer(false, finish)
    } else {
      dialog.dataset.knowledgeMotion = "false"
      finish()
    }
  }
  const select = (name, focus = true) => {
    if (name === "tags") window.__wheelmakerEnsureTags?.()
    activePane = name
    dialog.querySelectorAll("[data-knowledge-panel]").forEach(panel => { panel.hidden = panel.dataset.knowledgePanel !== name })
    dialog.querySelectorAll("[data-knowledge-pane]").forEach(tab => {
      const selected = tab.dataset.knowledgePane === name
      tab.setAttribute("aria-selected", String(selected))
      tab.tabIndex = selected ? 0 : -1
      if (selected && focus && name !== "search") tab.focus({ preventScroll: true })
    })
    if (name === "search") {
      if (!dialog.querySelector(".search-container.active")) dialog.querySelector(".search-button")?.click()
      if (focus) dialog.querySelector("input")?.focus({ preventScroll: true })
    } else clearSearch()
  }
  const open = (name, animate = false) => {
    if (!dialog) return
    const hasToc = !!dialog.querySelector(".toc a") && !document.querySelector(".knowledge-home, .knowledge-directory, .knowledge-tag-page")
    dialog.querySelector('[data-knowledge-pane="toc"]').disabled = !hasToc
    const pane = name || activePane || (hasToc ? "toc" : "directory")
    if (!mobile.matches) { select(pane); return }
    const opening = !dialog.open || dialog.dataset.knowledgeClosing === "true"
    const animated = animate && !reducedMotion.matches && typeof dialog.animate === "function"
    if (!dialog.open) {
      savedScroll = { x: scrollX, y: scrollY }
      bodyStyle = document.body.getAttribute("style")
      Object.assign(document.body.style, { position: "fixed", top: -savedScroll.y + "px", left: -savedScroll.x + "px", width: "100%" })
      // Select before showModal so its focus algorithm sees the intended panel.
      select(pane, false)
      viewport()
      dialog.dataset.knowledgeMotion = String(animated)
      dialog.showModal()
      capsule.setAttribute("aria-expanded", "true")
    }
    if (opening) {
      dialog.dataset.knowledgeMotion = String(animated)
      if (animated) animateDrawer(true)
      else cancelMotion()
    } else if (!animated && motion) {
      dialog.dataset.knowledgeMotion = "false"
      cancelMotion()
    }
    select(pane)
  }
  const restore = () => {
    observer?.disconnect()
    observer = null
    close(false)
    if (dialog?.open) dialog.close()
    activePane = null
    cancelMotion()
    for (const [node, placeholder] of placements) placeholder.replaceWith(node)
    placements = []
    dialog = null
    capsule = null
  }
  const mount = () => {
    restore()
    dialog = document.getElementById("knowledge-mobile-panel")
    capsule = document.querySelector(".knowledge-mobile-capsule")
    if (!dialog || !capsule) return
    const move = (selector, slot) => {
      const node = document.querySelector(selector)
      const target = dialog.querySelector('[data-knowledge-slot="' + slot + '"]')
      if (!node || !target) return
      const placeholder = document.createComment("knowledge-mobile-slot")
      node.before(placeholder)
      placements.push([node, placeholder])
      target.append(node)
    }
    move(".sidebar.left .explorer", "directory")
    move(".sidebar.left .knowledge-tags-sidebar", "tags")
    move(".sidebar.left .darkmode", "theme")
    move(".sidebar.left .search", "search")
    move(".sidebar.right .toc", "toc")
    move(".page-header .tags", "article-tags")
    dialog.querySelector(".knowledge-mobile-article-tags").hidden = !dialog.querySelector('[data-knowledge-slot="article-tags"] .tags > *')
    const search = dialog.querySelector(".search-container")
    const searchLayout = dialog.querySelector(".search-layout")
    if (searchLayout) searchLayout.dataset.preview = "false"
    if (search) {
      observer = new MutationObserver(() => {
        if (search.classList.contains("active")) {
          if (!dialog?.open || activePane !== "search") open("search")
        } else if (dialog?.open && activePane === "search") {
          if (mobile.matches) close()
          else select("directory")
        }
      })
      observer.observe(search, { attributes: true, attributeFilter: ["class"] })
    }
    const hasToc = !!dialog.querySelector(".toc a") && !document.querySelector(".knowledge-home, .knowledge-directory, .knowledge-tag-page")
    dialog.querySelector('[data-knowledge-pane="toc"]').disabled = !hasToc
    applyMode()
    viewport()
  }
  const applyMode = () => {
    if (!dialog) return
    const pane = activePane
    const focused = dialog.contains(document.activeElement) ? document.activeElement : null
    const panelScroll = [...dialog.querySelectorAll("[data-knowledge-panel]")].map(panel => [panel, panel.scrollTop])
    cancelMotion()
    dialog.dataset.knowledgeMotion = "false"
    if (dialog.matches(":modal")) close(false, false)
    if (dialog.open) dialog.close()
    activePane = pane
    dialog.setAttribute("role", mobile.matches ? "dialog" : "complementary")
    if (!mobile.matches) {
      // Setting open avoids the focus jump caused by show() on initial desktop load.
      dialog.setAttribute("open", "")
      select(pane || (document.querySelector(".knowledge-tag-page") ? "tags" : "directory"), false)
      focused?.focus({ preventScroll: true })
    } else if (focused) capsule.focus({ preventScroll: true })
    for (const [panel, top] of panelScroll) panel.scrollTop = top
    viewport()
  }
  document.addEventListener("click", event => {
    if (!dialog) return
    const target = event.target
    if (target.closest?.(".knowledge-mobile-capsule")) { open(undefined, event.detail > 0); return }
    if (!dialog.open) return
    const tab = target.closest?.("[data-knowledge-pane]")
    if (tab && !tab.disabled) { open(tab.dataset.knowledgePane, event.detail > 0); return }
    if (mobile.matches && target === dialog) {
      const rect = dialog.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(true, true, event.detail > 0)
    }
    const link = target.closest?.("a[href]")
    if (mobile.matches && link && dialog.contains(link) && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      // Do not detach search result anchors before Quartz's SPA click handler sees them.
      close(false, false)
      queueMicrotask(clearSearch)
    }
  }, true)
  document.addEventListener("keydown", event => {
    // A collapsed drawer may retain an active search after leaving wide mode.
    if (mobile.matches && dialog && !dialog.open && !event.isComposing
      && event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)
      && dialog.querySelector(".search-container.active")) {
      event.preventDefault()
      event.stopImmediatePropagation()
      open("search")
      if (event.shiftKey) {
        const input = dialog.querySelector("input")
        if (input) { input.value = "#"; input.dispatchEvent(new Event("input", { bubbles: true })) }
      }
      return
    }
    if (!dialog?.open) return
    if (event.key === "Escape") {
      if (mobile.matches) { event.preventDefault(); event.stopPropagation(); close() }
      else if (activePane === "search" && dialog.contains(event.target)) {
        event.preventDefault(); event.stopPropagation(); select("directory")
      }
      return
    }
    const tab = event.target.closest?.("[data-knowledge-pane]")
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const tabs = [...dialog.querySelectorAll("[data-knowledge-pane]:not(:disabled)")]
    const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
      : (tabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    open(tabs[index].dataset.knowledgePane)
  }, true)
  document.addEventListener("cancel", event => {
    if (event.target === dialog) { event.preventDefault(); close() }
  }, true)
  document.addEventListener("prenav", restore)
  document.addEventListener("nav", mount)
  mobile.addEventListener("change", applyMode)
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      if (dialog) dialog.dataset.knowledgeMotion = "false"
      motion?.finish()
    }
  })
  window.visualViewport?.addEventListener("resize", viewport)
  window.visualViewport?.addEventListener("scroll", viewport)
  window.addEventListener("resize", viewport)
  mount()
}

export const mobileScript = `(${installMobile.toString()})()`
