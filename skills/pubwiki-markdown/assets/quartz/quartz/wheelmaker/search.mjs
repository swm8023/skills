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

export const WheelMakerSearch = ({ cfg = {}, enablePreview = true } = {}) => {
  const isChinese = String(cfg.locale || "").toLowerCase().startsWith("zh")
  const title = isChinese ? "搜索" : "Search"
  const placeholder = isChinese ? "搜索文章" : "Search for something"
  return h("div", { class: "search", "data-search-locale": isChinese ? "zh" : "en" }, [
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
      h("div", { class: "search-layout", "data-preview": String(enablePreview) }, [
        h("div", { class: "results-container", "aria-live": "polite" }),
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
.search-layout[data-preview="false"] > .preview-container { display: none; }
.search-layout[data-preview="false"] > .results-container { flex-basis: 100%; }
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
.search-layout .search-status { padding: 1em; }
.search-layout .search-status button { cursor: pointer; font: inherit; }
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

// Serialized for Quartz's script resource API; keep browser dependencies local.
function installSearch() {
  if (window.__wheelmakerSearchLoaded) return
  window.__wheelmakerSearchLoaded = true

  const resultLimit = 8
  const contextCharacters = 220
  const parser = new DOMParser()
  let searchIndexPromise = null
  const previewCache = new Map()
  const mobile = window.matchMedia("(max-width: 800px)")
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
  const appendHighlighted = (root, value, terms = []) => {
    const text = String(value || "")
    const lower = text.toLocaleLowerCase()
    const matches = terms.flatMap(term => {
      const found = []
      let position = 0
      while (term && (position = lower.indexOf(term, position)) !== -1) {
        found.push([position, position + term.length])
        position += term.length
      }
      return found
    }).sort((a, b) => a[0] - b[0] || b[1] - a[1])
    const ranges = []
    for (const range of matches) {
      const last = ranges.at(-1)
      if (last && range[0] < last[1]) last[1] = Math.max(last[1], range[1])
      else ranges.push(range)
    }
    let position = 0
    for (const [start, end] of ranges) {
      root.append(document.createTextNode(text.slice(position, start)))
      const highlight = document.createElement("span")
      highlight.className = "highlight"
      highlight.textContent = text.slice(start, end)
      root.append(highlight)
      position = end
    }
    root.append(document.createTextNode(text.slice(position)))
  }
  const makeSnippet = (content, terms) => {
    const text = String(content || "").split(/\s+/gu).join(" ").trim()
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
  const articleURL = slug => new URL(slug.split("/").map(encodeURIComponent).join("/"),
    window.location.origin + (window.__wheelmakerWikiRoot || "/")).href
  const fetchPreview = slug => {
    if (!previewCache.has(slug)) {
      const url = articleURL(slug)
      const pending = fetch(url).then(async response => {
        if (!response.ok) throw new Error("Preview request failed: " + response.status)
        const html = parser.parseFromString(await response.text(), "text/html")
        const base = response.url || url
        const absolute = value => {
          try { return new URL(value, base).href } catch { return value }
        }
        html.querySelectorAll("[href], [src], [poster], [srcset]").forEach(node => {
          for (const attribute of ["href", "src", "poster"]) {
            if (node.hasAttribute(attribute)) node.setAttribute(attribute, absolute(node.getAttribute(attribute)))
          }
          // Parse URL tokens separately so commas in data URLs remain intact.
          if (node.hasAttribute("srcset")) {
            const candidates = []
            const source = node.getAttribute("srcset")
            let position = 0
            while (position < source.length) {
              while (/[\s,]/.test(source[position] || "") && position < source.length) position++
              const start = position
              while (position < source.length && !/\s/.test(source[position])) position++
              let target = source.slice(start, position)
              if (!target) break
              let descriptor = ""
              if (target.endsWith(",")) target = target.replace(/,+$/, "")
              else {
                const startDescriptor = position
                while (position < source.length && source[position] !== ",") position++
                descriptor = source.slice(startDescriptor, position).trim()
              }
              candidates.push(absolute(target) + (descriptor ? " " + descriptor : ""))
            }
            node.setAttribute("srcset", candidates.join(", "))
          }
        })
        return [...html.getElementsByClassName("popover-hint")]
      }).catch(error => { previewCache.delete(slug); throw error })
      previewCache.set(slug, pending)
    }
    return previewCache.get(slug)
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

      const chinese = search.dataset.searchLocale === "zh"
      const messages = chinese
        ? { loading: "正在加载搜索…", empty: "没有找到结果", hint: "请换一个关键词。", error: "搜索暂时无法加载", retry: "重试", preview: "预览暂时无法加载" }
        : { loading: "Loading search…", empty: "No results", hint: "Try another search term.", error: "Search could not load", retry: "Retry", preview: "Preview could not load" }
      let generation = 0
      let previewGeneration = 0
      let selected = -1
      let items = []
      let returnFocus = button
      let disposed = false
      const invalidatePreview = () => { previewGeneration++; preview?.replaceChildren() }
      const clear = () => {
        invalidatePreview()
        results.replaceChildren()
        layout.classList.remove("display-results")
        items = []
        selected = -1
        input.removeAttribute("aria-activedescendant")
      }
      const hide = (restoreFocus = true) => {
        generation++
        container.classList.remove("active")
        input.value = ""
        clear()
        if (restoreFocus && !search.closest("dialog")) returnFocus?.focus()
      }
      const status = (kind, text, detail) => {
        clear()
        layout.classList.add("display-results")
        const message = document.createElement("div")
        message.className = kind === "no-match" ? "result-card no-match" : "search-status " + kind
        message.setAttribute("role", kind === "search-error" ? "alert" : "status")
        const title = document.createElement("h3")
        title.textContent = text
        message.append(title)
        if (detail) {
          const description = document.createElement("p")
          description.textContent = detail
          message.append(description)
        }
        if (kind === "search-error") {
          const retry = document.createElement("button")
          retry.type = "button"
          retry.textContent = messages.retry
          retry.addEventListener("click", () => { void updateResults() })
          message.append(retry)
        }
        results.append(message)
      }
      const updatePreview = async () => {
        invalidatePreview()
        const item = items[selected]
        if (!preview || !item || mobile.matches || layout.dataset.preview !== "true") return
        const token = previewGeneration
        try {
          const nodes = await fetchPreview(item.slug)
          if (disposed || token !== previewGeneration) return
          const fragments = nodes.map(node => node.cloneNode(true))
          for (const fragment of fragments) {
            const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT)
            const textNodes = []
            while (walker.nextNode()) textNodes.push(walker.currentNode)
            for (const node of textNodes) {
              if (node.parentElement?.closest("script,style,textarea,.highlight")) continue
              const replacement = document.createDocumentFragment()
              appendHighlighted(replacement, node.nodeValue, item.terms)
              node.replaceWith(replacement)
            }
          }
          preview.replaceChildren(...fragments)
        } catch {
          if (!disposed && token === previewGeneration) preview.textContent = messages.preview
        }
      }
      const select = index => {
        selected = Math.min(Math.max(index, 0), items.length - 1)
        const cards = [...results.querySelectorAll(".result-card:not(.no-match)")]
        cards.forEach((card, i) => card.classList.toggle("focus", i === selected))
        const card = cards[selected]
        if (card) {
          input.setAttribute("aria-activedescendant", card.id)
          card.scrollIntoView({ block: "nearest" })
        }
        void updatePreview()
      }
      const renderResults = matches => {
        clear()
        if (!matches.length) { status("no-match", messages.empty, messages.hint); return }
        items = matches
        layout.classList.add("display-results")
        for (const [index, item] of items.entries()) {
          const card = document.createElement("a")
          card.className = "result-card"
          card.id = "wheelmaker-search-result-" + index
          card.href = articleURL(item.slug)
          card.dataset.slug = item.slug
          const title = document.createElement("h3")
          appendHighlighted(title, item.data?.title || item.slug, item.terms)
          card.append(title)
          const tags = Array.isArray(item.data?.tags) ? item.data.tags : []
          if (tags.length) {
            const list = document.createElement("ul")
            list.className = "tags"
            for (const tag of tags.slice(0, 5)) {
              const entry = document.createElement("li")
              const label = document.createElement("p")
              appendHighlighted(label, "#" + tag, item.terms)
              entry.append(label)
              list.append(entry)
            }
            card.append(list)
          }
          const description = document.createElement("p")
          appendHighlighted(description, makeSnippet(item.data?.content, item.terms), item.terms)
          card.append(description)
          card.addEventListener("mouseenter", () => select(index))
          card.addEventListener("focus", () => select(index))
          card.addEventListener("click", event => {
            if (!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) hide(false)
          })
          results.append(card)
        }
        select(0)
      }
      const updateResults = async () => {
        const token = ++generation
        const term = input.value
        clear()
        const current = () => !disposed && token === generation && input.value === term
        status("search-loading", messages.loading)
        try {
          if (!term.trim()) {
            await loadSearchIndex()
            if (current()) clear()
          } else {
            const matches = await findResults(term)
            if (current()) renderResults(matches)
          }
        } catch {
          if (current()) status("search-error", messages.error)
        }
      }
      const show = (tagOnly = false) => {
        if (!container.classList.contains("active")) {
          returnFocus = document.activeElement === document.body ? button : document.activeElement
        }
        container.classList.add("active")
        if (tagOnly) input.value = "#"
        const wasFocused = document.activeElement === input
        input.focus()
        if (wasFocused || tagOnly) void updateResults()
      }
      const onButton = (event) => { event.preventDefault(); show() }
      const onFocus = () => { if (!items.length) void updateResults() }
      const onInput = () => {
        if (input.value.trim()) void updateResults()
        else { generation++; clear() }
      }
      const onKeydown = (event) => {
        if (event.isComposing) return
        if (event.key === "Escape") { event.preventDefault(); hide(); return }
        if (event.target !== input) return
        if (items.length && ["ArrowUp", "ArrowDown", "Tab"].includes(event.key)) {
          event.preventDefault()
          select(selected + (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey) ? -1 : 1))
        } else if (event.key === "Enter" && items[selected]) {
          event.preventDefault()
          results.querySelectorAll(".result-card")[selected]?.click()
        }
      }
      const onBackdrop = (event) => { if (event.target === container) hide() }
      const onShortcut = event => {
        if (event.isComposing || event.key.toLowerCase() !== "k" || (!event.ctrlKey && !event.metaKey)) return
        event.preventDefault()
        if (event.shiftKey) show(true)
        else if (container.classList.contains("active")) hide()
        else show()
      }
      const onViewport = () => { void updatePreview() }
      button.addEventListener("click", onButton)
      input.addEventListener("focus", onFocus)
      input.addEventListener("input", onInput)
      container.addEventListener("keydown", onKeydown)
      container.addEventListener("click", onBackdrop)
      document.addEventListener("keydown", onShortcut)
      mobile.addEventListener("change", onViewport)
      addCleanup(() => {
        disposed = true
        hide(false)
        button.removeEventListener("click", onButton)
        input.removeEventListener("focus", onFocus)
        input.removeEventListener("input", onInput)
        container.removeEventListener("keydown", onKeydown)
        container.removeEventListener("click", onBackdrop)
        document.removeEventListener("keydown", onShortcut)
        mobile.removeEventListener("change", onViewport)
      })
    }
  }

  const onNavigation = () => { runCleanups(); setupSearch() }
  document.addEventListener("prenav", runCleanups)
  document.addEventListener("nav", onNavigation)
  document.addEventListener("render", onNavigation)
  setupSearch()
}

WheelMakerSearch.afterDOMLoaded = `(${installSearch.toString()})()`
