import { QuartzEmitterPlugin } from "../plugins/types"
import { QuartzComponent, QuartzComponentProps } from "../components/types"
import HeaderConstructor from "../components/Header"
import BodyConstructor from "../components/Body"
import { PageList } from "../components/PageList"
import { pageResources, renderPage } from "../components/renderPage"
import { FullPageLayout } from "../cfg"
import { FullSlug, pathToRoot } from "../util/path"
import { BuildCtx } from "../util/ctx"
import { StaticResources } from "../util/resources"
import { defaultListPageLayout, sharedPageComponents } from "../../quartz.layout"
import { ProcessedContent, defaultProcessedContent } from "../plugins/vfile"
import { write } from "../plugins/emitters/helpers"

const KnowledgeHomeContent: QuartzComponent = (props: QuartzComponentProps) => {
  const pages = props.allFiles.filter((file) => file.slug && file.slug !== "index")
  return (
    <div class="popover-hint knowledge-home">
      <p>Browse the WheelMaker knowledge base.</p>
      <PageList {...props} allFiles={pages} />
    </div>
  )
}

KnowledgeHomeContent.css = `
.knowledge-home > p {
  margin-top: 0;
}
`

async function* emitHome(
  ctx: BuildCtx,
  content: ProcessedContent[],
  resources: StaticResources,
  opts: FullPageLayout,
) {
  const cfg = ctx.cfg.configuration
  const slug = "index" as FullSlug
  const [tree, file] = defaultProcessedContent({
    slug,
    description: "Browse the WheelMaker knowledge base.",
    frontmatter: { title: cfg.pageTitle, tags: [] },
  })
  const externalResources = pageResources(pathToRoot(slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData: file.data,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles: content.map((entry) => entry[1].data),
  }
  yield await write({
    ctx,
    content: renderPage(cfg, slug, componentData, opts, externalResources),
    slug,
    ext: ".html",
  })
}

export const KnowledgeHomePage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: KnowledgeHomeContent,
  }
  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "KnowledgeHomePage",
    getQuartzComponents() {
      return [Head, Header, Body, ...header, ...beforeBody, pageBody, ...afterBody, ...left, ...right, Footer]
    },
    async *emit(ctx, content, resources) {
      yield* emitHome(ctx, content, resources, opts)
    },
    async *partialEmit(ctx, content, resources) {
      yield* emitHome(ctx, content, resources, opts)
    },
  }
}
