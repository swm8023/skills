import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

const HOME_DESCRIPTION = "Browse the WheelMaker knowledge base."
const DIRECTORY_DESCRIPTION = "Browse the articles in this directory."

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

function PageHeading({ eyebrow, title, description, count }) {
  return h("header", { class: "knowledge-page-heading" }, [
    h("p", { class: "knowledge-page-eyebrow" }, eyebrow),
    h("h1", { class: "knowledge-page-title" }, title),
    h("p", { class: "knowledge-page-lede" }, description),
    h("div", { class: "knowledge-page-meta", "aria-label": "Knowledge base status" }, [
      h("span", null, `${count} ${count === 1 ? "article" : "articles"}`),
      h("span", null, "Local workspace"),
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
            h("span", { class: "knowledge-page-card-arrow", "aria-hidden": "true" }, "↗"),
          ],
        ),
      ]),
    ),
  )
}

function HomeContent({ allFiles = [], fileData = { slug: "index" } } = {}) {
  const pages = allFiles.filter(isKnowledgePage).sort(sortPages)

  return h("div", { class: "popover-hint knowledge-home" }, [
    PageHeading({
      eyebrow: "Knowledge base",
      title: "WheelMaker Knowledge",
      description: HOME_DESCRIPTION,
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
      eyebrow: "Directory",
      title: folderSlug || "Root",
      description: DIRECTORY_DESCRIPTION,
      count: pages.length,
    }),
    KnowledgeCardList({
      pages,
      fileData,
      className: "knowledge-directory-grid",
      ariaLabel: `${folderSlug || "Root"} articles`,
      emptyTitle: "No articles in this directory",
      emptyDescription: "Add a Markdown note to this directory and it will appear here.",
    }),
  ])
}

function PageContent(props) {
  return props.fileData?.slug === "index" ? h(HomeContent, props) : h(DirectoryContent, props)
}

PageContent.css = `
.knowledge-home,
.knowledge-directory {
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
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.knowledge-page-meta span {
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  padding: 0.28rem 0.6rem;
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
  background: color-mix(in srgb, var(--light) 88%, var(--secondary));
  color: var(--dark);
  transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.knowledge-page-card-link.internal:hover,
.knowledge-page-card-link.internal:focus-visible {
  border-color: var(--knowledge-accent);
  background: var(--highlight);
  color: var(--dark);
  transform: translateY(-2px);
}

.knowledge-page-card-link.internal:focus-visible {
  outline: 2px solid var(--knowledge-accent);
  outline-offset: 3px;
}

.knowledge-page-card-section {
  color: var(--knowledge-accent);
  font-family: var(--codeFont);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.knowledge-page-card h2 {
  margin: 0.65rem 0 0;
  color: var(--dark);
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  line-height: 1.25;
}

.knowledge-page-card p {
  margin: 0.65rem 0 0;
  color: var(--darkgray);
  line-height: 1.55;
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

@media (max-width: 800px) {
  .knowledge-home,
  .knowledge-directory {
    padding-bottom: 2rem;
  }

  .knowledge-page-heading {
    margin-bottom: 1.35rem;
  }

  .knowledge-home-grid,
  .knowledge-directory-grid {
    grid-template-columns: 1fr;
  }

  .knowledge-page-card-link.internal {
    min-height: 0;
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
  match: ({ slug, fileData }) => slug === "index" || isFolderPage(fileData),
  generate({ cfg, content }) {
    return [
      {
        slug: "index",
        title: cfg.pageTitle,
        data: { description: HOME_DESCRIPTION },
      },
      ...directoryPagesFor(content),
    ]
  },
  layout: "home",
  body: () => PageContent,
})

export default WheelMakerHomePage
