import { Fragment, h } from "preact"
import { KnowledgeTagSidebar } from "./tags.mjs"

export { KnowledgeTagSidebar } from "./tags.mjs"

export const KnowledgeSidebarSwitch = () => {
  const Component = () =>
    h("div", { class: "knowledge-sidebar-switch", role: "group", "aria-label": "浏览知识库" }, [
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button active",
          "data-knowledge-view": "directory",
          "aria-pressed": "true",
        },
        "目录",
      ),
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button",
          "data-knowledge-view": "tags",
          "aria-pressed": "false",
        },
        "标签",
      ),
    ])

  Component.css = `
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

.center article > h1[data-knowledge-repeated-title="true"] {
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
  .page > #quartz-body .sidebar.left .search {
    max-width: none;
    width: 100%;
  }
}

@media (max-width: 800px) {
  html {
    scroll-behavior: auto;
    text-size-adjust: 100%;
  }

  body {
    font-family: var(--bodyFont), system-ui, sans-serif;
  }

  .page > #quartz-body {
    padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right));
  }

  .page > #quartz-body .sidebar.left:has(> .knowledge-sidebar-switch):has(> .explorer) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "title"
      "toolbar"
      "switch"
      "navigation";
    align-items: center;
    gap: 0.5rem;
    position: static;
    padding: max(0.75rem, env(safe-area-inset-top)) 0 0.75rem;
    border-bottom: 1px solid var(--lightgray);
  }

  .page > #quartz-body .sidebar.left > .page-title {
    grid-area: title;
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.4;
  }

  .page > #quartz-body .sidebar.left > .flex-component {
    grid-area: toolbar;
    display: flex;
    flex-wrap: nowrap !important;
    width: 100%;
    gap: 0.45rem !important;
  }

  .page > #quartz-body .sidebar.left > .flex-component > div:first-child {
    flex: 1 1 auto !important;
    width: auto;
  }

  .page > #quartz-body .sidebar.left .search {
    max-width: none;
    width: 100%;
  }

  .sidebar.left .search > .search-button,
  .sidebar.left .darkmode {
    min-height: 2.75rem;
  }

  .sidebar.left .darkmode {
    min-width: 2.75rem;
  }

  .sidebar.left .search > .search-button > p {
    color: var(--darkgray);
  }

  .search > .search-container {
    height: 100dvh;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    box-sizing: border-box;
  }

  .search > .search-container > .search-space {
    margin-top: 1rem;
  }

  .search > .search-container > .search-space > input {
    min-height: 2.75rem;
  }

  .page > #quartz-body .sidebar.left > .knowledge-sidebar-switch {
    grid-area: switch;
    width: 100%;
    margin: 0;
  }

  .page > #quartz-body .sidebar.left > .explorer,
  .page > #quartz-body .sidebar.left > .knowledge-tags-sidebar {
    grid-area: navigation;
    width: 100%;
    min-width: 0;
    margin: 0;
  }

  .sidebar.left .explorer .mobile-explorer {
    display: none;
  }

  .page > #quartz-body .sidebar.left > .explorer[data-knowledge-visible="true"] {
    display: block;
  }

  .sidebar.left .explorer .explorer-content {
    position: static;
    width: 100%;
    height: auto;
    max-height: min(45dvh, 24rem);
    margin: 0;
    padding: 0.5rem 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    transform: none;
    visibility: visible;
    transition: none;
  }

  .page > #quartz-body .sidebar.left > .knowledge-tags-sidebar {
    box-sizing: border-box;
    max-height: min(45dvh, 24rem);
    padding: 0.5rem 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .knowledge-tags-sidebar > h2 {
    display: none;
  }

  .sidebar.left .folder-container > div {
    min-width: 0;
    flex: 1;
  }

  .sidebar.left .folder-container div > a {
    display: flex;
    align-items: center;
    min-height: 2.75rem;
    overflow-wrap: anywhere;
  }

  .sidebar.left .folder-icon {
    box-sizing: content-box;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0.75rem;
    margin-right: 0;
  }

  .page > #quartz-body .center {
    min-width: 0;
    width: 100%;
  }

  .page > #quartz-body .page-header {
    margin-top: 1.25rem;
  }

  .page-header .article-title,
  .center article :is(h1, h2, h3, h4) {
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .page-header .article-title {
    font-size: 1.75rem;
    line-height: 1.25;
  }

  .center article {
    line-height: 1.75;
    overflow-wrap: anywhere;
  }

  .center article pre {
    max-width: 100%;
    overscroll-behavior-x: contain;
  }

  .center article img {
    max-width: 100%;
    height: auto;
  }

  .page > #quartz-body footer {
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
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
  const storageKey = "wheelmaker-knowledge-sidebar-view"
  const savedView = () => {
    try { return localStorage.getItem(storageKey) === "tags" ? "tags" : "directory" } catch { return "directory" }
  }
  const setView = (view) => {
    const root = document.querySelector(".knowledge-sidebar-switch")
    const directory = document.querySelector(".sidebar.left > .explorer")
    const tags = document.querySelector(".knowledge-tags-sidebar")
    if (!root || !directory || !tags) return
    root.dataset.openView = view
    document.documentElement.classList.remove("mobile-no-scroll")
    document.querySelector("#quartz-body")?.classList.remove("lock-scroll")
    const showDirectory = view === "directory"
    const showTags = view === "tags"
    directory.id = "knowledge-directory-panel"
    tags.id = "knowledge-tags-panel"
    directory.dataset.knowledgeVisible = String(showDirectory)
    tags.dataset.knowledgeVisible = String(showTags)
    directory.setAttribute("aria-hidden", String(!showDirectory))
    tags.setAttribute("aria-hidden", String(!showTags))
    directory.classList.toggle("collapsed", !showDirectory)
    directory.setAttribute("aria-expanded", String(showDirectory))
    directory.querySelector(".explorer-content")?.setAttribute("aria-expanded", String(showDirectory))
    root.querySelectorAll("[data-knowledge-view]").forEach((button) => {
      const active = button.dataset.knowledgeView === view
      button.classList.toggle("active", active)
      button.setAttribute("aria-pressed", String(active))
      button.setAttribute("aria-controls", button.dataset.knowledgeView === "tags" ? tags.id : directory.id)
      if (mobile.matches) button.setAttribute("aria-expanded", String(active))
      else button.removeAttribute("aria-expanded")
    })
  }
  // Delegate once: Quartz replaces page nodes during SPA navigation.
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-knowledge-view], .mobile-explorer")
    if (!button || !button.closest(".sidebar.left")) return
    event.stopImmediatePropagation()
    const view = button.dataset.knowledgeView || "directory"
    const current = document.querySelector(".knowledge-sidebar-switch")?.dataset.openView
    setView(mobile.matches && current === view ? "" : view)
    try { localStorage.setItem(storageKey, view) } catch {}
  }, true)
  const reset = () => {
    setView(mobile.matches ? "" : savedView())
    const title = document.querySelector(".article-title")
    const firstHeading = document.querySelector(".center article > h1:first-child")
    if (title && firstHeading) {
      const normalize = (text) => text.trim().replace(/\\s+/g, " ")
      firstHeading.dataset.knowledgeRepeatedTitle = String(normalize(title.textContent) === normalize(firstHeading.textContent))
    }
  }
  document.addEventListener("nav", reset)
  mobile.addEventListener("change", reset)
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
