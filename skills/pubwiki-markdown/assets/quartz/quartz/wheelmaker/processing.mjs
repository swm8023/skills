// Adapted from Quartz Community's Description and TableOfContents transformers.
// See THIRD_PARTY_LICENSES.txt for the original MIT license.
import { toString as htmlText } from "hast-util-to-string"
import { toString as markdownText } from "mdast-util-to-string"
import { visit } from "unist-util-visit"
import Slugger from "github-slugger"
import { escapeHTML } from "@quartz-community/utils"

const urlPattern = /(https?:\/\/)?(?<domain>([\da-z.-]+)\.([a-z.]{2,6})(:\d+)?)(?<path>[/\w.-]*)(\?[/\w.=&;-]*)?/g

// Quartz loads one transformer factory per package. Keep Markdown TOC extraction
// and HTML text extraction together, after link processing and before LaTeX.
export const WheelMakerContent = () => ({
  name: "WheelMakerContent",
  markdownPlugins() {
    return [() => (tree, file) => {
      if (!(file.data.frontmatter?.enableToc ?? true)) return
      const slugger = new Slugger()
      const entries = []
      let highestDepth = 3
      visit(tree, "heading", node => {
        if (node.depth > 3) return
        const text = markdownText(node)
        highestDepth = Math.min(highestDepth, node.depth)
        entries.push({ depth: node.depth, text, slug: slugger.slug(text) })
      })
      if (entries.length > 1) {
        file.data.toc = entries.map(entry => ({ ...entry, depth: entry.depth - highestDepth }))
        file.data.collapseToc = false
      }
    }]
  },
  htmlPlugins() {
    return [() => (tree, file) => {
      const text = escapeHTML(htmlText(tree)).replace(urlPattern, "$<domain>$<path>")
      const explicit = file.data.frontmatter?.description
      file.data.text = text
      if (typeof explicit === "string" && explicit) {
        file.data.description = explicit.replace(urlPattern, "$<domain>$<path>")
        return
      }
      const sentences = text.replace(/\s+/g, " ").split(/\.\s/)
      let description = ""
      for (const sentence of sentences) {
        if (!sentence) break
        const next = sentence.endsWith(".") ? sentence : sentence + "."
        if (description && description.length + next.length + 1 > 150) break
        description += (description ? " " : "") + next
      }
      file.data.description = description.length > 300 ? description.slice(0, 300) + "..." : description
    }]
  },
})

export const WheelMakerRemoveDrafts = () => ({
  name: "WheelMakerRemoveDrafts",
  shouldPublish(_ctx, [, file]) {
    const draft = file.data?.frontmatter?.draft
    return draft !== true && draft !== "true"
  },
})
