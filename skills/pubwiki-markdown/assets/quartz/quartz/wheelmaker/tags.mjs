import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

function addTag(root, tag) {
  const segments = tag.split("/").filter(Boolean)
  let current = root
  let prefix = ""
  for (const segment of segments) {
    prefix = prefix ? `${prefix}/${segment}` : segment
    let node = current.get(segment)
    if (!node) {
      node = { name: segment, path: prefix, count: 0, children: new Map() }
      current.set(segment, node)
    }
    node.count += 1
    current = node.children
  }
}

function sortedNodes(nodes) {
  return [...nodes.values()].sort((left, right) =>
    left.path.localeCompare(right.path, undefined, { sensitivity: "base" }),
  )
}

function renderNodes(nodes, slug) {
  return h(
    "ul",
    { class: "knowledge-tag-tree" },
    sortedNodes(nodes).map((node) =>
      h("li", { class: "knowledge-tag-item", key: node.path }, [
        h("a", {
          class: "knowledge-tag-link internal",
          href: resolveRelative(slug, `tags/${node.path}`),
        }, [
          h("span", null, node.name),
          h("span", { class: "knowledge-tag-count" }, String(node.count)),
        ]),
        node.children.size > 0 ? renderNodes(node.children, slug) : null,
      ]),
    ),
  )
}

export const KnowledgeTagSidebar = () => {
  const Component = ({ allFiles = [], fileData = {} } = {}) => {
    const tags = new Map()
    for (const file of allFiles) {
      for (const tag of file.frontmatter?.tags || []) {
        if (typeof tag === "string" && tag.trim()) {
          addTag(tags, tag.trim().replace(/^#+/u, ""))
        }
      }
    }
    const slug = fileData.slug || "index"
    return h("div", { class: "knowledge-tags-sidebar", "aria-label": "标签" }, [
      h("h2", null, "标签"),
      tags.size > 0 ? renderNodes(tags, slug) : h("p", null, "暂无标签"),
    ])
  }

  Component.css = `
.knowledge-tags-sidebar > h2 {
  margin: 0.75rem 0 0.45rem;
  font-size: 0.9rem;
}

.knowledge-tag-tree,
.knowledge-tag-tree ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.knowledge-tag-tree ul {
  margin-left: 0.8rem;
}

.knowledge-tag-item {
  margin: 0.15rem 0;
}

.knowledge-tag-link.internal {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.35rem;
  border-radius: 0.25rem;
  color: var(--darkgray);
  background: transparent;
  font-size: 0.8rem;
  text-decoration: none;
}

.knowledge-tag-link > span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.knowledge-tag-link.internal:hover {
  background: var(--highlight);
  color: var(--dark);
}

.knowledge-tag-count {
  color: var(--darkgray);
  font-size: 0.7rem;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 800px) {
  .knowledge-tag-link.internal {
    box-sizing: border-box;
    min-height: 2.75rem;
    align-items: center;
    padding: 0.5rem;
    font-size: 0.9375rem;
    background: transparent;
  }

  .knowledge-tag-link.internal:hover,
  .knowledge-tag-link.internal:focus-visible {
    background: var(--highlight);
  }
}
`

  return Component
}
