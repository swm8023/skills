import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

export function buildDirectoryTree(allFiles = []) {
  const root = new Map()
  for (const file of allFiles) {
    const draft = file.frontmatter?.draft
    if (draft === true || draft === "true") continue
    const segments = (file.slug || "").split("/").filter(Boolean)
    if (segments[0] === "tags") continue
    let current = root
    for (let index = 0; index < segments.length - 1; index++) {
      const name = segments[index]
      if (!current.has(name)) current.set(name, { name, path: segments.slice(0, index + 1).join("/"), children: new Map() })
      current = current.get(name).children
    }
  }
  const sorted = nodes => [...nodes.values()]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
    .map(node => ({ ...node, children: sorted(node.children) }))
  return sorted(root)
}

function renderFolders(nodes, slug) {
  return nodes.map(node => h("li", { key: node.path }, [
    h("div", { class: "folder-container", "data-folderpath": node.path }, [
      h("svg", { class: "folder-icon", width: 16, height: 16, "aria-hidden": "true" }),
      h("a", { class: "folder-title internal", href: resolveRelative(slug, `${node.path}/index`) },
        h("span", { class: "knowledge-nav-label" }, node.name)),
    ]),
    node.children.length ? h("div", { class: "folder-outer" }, h("ul", null, renderFolders(node.children, slug))) : null,
  ]))
}

// Keep the directory DOM contract consumed by the shared sidebar's keyboard,
// selection, saved-state and mobile-dialog handlers. No client-side index fetch.
export const WheelMakerExplorer = () => {
  const Component = ({ allFiles = [], fileData = {} } = {}) =>
    h("div", { class: "explorer", "aria-label": "目录" },
      h("div", { class: "explorer-content", role: "group", "aria-label": "目录" },
        h("ul", { class: "explorer-ul" }, renderFolders(buildDirectoryTree(allFiles), fileData.slug || "index"))))
  Component.css = `
.explorer { display: flex; flex-direction: column; min-height: 0; overflow: hidden; flex: 0 1 auto; }
.explorer-content { overflow-y: auto; margin-top: 0.5rem; }
.explorer-content ul { list-style: none; margin: 0; padding: 0; }
.explorer-ul { overscroll-behavior: contain; }
.folder-container { display: flex; align-items: center; }
.folder-container > a { color: var(--secondary); font-size: 0.95rem; line-height: 1.5rem; }
.folder-outer { display: none; }
.folder-outer.open { display: block; }
.folder-outer > ul { margin-left: 6px; padding-left: 0.8rem; border-left: 1px solid var(--lightgray); }
`
  return Component
}
