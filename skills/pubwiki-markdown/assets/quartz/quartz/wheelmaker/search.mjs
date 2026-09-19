import { h } from "preact"

const searchIcon = h("svg", {
  role: "img",
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 19.9 19.7",
  "aria-hidden": "true",
}, h("g", { class: "search-path", fill: "none" }, [
  h("path", { stroke: "currentColor", "stroke-linecap": "square", d: "m18.5 18.3-5.4-5.4" }),
  h("circle", { stroke: "currentColor", cx: 8, cy: 8, r: 7 }),
]))

export const WheelMakerSearch = ({ cfg = {} } = {}) => {
  const isChinese = String(cfg.locale || "").toLowerCase().startsWith("zh")
  const title = isChinese ? "搜索" : "Search"
  const placeholder = isChinese ? "搜索文章" : "Search for something"
  return h("div", { class: "search" }, [
    h("button", { class: "search-button", type: "button", "aria-label": title }, [
      searchIcon,
      h("p", null, title),
    ]),
    h("div", { class: "search-container" }, h("div", { class: "search-space" }, [
      h("input", {
        autocomplete: "off",
        class: "search-bar",
        name: "search",
        type: "text",
        "aria-label": placeholder,
        placeholder,
      }),
      h("div", { class: "search-layout", "data-preview": "true" }, [
        h("div", { class: "results-container" }),
        h("div", { class: "preview-container" }),
      ]),
    ])),
  ])
}

WheelMakerSearch.css = `
.search {
  min-width: 0;
  max-width: 14rem;
}
.search > .search-button {
  display: flex;
  align-items: center;
  width: 100%;
  height: 2rem;
  padding: 0 1rem 0 0;
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  font: inherit;
  text-align: inherit;
  white-space: nowrap;
}
.search > .search-button > p { margin: 0; color: var(--gray); }
.search > .search-button > svg { width: 18px; min-width: 18px; margin: 0 0.5rem; }
.search > .search-button > svg .search-path { stroke: var(--darkgray); stroke-width: 1.5px; }
.search > .search-container {
  position: fixed;
  contain: layout;
  z-index: 999;
  inset: 0;
  display: none;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  backdrop-filter: blur(4px);
}
.search > .search-container.active { display: inline-block; }
.search > .search-container > .search-space { width: 65%; margin: 12vh auto 0; }
.search > .search-container > .search-space > * {
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 2em;
  border-radius: 7px;
  background: var(--light);
  box-shadow: 0 14px 50px rgb(27 33 48 / 12%), 0 10px 30px rgb(27 33 48 / 16%);
}
.search > .search-container > .search-space > input {
  padding: 0.5em 1em;
  border: 1px solid var(--lightgray);
  color: var(--dark);
  font-family: var(--bodyFont);
  font-size: 1.1em;
}
.search > .search-container > .search-space > input:focus { outline: none; }
.search-layout { display: none; flex-direction: row; border: 1px solid var(--lightgray); }
.search-layout.display-results { display: flex; }
.search-layout > div { height: calc(75vh - 12vh); border-radius: 5px; }
.search-layout > .results-container { flex: 0 0 min(30%, 450px); overflow-y: auto; }
.search-layout > .preview-container {
  flex-grow: 1;
  overflow: hidden auto;
  padding: 0 2rem;
  color: var(--dark);
  font-weight: 400;
  line-height: 1.5em;
}
.search-layout .highlight {
  border-radius: 5px;
  background: color-mix(in srgb, var(--tertiary) 60%, transparent);
}
.search-layout .result-card {
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: 1em;
  border: 0;
  border-bottom: 1px solid var(--lightgray);
  background: transparent;
  color: var(--dark);
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
}
.search-layout .result-card:hover,
.search-layout .result-card:focus,
.search-layout .result-card.focus { background: var(--lightgray); }
.search-layout .result-card > h3 { margin: 0; color: var(--secondary); }
.search-layout .result-card > p { margin: 0.5em 0 0; color: var(--gray); font-size: 0.9em; }
.search-layout .result-card.no-match { cursor: default; }
.search-layout .result-card > ul.tags { margin: 0.45rem 0 0; padding: 0; list-style: none; }
.search-layout .result-card > ul.tags > li { display: inline-block; margin-right: 0.3rem; }
.search-layout .result-card > ul.tags > li > p {
  margin: 0;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  background: var(--highlight);
  color: var(--secondary);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4rem;
}
@media all and (max-width: 1199px) {
  .search > .search-container > .search-space { width: 90%; }
}
@media all and (max-width: 800px) {
  .search { flex-grow: 0.3; max-width: none; }
  .search > .search-container > .search-space { width: 90%; }
  .search-layout { flex-direction: column; }
  .search-layout > .results-container { width: 100%; height: auto; flex: 0 0 100%; }
  .search-layout > .preview-container { display: none; }
}
`

WheelMakerSearch.afterDOMLoaded = `
(() => {
  if (window.__wheelmakerSearchLoaded) return
  window.__wheelmakerSearchLoaded = true

  const resultLimit = 8
  const contextCharacters = 220
  const parser = new DOMParser()
  let searchIndexPromise = null
  let currentTerm = ""
  const cleanupFns = []

  const addCleanup = (fn) => cleanupFns.push(fn)
  const runCleanups = () => {
    cleanupFns.splice(0).forEach((fn) => fn())
  }
  const isCjk = (char) => {
    const code = char.codePointAt(0)
    return (code >= 0x3040 && code <= 0x30ff)
      || (code >= 0x4e00 && code <= 0x9fff)
      || (code >= 0xac00 && code <= 0xd7af)
      || (code >= 0x20000 && code <= 0x2a6df)
  }
  const tokenize = (value) => {
    const tokens = []
    let word = ""
    for (const char of String(value || "").toLocaleLowerCase()) {
      if (isCjk(char)) {
        if (word) tokens.push(word), word = ""
        tokens.push(char)
      } else if (char.trim() === "") {
        if (word) tokens.push(word), word = ""
      } else {
        word += char
      }
    }
    if (word) tokens.push(word)
    return [...new Set(tokens.filter(Boolean))]
  }
  const appendHighlighted = (root, value) => {
    const text = String(value || "")
    root.append(document.createTextNode(text))
  }
  const makeSnippet = (content, terms) => {
    const text = String(content || "").split(/\\s+/gu).join(" ").trim()
    if (!text) return ""
    const lower = text.toLocaleLowerCase()
    const firstMatch = terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0]
    const start = Math.max((firstMatch ?? 0) - 70, 0)
    const end = Math.min(start + contextCharacters, text.length)
    return (start ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "")
  }
  const loadSearchIndex = () => {
    if (!searchIndexPromise) {
      searchIndexPromise = fetch("/static/searchIndex.json")
        .then((response) => {
          if (!response.ok) throw new Error("Search index request failed: " + response.status)
          return response.json()
        })
        .then((data) => data?.content && typeof data.content === "object" ? data.content : data)
        .catch((error) => {
          searchIndexPromise = null
          throw error
        })
    }
    return searchIndexPromise
  }
  const scoreDocument = (data, terms, tagOnly) => {
    const title = String(data?.title || "").toLocaleLowerCase()
    const tags = Array.isArray(data?.tags) ? data.tags.map(String) : []
    const tagText = tags.join(" ").toLocaleLowerCase()
    const content = String(data?.content || "").toLocaleLowerCase()
    let score = 0
    for (const term of terms) {
      const inTitle = title.includes(term)
      const inTags = tagText.includes(term)
      const inContent = content.includes(term)
      if (tagOnly ? !inTags : !(inTitle || inTags || inContent)) return -1
      if (inTitle) score += 30
      if (inTags) score += 12
      if (inContent && !tagOnly) score += 1
    }
    return score
  }
  const findResults = async (term) => {
    const data = await loadSearchIndex()
    const tagOnly = term.trim().startsWith("#")
    const query = tagOnly ? term.trim().slice(1) : term.trim()
    const terms = tokenize(query)
    if (!terms.length) return []
    return Object.entries(data || {})
      .map(([slug, value]) => ({ slug, data: value, score: scoreDocument(value, terms, tagOnly) }))
      .filter((item) => item.score >= 0)
      .sort((left, right) => right.score - left.score || left.slug.localeCompare(right.slug))
      .slice(0, resultLimit)
      .map((item) => ({ ...item, terms, tagOnly }))
  }
  const clearResults = (results, preview, layout) => {
    results.replaceChildren()
    preview?.replaceChildren()
    layout.classList.remove("display-results")
  }
  const renderResults = (results, preview, layout, items) => {
    results.replaceChildren()
    layout.classList.toggle("display-results", currentTerm !== "")
    if (!items.length) {
      const empty = document.createElement("div")
      empty.className = "result-card no-match"
      empty.innerHTML = "<h3>没有找到结果</h3><p>请换一个关键词。</p>"
      results.append(empty)
      return
    }
    for (const item of items) {
      const card = document.createElement("a")
      card.className = "result-card"
      card.href = "/" + item.slug
      card.dataset.slug = item.slug
      const title = document.createElement("h3")
      appendHighlighted(title, item.data?.title || item.slug)
      card.append(title)
      const tags = Array.isArray(item.data?.tags) ? item.data.tags : []
      if (tags.length) {
        const list = document.createElement("ul")
        list.className = "tags"
        for (const tag of tags.slice(0, 5)) {
          const entry = document.createElement("li")
          const label = document.createElement("p")
          label.textContent = "#" + tag
          entry.append(label)
          list.append(entry)
        }
        card.append(list)
      }
      const description = document.createElement("p")
      appendHighlighted(description, makeSnippet(item.data?.content, item.terms))
      card.append(description)
      card.addEventListener("mouseenter", () => {
        card.classList.add("focus")
        void updatePreview(preview, item.slug, item.terms)
      })
      card.addEventListener("mouseleave", () => card.classList.remove("focus"))
      card.addEventListener("click", () => {
        card.closest(".search-container")?.classList.remove("active")
      })
      results.append(card)
    }
    void updatePreview(preview, items[0].slug, items[0].terms)
  }
  const updatePreview = async (preview, slug, terms) => {
    if (!preview) return
    try {
      const response = await fetch("/" + slug)
      const html = await response.text()
      const documentFragment = parser.parseFromString(html, "text/html")
      preview.replaceChildren(...Array.from(documentFragment.getElementsByClassName("popover-hint"), (node) => node.cloneNode(true)))
      if (terms.length) {
        preview.querySelectorAll(".popover-hint").forEach((node) => {
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
          const textNodes = []
          let current = walker.nextNode()
          while (current) textNodes.push(current), current = walker.nextNode()
          textNodes.forEach((textNode) => {
            const parent = textNode.parentNode
            if (!parent || parent.closest("script,style")) return
            const replacement = document.createDocumentFragment()
            appendHighlighted(replacement, textNode.nodeValue)
            parent.replaceChild(replacement, textNode)
          })
        })
      }
    } catch {
      preview.replaceChildren()
    }
  }
  const setupSearch = () => {
    for (const search of document.querySelectorAll(".search")) {
      const container = search.querySelector(".search-container")
      const button = search.querySelector(".search-button")
      const input = search.querySelector(".search-bar")
      const layout = search.querySelector(".search-layout")
      const results = search.querySelector(".results-container")
      const preview = search.querySelector(".preview-container")
      if (!container || !button || !input || !layout || !results) continue

      const hide = () => {
        container.classList.remove("active")
        input.value = ""
        currentTerm = ""
        clearResults(results, preview, layout)
      }
      const show = () => {
        container.classList.add("active")
        input.focus()
        void loadSearchIndex().catch(() => {})
      }
      const onButton = (event) => { event.preventDefault(); show() }
      const onFocus = () => { void loadSearchIndex().catch(() => {}) }
      const onInput = async () => {
        currentTerm = input.value
        const term = currentTerm
        if (!term.trim()) { clearResults(results, preview, layout); return }
        try {
          const items = await findResults(term)
          if (input.value === term) renderResults(results, preview, layout, items)
        } catch {
          if (input.value === term) renderResults(results, preview, layout, [])
        }
      }
      const onKeydown = (event) => {
        if (event.key === "Escape") { event.preventDefault(); hide() }
        if (event.key === "Enter") {
          const first = results.querySelector(".result-card:not(.no-match)")
          if (first) first.click()
        }
      }
      const onBackdrop = (event) => { if (event.target === container) hide() }
      button.addEventListener("click", onButton)
      input.addEventListener("focus", onFocus)
      input.addEventListener("input", onInput)
      input.addEventListener("keydown", onKeydown)
      container.addEventListener("click", onBackdrop)
      addCleanup(() => button.removeEventListener("click", onButton))
      addCleanup(() => input.removeEventListener("focus", onFocus))
      addCleanup(() => input.removeEventListener("input", onInput))
      addCleanup(() => input.removeEventListener("keydown", onKeydown))
      addCleanup(() => container.removeEventListener("click", onBackdrop))
    }

    const onShortcut = (event) => {
      if (event.key.toLowerCase() !== "k" || (!event.ctrlKey && !event.metaKey)) return
      const search = document.querySelector(".search")
      if (!search) return
      event.preventDefault()
      const container = search.querySelector(".search-container")
      const button = search.querySelector(".search-button")
      if (container?.classList.contains("active")) search.querySelector(".search-bar")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
      else button?.click()
    }
    document.addEventListener("keydown", onShortcut)
    addCleanup(() => document.removeEventListener("keydown", onShortcut))
  }

  const onNavigation = () => { runCleanups(); setupSearch() }
  document.addEventListener("nav", onNavigation)
  document.addEventListener("render", onNavigation)
  setupSearch()
})()
`
