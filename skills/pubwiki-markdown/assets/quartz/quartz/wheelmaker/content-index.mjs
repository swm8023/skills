import path from "node:path"
import { mkdir, writeFile } from "node:fs/promises"

function asString(value) {
  return typeof value === "string" ? value : ""
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : []
}

function recordForContent(entry) {
  const data = entry?.[1]?.data ?? {}
  const slug = asString(data.slug)
  if (!slug) return null

  const frontmatter = data.frontmatter && typeof data.frontmatter === "object"
    ? data.frontmatter
    : {}
  const record = {
    slug,
    filePath: asString(data.relativePath),
    title: asString(frontmatter.title),
    links: asStringArray(data.links),
    tags: asStringArray(frontmatter.tags),
    content: asString(data.text),
  }

  if (!record.filePath) delete record.filePath
  return record
}

export function buildIndexes(content = []) {
  const metadata = {}
  const search = {}

  for (const entry of content) {
    const record = recordForContent(entry)
    if (!record) continue

    const { content: fullText, links, filePath, ...searchRecord } = record
    metadata[record.slug] = {
      slug: record.slug,
      ...(filePath ? { filePath } : {}),
      title: record.title,
      links,
      tags: record.tags,
    }
    search[record.slug] = {
      ...searchRecord,
      content: fullText,
    }
  }

  return { metadata, search }
}

async function writeJson(ctx, relativePath, value) {
  const filename = path.join(ctx.argv.output, ...relativePath.split("/"))
  await mkdir(path.dirname(filename), { recursive: true })
  await writeFile(filename, JSON.stringify(value))
  return filename
}

export function WheelMakerContentIndex() {
  const emitIndexes = async (ctx, content) => {
    const { metadata, search } = buildIndexes(content)
    return Promise.all([
      writeJson(ctx, "static/contentIndex.json", metadata),
      writeJson(ctx, "static/searchIndex.json", search),
    ])
  }

  return {
    name: "WheelMakerContentIndex",
    emit: emitIndexes,
    partialEmit: emitIndexes,
  }
}
