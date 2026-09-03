import { QuartzComponent, QuartzComponentConstructor } from "./types"

const KnowledgeSidebarSwitch: QuartzComponent = () => {
  return (
    <div class="knowledge-sidebar-switch" role="tablist" aria-label="侧栏分类">
      <button type="button" class="knowledge-sidebar-button active" data-knowledge-view="directory" role="tab" aria-selected="true">
        目录
      </button>
      <button type="button" class="knowledge-sidebar-button" data-knowledge-view="tags" role="tab" aria-selected="false">
        Tags
      </button>
    </div>
  )
}

KnowledgeSidebarSwitch.css = `
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

.knowledge-tag-tree,
.knowledge-tag-tree ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.knowledge-tag-tree ul {
  margin-left: 0.8rem;
}

.knowledge-tag-item {
  margin: 0.15rem 0;
}

.knowledge-tag-link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.35rem;
  border-radius: 0.25rem;
  color: var(--darkgray);
  font-size: 0.8rem;
  text-decoration: none;
}

.knowledge-tag-link:hover {
  background: var(--highlight);
  color: var(--dark);
}

.knowledge-tag-count {
  color: var(--gray);
  font-size: 0.7rem;
}
`

KnowledgeSidebarSwitch.afterDOMLoaded = `
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

export default (() => KnowledgeSidebarSwitch) satisfies QuartzComponentConstructor
