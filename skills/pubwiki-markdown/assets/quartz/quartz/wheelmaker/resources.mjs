import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { parse } from "parse5"

const hash = value => createHash("sha256").update(value).digest("hex")
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value || ""
const nodesOf = root => {
  const nodes = []
  const visit = node => { if (node.tagName) nodes.push(node); for (const child of node.childNodes || []) visit(child) }
  visit(root)
  return nodes
}
const textOf = node => (node.childNodes || []).map(child => child.nodeName === "#text" ? child.value : textOf(child)).join("")
const jsonForHTML = data => JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")

export function compactHTML(html, styles = new Map()) {
  const nodes = nodesOf(parse(html, { sourceCodeLocationInfo: true }))
  const edits = [], symbols = new Map()
  const slice = node => html.slice(node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset)
  const replace = (node, value) => edits.push({ ...node.sourceCodeLocation, value })
  const hasMath = nodes.some(node => attr(node, "class").split(" ").includes("katex"))
  for (const node of nodes) {
    if (!node.sourceCodeLocation) continue
    if (node.tagName === "script" && /\bconst fetchData\s*=\s*fetch\(/.test(textOf(node))) { replace(node, ""); continue }
    if (node.tagName === "link" && attr(node, "rel") === "preconnect" && attr(node, "href").includes("cdnjs.cloudflare.com")) { replace(node, ""); continue }
    if (!hasMath && ((node.tagName === "link" && attr(node, "href").includes("/katex.min.css"))
      || (node.tagName === "script" && attr(node, "src").includes("/copy-tex.min.js")))) { replace(node, ""); continue }
    if (node.tagName === "span" && attr(node, "style").includes("--shiki") && /^[\w#;:.,()%\s+-]+$/.test(attr(node, "style"))) {
      const style = attr(node, "style"), name = "wm-token-" + hash(style).slice(0, 10)
      styles.set(name, style)
      const location = node.sourceCodeLocation.attrs.style
      const classLocation = node.sourceCodeLocation.attrs.class
      edits.push({ ...location, value: classLocation ? "" : `class="${name}"` })
      if (classLocation) edits.push({ ...classLocation, value: `class="${attr(node, "class")} ${name}"` })
    }
    if (node.tagName === "a" && attr(node, "role") === "anchor") {
      for (const svg of (node.childNodes || []).filter(child => child.tagName === "svg" && child.sourceCodeLocation?.endTag)) {
        const id = "wm-icon-" + hash(slice(svg)).slice(0, 10)
        const location = svg.sourceCodeLocation
        symbols.set(id, html.slice(location.startOffset, location.startTag.endOffset).replace(/^<svg/, `<symbol id="${id}"`).replace(/\s(?:width|height)="[^"]*"/g, "") + html.slice(location.startTag.endOffset, location.endTag.startOffset) + "</symbol>")
        replace(svg, `<svg class="wm-heading-icon" viewBox="${attr(svg, "viewBox") || attr(svg, "viewbox")}"><use href="#${id}"></use></svg>`)
      }
    }
    if (attr(node, "class").split(" ").includes("knowledge-tags-sidebar") && !nodesOf(node).some(child => attr(child, "data-knowledge-tags") === "true")) {
      const records = nodesOf(node).filter(child => attr(child, "data-knowledge-tag")).map(row => {
        const count = nodesOf(row).find(child => attr(child, "class").split(" ").includes("knowledge-tag-count"))
        return [attr(row, "data-knowledge-tag"), Number(textOf(count || {})) || 0]
      })
      replace(node, `<div class="knowledge-tags-sidebar" aria-label="标签"><nav aria-label="标签导航"></nav><script type="application/json" data-knowledge-tags="true">${jsonForHTML(records)}</script></div>`)
    }
  }
  // A parent replacement owns its descendants; never apply stale nested offsets.
  const filtered = []
  for (const edit of edits.sort((a, b) => a.startOffset - b.startOffset || b.endOffset - a.endOffset)) {
    const parent = filtered.at(-1)
    if (parent && parent.endOffset > parent.startOffset && parent.endOffset >= edit.endOffset) continue
    filtered.push(edit)
  }
  for (const edit of filtered.sort((a, b) => b.startOffset - a.startOffset)) html = html.slice(0, edit.startOffset) + edit.value + html.slice(edit.endOffset)
  if (symbols.size) html = html.replace("</body>", `<svg aria-hidden="true" style="display:none" data-wm-symbols="true">${[...symbols.values()].join("")}</svg></body>`)
  return { html, hasMath, styles }
}

async function siteFiles(root, prefix = "") {
  const files = []
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name)
    if (entry.isDirectory()) files.push(...await siteFiles(root, relative))
    else if (entry.isFile()) files.push(relative)
    else throw new Error("Wiki output contains a nonregular file")
  }
  return files
}

export async function optimizeSite(root, { runtime = process.cwd() } = {}) {
  root = path.resolve(root)
  const htmlFiles = (await siteFiles(root)).filter(file => file.endsWith(".html"))
  const styles = new Map(), pages = []
  for (const file of htmlFiles) pages.push({ file, ...compactHTML(await readFile(path.join(root, file), "utf8"), styles) })
  const assets = {}, emitted = []
  const emitAsset = async (name, data) => {
    const extension = path.extname(name), stem = path.basename(name, extension)
    const file = `static/wm-assets/${stem}.${hash(data)}${extension}`
    await mkdir(path.join(root, "static/wm-assets"), { recursive: true })
    await writeFile(path.join(root, file), data)
    emitted.push(path.join(root, file))
    assets[name] = file
    return file
  }
  for (const file of ["index.css", "prescript.js", "postscript.js"]) {
    let data = await readFile(path.join(root, file))
    if (file === "index.css") data = Buffer.from(data.toString() + "\n.wm-heading-icon{width:18px;height:18px}" + [...styles].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `.${name}{${value}}`).join(""))
    await emitAsset(file, data)
  }
  // Quartz bundles this module; import.meta.url then points to the config bundle.
  await emitAsset("icon.svg", await readFile(path.join(runtime, "quartz/wheelmaker/icon.svg")))
  if (pages.some(page => page.hasMath)) {
    const require = createRequire(path.join(runtime, "package.json"))
    const katexCSS = require.resolve("katex/dist/katex.min.css")
    let css = await readFile(katexCSS, "utf8")
    // Modern supported browsers use woff2; do not ship duplicate legacy fonts.
    css = css.replace(/src:(url\(fonts\/[^)]+\.woff2\) format\("woff2"\))[^}]+/g, "src:$1")
    for (const font of new Set([...css.matchAll(/url\(fonts\/([^)]+)\)/g)].map(match => match[1]))) {
      const file = await emitAsset(font, await readFile(path.join(path.dirname(katexCSS), "fonts", font)))
      css = css.replaceAll(`fonts/${font}`, path.posix.basename(file))
    }
    await emitAsset("katex.min.css", css)
    const script = await readFile(path.join(path.dirname(katexCSS), "contrib/copy-tex.min.js"), "utf8")
    await emitAsset("copy-tex.min.js", `if(!window.__wheelmakerCopyTexLoaded){window.__wheelmakerCopyTexLoaded=true;${script}}`)
  }
  const index = await readFile(path.join(root, "static/searchIndex.json")).catch(error => { if (error.code === "ENOENT") return Buffer.alloc(0); throw error })
  const revision = hash(JSON.stringify(assets) + hash(index))
  for (const page of pages) {
    let html = page.html
    const relative = name => path.posix.relative(path.posix.dirname(page.file), assets[name])
    // Keep source HTML otherwise intact: code whitespace, IDs and text selection matter.
    html = html.replace(/(<(?:link|script)\b[^>]*?\b(?:href|src)=")([^"]+)(")/g, (whole, start, url, end) => {
      const name = url.includes("/katex.min.css") ? "katex.min.css" : url.includes("/copy-tex.min.js") ? "copy-tex.min.js"
        : /(?:^|\/)static\/icon\.png$/.test(url) ? "icon.svg" : /(?:^|\/)(index\.css|prescript\.js|postscript\.js)$/.exec(url)?.[1]
      return name && assets[name] ? start + relative(name) + end : whole
    })
    // KaTeX CSS must join the head when SPA enters a math article.
    html = html.replace(/(<link[^>]+href="[^"]*\/katex\.min\.[a-f0-9]+\.css"[^>]*?)\sdata-persist="true"/g, "$1")
    html = html.replace("</head>", '<meta name="wheelmaker-build" content="' + revision + '"></head>')
    await writeFile(path.join(root, page.file), html)
  }
  await writeFile(path.join(root, "static/asset-manifest.json"), JSON.stringify({ version: 1, assets }))
  return { emitted, pages: pages.length, styles: styles.size, assets }
}

// Quartz emits pages first and the remaining emitters concurrently. Finalize
// only after every real emitter has finished; no polling or core source patch.
export function withWheelMakerResources(config) {
  const states = new WeakMap()
  const expected = config.plugins.emitters.filter(emitter => emitter.name !== "PageTypeDispatcher").length
  config.plugins.emitters = config.plugins.emitters.map(emitter => ({ ...emitter,
    async *emit(ctx, ...args) {
      const result = await emitter.emit(ctx, ...args)
      for await (const file of result) yield file
      if (ctx.argv.serve || emitter.name === "PageTypeDispatcher") return
      const state = states.get(ctx) || { completed: 0 }
      states.set(ctx, state)
      if (++state.completed === expected) {
        const result = await optimizeSite(ctx.argv.output)
        for (const file of result.emitted) yield file
        yield path.join(ctx.argv.output, "static/asset-manifest.json")
        states.delete(ctx)
      }
    },
  }))
  return config
}
