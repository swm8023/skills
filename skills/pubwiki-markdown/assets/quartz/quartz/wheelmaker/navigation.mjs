import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

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

function renderNodes(nodes, slug) {
  return h(
    "ul",
    { class: "knowledge-tag-tree" },
    sortedNodes(nodes).map((node) =>
      h("li", { class: "knowledge-tag-item", key: node.path }, [
        h("div", { class: "knowledge-nav-row knowledge-tag-row", "data-knowledge-tag": node.path }, [
          node.children.size ? h("button", {
            type: "button", class: "knowledge-tree-toggle", "data-knowledge-expand": "tag",
            "aria-expanded": "false", "aria-controls": `knowledge-tag-${encodeURIComponent(node.path)}`,
            "aria-label": `展开 ${node.name}`,
          }, h("svg", { viewBox: "0 0 24 24", width: 16, height: 16, fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" },
            h("path", { d: "m9 18 6-6-6-6" }))) : h("span", { class: "knowledge-tree-spacer", "aria-hidden": "true" }),
          h("a", {
            class: "knowledge-tag-link internal", title: node.path,
            href: resolveRelative(slug, `tags/${node.path}`),
          }, [
            h("span", { class: "knowledge-nav-label" }, node.name),
            h("span", { class: "knowledge-tag-count", "aria-label": `${node.pages.size} 篇文章` }, String(node.pages.size)),
          ]),
        ]),
        node.children.size ? h("div", { class: "knowledge-tag-children", id: `knowledge-tag-${encodeURIComponent(node.path)}`, hidden: true }, renderNodes(node.children, slug)) : null,
      ]),
    ),
  )
}

export const KnowledgeTagSidebar = () => {
  const Component = ({ allFiles = [], fileData = {} } = {}) => {
    const tags = buildTagTree(allFiles)
    const slug = fileData.slug || "index"
    return h("div", { class: "knowledge-tags-sidebar", "aria-label": "标签" }, [
      h("nav", { "aria-label": "标签导航" }, tags.size > 0 ? renderNodes(tags, slug) : h("p", { class: "knowledge-nav-empty" }, "暂无标签")),
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
.explorer .folder-container div > a {
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
.explorer .folder-container > div {
  flex: 1;
  min-width: 0;
}
.knowledge-nav-label,
.explorer .folder-title {
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
.explorer .folder-container div > a[aria-current] {
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
  .explorer .folder-container div > a,
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
