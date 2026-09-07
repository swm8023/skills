import { Fragment, h } from "preact"
import { resolveRelative } from "@quartz-community/utils"
import { KnowledgeTagSidebar, directoryCounts } from "./tags.mjs"

export { KnowledgeTagSidebar } from "./tags.mjs"

// Lucide outline icons share a 24px viewBox and 2px stroke.
function ChromeIcon({ name }) {
  return h("svg", {
    viewBox: "0 0 24 24", width: 20, height: 20, fill: "none",
    stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round",
    "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false",
  }, name === "search"
    ? [h("path", { d: "m21 21-4.34-4.34" }), h("circle", { cx: 11, cy: 11, r: 8 })]
    : h("path", { d: name === "menu" ? "M4 5h16M4 12h16M4 19h16"
      : name === "book" ? "M12 5v16m8.001-2A2 2 0 0 0 22 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2a5 5 0 0 1 4-2z"
      : "M18 6 6 18M6 6l12 12" }))
}

function MobileChrome({ cfg = {}, fileData = {} }) {
  const home = resolveRelative(fileData.slug || "index", "index")
  const dialogHeader = (name, title) => h("header", { class: "knowledge-mobile-dialog-header" }, [
    h("h2", { id: `knowledge-${name}-title` }, title),
    h("button", { type: "button", class: "knowledge-icon-button", "data-knowledge-close": "", "aria-label": "关闭" }, h(ChromeIcon, { name: "close" })),
  ])
  return h(Fragment, null, [
    h("header", { class: "knowledge-mobile-bar", "aria-label": "知识库导航" }, [
      h("button", { type: "button", class: "knowledge-icon-button", "data-knowledge-open": "navigation", "aria-label": "打开导航", "aria-controls": "knowledge-mobile-navigation", "aria-expanded": "false" }, h(ChromeIcon, { name: "menu" })),
      h("a", { class: "knowledge-mobile-title internal", href: home }, cfg.pageTitle),
      h("button", { type: "button", class: "knowledge-icon-button", "data-knowledge-open": "search", "aria-label": "搜索文章", "aria-controls": "knowledge-mobile-search", "aria-expanded": "false" }, h(ChromeIcon, { name: "search" })),
    ]),
    h("dialog", { id: "knowledge-mobile-navigation", class: "knowledge-mobile-dialog knowledge-mobile-navigation", "aria-labelledby": "knowledge-navigation-title" }, [
      dialogHeader("navigation", "浏览知识库"),
      h("div", { class: "knowledge-mobile-navigation-body" }, [
        h("a", { class: "knowledge-mobile-home internal", href: home }, [h(ChromeIcon, { name: "book" }), h("span", null, "全部文章")]),
        h("div", { "data-knowledge-slot": "navigation" }),
        h("section", { class: "knowledge-mobile-article-tags", hidden: true }, [
          h("h3", null, "本文标签"),
          h("div", { "data-knowledge-slot": "article-tags" }),
        ]),
      ]),
      h("footer", { class: "knowledge-mobile-settings" }, [
        h("span", null, "外观"),
        h("div", { class: "knowledge-mobile-theme-control" }, [
          h("span", { "data-knowledge-theme-label": "" }),
          h("div", { "data-knowledge-slot": "theme" }),
        ]),
      ]),
    ]),
    h("dialog", { id: "knowledge-mobile-search", class: "knowledge-mobile-dialog knowledge-mobile-search", "aria-labelledby": "knowledge-search-title" }, [
      dialogHeader("search", "搜索文章"),
      h("div", { "data-knowledge-slot": "search" }),
    ]),
  ])
}

export const KnowledgeSidebarSwitch = () => {
  const Component = (props = {}) => h(Fragment, null, [h(MobileChrome, props),
    h("div", { class: "knowledge-sidebar-switch", role: "tablist", "aria-label": "浏览知识库",
      "data-knowledge-directory-counts": JSON.stringify(directoryCounts(props.allFiles)) }, [
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button active",
          "data-knowledge-view": "directory",
          role: "tab", id: "knowledge-directory-tab", "aria-selected": "true", tabindex: 0,
        },
        "目录",
      ),
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button",
          "data-knowledge-view": "tags",
          role: "tab", id: "knowledge-tags-tab", "aria-selected": "false", tabindex: -1,
        },
        "标签",
      ),
    ]),
  ])

  Component.css = `
.page:has(.knowledge-sidebar-switch) {
  --knowledge-ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
  --knowledge-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
.sidebar.left :is(.page-title, .knowledge-sidebar-button, .knowledge-mobile-dialog-header, .knowledge-mobile-home, .knowledge-mobile-settings, .knowledge-mobile-title) {
  font-family: var(--knowledge-ui-font);
}
.sidebar.left .darkmode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--darkgray);
  border-radius: 0.5rem;
}
.sidebar.left .darkmode svg {
  position: static;
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  flex-shrink: 0;
}
:root .sidebar.left .darkmode > .dayIcon { display: block; }
:root .sidebar.left .darkmode > .nightIcon { display: none; }
:root[saved-theme="dark"] .sidebar.left .darkmode > .dayIcon { display: none; }
:root[saved-theme="dark"] .sidebar.left .darkmode > .nightIcon { display: block; }
.sidebar.left .darkmode:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }
.knowledge-mobile-bar,
.knowledge-mobile-dialog {
  display: none;
}

.page > #quartz-body .sidebar.left {
  min-width: 0;
}

.page > #quartz-body .sidebar.left .page-title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.page > #quartz-body .sidebar.left .flex-component {
  min-width: 0;
}

.page > #quartz-body .sidebar.left .flex-component > div:first-child,
.page > #quartz-body .sidebar.left .search {
  min-width: 0;
}

.center article > h1[data-knowledge-repeated-title="true"],
.search .preview-container article > h1[data-knowledge-repeated-title="true"] {
  display: none;
}

.knowledge-sidebar-switch {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  margin: 0.75rem 0;
  padding: 0.2rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.35rem;
}

.knowledge-sidebar-button {
  min-height: 2.75rem;
  border: 0;
  border-radius: 0.25rem;
  padding: 0.35rem 0.45rem;
  background: transparent;
  color: var(--darkgray);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  touch-action: manipulation;
}

.knowledge-sidebar-button:focus-visible,
.knowledge-tag-link:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}

.knowledge-sidebar-button.active {
  background: var(--highlight);
  color: var(--dark);
}

@media (hover: hover) and (pointer: fine) {
  .knowledge-sidebar-button:hover {
    background: var(--highlight);
    color: var(--dark);
  }
}

.knowledge-tags-sidebar {
  display: none;
}

.knowledge-tags-sidebar[data-knowledge-visible="true"] {
  display: block;
}

.explorer[data-knowledge-visible="false"] {
  display: none;
}

@media (min-width: 801px) {
  .page:has(.knowledge-sidebar-switch) { max-width: 100rem; padding-inline: 1.5rem; box-sizing: border-box; }
  .page:has(.knowledge-sidebar-switch) > #quartz-body {
    grid-template-columns: clamp(14.5rem, 19vw, 17rem) minmax(0, 1fr);
    grid-template-areas: "grid-sidebar-left grid-header" "grid-sidebar-left grid-center" "grid-sidebar-left grid-sidebar-right" "grid-sidebar-left grid-footer";
    column-gap: 2rem;
    padding: 0;
  }
  .page > #quartz-body .sidebar.left:has(.knowledge-sidebar-switch) {
    padding: 2rem 1rem 1.25rem 0;
    gap: 0.875rem;
    height: 100dvh;
    border-right: 1px solid var(--lightgray);
  }
  .sidebar.left .page-title { margin: 0; font-size: 1.375rem; line-height: 1.3; letter-spacing: -0.015em; }
  .sidebar.left > .page-title,
  .sidebar.left > .flex-component,
  .sidebar.left > .knowledge-sidebar-switch { flex-shrink: 0; }
  .knowledge-sidebar-switch { margin: 0.25rem 0 0; padding: 0.1875rem; border-radius: 0.5rem; }
  .knowledge-sidebar-button { min-height: 2.25rem; font-size: 0.875rem; border-radius: 0.3125rem; }
  .sidebar.left .explorer > .desktop-explorer { display: none; }
  .sidebar.left .explorer,
  .sidebar.left .knowledge-tags-sidebar { flex: 1 1 0; min-height: 0; }
  .sidebar.left .knowledge-tags-sidebar { overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
  .sidebar.left .explorer-content { min-height: 0; margin: 0; scrollbar-gutter: stable; }
  .page > #quartz-body .page-header { margin-top: 2rem; }
  .page > #quartz-body .center { min-width: 0; width: 100%; }
  .page > #quartz-body .center:not(:has(.knowledge-home, .knowledge-directory, .knowledge-tag-page)) { max-width: 52rem; margin-left: 0; }
  .page > #quartz-body .sidebar.right { min-width: 0; padding: 2rem 0 1rem; gap: 1.5rem; }
  .page > #quartz-body .sidebar.right:not(:has(> *)) { display: none; }
  .center .article-title { font-size: 1.875rem; line-height: 1.25; letter-spacing: -0.02em; }
  .center article { line-height: 1.75; overflow-wrap: anywhere; }
  .center article pre { overflow-x: auto; }
  .page > #quartz-body .sidebar.left .search {
    max-width: none;
    width: 100%;
  }
  .sidebar.left .search .search-container .search-space .search-layout .results-container .result-card > p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    color: var(--darkgray);
    font-size: 0.875rem;
    line-height: 1.55;
  }
}

@media (min-width: 1201px) {
  .page:has(.knowledge-sidebar-switch) > #quartz-body:has(.sidebar.right > *) {
    grid-template-columns: 17rem minmax(0, 1fr) 14rem;
    grid-template-areas: "grid-sidebar-left grid-header grid-sidebar-right" "grid-sidebar-left grid-center grid-sidebar-right" "grid-sidebar-left grid-footer grid-sidebar-right";
  }
}

@media (max-width: 800px) {
  html {
    scroll-behavior: auto;
    scroll-padding-top: calc(4.5rem + env(safe-area-inset-top));
    text-size-adjust: 100%;
  }
  html:has(.knowledge-mobile-dialog[open]) { overflow: hidden; }
  body { font-family: var(--bodyFont), system-ui, sans-serif; }
  .page > #quartz-body {
    padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right));
  }
  .page > #quartz-body .sidebar.left:has(.knowledge-mobile-bar) {
    display: block;
    position: static;
    height: calc(3.5rem + env(safe-area-inset-top));
    padding: 0;
    margin: 0;
    z-index: auto;
  }
  .sidebar.left:has(.knowledge-mobile-bar) > :not(.knowledge-mobile-bar):not(.knowledge-mobile-dialog) {
    display: none !important;
  }
  .knowledge-mobile-bar {
    position: fixed;
    inset: 0 0 auto;
    z-index: 10;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
    align-items: center;
    gap: 0.5rem;
    height: calc(3.5rem + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) max(0.5rem, env(safe-area-inset-right)) 0 max(0.5rem, env(safe-area-inset-left));
    border-bottom: 1px solid var(--lightgray);
    background: var(--light);
  }
  .knowledge-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    color: var(--dark);
    cursor: pointer;
    touch-action: manipulation;
    flex-shrink: 0;
  }
  .knowledge-icon-button:active,
  .knowledge-mobile-settings .darkmode:active { background: var(--highlight); }
  .knowledge-icon-button svg { width: 20px; height: 20px; flex-shrink: 0; }
  .knowledge-icon-button:focus-visible,
  .knowledge-mobile-title:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }
  .knowledge-mobile-title.internal {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: none;
    padding: 0;
    color: var(--dark);
    font-size: 1rem;
    font-weight: 600;
    line-height: 2.75rem;
    text-align: center;
  }
  .knowledge-mobile-dialog {
    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    border: 0;
    background: var(--light);
    color: var(--darkgray);
    overflow: hidden;
  }
  .knowledge-mobile-dialog[open] { display: flex; flex-direction: column; }
  .knowledge-mobile-dialog::backdrop { background: rgb(0 0 0 / 48%); }
  .knowledge-mobile-navigation {
    right: auto;
    width: min(21rem, calc(100vw - 3.25rem));
    border-radius: 0 1rem 1rem 0;
    box-shadow: 0.5rem 0 2rem rgb(0 0 0 / 16%);
  }
  @media (prefers-reduced-motion: no-preference) {
    .knowledge-mobile-navigation[data-knowledge-motion="true"]::backdrop { transition: background-color 220ms var(--knowledge-ease-out); }
    .knowledge-mobile-navigation[data-knowledge-closing="true"]::backdrop { background: transparent; transition-duration: 160ms; }
    @starting-style {
      .knowledge-mobile-navigation[data-knowledge-motion="true"][open]::backdrop { background: transparent; }
    }
  }
  .knowledge-mobile-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 3.5rem;
    padding: 0 0.5rem 0 1rem;
    border-bottom: 1px solid var(--lightgray);
    flex-shrink: 0;
  }
  .knowledge-mobile-dialog-header h2 { margin: 0; font-family: inherit; font-size: 0.9375rem; font-weight: 600; line-height: 1.4; }
  .knowledge-mobile-navigation-body {
    flex: 1;
    min-height: 0;
    padding: 0.75rem 0.75rem 1rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
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
  .knowledge-mobile-dialog .knowledge-sidebar-switch { margin: 0.625rem 0 0.75rem; padding: 0; border: 0; border-radius: 0.5rem; background: color-mix(in srgb, var(--lightgray) 42%, transparent); gap: 0; }
  .knowledge-mobile-dialog .knowledge-sidebar-button { position: relative; min-height: 2.75rem; font-size: 0.875rem; font-weight: 500; background: transparent; }
  .knowledge-mobile-dialog .knowledge-sidebar-button::before { content: ""; position: absolute; inset: 0.25rem; border-radius: 0.375rem; background: transparent; z-index: -1; }
  .knowledge-mobile-dialog .knowledge-sidebar-button { isolation: isolate; }
  .knowledge-mobile-dialog .knowledge-sidebar-button.active::before { background: var(--light); box-shadow: 0 1px 3px rgb(0 0 0 / 12%); }
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
  .knowledge-mobile-dialog .folder-container > div { min-width: 0; flex: 1; }
  .knowledge-mobile-dialog .folder-container div > a {
    display: flex;
    align-items: center;
    min-height: 2.75rem;
    overflow-wrap: anywhere;
  }
  .knowledge-mobile-article-tags { margin-top: 1.5rem; border-top: 1px solid var(--lightgray); }
  .knowledge-mobile-article-tags h3 { font-size: 0.8125rem; color: var(--darkgray); }
  .page > #quartz-body .knowledge-mobile-settings {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    min-width: 0;
    margin: 0;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--lightgray);
    opacity: 1;
    flex-shrink: 0;
    font-size: 0.875rem;
  }
  .knowledge-mobile-settings .darkmode { width: 2.75rem; height: 2.75rem; }
  .knowledge-mobile-theme-control { display: flex; align-items: center; gap: 0.5rem; }
  [data-knowledge-theme-label] { font-size: 0.8125rem; color: var(--darkgray); }
  .knowledge-mobile-search [data-knowledge-slot="search"] {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1rem;
  }
  .knowledge-mobile-search .search { width: 100%; max-width: none; }
  .knowledge-mobile-search .search-button { display: none; }
  .knowledge-mobile-search .search > .search-container {
    position: static;
    width: 100%;
    height: auto;
    overflow: visible;
    backdrop-filter: none;
  }
  .knowledge-mobile-search .search > .search-container > .search-space { width: 100%; margin: 0; }
  .knowledge-mobile-search .search-space > * { box-shadow: none !important; }
  .knowledge-mobile-search .search > .search-container > .search-space > input {
    min-height: 3rem;
    margin-bottom: 1rem;
    border-color: var(--secondary);
    font-size: 1rem;
  }
  .knowledge-mobile-search .search .search-container .search-space .search-layout,
  .knowledge-mobile-search .search .search-container .search-space .results-container {
    height: auto;
    max-height: none;
    overflow: visible;
  }
  .knowledge-mobile-search .search .search-container .search-space .search-layout {
    border: 0;
  }
  .knowledge-mobile-search .search .search-container .search-space .search-layout .results-container .result-card {
    padding: 1rem 0;
    border: 0;
    border-bottom: 1px solid var(--lightgray);
    border-radius: 0;
    background: transparent;
  }
  .knowledge-mobile-search .search .search-container .search-space .search-layout .results-container .result-card.focus {
    background: var(--highlight);
  }
  .knowledge-mobile-search .search .search-container .search-space .search-layout .results-container .result-card > h3 {
    margin: 0;
    color: var(--dark);
    font-size: 1.125rem;
    line-height: 1.4;
  }
  .knowledge-mobile-search .search .search-container .search-space .search-layout .results-container .result-card > p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    margin: 0.5rem 0 0;
    color: var(--darkgray);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
  .page > #quartz-body .center { min-width: 0; width: 100%; }
  .page > #quartz-body .page-header { margin-top: 1.25rem; }
  .page > #quartz-body .page-header:has(> .popover-hint:empty) { margin-top: 1rem; }
  .page-header .article-title,
  .center article :is(h1, h2, h3, h4) { overflow-wrap: anywhere; text-wrap: balance; }
  .page-header .article-title { margin-top: 0; font-size: 1.75rem; line-height: 1.25; }
  .page-header .content-meta { margin: 0.5rem 0 1.25rem; font-size: 0.8125rem; }
  .center article { line-height: 1.75; overflow-wrap: anywhere; }
  .center article pre { max-width: 100%; overscroll-behavior-x: contain; }
  .center article img { max-width: 100%; height: auto; }
  .page > #quartz-body > footer,
  .page > #quartz-body .center:has(> .knowledge-home) > hr,
  .page > #quartz-body .sidebar.right .graph { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .knowledge-sidebar-button {
    transition: none;
  }
}
`

  Component.beforeDOMLoaded = `
(() => {
  if (window.__wheelmakerWikiFetchPatched) return
  window.__wheelmakerWikiFetchPatched = true

  const marker = "/wiki/"
  const pathname = window.location.pathname
  const markerIndex = pathname.lastIndexOf(marker)
  const wikiRoot = markerIndex >= 0 ? pathname.slice(0, markerIndex + marker.length) : "/"
  const contentIndexURL = new URL("static/contentIndex.json", window.location.origin + wikiRoot).href
  const nativeFetch = window.fetch.bind(window)

  const rewriteWikiURL = (url) => {
    if (url.origin !== window.location.origin || url.pathname.startsWith(wikiRoot)) return url
    if (url.pathname === "/static/contentIndex.json") return new URL(contentIndexURL)
    const path = url.pathname.slice(1)
    const lastSegment = path.split("/").pop() || ""
    if (!url.pathname.startsWith("/static/") && lastSegment.includes(".")) return url
    return new URL(path + url.search + url.hash, window.location.origin + wikiRoot)
  }

  const rewriteRequest = (input) => {
    const rawURL = typeof input === "string" ? input : input?.url
    if (!rawURL) return input
    const requestedURL = new URL(rawURL, window.location.href)
    const mountedURL = rewriteWikiURL(requestedURL)
    if (mountedURL.href === requestedURL.href) {
      return input
    }
    return typeof input === "string" ? mountedURL.href : new Request(mountedURL.href, input)
  }

  const rewriteNavigation = (root) => {
    if (root.matches?.("a[href]")) {
      const rawHref = root.getAttribute("href")
      if (rawHref?.startsWith("/")) {
        const mountedURL = rewriteWikiURL(new URL(rawHref, window.location.href))
        if (mountedURL.href !== new URL(rawHref, window.location.href).href) {
          root.setAttribute("href", mountedURL.pathname + mountedURL.search + mountedURL.hash)
        }
      }
    }
    root.querySelectorAll?.("a[href]").forEach((anchor) => rewriteNavigation(anchor))
  }

  window.fetch = (input, init) => nativeFetch(rewriteRequest(input), init)
  rewriteNavigation(document)
  new MutationObserver((records) => {
    records.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) rewriteNavigation(node)
      })
    })
  }).observe(document.documentElement, { childList: true, subtree: true })
})()
`

  Component.afterDOMLoaded = `
(() => {
  if (window.__wheelmakerSidebarBound) return
  window.__wheelmakerSidebarBound = true
  const mobile = window.matchMedia("(max-width: 800px)")
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const dialogMotions = new Map()
  const storageKey = "wheelmaker-knowledge-sidebar-view"
  let placements = []
  let mountedSidebar = null
  let searchObserver = null
  let directoryObserver = null
  let previewObserver = null
  const tagStateKey = "wheelmaker-knowledge-tag-tree"
  const canonicalPath = (value) => {
    const url = new URL(value, location.href)
    let pathname = url.pathname
    try { pathname = decodeURIComponent(pathname) } catch {}
    return pathname.replace(/\\.html$/, "").replace(/\\/index$/, "").replace(/\\/$/, "")
  }
  const readTagState = () => {
    try {
      const state = JSON.parse(localStorage.getItem(tagStateKey) || "{}")
      return state && typeof state === "object" && !Array.isArray(state) ? Object.assign(Object.create(null), state) : Object.create(null)
    } catch { return Object.create(null) }
  }
  const outlineIcon = (icon, paths) => {
    icon.setAttribute("viewBox", "0 0 24 24")
    icon.setAttribute("fill", "none")
    icon.setAttribute("stroke", "currentColor")
    icon.setAttribute("stroke-width", "2")
    icon.setAttribute("stroke-linecap", "round")
    icon.setAttribute("stroke-linejoin", "round")
    icon.setAttribute("aria-hidden", "true")
    icon.setAttribute("focusable", "false")
    icon.removeAttribute("style")
    icon.removeAttribute("aria-label")
    icon.replaceChildren(...paths.map(d => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", d)
      return path
    }))
  }
  const updateTheme = () => {
    const dark = document.documentElement.getAttribute("saved-theme") === "dark"
    document.querySelectorAll(".sidebar.left .darkmode").forEach(button => {
      button.setAttribute("aria-label", dark ? "切换至浅色模式" : "切换至深色模式")
      button.title = button.getAttribute("aria-label")
    })
    document.querySelectorAll("[data-knowledge-theme-label]").forEach(label => { label.textContent = dark ? "深色" : "浅色" })
  }
  const enhanceTheme = () => {
    document.querySelectorAll(".sidebar.left .darkmode:not([data-knowledge-icons])").forEach(button => {
      const day = button.querySelector(".dayIcon")
      const night = button.querySelector(".nightIcon")
      if (day) outlineIcon(day, ["M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0", "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"])
      if (night) outlineIcon(night, ["M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"])
      button.dataset.knowledgeIcons = "true"
    })
    updateTheme()
  }
  const updateExpanded = (button, open) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"))
    if (!panel) return
    if (button.dataset.knowledgeExpand === "directory") panel.classList.toggle("open", open)
    else panel.hidden = !open
    button.setAttribute("aria-expanded", String(open))
    const label = button.closest(".knowledge-nav-row, .folder-container")?.querySelector("a")?.textContent.trim() || ""
    button.setAttribute("aria-label", (open ? "收起 " : "展开 ") + (button.dataset.knowledgeLabel || label))
  }
  const toggleBranch = (button) => {
    const open = button.getAttribute("aria-expanded") !== "true"
    updateExpanded(button, open)
    const row = button.closest(".knowledge-nav-row, .folder-container")
    try {
      if (button.dataset.knowledgeExpand === "tag") {
        const state = readTagState()
        state[row.dataset.knowledgeTag] = open
        localStorage.setItem(tagStateKey, JSON.stringify(state))
      } else {
        let state = JSON.parse(localStorage.getItem("fileTree") || "[]")
        if (!Array.isArray(state)) state = []
        state = state.filter(item => item.path !== row.dataset.folderpath)
        state.push({ path: row.dataset.folderpath, collapsed: !open })
        localStorage.setItem("fileTree", JSON.stringify(state))
      }
    } catch {}
  }
  const enhanceTags = () => {
    const current = canonicalPath(location.href)
    const state = readTagState()
    document.querySelectorAll(".knowledge-tag-row").forEach(row => {
      const link = row.querySelector("a")
      const target = canonicalPath(link.href)
      if (current === target) link.setAttribute("aria-current", "page")
      else link.removeAttribute("aria-current")
      const button = row.querySelector(".knowledge-tree-toggle")
      if (button) {
        button.dataset.knowledgeLabel = link.querySelector(".knowledge-nav-label").textContent
        updateExpanded(button, current === target || current.startsWith(target + "/") || state[row.dataset.knowledgeTag] === true)
      }
    })
  }
  const enhanceDirectory = () => {
    const explorer = document.querySelector(".sidebar.left .explorer")
    if (!explorer) return
    const list = explorer.querySelector(".explorer-ul")
    const end = list?.querySelector(":scope > .overflow-end")
    if (end && list.lastElementChild !== end) list.append(end)
    const current = canonicalPath(location.href)
    let counts = {}
    try { counts = JSON.parse(document.querySelector(".knowledge-sidebar-switch")?.dataset.knowledgeDirectoryCounts || "{}") } catch {}
    const rows = [...explorer.querySelectorAll(".folder-container")]
    explorer.tabIndex = rows.length ? -1 : 0
    const candidates = rows.filter(row => {
      const link = row.querySelector("a")
      if (!link) return false
      const target = canonicalPath(link.href)
      return current === target || current.startsWith(target + "/")
    }).sort((a, b) => b.querySelector("a").href.length - a.querySelector("a").href.length)
    rows.forEach((row, index) => {
      const link = row.querySelector("a")
      if (!link) return
      const target = canonicalPath(link.href)
      const selected = row === candidates[0]
      if (selected) link.setAttribute("aria-current", current === target ? "page" : "location")
      else link.removeAttribute("aria-current")
      link.classList.toggle("active", selected)
      if (row.dataset.knowledgeEnhanced) return
      row.dataset.knowledgeEnhanced = "true"
      row.classList.add("knowledge-nav-row")
      const name = link.textContent.trim()
      link.title = row.dataset.folderpath || name
      const count = counts[(row.dataset.folderpath || "").replace(/\\/index$/, "")]
      if (count !== undefined) {
        const label = document.createElement("span")
        label.className = "knowledge-tag-count"
        label.textContent = String(count)
        label.setAttribute("aria-label", count + " 篇文章")
        link.append(label)
      }
      const icon = row.querySelector(":scope > .folder-icon")
      const panel = row.nextElementSibling
      if (!icon) return
      if (!panel?.querySelector(".folder-container")) {
        const spacer = document.createElement("span")
        spacer.className = "knowledge-tree-spacer"
        spacer.setAttribute("aria-hidden", "true")
        icon.replaceWith(spacer)
        return
      }
      panel.id = "knowledge-directory-branch-" + index
      const button = document.createElement("button")
      button.type = "button"
      button.className = "knowledge-tree-toggle"
      button.dataset.knowledgeExpand = "directory"
      button.dataset.knowledgeLabel = name
      button.setAttribute("aria-controls", panel.id)
      icon.before(button)
      button.append(icon)
      outlineIcon(icon, ["m9 18 6-6-6-6"])
      const activeAncestor = current === target || current.startsWith(target + "/")
      updateExpanded(button, panel.classList.contains("open") || activeAncestor)
    })
  }

  const savedView = () => {
    try { return localStorage.getItem(storageKey) === "tags" ? "tags" : "directory" } catch { return "directory" }
  }
  const updateTrigger = (dialog) => {
    document.querySelectorAll("[data-knowledge-open]").forEach((button) => {
      if (button.getAttribute("aria-controls") === dialog.id) button.setAttribute("aria-expanded", String(dialog.open))
    })
  }
  const clearSearch = (dialog) => {
    const search = dialog.querySelector(".search-container")
    search?.classList.remove("active")
    const input = search?.querySelector("input")
    if (input) {
      input.value = ""
      input.dispatchEvent(new Event("input", { bubbles: true }))
    }
  }
  const cancelDialogMotion = (dialog) => {
    dialogMotions.get(dialog)?.animation.cancel()
    dialogMotions.delete(dialog)
    delete dialog.dataset.knowledgeClosing
  }
  const moveDialog = (dialog, opening, complete) => {
    const previous = dialogMotions.get(dialog)
    const from = previous ? getComputedStyle(dialog).transform : opening ? "translateX(-100%)" : "translateX(0)"
    cancelDialogMotion(dialog)
    if (!opening) dialog.dataset.knowledgeClosing = "true"
    const animation = dialog.animate([
      { transform: from }, { transform: opening ? "translateX(0)" : "translateX(-100%)" },
    ], { duration: opening ? 220 : 160, easing: "cubic-bezier(0.32, 0.72, 0, 1)", fill: "both" })
    const finish = () => {
      if (dialogMotions.get(dialog)?.animation !== animation) return
      cancelDialogMotion(dialog)
      complete?.()
    }
    dialogMotions.set(dialog, { animation, finish })
    animation.onfinish = finish
  }
  const canMoveDialog = (dialog, animate) => animate && !reducedMotion.matches && dialog.classList.contains("knowledge-mobile-navigation") && typeof dialog.animate === "function"
  const closeDialog = (dialog, animate = false) => {
    if (!dialog) return
    const finish = () => {
      cancelDialogMotion(dialog)
      clearSearch(dialog)
      if (dialog.open) dialog.close()
      updateTrigger(dialog)
    }
    if (dialog.open && canMoveDialog(dialog, animate)) {
      if (dialog.dataset.knowledgeClosing !== "true") moveDialog(dialog, false, finish)
    } else finish()
  }
  const restore = () => {
    previewObserver?.disconnect()
    previewObserver = null
    directoryObserver?.disconnect()
    directoryObserver = null
    searchObserver?.disconnect()
    searchObserver = null
    document.querySelectorAll(".knowledge-mobile-dialog").forEach(dialog => closeDialog(dialog))
    for (const [node, placeholder] of placements) placeholder.replaceWith(node)
    placements = []
    mountedSidebar = null
  }
  const mount = () => {
    const sidebar = document.querySelector(".sidebar.left")
    if (!mobile.matches || !sidebar || mountedSidebar === sidebar) return
    const move = (node, slot) => {
      const target = sidebar.querySelector('[data-knowledge-slot="' + slot + '"]')
      if (!node || !target) return
      const placeholder = document.createComment("knowledge-mobile-slot")
      node.before(placeholder)
      placements.push([node, placeholder])
      target.append(node)
    }
    move(sidebar.querySelector(".knowledge-sidebar-switch"), "navigation")
    move(sidebar.querySelector(".explorer"), "navigation")
    move(sidebar.querySelector(".knowledge-tags-sidebar"), "navigation")
    move(sidebar.querySelector(".darkmode"), "theme")
    move(sidebar.querySelector(".search"), "search")
    const articleTags = document.querySelector(".page-header .tags")
    move(articleTags, "article-tags")
    const articleSection = sidebar.querySelector(".knowledge-mobile-article-tags")
    if (articleSection) articleSection.hidden = !articleTags?.children.length
    mountedSidebar = sidebar
    const search = sidebar.querySelector(".search-container")
    if (search) {
      searchObserver = new MutationObserver(() => {
        const dialog = sidebar.querySelector("#knowledge-mobile-search")
        if (search.classList.contains("active")) showDialog("search", false)
        else if (dialog?.open) closeDialog(dialog)
      })
      searchObserver.observe(search, { attributes: true, attributeFilter: ["class"] })
    }
  }
  const setView = (view) => {
    const root = document.querySelector(".knowledge-sidebar-switch")
    const directory = document.querySelector(".sidebar.left .explorer")
    const tags = document.querySelector(".knowledge-tags-sidebar")
    if (!root || !directory || !tags) return
    document.documentElement.classList.remove("mobile-no-scroll")
    document.querySelector("#quartz-body")?.classList.remove("lock-scroll")
    const showDirectory = view !== "tags"
    root.dataset.openView = showDirectory ? "directory" : "tags"
    directory.id = "knowledge-directory-panel"
    tags.id = "knowledge-tags-panel"
    directory.setAttribute("role", "tabpanel")
    directory.setAttribute("aria-labelledby", "knowledge-directory-tab")
    tags.setAttribute("role", "tabpanel")
    tags.setAttribute("aria-labelledby", "knowledge-tags-tab")
    tags.tabIndex = tags.querySelector("a") ? -1 : 0
    directory.dataset.knowledgeVisible = String(showDirectory)
    tags.dataset.knowledgeVisible = String(!showDirectory)
    directory.setAttribute("aria-hidden", String(!showDirectory))
    tags.setAttribute("aria-hidden", String(showDirectory))
    directory.classList.toggle("collapsed", !showDirectory)
    directory.removeAttribute("aria-expanded")
    const directoryContent = directory.querySelector(".explorer-content")
    directoryContent?.removeAttribute("aria-expanded")
    directoryContent?.setAttribute("role", "navigation")
    directoryContent?.setAttribute("aria-label", "目录导航")
    root.querySelectorAll("[data-knowledge-view]").forEach((button) => {
      const active = button.dataset.knowledgeView === view
      button.classList.toggle("active", active)
      button.setAttribute("aria-selected", String(active))
      button.tabIndex = active ? 0 : -1
      button.setAttribute("aria-controls", button.dataset.knowledgeView === "tags" ? tags.id : directory.id)
    })
  }
  const showDialog = (name, launchSearch = true, animate = false) => {
    if (!mobile.matches) return
    mount()
    const dialog = document.getElementById("knowledge-mobile-" + name)
    if (!dialog) return
    document.querySelectorAll(".knowledge-mobile-dialog[open]").forEach((other) => {
      if (other !== dialog) closeDialog(other)
    })
    const opening = !dialog.open || dialog.dataset.knowledgeClosing === "true"
    if (opening) {
      dialog.dataset.knowledgeMotion = String(canMoveDialog(dialog, animate))
      if (!dialog.open) dialog.showModal()
      if (canMoveDialog(dialog, animate)) moveDialog(dialog, true)
      else cancelDialogMotion(dialog)
    }
    updateTrigger(dialog)
    if (name === "search") {
      if (launchSearch) dialog.querySelector(".search-button")?.click()
      dialog.querySelector("input")?.focus()
    }
  }
  // Keep the existing Quartz nodes and listeners; native dialogs own focus and Escape.
  document.addEventListener("click", (event) => {
    const target = event.target
    const expander = target.closest?.(".knowledge-tree-toggle")
    if (expander) {
      event.preventDefault()
      event.stopImmediatePropagation()
      expander.dataset.knowledgeMotion = String(event.detail > 0)
      toggleBranch(expander)
      return
    }
    const opener = target.closest?.("[data-knowledge-open]")
    if (opener) { showDialog(opener.dataset.knowledgeOpen, true, event.detail > 0); return }
    const closer = target.closest?.("[data-knowledge-close]")
    if (closer) { closeDialog(closer.closest("dialog"), event.detail > 0); return }
    const button = target.closest?.("[data-knowledge-view]")
    if (button) {
      event.stopImmediatePropagation()
      const view = button.dataset.knowledgeView
      setView(view)
      try { localStorage.setItem(storageKey, view) } catch {}
      return
    }
    if (target.matches?.(".knowledge-mobile-dialog")) {
      const rect = target.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(target, event.detail > 0)
    }
  }, true)
  document.addEventListener("keydown", (event) => {
    const tab = event.target.closest?.('[role="tab"][data-knowledge-view]')
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const view = event.key === "Home" ? "directory" : event.key === "End" ? "tags"
      : tab.dataset.knowledgeView === "directory" ? "tags" : "directory"
    document.querySelector('[data-knowledge-view="' + view + '"]')?.click()
    document.querySelector('[data-knowledge-view="' + view + '"]')?.focus()
  })
  document.addEventListener("close", (event) => {
    const dialog = event.target
    if (!dialog.matches?.(".knowledge-mobile-dialog") || dialog.open) return
    cancelDialogMotion(dialog)
    clearSearch(dialog)
    updateTrigger(dialog)
  }, true)
  const normalizeTitle = (root) => {
    const title = root?.querySelector(".article-title")
    const firstHeading = root?.querySelector("article > h1:first-child")
    if (title && firstHeading) {
      const normalize = (text) => text.trim().replace(/\\s+/g, " ")
      firstHeading.dataset.knowledgeRepeatedTitle = String(normalize(title.textContent) === normalize(firstHeading.textContent))
    }
  }
  const reset = () => {
    restore()
    mount()
    const view = document.querySelector(".knowledge-tag-page") ? "tags" : document.querySelector(".knowledge-directory") ? "directory" : savedView()
    setView(view)
    try { localStorage.setItem(storageKey, view) } catch {}
    enhanceTags()
    enhanceDirectory()
    enhanceTheme()
    document.querySelectorAll(".knowledge-mobile-home").forEach(link => {
      if (canonicalPath(link.href) === canonicalPath(location.href)) link.setAttribute("aria-current", "page")
      else link.removeAttribute("aria-current")
    })
    const explorerList = document.querySelector(".explorer-ul")
    if (explorerList) {
      directoryObserver = new MutationObserver(enhanceDirectory)
      directoryObserver.observe(explorerList, { childList: true, subtree: true })
    }
    normalizeTitle(document.querySelector(".center"))
    const searchLayout = document.querySelector(".search .search-layout")
    if (searchLayout) {
      previewObserver = new MutationObserver(() => normalizeTitle(searchLayout.querySelector(".preview-container")))
      previewObserver.observe(searchLayout, { childList: true, subtree: true })
    }
  }
  document.addEventListener("prenav", restore)
  document.addEventListener("nav", reset)
  mobile.addEventListener("change", reset)
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) [...dialogMotions.values()].forEach(motion => motion.finish())
  })
  new MutationObserver(updateTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["saved-theme"] })
  reset()
})()
`

  return Component
}

export const WheelMakerSidebar = () => {
  const SidebarSwitch = KnowledgeSidebarSwitch()
  const TagSidebar = KnowledgeTagSidebar()
  const Component = (props) =>
    h(Fragment, null, [
      h(SidebarSwitch, props),
      h(TagSidebar, props),
    ])

  Component.css = [SidebarSwitch.css, TagSidebar.css].filter(Boolean).join("\n")
  Component.beforeDOMLoaded = SidebarSwitch.beforeDOMLoaded
  Component.afterDOMLoaded = SidebarSwitch.afterDOMLoaded

  return Component
}
