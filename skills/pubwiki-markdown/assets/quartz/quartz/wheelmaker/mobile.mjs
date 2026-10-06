import { Fragment, h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

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

export function MobileChrome({ fileData = {} }) {
  const home = resolveRelative(fileData.slug || "index", "index")
  return h(Fragment, null, [
    h("button", { type: "button", class: "knowledge-mobile-capsule", "aria-label": "打开知识库导航", "aria-controls": "knowledge-mobile-panel", "aria-expanded": "false" }, [h(ChromeIcon, { name: "menu" }), "导航"]),
    h("dialog", { id: "knowledge-mobile-panel", class: "knowledge-mobile-dialog", "aria-label": "知识库导航" }, [
      h("header", { class: "knowledge-mobile-dialog-header" }, [
        h("div", { class: "knowledge-mobile-tabs", role: "tablist", "aria-label": "导航功能" },
          [["directory", "目录"], ["toc", "本文"], ["search", "搜索"]].map(([name, label]) =>
            h("button", { type: "button", role: "tab", id: `knowledge-pane-${name}`, "data-knowledge-pane": name, "aria-controls": `knowledge-panel-${name}`, "aria-selected": "false", tabindex: -1 }, label))),
        h("button", { type: "button", class: "knowledge-icon-button", "data-knowledge-close": "", "aria-label": "关闭导航" }, h(ChromeIcon, { name: "close" })),
      ]),
      ...["directory", "toc", "search"].map(name => h("section", { id: `knowledge-panel-${name}`, role: "tabpanel", "aria-labelledby": `knowledge-pane-${name}`, "data-knowledge-panel": name, hidden: true, tabindex: 0 }, name === "directory" ? [
        h("div", { "data-knowledge-slot": "navigation" }),
        h("section", { class: "knowledge-mobile-article-tags", hidden: true }, [h("h3", null, "本文标签"), h("div", { "data-knowledge-slot": "article-tags" })]),
      ] : h("div", { "data-knowledge-slot": name }))),
      h("footer", { class: "knowledge-mobile-settings" }, [
        h("a", { class: "knowledge-mobile-home internal", href: home }, [h(ChromeIcon, { name: "book" }), h("span", null, "全部文章")]),
        h("div", { class: "knowledge-mobile-theme-control" }, [h("span", { "data-knowledge-theme-label": "" }), h("div", { "data-knowledge-slot": "theme" })]),
      ]),
    ]),
  ])
}

export const mobileCSS = `
.knowledge-mobile-capsule, .knowledge-mobile-dialog { display: none; }
@media (max-width: 800px) {
  html {
    scroll-behavior: auto;
    scroll-padding-top: calc(4.5rem + env(safe-area-inset-top));
    text-size-adjust: 100%;
  }
  html:has(.knowledge-mobile-dialog[open]) { overflow: hidden; }
  body { font-family: var(--bodyFont), system-ui, sans-serif; }
  .page:has(.knowledge-mobile-capsule) > #quartz-body { display: block; padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right)); }
  .page > #quartz-body .sidebar.left:has(.knowledge-mobile-capsule) {
    display: block; position: static; height: 0; min-height: 0; padding: 0; margin: 0; z-index: auto;
  }
  .sidebar.left:has(.knowledge-mobile-capsule) > :not(.knowledge-mobile-capsule):not(.knowledge-mobile-dialog) { display: none !important; }
  .knowledge-mobile-capsule {
    position: fixed; top: max(0.5rem, env(safe-area-inset-top)); left: max(0.75rem, env(safe-area-inset-left));
    z-index: 10; display: inline-flex; align-items: center; gap: 0.375rem;
    min-height: 2.75rem; padding: 0 0.75rem; border: 1px solid var(--lightgray); border-radius: 2rem;
    background: var(--light); color: var(--dark); font: 500 0.875rem var(--knowledge-ui-font);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%); cursor: pointer; touch-action: manipulation;
  }
  .knowledge-mobile-capsule:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }
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
  .knowledge-icon-button:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }
  .knowledge-mobile-dialog {
    position: fixed; inset: auto; top: calc(var(--knowledge-viewport-top, 0px) + max(0.5rem, env(safe-area-inset-top)));
    left: max(0.75rem, env(safe-area-inset-left)); box-sizing: border-box;
    width: min(24rem, calc(100vw - 1.5rem - env(safe-area-inset-left) - env(safe-area-inset-right)));
    height: min(38rem, calc(min(var(--knowledge-viewport-height, 100dvh), 100dvh) - 4rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)));
    max-width: none; max-height: none; margin: 0; padding: 0;
    border: 1px solid var(--lightgray); border-radius: 1rem; background: var(--light); color: var(--darkgray);
    box-shadow: 0 8px 32px rgb(0 0 0 / 16%); overflow: hidden; font-family: var(--knowledge-ui-font);
  }
  .knowledge-mobile-dialog[open] { display: flex; flex-direction: column; }
  .knowledge-mobile-dialog::backdrop { background: rgb(0 0 0 / 28%); }
  .knowledge-mobile-tabs { display: flex; flex: 1; gap: 0.25rem; }
  .knowledge-mobile-tabs button { flex: 1; min-height: 2.75rem; border: 0; border-radius: 0.5rem; background: transparent; color: var(--darkgray); font: inherit; cursor: pointer; }
  .knowledge-mobile-tabs button[aria-selected="true"] { background: var(--highlight); color: var(--dark); }
  .knowledge-mobile-tabs button:disabled { opacity: 0.4; cursor: default; }
  .knowledge-mobile-tabs button:focus-visible { outline: 2px solid var(--secondary); outline-offset: -2px; }
  [data-knowledge-panel] { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0.75rem; }
  [data-knowledge-panel][hidden] { display: none; }
  .knowledge-mobile-dialog .toc { display: block; overflow: visible; }
  .knowledge-mobile-dialog .toc-header { display: none; }
  .knowledge-mobile-dialog .toc-content { display: block; overflow: visible; }
  .knowledge-mobile-dialog .toc-content a { display: flex; align-items: center; min-height: 2.75rem; opacity: 1; text-decoration: none; }
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
  [data-knowledge-panel="directory"] {
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
  .page > #quartz-body .center { min-width: 0; width: 100%; }
  .page > #quartz-body .page-header { margin-top: max(0.5rem, env(safe-area-inset-top)); }
  .page > #quartz-body .page-header:has(> .popover-hint:empty) { margin-top: 0; }
  .page-header .article-title, .center:not(:has(.article-title)) > article > h1:first-child,
  .center :is(.knowledge-home, .knowledge-directory, .knowledge-tag-page) .knowledge-page-title {
    padding-inline-start: 5.5rem; min-height: 2.75rem;
  }
  .center .knowledge-home .knowledge-mobile-list-title { padding-inline-start: 5.5rem; min-height: 2.75rem; display: flex; align-items: center; }
  .center :is(.knowledge-home, .knowledge-directory, .knowledge-tag-page) > .knowledge-page-heading { padding-top: max(0.5rem, env(safe-area-inset-top)); }
  .page > #quartz-body .sidebar.right { display: none; }
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


// Move existing reader nodes so their listeners and state survive viewport changes.
function installMobile() {
  if (window.__wheelmakerMobileBound) return
  window.__wheelmakerMobileBound = true
  const mobile = matchMedia("(max-width: 800px)")
  let dialog, capsule, observer, activePane, savedScroll, bodyStyle
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
  const close = (focus = true, clear = true) => {
    if (!dialog?.open) return
    activePane = null
    dialog.close()
    capsule?.setAttribute("aria-expanded", "false")
    if (bodyStyle === null) document.body.removeAttribute("style")
    else document.body.setAttribute("style", bodyStyle)
    if (savedScroll) window.scrollTo(savedScroll.x, savedScroll.y)
    if (focus) capsule?.focus({ preventScroll: true })
    if (clear) clearSearch()
  }
  const select = (name, focus = true) => {
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
  const open = (name) => {
    if (!mobile.matches || !dialog) return
    const hasToc = !!dialog.querySelector(".toc a") && !document.querySelector(".knowledge-home, .knowledge-directory, .knowledge-tag-page")
    dialog.querySelector('[data-knowledge-pane="toc"]').disabled = !hasToc
    const pane = name || (hasToc ? "toc" : "directory")
    if (!name && pane === "directory") dialog.querySelector('[data-knowledge-view="directory"]')?.click()
    if (!dialog.open) {
      savedScroll = { x: scrollX, y: scrollY }
      bodyStyle = document.body.getAttribute("style")
      Object.assign(document.body.style, { position: "fixed", top: -savedScroll.y + "px", left: -savedScroll.x + "px", width: "100%" })
      // Select before showModal so its focus algorithm sees the intended panel.
      select(pane, false)
      viewport()
      dialog.showModal()
      capsule.setAttribute("aria-expanded", "true")
    }
    select(pane)
  }
  const restore = () => {
    observer?.disconnect()
    observer = null
    close(false)
    for (const [node, placeholder] of placements) placeholder.replaceWith(node)
    placements = []
    dialog = null
    capsule = null
  }
  const mount = () => {
    restore()
    if (!mobile.matches) return
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
    move(".sidebar.left .knowledge-sidebar-switch", "navigation")
    move(".sidebar.left .explorer", "navigation")
    move(".sidebar.left .knowledge-tags-sidebar", "navigation")
    move(".sidebar.left .darkmode", "theme")
    move(".sidebar.left .search", "search")
    move(".sidebar.right .toc", "toc")
    move(".page-header .tags", "article-tags")
    dialog.querySelector(".knowledge-mobile-article-tags").hidden = !dialog.querySelector('[data-knowledge-slot="article-tags"] .tags > *')
    const search = dialog.querySelector(".search-container")
    if (search) {
      observer = new MutationObserver(() => {
        if (search.classList.contains("active")) {
          if (!dialog?.open || activePane !== "search") open("search")
        } else if (dialog?.open && activePane === "search") close()
      })
      observer.observe(search, { attributes: true, attributeFilter: ["class"] })
    }
    viewport()
  }
  document.addEventListener("click", event => {
    if (!mobile.matches || !dialog) return
    const target = event.target
    if (target.closest?.(".knowledge-mobile-capsule")) { open(); return }
    if (!dialog.open) return
    const tab = target.closest?.("[data-knowledge-pane]")
    if (tab && !tab.disabled) { select(tab.dataset.knowledgePane); return }
    if (target.closest?.("[data-knowledge-close]")) { close(); return }
    if (target === dialog) {
      const rect = dialog.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
    }
    const link = target.closest?.("a[href]")
    if (link && dialog.contains(link) && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      // Do not detach search result anchors before Quartz's SPA click handler sees them.
      close(false, false)
      queueMicrotask(clearSearch)
    }
  }, true)
  document.addEventListener("keydown", event => {
    if (!dialog?.open) return
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); return }
    const tab = event.target.closest?.("[data-knowledge-pane]")
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const tabs = [...dialog.querySelectorAll("[data-knowledge-pane]:not(:disabled)")]
    const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
      : (tabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    select(tabs[index].dataset.knowledgePane)
  }, true)
  document.addEventListener("cancel", event => {
    if (event.target === dialog) { event.preventDefault(); close() }
  }, true)
  document.addEventListener("prenav", restore)
  document.addEventListener("nav", mount)
  mobile.addEventListener("change", mount)
  window.visualViewport?.addEventListener("resize", viewport)
  window.visualViewport?.addEventListener("scroll", viewport)
  window.addEventListener("resize", viewport)
  mount()
}

export const mobileScript = `(${installMobile.toString()})()`
