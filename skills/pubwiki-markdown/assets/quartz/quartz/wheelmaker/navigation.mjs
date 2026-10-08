import { h } from "preact"

export function isNote(page) {
  const slug = page?.slug || ""
  return !!slug && !["index", "tags", "404"].includes(slug)
    && !slug.startsWith("tags/") && !slug.endsWith("/") && !slug.endsWith("/index")
    && page.frontmatter?.draft !== true
}

export function normalizedTags(file) {
  return [...new Set((file.frontmatter?.tags || [])
    .filter(tag => typeof tag === "string")
    .map(tag => tag.trim().replace(/^#+/u, "").split("/").filter(Boolean).join("/"))
    .filter(Boolean))]
}

function addTag(root, tag, article) {
  const segments = tag.split("/").filter(Boolean)
  let current = root
  let prefix = ""
  for (const segment of segments) {
    prefix = prefix ? `${prefix}/${segment}` : segment
    let node = current.get(segment)
    if (!node) {
      node = { name: segment, path: prefix, pages: new Set(), children: new Map() }
      current.set(segment, node)
    }
    node.pages.add(article)
    current = node.children
  }
}

export function sortedNodes(nodes) {
  return [...nodes.values()].sort((left, right) =>
    left.path.localeCompare(right.path, undefined, { sensitivity: "base" }),
  )
}

export function buildTagTree(allFiles = []) {
  const tags = new Map()
  for (const file of allFiles.filter(isNote)) {
    for (const tag of normalizedTags(file)) addTag(tags, tag, file.slug)
  }
  return tags
}

export function directoryCounts(allFiles = []) {
  const counts = Object.create(null)
  const seen = new Set()
  for (const file of allFiles.filter(isNote)) {
    if (seen.has(file.slug)) continue
    seen.add(file.slug)
    const segments = file.slug.split("/")
    for (let index = 1; index < segments.length; index++) {
      const folder = segments.slice(0, index).join("/")
      counts[folder] = (counts[folder] || 0) + 1
    }
  }
  return counts
}

export function pagesForTag(allFiles, tag) {
  return allFiles.filter(file => isNote(file) && normalizedTags(file).some(value => value === tag || value.startsWith(`${tag}/`)))
}

export const KnowledgeTagSidebar = () => {
  const Component = ({ allFiles = [], fileData = {} } = {}) => {
    const tags = buildTagTree(allFiles)
    const records = []
    const collect = nodes => { for (const node of sortedNodes(nodes)) { records.push([node.path, node.pages.size]); collect(node.children) } }
    collect(tags)
    return h("div", { class: "knowledge-tags-sidebar", "aria-label": "标签" }, [
      h("nav", { "aria-label": "标签导航" }),
      h("script", { type: "application/json", "data-knowledge-tags": "true", dangerouslySetInnerHTML: {
        __html: JSON.stringify(records).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"),
      } }),
    ])
  }

  Component.css = `
.knowledge-tag-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}


.knowledge-tag-children {
  margin-left: 0.875rem;
  padding-left: 0.875rem;
  border-left: 1px solid var(--lightgray);
}
.knowledge-tag-item { margin: 0; }
.knowledge-tag-children[hidden] { display: none; }
.knowledge-nav-row,
.explorer .folder-container {
  display: flex;
  align-items: center;
  min-height: 2.25rem;
  border-radius: 0.375rem;
  margin: 0.125rem 0;
  min-width: 0;
}
.knowledge-tag-link.internal,
.explorer .folder-container > a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
  min-height: 2.25rem;
  box-sizing: border-box;
  padding: 0.25rem 0.5rem 0.25rem 0;
  color: var(--darkgray);
  background: transparent;
  font-family: var(--knowledge-ui-font, var(--bodyFont)), system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  text-decoration: none;
  flex: 1;
}
.knowledge-nav-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.knowledge-nav-row:has(a[aria-current]),
.explorer .folder-container:has(a[aria-current]) {
  background: var(--highlight);
}
.knowledge-tag-link.internal[aria-current],
.explorer .folder-container > a[aria-current] {
  color: var(--dark);
  font-weight: 600;
}
.knowledge-nav-row a:focus-visible,
.explorer .folder-container a:focus-visible,
.knowledge-tree-toggle:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: -2px;
  border-radius: 0.25rem;
}
.knowledge-tree-toggle,
.knowledge-tree-spacer {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 1.75rem;
  width: 1.75rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--darkgray);
}
.knowledge-tree-toggle { cursor: pointer; touch-action: manipulation; }
.knowledge-tree-toggle svg,
.explorer .knowledge-tree-toggle .folder-icon {
  box-sizing: border-box; width: 16px; height: 16px; padding: 0; margin: 0;
  flex-shrink: 0; color: currentColor; pointer-events: none;
  transform: rotate(0); transition: none;
}
.knowledge-tree-toggle[aria-expanded="true"] svg,
.explorer .knowledge-tree-toggle[aria-expanded="true"] .folder-icon { transform: rotate(90deg); }
@media (prefers-reduced-motion: no-preference) {
  .knowledge-tree-toggle[data-knowledge-motion="true"] svg { transition: transform 160ms var(--knowledge-ease-out); }
}
@media (hover: hover) and (pointer: fine) {
  .knowledge-nav-row:has(a:hover),
  .explorer .folder-container:has(a:hover) { background: var(--highlight); }
  .knowledge-tree-toggle:hover { color: var(--dark); background: var(--highlight); border-radius: 0.25rem; }
}
.explorer-content .folder-outer { transition: none; }
.explorer-content .folder-outer > ul {
  margin-left: 0.875rem;
  padding-left: 0.875rem;
}
.knowledge-tag-count {
  color: var(--darkgray);
  font-size: 0.75rem;
  font-weight: 400;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.knowledge-nav-empty { margin: 0.5rem; font-size: 0.875rem; color: var(--darkgray); }

@media (max-width: 800px) {
  .knowledge-tag-link.internal,
  .explorer .folder-container > a,
  .knowledge-nav-row,
  .explorer .folder-container {
    min-height: 2.75rem;
    font-size: 0.9375rem;
  }
  .knowledge-tree-toggle,
  .knowledge-tree-spacer {
    flex-basis: 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
  }
}
`

  return Component
}

function installLazyTags() {
  window.__wheelmakerEnsureTags = () => {
    const panel = document.querySelector(".knowledge-tags-sidebar")
    if (!panel || panel.dataset.knowledgeMaterialized) return
    const source = panel.querySelector("[data-knowledge-tags]")
    if (!source) return // Older emitted pages still contain their complete tree.
    const records = JSON.parse(source.textContent)
    const entries = new Map(records.map(([path, count]) => [path, { path, count, children: [] }]))
    const roots = []
    for (const node of entries.values()) {
      const parent = entries.get(node.path.slice(0, node.path.lastIndexOf("/")))
      ;(node.path.includes("/") && parent ? parent.children : roots).push(node)
    }
    const create = (tag, className, text) => {
      const element = document.createElement(tag)
      if (className) element.className = className
      if (text !== undefined) element.textContent = text
      return element
    }
    const render = nodes => {
      const list = create("ul", "knowledge-tag-tree")
      for (const node of nodes) {
        const name = node.path.split("/").at(-1)
        const item = create("li", "knowledge-tag-item")
        const row = create("div", "knowledge-nav-row knowledge-tag-row")
        row.dataset.knowledgeTag = node.path
        const toggle = create(node.children.length ? "button" : "span", node.children.length ? "knowledge-tree-toggle" : "knowledge-tree-spacer")
        if (node.children.length) {
          toggle.type = "button"
          toggle.dataset.knowledgeExpand = "tag"
          toggle.setAttribute("aria-expanded", "false")
          toggle.setAttribute("aria-controls", "knowledge-tag-" + encodeURIComponent(node.path))
          toggle.setAttribute("aria-label", "展开 " + name)
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" })) svg.setAttribute(key, value)
          const path = document.createElementNS(svg.namespaceURI, "path")
          path.setAttribute("d", "m9 18 6-6-6-6")
          svg.append(path); toggle.append(svg)
        } else toggle.setAttribute("aria-hidden", "true")
        const link = create("a", "knowledge-tag-link internal")
        link.title = node.path
        link.href = (window.__wheelmakerWikiRoot || "/") + "tags/" + node.path.split("/").map(encodeURIComponent).join("/")
        link.dataset.noPopover = "true"
        const count = create("span", "knowledge-tag-count", String(node.count))
        count.setAttribute("aria-label", node.count + " 篇文章")
        link.append(create("span", "knowledge-nav-label", name), count)
        row.append(toggle, link); item.append(row)
        if (node.children.length) {
          const children = create("div", "knowledge-tag-children")
          children.id = "knowledge-tag-" + encodeURIComponent(node.path)
          children.hidden = true
          children.append(render(node.children)); item.append(children)
        }
        list.append(item)
      }
      return list
    }
    panel.querySelector("nav").append(roots.length ? render(roots) : create("p", "knowledge-nav-empty", "暂无标签"))
    panel.dataset.knowledgeMaterialized = "true"
    document.dispatchEvent(new Event("knowledge-tags-ready"))
  }
}
export const lazyTagsScript = `(${installLazyTags.toString()})()`
