import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type TagNode = {
  name: string
  path: string
  count: number
  children: Map<string, TagNode>
}

function addTag(root: Map<string, TagNode>, tag: string) {
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

function sortedNodes(nodes: Map<string, TagNode>) {
  return [...nodes.values()].sort((left, right) => left.path.localeCompare(right.path, undefined, { sensitivity: "base" }))
}

function renderNodes(nodes: Map<string, TagNode>, slug: FullSlug) {
  return (
    <ul class="knowledge-tag-tree">
      {sortedNodes(nodes).map((node) => (
        <li class="knowledge-tag-item" key={node.path}>
          <a class="knowledge-tag-link internal" href={resolveRelative(slug, `tags/${node.path}` as FullSlug)}>
            <span>{node.name}</span>
            <span class="knowledge-tag-count">{node.count}</span>
          </a>
          {node.children.size > 0 ? renderNodes(node.children, slug) : null}
        </li>
      ))}
    </ul>
  )
}

const KnowledgeTagSidebar: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  const tags = new Map<string, TagNode>()
  for (const file of allFiles) {
    for (const tag of file.frontmatter?.tags || []) {
      if (typeof tag === "string" && tag.trim()) addTag(tags, tag.trim().replace(/^#+/u, ""))
    }
  }
  const slug = fileData.slug || ("index" as FullSlug)
  return (
    <div class="knowledge-tags-sidebar" aria-label="Tags">
      <h2>Tags</h2>
      {tags.size > 0 ? renderNodes(tags, slug) : <p>暂无 Tags</p>}
    </div>
  )
}

KnowledgeTagSidebar.css = `
.knowledge-tags-sidebar > h2 {
  margin: 0.75rem 0 0.45rem;
  font-size: 0.9rem;
}
`

export default (() => KnowledgeTagSidebar) satisfies QuartzComponentConstructor
