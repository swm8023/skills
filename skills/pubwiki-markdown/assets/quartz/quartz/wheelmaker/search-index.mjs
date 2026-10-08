import { createHash } from "node:crypto"

// Character postings preserve short/CJK queries; ASCII trigrams narrow longer
// code and English queries. Candidates are verified against original text.
export function buildSearchIndex(records) {
  const documents = [], postings = Object.create(null), texts = Object.create(null)
  for (const [slug, record] of Object.entries(records)) {
    const content = String(record.content || "")
    const digest = content ? createHash("sha256").update(content).digest("hex") : null
    const id = documents.length
    documents.push({ slug, title: record.title || "", tags: record.tags || [], ...(digest ? { text: `static/search-text/${digest}.json` } : {}) })
    if (digest) texts[`static/search-text/${digest}.json`] = { content }
    const lower = content.toLocaleLowerCase(), grams = new Set([...lower].map(char => "c" + char))
    for (let i = 0; i < lower.length - 2; i++) {
      const gram = lower.slice(i, i + 3)
      if (/^[\x00-\x7f]{3}$/.test(gram)) grams.add("t" + gram)
    }
    for (const gram of grams) (postings[gram] ||= []).push(id)
  }
  return { index: { version: 2, documents, postings }, texts }
}

// Serialized into the browser bundle with no Node dependencies.
export function searchCandidates(index, terms, tagOnly = false) {
  const postingSets = terms.map(term => {
    const grams = new Set([...term].map(char => "c" + char))
    for (let i = 0; i < term.length - 2; i++) {
      const gram = term.slice(i, i + 3)
      if (/^[\x00-\x7f]{3}$/.test(gram)) grams.add("t" + gram)
    }
    const sets = [...grams].map(gram => index.postings[gram] || []).sort((a, b) => a.length - b.length)
    return new Set((sets[0] || []).filter(id => sets.every(ids => ids.includes(id))))
  })
  return index.documents.map((document, id) => ({ document, id })).filter(({ document, id }) => {
    const title = String(document.title || "").toLocaleLowerCase()
    const tags = (document.tags || []).join(" ").toLocaleLowerCase()
    return terms.every((term, i) => tagOnly ? tags.includes(term)
      : title.includes(term) || tags.includes(term) || postingSets[i].has(id))
  }).map(({ document }) => document)
}
