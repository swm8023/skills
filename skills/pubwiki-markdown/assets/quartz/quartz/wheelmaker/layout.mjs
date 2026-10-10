import { Fragment, h } from "preact"
import { MobileChrome, mobileCSS, mobileScript } from "./mobile.mjs"
import { KnowledgeTagSidebar, directoryCounts, lazyTagsScript } from "./navigation.mjs"
import { WheelMakerSearch } from "./search.mjs"
import { WheelMakerExplorer } from "./explorer.mjs"

export { KnowledgeTagSidebar } from "./navigation.mjs"

export const KnowledgeSidebarSwitch = () => {
  const Component = (props = {}) => h(Fragment, null, [h(MobileChrome, props),
    h("div", { class: "knowledge-sidebar-switch", hidden: true,
      "data-knowledge-directory-counts": JSON.stringify(directoryCounts(props.allFiles)) }),
  ])

  Component.css = `
.page:has(.knowledge-sidebar-switch) {
  --knowledge-ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
  --knowledge-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --knowledge-sidebar-surface: var(--light);
  --knowledge-sidebar-divider: color-mix(in srgb, var(--lightgray) 55%, var(--light));
  --knowledge-desktop-page-gutter: 1.5rem;
}
.sidebar.left :is(.page-title, .knowledge-mobile-dialog-header, .knowledge-mobile-home, .knowledge-mobile-settings) {
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
:root[data-wheelmaker-theme-source="host"] .sidebar.left .darkmode,
:root[data-wheelmaker-theme-source="host"] .knowledge-mobile-theme-control { display: none; }
.page > #quartz-body .sidebar.left {
  min-width: 0;
}

.page > #quartz-body .sidebar.left .page-title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.page > #quartz-body .sidebar.left:has(.knowledge-sidebar-switch) > .page-title {
  display: none;
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
  .page:has(.knowledge-sidebar-switch) {
    --knowledge-desktop-top-inset: 1rem;
    max-width: 100rem;
    padding-inline: var(--knowledge-desktop-page-gutter);
    box-sizing: border-box;
  }
  .page:has(.knowledge-sidebar-switch) > #quartz-body {
    grid-template-columns: clamp(17rem, 22vw, 20rem) minmax(0, 1fr);
    grid-template-areas: "grid-sidebar-left grid-header" "grid-sidebar-left grid-center" "grid-sidebar-left grid-footer";
    column-gap: 2rem;
    padding: 0;
  }
  .page > #quartz-body .sidebar.left:has(.knowledge-sidebar-switch) {
    padding: var(--knowledge-desktop-top-inset) 1rem 1.25rem 0;
    gap: 0.875rem;
    height: 100dvh;
    background: var(--knowledge-sidebar-surface);
    border-right: 1px solid var(--knowledge-sidebar-divider);
  }
  .page:has(.knowledge-sidebar-switch) > #quartz-body .page-header { margin-top: var(--knowledge-desktop-top-inset); }
  .page > #quartz-body .center { min-width: 0; width: 100%; }
  .page > #quartz-body .center:not(:has(.knowledge-home, .knowledge-directory, .knowledge-tag-page)) { max-width: 52rem; margin-left: 0; }
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


`

  Component.beforeDOMLoaded = `
(() => {
  if (window.__wheelmakerWikiFetchPatched) return
  window.__wheelmakerWikiFetchPatched = true

  if (window.parent !== window) {
    document.documentElement.setAttribute("data-wheelmaker-theme-source", "host")
    window.addEventListener("message", (event) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return
      const message = event.data
      const mode = message?.type === "wheelmaker-theme" ? message.mode : null
      if (mode !== "dark" && mode !== "light") return
      document.documentElement.setAttribute("saved-theme", mode)
    })
  }

  const marker = "/wiki/"
  const pathname = window.location.pathname
  const markerIndex = pathname.lastIndexOf(marker)
  const wikiRoot = markerIndex >= 0 ? pathname.slice(0, markerIndex + marker.length) : "/"
  const searchIndexURL = new URL("static/searchIndex.json", window.location.origin + wikiRoot).href
  const nativeFetch = window.fetch.bind(window)
  window.__wheelmakerWikiRoot = wikiRoot

  const rewriteWikiURL = (url) => {
    if (url.origin !== window.location.origin || url.pathname.startsWith(wikiRoot)) return url
    if (url.pathname === "/static/searchIndex.json") return new URL(searchIndexURL)
    const path = url.pathname.slice(1)
    const lastSegment = path.split("/").pop() || ""
    if (!url.pathname.startsWith("/static/") && lastSegment.includes(".")) return url
    return new URL(path + url.search + url.hash, window.location.origin + wikiRoot)
  }

  const rewriteRequest = (input) => {
    const rawURL = input instanceof URL ? input.href : typeof input === "string" ? input : input?.url
    if (!rawURL) return input
    const requestedURL = new URL(rawURL, window.location.href)
    const mountedURL = rewriteWikiURL(requestedURL)
    if (mountedURL.href === requestedURL.href) {
      return input
    }
    return input instanceof Request ? new Request(mountedURL.href, input) : mountedURL.href
  }

  const rewriteNavigation = (root) => {
    root.querySelectorAll?.(".wm-heading-icon use").forEach(use => {
      const id = use.getAttribute("href")?.match(/#(wm-icon-[a-f0-9]+)$/)?.[1]
      if (id) use.setAttribute("href", "#" + id)
    })
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
  let buildRevision = null
  document.addEventListener("nav", () => {
    const revision = document.querySelector('meta[name="wheelmaker-build"]')?.content
    if (buildRevision && revision && revision !== buildRevision) { location.reload(); return }
    buildRevision = revision || buildRevision
    if (document.querySelector(".katex") && !window.__wheelmakerCopyTexLoaded) {
      const source = document.querySelector('script[src*="copy-tex.min."]')?.src
      if (source && !document.querySelector('script[data-wm-copy-tex]')) {
        const script = document.createElement("script")
        script.src = source; script.dataset.wmCopyTex = "true"; document.head.append(script)
      }
    }
  })
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
  let directoryObserver = null
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
    let savedFolders = []
    try {
      const stored = JSON.parse(localStorage.getItem("fileTree") || "[]")
      if (Array.isArray(stored)) savedFolders = stored
    } catch {}
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
      const activeAncestor = current === target || current.startsWith(target + "/")
      if (row.dataset.knowledgeEnhanced) {
        const button = row.querySelector(".knowledge-tree-toggle")
        if (button && activeAncestor) updateExpanded(button, true)
        return
      }
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
      const savedOpen = savedFolders.some(item => item?.path === row.dataset.folderpath && item.collapsed === false)
      updateExpanded(button, panel.classList.contains("open") || activeAncestor || savedOpen)
    })
  }

  const restore = () => {
    directoryObserver?.disconnect()
    directoryObserver = null
  }
  const setupPanels = () => {
    for (const [selector, pane] of [[".sidebar.left .explorer", "directory"], [".knowledge-tags-sidebar", "tags"]]) {
      const panel = document.querySelector(selector)
      if (!panel) continue
      panel.setAttribute("role", "group")
      panel.setAttribute("aria-labelledby", "knowledge-pane-" + pane)
      panel.dataset.knowledgeVisible = "true"
      panel.removeAttribute("aria-hidden")
      panel.classList.remove("collapsed")
      panel.removeAttribute("aria-expanded")
    }
    const directoryContent = document.querySelector(".explorer-content")
    directoryContent?.setAttribute("role", "navigation")
    directoryContent?.setAttribute("aria-label", "目录导航")
  }
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
    setupPanels()
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
  }
  document.addEventListener("prenav", restore)
  document.addEventListener("nav", reset)
  document.addEventListener("knowledge-tags-ready", enhanceTags)
  new MutationObserver(updateTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["saved-theme"] })
  reset()
})()
`

  Component.css += mobileCSS
  Component.afterDOMLoaded = [lazyTagsScript, mobileScript, Component.afterDOMLoaded].join(";\n")
  return Component
}

export const WheelMakerSidebar = () => {
  const SidebarSwitch = KnowledgeSidebarSwitch()
  const TagSidebar = KnowledgeTagSidebar()
  const Explorer = WheelMakerExplorer()
  const Component = (props) =>
    h(Fragment, null, [
      h("div", { class: "flex-component", style: "flex-direction: row; gap: 0.5rem;" }, h(WheelMakerSearch, props)),
      h(SidebarSwitch, props),
      h(TagSidebar, props),
      h(Explorer, props),
    ])

  Component.css = [WheelMakerSearch.css, Explorer.css, SidebarSwitch.css, TagSidebar.css].filter(Boolean).join("\n")
  Component.beforeDOMLoaded = [SidebarSwitch.beforeDOMLoaded].filter(Boolean).join("\n")
  Component.afterDOMLoaded = [WheelMakerSearch.afterDOMLoaded, SidebarSwitch.afterDOMLoaded].filter(Boolean).join(";\n")

  return Component
}
