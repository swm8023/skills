import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import KnowledgeSidebarSwitch from "./quartz/components/KnowledgeSidebarSwitch"
import KnowledgeTagSidebar from "./quartz/components/KnowledgeTagSidebar"

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: [Component.Footer({ links: {} })],
}

const knowledgeLeft = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [
      { Component: Component.Search(), grow: true },
      { Component: Component.Darkmode() },
      { Component: Component.ReaderMode() },
    ],
  }),
  KnowledgeSidebarSwitch(),
  Component.Explorer({ title: "目录" }),
  KnowledgeTagSidebar(),
]

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: knowledgeLeft,
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: knowledgeLeft,
  right: [],
}
