import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { KnowledgeHomePage } from "./quartz/emitters/KnowledgeHomePage"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "WheelMaker Knowledge",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: { provider: "plausible" },
    locale: "zh-CN",
    // Quartz requires a syntactically valid host for its 404 and sitemap emitters.
    // WheelMaker serves the generated files below its own /wiki/ route.
    baseUrl: "localhost",
    ignorePatterns: [".git", ".obsidian", ".index"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "local",
      cdnCaching: false,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#fafafa",
          lightgray: "#e8e8e8",
          gray: "#b8b8b8",
          darkgray: "#4a4a4a",
          dark: "#222222",
          secondary: "#405a72",
          tertiary: "#738ca3",
          highlight: "rgba(64, 90, 114, 0.12)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#1e1e20",
          lightgray: "#3b3b3e",
          gray: "#747478",
          darkgray: "#d0d0d4",
          dark: "#eeeeef",
          secondary: "#91abc1",
          tertiary: "#9aaebd",
          highlight: "rgba(145, 171, 193, 0.16)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({ priority: ["frontmatter", "git", "filesystem"] }),
      Plugin.SyntaxHighlighting({
        theme: { light: "github-light", dark: "github-dark" },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      KnowledgeHomePage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({ enableSiteMap: true, enableRSS: true }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
