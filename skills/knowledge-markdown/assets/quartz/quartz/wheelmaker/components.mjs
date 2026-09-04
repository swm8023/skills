import { Fragment, h } from "preact"
import { KnowledgeTagSidebar } from "./tags.mjs"

export { KnowledgeTagSidebar } from "./tags.mjs"

export const KnowledgeSidebarSwitch = () => {
  const Component = () =>
    h("div", { class: "knowledge-sidebar-switch", role: "tablist", "aria-label": "侧栏分类" }, [
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button active",
          "data-knowledge-view": "directory",
          role: "tab",
          "aria-selected": "true",
        },
        "目录",
      ),
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button",
          "data-knowledge-view": "tags",
          role: "tab",
          "aria-selected": "false",
        },
        "Tags",
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

.knowledge-sidebar-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  margin: 0.75rem 0;
  padding: 0.2rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.35rem;
}

.knowledge-sidebar-button {
  border: 0;
  border-radius: 0.25rem;
  padding: 0.35rem 0.45rem;
  background: transparent;
  color: var(--darkgray);
  cursor: pointer;
  font-size: 0.8rem;
}

.knowledge-sidebar-button.active,
.knowledge-sidebar-button:hover {
  background: var(--highlight);
  color: var(--dark);
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
  .page > #quartz-body .sidebar.left:has(> .knowledge-sidebar-switch):has(> .explorer) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "title"
      "toolbar"
      "switch"
      "navigation";
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0 0;
  }

  .page > #quartz-body .sidebar.left > .page-title {
    grid-area: title;
    margin: 0;
    font-size: clamp(1.55rem, 7vw, 2.2rem);
    line-height: 1.08;
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
  const root = document.querySelector(".knowledge-sidebar-switch")
  if (!root) return
  const buttons = [...root.querySelectorAll("[data-knowledge-view]")]
  const directory = document.querySelector(".explorer")
  const tags = document.querySelector(".knowledge-tags-sidebar")
  if (!directory || !tags) return
  const storageKey = "wheelmaker-knowledge-sidebar-view"
  const mobileExplorer = directory.querySelector(".mobile-explorer")
  if (mobileExplorer && mobileExplorer.dataset.wheelmakerMobileExplorerBound !== "true") {
    mobileExplorer.dataset.wheelmakerMobileExplorerBound = "true"
    directory.classList.add("collapsed")
    directory.setAttribute("aria-expanded", "false")
    mobileExplorer.setAttribute("aria-expanded", "false")
    mobileExplorer.addEventListener("click", (event) => {
      event.stopImmediatePropagation()
      const collapsed = directory.classList.toggle("collapsed")
      directory.setAttribute("aria-expanded", String(!collapsed))
      mobileExplorer.setAttribute("aria-expanded", String(!collapsed))
      document.documentElement.classList.toggle("mobile-no-scroll", !collapsed)
    }, true)
  }
  const setView = (view) => {
    const useTags = view === "tags"
    directory.dataset.knowledgeVisible = String(!useTags)
    tags.dataset.knowledgeVisible = String(useTags)
    directory.setAttribute("aria-hidden", String(useTags))
    tags.setAttribute("aria-hidden", String(!useTags))
    buttons.forEach((button) => {
      const active = button.dataset.knowledgeView === (useTags ? "tags" : "directory")
      button.classList.toggle("active", active)
      button.setAttribute("aria-selected", String(active))
    })
    try { localStorage.setItem(storageKey, useTags ? "tags" : "directory") } catch {}
  }
  buttons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.knowledgeView)))
  let initial = "directory"
  try { initial = localStorage.getItem(storageKey) === "tags" ? "tags" : "directory" } catch {}
  setView(initial)
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
