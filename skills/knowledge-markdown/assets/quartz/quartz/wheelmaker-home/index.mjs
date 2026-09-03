import { h } from "preact"
import { resolveRelative } from "@quartz-community/utils"

const HOME_DESCRIPTION = "Browse the WheelMaker knowledge base."

function titleFor(page) {
  return page.frontmatter?.title || page.slug || "Untitled"
}

function HomeContent({ allFiles = [], fileData = { slug: "index" } } = {}) {
  const pages = allFiles
    .filter((page) => page.slug && page.slug !== "index" && !page.slug.startsWith("tags/"))
    .sort((left, right) => titleFor(left).localeCompare(titleFor(right), undefined, { sensitivity: "base" }))

  return h("div", { class: "popover-hint knowledge-home" }, [
    h("p", null, HOME_DESCRIPTION),
    pages.length > 0
      ? h(
          "ul",
          { class: "section-ul" },
          pages.map((page) =>
            h("li", { class: "section-li", key: page.slug }, [
              h("div", { class: "section" }, [
                h("div", { class: "desc" }, [
                  h(
                    "h3",
                    null,
                    h(
                      "a",
                      {
                        href: resolveRelative(fileData.slug || "index", page.slug),
                        class: "internal internal-link",
                      },
                      titleFor(page),
                    ),
                  ),
                  page.description ? h("p", null, page.description) : null,
                ]),
              ]),
            ]),
          ),
        )
      : h("p", null, "暂无知识条目。"),
  ])
}

HomeContent.css = `
.knowledge-home > p {
  margin-top: 0;
}

.knowledge-home .section h3 {
  margin: 0;
}

.knowledge-home .section p {
  margin: 0.35rem 0 0;
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
