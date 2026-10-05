import { h } from "preact"

export const WheelMakerTableOfContents = () => {
  const Component = ({ fileData = {}, cfg = {} } = {}) => {
    if (!fileData.toc?.length) return null
    const collapsed = fileData.collapseToc === true
    return h("div", { class: "toc" }, [
      h("button", { type: "button", class: `toc-header${collapsed ? " collapsed" : ""}`,
        "aria-controls": "wheelmaker-toc", "aria-expanded": String(!collapsed) }, [
        h("h3", null, cfg.locale?.startsWith("zh") ? "目录" : "Table of Contents"),
        h("span", { class: "fold", "aria-hidden": "true" }, "⌄"),
      ]),
      h("ul", { id: "wheelmaker-toc", class: "toc-content", hidden: collapsed },
        fileData.toc.map(entry => h("li", { key: entry.slug, style: { paddingLeft: `${entry.depth}rem` } },
          h("a", { href: `#${entry.slug}`, "data-for": entry.slug }, entry.text)))),
    ])
  }
  Component.css = `
.toc { display: flex; flex-direction: column; min-height: 1.4rem; overflow: hidden; flex: 0 0.5 auto; }
.toc-header { display: flex; align-items: center; padding: 0; border: 0; background: transparent; color: var(--dark); cursor: pointer; text-align: left; }
.toc-header h3 { margin: 0; font-size: 1rem; }
.toc-header .fold { margin-left: 0.5rem; }
.toc-header.collapsed .fold { transform: rotate(-90deg); }
.toc-content { list-style: none; margin: 0.5rem 0; padding: 0; overflow-y: auto; overscroll-behavior: contain; }
.toc-content[hidden] { display: none; }
.toc-content a { color: var(--dark); opacity: 0.5; }
.toc-content a.in-view, .toc-content a:focus-visible { opacity: 1; }
`
  Component.afterDOMLoaded = `
(() => {
  if (window.__wheelmakerTocBound) return
  window.__wheelmakerTocBound = true
  let observer
  document.addEventListener("click", event => {
    const button = event.target.closest?.(".toc-header")
    if (!button) return
    const list = button.nextElementSibling
    if (!list) return
    list.hidden = !list.hidden
    button.classList.toggle("collapsed", list.hidden)
    button.setAttribute("aria-expanded", String(!list.hidden))
  })
  const setup = () => {
    observer?.disconnect()
    if (!("IntersectionObserver" in window)) return
    const links = [...document.querySelectorAll(".toc a[data-for]")]
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const visible = entry.boundingClientRect.y < (entry.rootBounds?.height || window.innerHeight)
        links.filter(link => link.dataset.for === entry.target.id).forEach(link => link.classList.toggle("in-view", visible))
      }
    })
    for (const link of links) {
      const heading = document.getElementById(link.dataset.for)
      if (heading) observer.observe(heading)
    }
  }
  document.addEventListener("nav", setup)
  document.addEventListener("render", setup)
  setup()
})()
`
  return Component
}

export const WheelMakerFooter = () => {
  const Component = ({ cfg = {} } = {}) => h("footer", { class: "wheelmaker-footer" },
    h("p", null, [cfg.locale?.startsWith("zh") ? "由 " : "Created with ",
      h("a", { href: "https://quartz.jzhao.xyz/" }, "Quartz"), ` © ${new Date().getFullYear()}`]))
  Component.css = `.wheelmaker-footer { text-align: left; margin-bottom: 4rem; opacity: 0.7; }`
  return Component
}

// Quartz's YAML loader only places one component per plugin and special-cases
// a plugin named "footer". Fill these slots through its supported TS layout API.
export function withWheelMakerReader(layout) {
  const toc = WheelMakerTableOfContents()
  const footer = WheelMakerFooter()
  const attach = (entry, defaults = false) => ({
    ...entry,
    footer,
    ...(defaults || entry.right?.length ? { right: [toc, ...(entry.right || [])] } : {}),
  })
  return {
    ...layout,
    defaults: attach(layout.defaults, true),
    byPageType: Object.fromEntries(Object.entries(layout.byPageType || {}).map(([name, entry]) => [name, attach(entry)])),
  }
}
