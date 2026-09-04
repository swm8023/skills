import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

const HOME_DESCRIPTION = "Browse the WheelMaker knowledge base."

function titleFor(page) {
  return page.frontmatter?.title || page.slug || "Untitled"
}

function sectionFor(page) {
  const segments = page.slug.split("/").filter(Boolean)
  return segments.length > 1 ? segments.slice(0, -1).join(" / ") : "Root"
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

function HomeContent({ allFiles = [], fileData = { slug: "index" } } = {}) {
  const pages = allFiles
    .filter(isKnowledgePage)
    .sort((left, right) => titleFor(left).localeCompare(titleFor(right), undefined, { sensitivity: "base" }))

  return h("div", { class: "popover-hint knowledge-home" }, [
    h("div", { class: "knowledge-home-intro" }, [
      h("p", { class: "knowledge-home-lede" }, HOME_DESCRIPTION),
      h("div", { class: "knowledge-home-meta", "aria-label": "Knowledge base status" }, [
        h("span", null, `${pages.length} ${pages.length === 1 ? "entry" : "entries"}`),
        h("span", null, "Local workspace"),
      ]),
    ]),
    pages.length > 0
      ? h(
          "ul",
          { class: "knowledge-home-grid", "aria-label": "Knowledge entries" },
          pages.map((page) =>
            h("li", { class: "knowledge-home-card", key: page.slug }, [
              h(
                "a",
                {
                  href: resolveRelative(fileData.slug || "index", page.slug),
                  class: "knowledge-home-card-link internal internal-link",
                },
                [
                  h("span", { class: "knowledge-home-card-section" }, sectionFor(page)),
                  h("h2", null, titleFor(page)),
                  page.description ? h("p", null, page.description) : null,
                  h("span", { class: "knowledge-home-card-arrow", "aria-hidden": "true" }, "↗"),
                ],
              ),
            ]),
          ),
        )
      : h("div", { class: "knowledge-home-empty" }, [
          h("strong", null, "暂无知识条目"),
          h("p", null, "发布一篇 Markdown 笔记后，它会出现在这里。"),
        ]),
  ])
}

HomeContent.css = `
.knowledge-home {
  --knowledge-accent: var(--secondary);
  padding-bottom: 3rem;
}

.knowledge-home-intro {
  max-width: 48rem;
  margin-bottom: 2rem;
}

.knowledge-home-lede {
  margin: 0.25rem 0 1rem;
  color: var(--darkgray);
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.7;
}

.knowledge-home-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.knowledge-home-meta span {
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  padding: 0.28rem 0.6rem;
}

.knowledge-home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 1rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.knowledge-home-card {
  min-width: 0;
  margin: 0;
}

.knowledge-home-card-link.internal {
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

.knowledge-home-card-link.internal:hover,
.knowledge-home-card-link.internal:focus-visible {
  border-color: var(--knowledge-accent);
  background: var(--highlight);
  color: var(--dark);
  transform: translateY(-2px);
}

.knowledge-home-card-link.internal:focus-visible {
  outline: 2px solid var(--knowledge-accent);
  outline-offset: 3px;
}

.knowledge-home-card-section {
  color: var(--knowledge-accent);
  font-family: var(--codeFont);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.knowledge-home-card h2 {
  margin: 0.65rem 0 0;
  color: var(--dark);
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  line-height: 1.25;
}

.knowledge-home-card p {
  margin: 0.65rem 0 0;
  color: var(--darkgray);
  line-height: 1.55;
}

.knowledge-home-card-arrow {
  align-self: flex-end;
  margin-top: auto;
  padding-top: 1rem;
  color: var(--knowledge-accent);
  font-size: 1.25rem;
  line-height: 1;
}

.knowledge-home-empty {
  border: 1px dashed var(--lightgray);
  border-radius: 0.7rem;
  padding: 1.25rem;
}

.knowledge-home-empty strong {
  color: var(--dark);
}

.knowledge-home-empty p {
  margin: 0.4rem 0 0;
}

@media (max-width: 800px) {
  .knowledge-home {
    padding-bottom: 2rem;
  }

  .knowledge-home-intro {
    margin-bottom: 1.35rem;
  }

  .knowledge-home-grid {
    grid-template-columns: 1fr;
  }

  .knowledge-home-card-link.internal {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .knowledge-home-card-link.internal {
    transition: none;
  }
}
`

export const WheelMakerHomePage = () => ({
  name: "WheelMakerHomePage",
  priority: 1000,
  match: () => false,
  generate({ cfg }) {
    return [
      {
        slug: "index",
        title: cfg.pageTitle,
        data: { description: HOME_DESCRIPTION },
      },
    ]
  },
  layout: "home",
  body: () => HomeContent,
})

export default WheelMakerHomePage
