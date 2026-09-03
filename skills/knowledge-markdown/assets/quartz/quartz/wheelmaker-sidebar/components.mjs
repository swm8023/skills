import { h } from "preact"

export const KnowledgeSidebarSwitch = () => {
  const Component = () =>
    h("div", { class: "knowledge-sidebar-switch", role: "tablist", "aria-label": "侧栏分类" }, [
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button active",
          "data-knowledge-view": "directory",
          role: "tab",
          "aria-selected": "true",
        },
        "目录",
      ),
      h(
        "button",
        {
          type: "button",
          class: "knowledge-sidebar-button",
          "data-knowledge-view": "tags",
          role: "tab",
          "aria-selected": "false",
        },
        "Tags",
      ),
    ])

  Component.css = `
.knowledge-sidebar-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  margin: 0.75rem 0;
  padding: 0.2rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.35rem;
}

.knowledge-sidebar-button {
  border: 0;
  border-radius: 0.25rem;
  padding: 0.35rem 0.45rem;
  background: transparent;
  color: var(--darkgray);
  cursor: pointer;
  font-size: 0.8rem;
}

.knowledge-sidebar-button.active,
.knowledge-sidebar-button:hover {
  background: var(--highlight);
  color: var(--dark);
}

.knowledge-tags-sidebar {
  display: none;
}

.knowledge-tags-sidebar[data-knowledge-visible="true"] {
  display: block;
}

.explorer[data-knowledge-visible="false"] {
  display: none;
}
`

  Component.afterDOMLoaded = `
(() => {
  const root = document.querySelector(".knowledge-sidebar-switch")
  if (!root) return
  const buttons = [...root.querySelectorAll("[data-knowledge-view]")]
  const directory = document.querySelector(".explorer")
  const tags = document.querySelector(".knowledge-tags-sidebar")
  if (!directory || !tags) return
  const storageKey = "wheelmaker-knowledge-sidebar-view"
  const setView = (view) => {
    const useTags = view === "tags"
    directory.dataset.knowledgeVisible = String(!useTags)
    tags.dataset.knowledgeVisible = String(useTags)
    directory.setAttribute("aria-hidden", String(useTags))
    tags.setAttribute("aria-hidden", String(!useTags))
    buttons.forEach((button) => {
      const active = button.dataset.knowledgeView === (useTags ? "tags" : "directory")
      button.classList.toggle("active", active)
      button.setAttribute("aria-selected", String(active))
    })
    try { localStorage.setItem(storageKey, useTags ? "tags" : "directory") } catch {}
  }
  buttons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.knowledgeView)))
  let initial = "directory"
  try { initial = localStorage.getItem(storageKey) === "tags" ? "tags" : "directory" } catch {}
  setView(initial)
})()
`

  return Component
}
