import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"
import { buildTagTree, normalizedTags, pagesForTag, sortedNodes } from "./tags.mjs"

const DEFAULT_SITE_TITLE = "WheelMaker Knowledge"
const DEFAULT_SITE_DESCRIPTION = "Browse the WheelMaker knowledge base."
const DIRECTORY_DESCRIPTION = "浏览此目录下的全部文章。"

function siteSettings(cfg = {}) {
  const configuredTitle = typeof process?.env?.WHEELMAKER_WIKI_SITE_TITLE === "string"
    ? process.env.WHEELMAKER_WIKI_SITE_TITLE.trim()
    : ""
  const configuredDescription = typeof process?.env?.WHEELMAKER_WIKI_SITE_DESCRIPTION === "string"
    ? process.env.WHEELMAKER_WIKI_SITE_DESCRIPTION.trim()
    : ""
  const configuredPageTitle = typeof cfg.pageTitle === "string" ? cfg.pageTitle.trim() : ""

  return {
    title: configuredTitle || configuredPageTitle || DEFAULT_SITE_TITLE,
    description: configuredDescription || DEFAULT_SITE_DESCRIPTION,
  }
}

function titleFor(page) {
  return page.frontmatter?.title || page.slug || "Untitled"
}

function sectionFor(page) {
  const segments = page.slug.split("/").filter(Boolean)
  return segments.length > 1 ? segments.slice(0, -1).join(" / ") : "Root"
}

function sortPages(left, right) {
  const titleOrder = titleFor(left).localeCompare(titleFor(right), undefined, {
    sensitivity: "base",
  })
  return titleOrder || left.slug.localeCompare(right.slug, undefined, { sensitivity: "base" })
}

export function isKnowledgePage(page) {
  const slug = page?.slug || ""
  return Boolean(
    slug
      && slug !== "index"
      && slug !== "404"
      && slug !== "tags"
      && page.frontmatter?.draft !== true
      && !slug.startsWith("tags/")
      && !slug.endsWith("/")
      && !slug.endsWith("/index"),
  )
}

export function isFolderPage(fileData) {
  const slug = fileData?.slug || ""
  const title = fileData?.frontmatter?.title || ""
  return slug.endsWith("/index")
    && (title.startsWith("Folder:") || fileData?.wheelmakerDirectory === true)
}

export function folderPathFor(slug) {
  if (!slug || slug === "index") return ""
  return slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug
}

export function pagesForFolder(allFiles = [], folderSlug = "") {
  const normalizedFolder = folderSlug.replace(/^\/+|\/+$/g, "")
  const prefix = normalizedFolder ? `${normalizedFolder}/` : ""

  return allFiles
    .filter((page) => {
      const slug = page?.slug || ""
      return isKnowledgePage(page) && slug.startsWith(prefix)
    })
    .sort(sortPages)
}

function folderPathsFor(slug) {
  const segments = slug.split("/").filter(Boolean)
  return Array.from({ length: Math.max(segments.length - 1, 0) }, (_, index) =>
    segments.slice(0, index + 1).join("/"),
  )
}

function directoryPagesFor(content = []) {
  const folders = new Set()
  const foldersWithIndex = new Set()

  for (const [, file] of content) {
    const slug = file?.data?.slug || ""
    if (!slug) continue

    if (slug.endsWith("/index")) {
      foldersWithIndex.add(folderPathFor(slug))
    }

    for (const folder of folderPathsFor(slug)) {
      if (folder !== "tags" && !folder.startsWith("tags/")) {
        folders.add(folder)
      }
    }
  }

  return [...folders]
    .filter((folder) => !foldersWithIndex.has(folder))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }))
    .map((folder) => ({
      slug: `${folder}/index`,
      title: folder,
      data: { wheelmakerDirectory: true },
    }))
}

function tagPagesFor(content = []) {
  const files = content.map(([, file]) => file.data)
  const existing = new Set(files.map(file => file.slug))
  const tags = new Set(["index"])
  for (const file of files.filter(isKnowledgePage)) {
    for (const tag of normalizedTags(file)) {
      const parts = tag.split("/")
      parts.forEach((_, index) => tags.add(parts.slice(0, index + 1).join("/")))
    }
  }
  return [...tags].sort().filter(tag => !existing.has(`tags/${tag}`))
    .map(tag => ({ slug: `tags/${tag}`, title: tag === "index" ? "全部标签" : `标签：${tag}`, data: {} }))
}

function PageHeading({ eyebrow, title, description, count, mobileTitle }) {
  return h("header", { class: "knowledge-page-heading" }, [
    h("p", { class: "knowledge-page-eyebrow" }, eyebrow),
    h("h1", { class: "knowledge-page-title" }, title),
    mobileTitle ? h("h2", { class: "knowledge-mobile-list-title" }, mobileTitle) : null,
    h("p", { class: "knowledge-page-lede" }, description),
    h("div", { class: "knowledge-page-meta", "aria-label": "文章数量" }, [
      h("span", null, `共 ${count} 篇文章`),
    ]),
  ])
}

function KnowledgeCardList({
  pages,
  fileData,
  className,
  ariaLabel,
  emptyTitle,
  emptyDescription,
}) {
  if (pages.length === 0) {
    return h("div", { class: "knowledge-page-empty" }, [
      h("strong", null, emptyTitle),
      h("p", null, emptyDescription),
    ])
  }

  return h(
    "ul",
    { class: className, "aria-label": ariaLabel },
    pages.map((page) =>
      h("li", { class: "knowledge-page-card", key: page.slug }, [
        h(
          "a",
          {
            href: resolveRelative(fileData.slug || "index", page.slug),
            class: "knowledge-page-card-link internal internal-link",
          },
          [
            h("span", { class: "knowledge-page-card-section" }, sectionFor(page)),
            h("h2", null, titleFor(page)),
            page.description ? h("p", null, page.description) : null,
            h("span", { class: "knowledge-page-card-arrow", "aria-hidden": "true" },
              h("svg", { viewBox: "0 0 24 24", width: "1em", height: "1em", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", focusable: "false" },
                h("path", { d: "m9 18 6-6-6-6" }))),
          ],
        ),
      ]),
    ),
  )
}

function HomeContent({ allFiles = [], fileData = { slug: "index" }, cfg = {} } = {}) {
  const pages = allFiles.filter(isKnowledgePage).sort(sortPages)
  const site = siteSettings(cfg)

  return h("div", { class: "popover-hint knowledge-home" }, [
    PageHeading({
      eyebrow: "知识库",
      mobileTitle: "全部文章",
      title: fileData.title || site.title,
      description: fileData.description || site.description,
      count: pages.length,
    }),
    KnowledgeCardList({
      pages,
      fileData,
      className: "knowledge-home-grid",
      ariaLabel: "Knowledge entries",
      emptyTitle: "暂无知识条目",
      emptyDescription: "发布一篇 Markdown 笔记后，它会出现在这里。",
    }),
  ])
}

function DirectoryContent({ allFiles = [], fileData = { slug: "" } } = {}) {
  const folderSlug = folderPathFor(fileData.slug)
  const pages = pagesForFolder(allFiles, folderSlug)

  return h("div", { class: "popover-hint knowledge-directory" }, [
    PageHeading({
      eyebrow: "目录",
      title: folderSlug || "Root",
      description: DIRECTORY_DESCRIPTION,
      count: pages.length,
    }),
    KnowledgeCardList({
      pages,
      fileData,
      className: "knowledge-directory-grid",
      ariaLabel: `${folderSlug || "Root"} articles`,
      emptyTitle: "此目录暂无文章",
      emptyDescription: "发布到此目录的 Markdown 笔记会出现在这里。",
    }),
  ])
}

function TagContent({ allFiles = [], fileData = { slug: "tags/index" } } = {}) {
  const tag = fileData.slug.replace(/^tags\/?/, "").replace(/\/index$/, "")
  if (!tag || tag === "index") {
    const nodes = sortedNodes(buildTagTree(allFiles))
    return h("div", { class: "popover-hint knowledge-tag-page" }, [
      PageHeading({ eyebrow: "标签", title: "全部标签", description: "按主题浏览知识库。", count: allFiles.filter(isKnowledgePage).length }),
      h("ul", { class: "knowledge-tag-index" }, nodes.map(node => h("li", { key: node.path },
        h("a", { class: "internal", href: resolveRelative(fileData.slug, `tags/${node.path}`) }, [
          h("span", null, node.name), h("span", { class: "knowledge-tag-count" }, `${node.pages.size} 篇文章`),
        ])))),
    ])
  }
  const pages = pagesForTag(allFiles, tag).sort(sortPages)
  return h("div", { class: "popover-hint knowledge-tag-page" }, [
    PageHeading({ eyebrow: "标签", title: tag, description: "包含此标签及其子标签的文章。", count: pages.length }),
    KnowledgeCardList({ pages, fileData, className: "knowledge-directory-grid", ariaLabel: `${tag} articles`,
      emptyTitle: "此标签暂无文章", emptyDescription: "选择左侧的其他标签继续浏览。" }),
  ])
}

function PageContent(props) {
  if (props.fileData?.slug === "tags" || props.fileData?.slug?.startsWith("tags/")) return h(TagContent, props)
  return props.fileData?.slug === "index" ? h(HomeContent, props) : h(DirectoryContent, props)
}

PageContent.css = `
.knowledge-mobile-list-title {
  display: none;
}

.knowledge-home,
.knowledge-directory,
.knowledge-tag-page {
  --knowledge-accent: var(--secondary);
  padding-bottom: 3rem;
}

.knowledge-page-heading {
  max-width: 52rem;
  margin-bottom: 2.2rem;
}

.knowledge-page-eyebrow {
  margin: 0 0 0.65rem;
  color: var(--knowledge-accent);
  font-family: var(--codeFont);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.knowledge-page-title {
  max-width: 100%;
  margin: 0;
  color: var(--dark);
  font-size: clamp(2rem, 5vw, 3.35rem);
  line-height: 1.08;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.knowledge-page-lede {
  max-width: 48rem;
  margin: 0.7rem 0 1rem;
  color: var(--darkgray);
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.7;
}

.knowledge-page-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: var(--darkgray);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.knowledge-page-meta span {
  padding: 0.25rem 0;
}

.knowledge-home-grid,
.knowledge-directory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 1rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.knowledge-page-card {
  min-width: 0;
  margin: 0;
}

.knowledge-page-card-link.internal {
  display: flex;
  flex-direction: column;
  min-height: 11rem;
  box-sizing: border-box;
  padding: 1.15rem 1.2rem 1rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.7rem;
  background: var(--light);
  color: var(--dark);
  font-weight: 400;
}

.knowledge-page-card-link.internal:hover,
.knowledge-page-card-link.internal:focus-visible {
  border-color: var(--knowledge-accent);
  background: var(--highlight);
  color: var(--dark);
}

.knowledge-page-card-link.internal:focus-visible {
  outline: 2px solid var(--knowledge-accent);
  outline-offset: 3px;
}

.knowledge-page-card-section {
  color: var(--knowledge-accent);
  font-family: var(--codeFont), monospace;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.knowledge-page-card h2 {
  margin: 0.65rem 0 0;
  color: var(--dark);
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  line-height: 1.25;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.knowledge-page-card p {
  margin: 0.65rem 0 0;
  color: var(--darkgray);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.knowledge-page-card-arrow {
  align-self: flex-end;
  margin-top: auto;
  padding-top: 1rem;
  color: var(--knowledge-accent);
  font-size: 1.25rem;
  line-height: 1;
}

.knowledge-page-empty {
  border: 1px dashed var(--lightgray);
  border-radius: 0.7rem;
  padding: 1.25rem;
}

.knowledge-page-empty strong {
  color: var(--dark);
}

.knowledge-page-empty p {
  margin: 0.4rem 0 0;
}

.knowledge-tag-index { list-style: none; margin: 0; padding: 0; }
.knowledge-tag-index > li { margin: 0; border-bottom: 1px solid var(--lightgray); }
.knowledge-tag-index a.internal { display: flex; justify-content: space-between; gap: 1rem; padding: 0.875rem 0.5rem; background: transparent; }

@media (min-width: 801px) {
  .knowledge-page-heading { margin-bottom: 1.5rem; max-width: none; }
  .knowledge-page-eyebrow { margin-bottom: 0.5rem; }
  .knowledge-page-title { font-size: clamp(1.75rem, 2.6vw, 2.25rem); line-height: 1.2; letter-spacing: -0.025em; text-wrap: pretty; }
  .knowledge-page-lede { margin: 0.625rem 0 0.75rem; font-size: 1rem; line-height: 1.6; }
  .knowledge-home-grid,
  .knowledge-directory-grid { gap: 0.875rem; align-items: stretch; }
  .knowledge-page-card-link.internal { height: 100%; min-height: 10rem; padding: 1rem; border-radius: 0.5rem; }
  .knowledge-page-card h2 { margin-top: 0.5rem; font-size: 1.125rem; line-height: 1.4; text-wrap: pretty; }
  .knowledge-page-card p { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; font-size: 0.9375rem; line-height: 1.6; }
  .knowledge-page-card-section { font-size: 0.7rem; letter-spacing: 0.02em; text-transform: none; }
  .knowledge-page-card-arrow { padding-top: 0.75rem; font-size: 1rem; }
}

@media (max-width: 800px) {
  .knowledge-home,
  .knowledge-directory {
    padding-bottom: 2rem;
  }

  .knowledge-page-heading {
    margin-bottom: 0.5rem;
  }

  .knowledge-home .knowledge-page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .knowledge-mobile-list-title {
    display: block;
    margin: 0;
    font-size: 1rem;
  }

  .knowledge-home .knowledge-page-title {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .knowledge-page-eyebrow,
  .knowledge-page-lede {
    display: none;
  }

  .knowledge-page-title {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .knowledge-home-grid,
  .knowledge-directory-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .knowledge-page-card-link.internal {
    min-height: 0;
    position: relative;
    padding: 1rem 0;
    border: 0;
    border-bottom: 1px solid var(--lightgray);
    border-radius: 0;
    background: transparent;
  }

  .knowledge-page-card-section {
    padding-right: 1.5rem;
    font-size: 0.7rem;
    font-family: var(--bodyFont);
    text-transform: none;
    letter-spacing: normal;
  }

  .knowledge-page-card h2 {
    margin-top: 0.5rem;
    font-size: 1.125rem;
    line-height: 1.4;
  }

  .knowledge-page-card p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-top: 0.5rem;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .knowledge-page-card-arrow {
    position: absolute;
    top: 1rem;
    right: 0;
    padding: 0;
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .knowledge-page-card-link.internal {
    transition: none;
  }
}
`

export const WheelMakerHomePage = () => ({
  name: "WheelMakerHomePage",
  priority: 1000,
  match: ({ slug, fileData }) => slug === "index" || isFolderPage(fileData) || slug === "tags" || slug.startsWith("tags/"),
  generate({ cfg, content, ctx }) {
    if (ctx?.cfg?.plugins?.pageTypes?.some(plugin => plugin.name === "TagPage")) {
      throw new Error("WheelMaker now owns tag result pages. Run ensure-quartz.mjs --refresh --link-skill to update the pinned configuration before publishing.")
    }
    const site = siteSettings(cfg)
    cfg.pageTitle = site.title
    return [
      {
        slug: "index",
        title: site.title,
        data: { description: site.description },
      },
      ...directoryPagesFor(content),
      ...tagPagesFor(content),
    ]
  },
  layout: "home",
  body: () => PageContent,
})

export default WheelMakerHomePage
