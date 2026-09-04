#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { normalizeRelativePath, parseYamlDocument } from './pubwiki-core.mjs';
import { pathToFileURL } from 'node:url';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/u;

export function parseFrontmatter(source, filename = 'note.md') {
  const normalized = String(source || '').replace(/^\uFEFF/u, '').replace(/\r\n/gu, '\n');
  if (!normalized.startsWith('---\n')) return { metadata: {}, body: normalized, hasFrontmatter: false };
  const boundary = normalized.indexOf('\n---\n', 4);
  if (boundary < 0) throw new Error(`${filename}: unterminated YAML frontmatter`);
  const raw = normalized.slice(4, boundary);
  const metadata = parseYamlDocument(raw, `${filename} frontmatter`) ?? {};
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error(`${filename}: frontmatter must be an object`);
  return {
    metadata,
    body: normalized.slice(boundary + '\n---\n'.length).replace(/^\n/u, ''),
    hasFrontmatter: true,
  };
}

function normalizeTag(value) {
  if (typeof value !== 'string') return '';
  let tag = value.trim().replace(/^#+/u, '').replace(/\\/gu, '/');
  tag = tag.replace(/^\/|\/$/gu, '').replace(/\s+/gu, '-');
  tag = tag.replace(/[^\p{Letter}\p{Number}_./-]/gu, '');
  return tag;
}

function tagValues(value) {
  if (Array.isArray(value)) return value.flatMap(tagValues);
  if (typeof value === 'string') return value.split(/[,\n]/u).map(normalizeTag).filter(Boolean);
  return [];
}

function bodyWithoutCode(markdown) {
  return String(markdown || '').replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1\s*$/gmu, '');
}

export function collectTags(metadata = {}, body = '') {
  const tags = [];
  const seen = new Set();
  const add = (value) => {
    const tag = normalizeTag(value);
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  };
  for (const tag of tagValues(metadata.tags)) add(tag);
  const text = bodyWithoutCode(body);
  for (const match of text.matchAll(/(?:^|\s)#([^\s#.,;!?()[\]{}<>]+)/gmu)) add(match[1]);
  return tags;
}

function extractSummary(source) {
  const normalized = String(source || '').replace(/^\uFEFF/u).replace(/\r\n/gu, '\n');
  const lines = normalized.split('\n');
  const match = lines[0].match(/^>\s*摘要：\s*(.*?)\s*$/u);
  if (!match) return { summary: '', source: normalized, removed: false };
  return { summary: match[1].trim(), source: lines.slice(1).join('\n').replace(/^\n+/u, ''), removed: true };
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function scalarYaml(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const text = String(value);
  if (text !== text.trim() || text === '' || /^(?:null|true|false|~)$/iu.test(text)
    || /^[-+]?\d(?:[\d.]*)$/u.test(text) || /[:#[\],{}&*!|>'"%@`]/u.test(text)) {
    return JSON.stringify(text);
  }
  return text;
}

function yamlValue(value, indent = '') {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))) {
      return `[${value.map(scalarYaml).join(', ')}]`;
    }
    return `\n${value.map((item) => `${indent}- ${yamlValue(item, `${indent}  `)}`).join('\n')}`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (!entries.length) return '{}';
    return `\n${entries.map(([key, item]) => `${indent}${key}: ${yamlValue(item, `${indent}  `)}`).join('\n')}`;
  }
  return scalarYaml(value);
}

const FRONTMATTER_ORDER = ['title', 'description', 'date', 'tags', 'draft'];

export function serializeFrontmatter(metadata) {
  const keys = [...FRONTMATTER_ORDER, ...Object.keys(metadata).filter((key) => !FRONTMATTER_ORDER.includes(key))];
  const lines = [];
  for (const key of keys) {
    if (!Object.hasOwn(metadata, key)) continue;
    if (key === 'aliases' && (!Array.isArray(metadata[key]) || metadata[key].length === 0)) continue;
    lines.push(`${key}: ${yamlValue(metadata[key], '  ')}`);
  }
  return `---\n${lines.join('\n')}\n---`;
}

function titleFromPath(sourcePath, source = '') {
  const heading = String(source || '').match(/^#{1,6}\s+(.+?)\s*#*$/mu);
  if (heading?.[1]) return heading[1].replace(/[\*_`~]/gu, '').trim();
  const base = path.posix.basename(String(sourcePath || '').replace(/\\/gu, '/'), path.posix.extname(String(sourcePath || '').replace(/\\/gu, '/')));
  return base.replace(/[-_]+/gu, ' ').replace(/\b\w/gu, (character) => character.toUpperCase()) || 'Untitled';
}

function englishSlug(title) {
  const slug = String(title || 'note').normalize('NFKD')
    .replace(/[^\x00-\x7F]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  return slug || 'note';
}

function asAliases(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function normalizeRelative(value) {
  return normalizeRelativePath(value);
}

function stripSuffix(value) {
  return value.replace(/\.md$/iu, '');
}

export function buildPathMap(entries = []) {
  const map = new Map();
  const collisions = [];
  const targets = new Map();
  for (const entry of entries) {
    const sourcePath = normalizeRelative(entry.sourcePath);
    const targetPath = normalizeRelative(entry.targetPath);
    if (!sourcePath || !targetPath) continue;
    const existing = targets.get(targetPath);
    if (existing && existing !== sourcePath) collisions.push({ targetPath, sourcePaths: [existing, sourcePath] });
    else targets.set(targetPath, sourcePath);
    map.set(sourcePath, targetPath);
    if (/\.md$/iu.test(sourcePath)) map.set(stripSuffix(sourcePath), targetPath);
  }
  return { map, collisions };
}

function getMapValue(map, key) {
  if (map instanceof Map) return map.get(key);
  return map?.[key];
}

function splitLinkTarget(value) {
  const hash = value.search(/[\^#]/u);
  if (hash < 0) return { path: value, suffix: '' };
  return { path: value.slice(0, hash), suffix: value.slice(hash) };
}

function isExternalTarget(value) {
  return !value || value.startsWith('#') || /^[a-z][a-z\d+.-]*:/iu.test(value) || value.startsWith('//');
}

function mappingFor(rawTarget, sourcePath, map) {
  const target = decodeURIComponent(rawTarget).replace(/\\/gu, '/');
  if (isExternalTarget(target)) return null;
  const candidate = normalizeRelative(path.posix.join(path.posix.dirname(normalizeRelative(sourcePath)), target));
  const candidates = [candidate];
  if (/\.md$/iu.test(candidate)) candidates.push(stripSuffix(candidate));
  else candidates.push(`${candidate}.md`);
  for (const key of candidates) {
    const mapped = getMapValue(map, key);
    if (mapped) return mapped;
  }
  return undefined;
}

function relativeTarget(targetPath, mappedPath, preserveExtension) {
  const relative = path.posix.relative(path.posix.dirname(normalizeRelative(targetPath)), normalizeRelative(mappedPath)) || path.posix.basename(mappedPath);
  const clean = relative.startsWith('.') || relative.startsWith('/') ? relative : `./${relative}`;
  if (!preserveExtension && /\.md$/iu.test(clean)) return clean.slice(0, -3);
  return clean;
}

function rewriteOutsideInlineCode(source, rewrite) {
  let result = '';
  let cursor = 0;
  const codeSpan = /(`+)[\s\S]*?\1/gu;
  for (const match of source.matchAll(codeSpan)) {
    const start = match.index ?? 0;
    result += rewrite(source.slice(cursor, start));
    result += match[0];
    cursor = start + match[0].length;
  }
  return result + rewrite(source.slice(cursor));
}

function rewriteOutsideCode(markdown, rewrite) {
  const lines = String(markdown || '').match(/[^\n]*\n|[^\n]+$/gu) || [];
  let result = '';
  let fence = null;
  for (const line of lines) {
    const content = line.replace(/\n$/u, '');
    const marker = content.match(/^ {0,3}(`{3,}|~{3,})/u)?.[1] || null;
    if (fence) {
      result += line;
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      continue;
    }
    if (marker) {
      result += line;
      fence = marker;
      continue;
    }
    result += rewriteOutsideInlineCode(line, rewrite);
  }
  return result;
}

export function rewriteLinks(markdown, pathMap, { sourcePath = '', targetPath = sourcePath } = {}) {
  const unresolved = [];
  const noteUnresolved = (kind, target) => unresolved.push({ kind, target, sourcePath });
  const rewrite = (segment) => {
    let content = String(segment || '');
    content = content.replace(/(!?)\[\[([^\]]+)\]\]/gu, (whole, embed, inner) => {
      const separator = inner.indexOf('|');
      const raw = separator >= 0 ? inner.slice(0, separator).trim() : inner.trim();
      const alias = separator >= 0 ? inner.slice(separator) : '';
      const split = splitLinkTarget(raw);
      const mapped = mappingFor(split.path, sourcePath, pathMap);
      if (mapped === null) return whole;
      if (!mapped) {
        noteUnresolved(embed ? 'embed' : 'wikilink', raw);
        return whole;
      }
      const preserve = embed && !/\.md$/iu.test(mapped);
      return `${embed ? '!' : ''}[[${relativeTarget(targetPath, mapped, preserve)}${split.suffix}${alias}]]`;
    });
    return content.replace(/(!?\[[^\]]*\])\(([^)]+)\)/gu, (whole, label, rawDestination) => {
      const destination = rawDestination.trim();
      if (destination.startsWith('<') && destination.includes('>')) {
        const close = destination.indexOf('>');
        const target = destination.slice(1, close);
        const rest = destination.slice(close + 1);
        const split = splitLinkTarget(target);
        const mapped = mappingFor(split.path, sourcePath, pathMap);
        if (mapped === null) return whole;
        if (!mapped) {
          noteUnresolved(label.startsWith('!') ? 'asset' : 'markdown', target);
          return whole;
        }
        return `${label}(<${relativeTarget(targetPath, mapped, true)}${split.suffix}>${rest})`;
      }
      const split = splitLinkTarget(destination);
      const mapped = mappingFor(split.path, sourcePath, pathMap);
      if (mapped === null) return whole;
      if (!mapped) {
        noteUnresolved(label.startsWith('!') ? 'asset' : 'markdown', split.path);
        return whole;
      }
      return `${label}(${relativeTarget(targetPath, mapped, true)}${split.suffix})`;
    });
  };
  const content = rewriteOutsideCode(markdown, rewrite);
  return { content, unresolved };
}

export function normalizeNote({
  source = '',
  sourcePath = '',
  targetPath = '',
  title,
  description,
  date,
  tags,
  aliases,
  draft,
} = {}) {
  const summaryResult = extractSummary(source);
  const parsed = parseFrontmatter(summaryResult.source, sourcePath || 'note.md');
  const metadata = { ...parsed.metadata };
  const resolvedTitle = stringValue(title) || stringValue(metadata.title) || titleFromPath(sourcePath, parsed.body);
  const resolvedDate = DATE_RE.test(String(date || ''))
    ? String(date)
    : (DATE_RE.test(String(metadata.date || '')) ? String(metadata.date) : new Date().toISOString().slice(0, 10));
  const existingDescription = stringValue(metadata.description) || stringValue(metadata.summary);
  const resolvedDescription = stringValue(description) || existingDescription || summaryResult.summary;
  const resolvedTags = collectTags({ tags: [...tagValues(metadata.tags), ...tagValues(tags)] }, parsed.body);
  const existingAliases = asAliases(metadata.aliases);
  const resolvedAliases = asAliases(aliases).length ? asAliases(aliases) : existingAliases;
  const resolvedDraft = typeof metadata.draft === 'boolean' ? metadata.draft : Boolean(draft);
  const normalizedMetadata = {
    ...metadata,
    title: resolvedTitle,
    description: resolvedDescription,
    date: resolvedDate,
    tags: resolvedTags,
    draft: resolvedDraft,
  };
  if (resolvedAliases.length) normalizedMetadata.aliases = resolvedAliases;
  else delete normalizedMetadata.aliases;
  const body = parsed.body.replace(/^\n+/u, '').replace(/\s*$/u, '\n');
  const filename = targetPath
    ? path.posix.basename(normalizeRelative(targetPath))
    : (sourcePath ? path.posix.basename(normalizeRelative(sourcePath)) : `${resolvedDate}-${englishSlug(resolvedTitle)}.md`);
  const finalTargetPath = targetPath ? normalizeRelative(targetPath) : filename;
  return {
    metadata: normalizedMetadata,
    frontmatter: serializeFrontmatter(normalizedMetadata),
    body,
    content: `${serializeFrontmatter(normalizedMetadata)}\n\n${body}`,
    filename,
    targetPath: finalTargetPath,
    summary: summaryResult.summary,
    summaryRemoved: summaryResult.removed,
    diagnostics: {
      needsDescription: !resolvedDescription,
      draft: resolvedDraft,
      sourcePath,
      targetPath: finalTargetPath,
    },
  };
}

function parseCli(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (!['--input', '--output', '--title', '--description', '--date'].includes(flag)) throw new Error(`unknown normalizer argument ${flag}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
    values[flag.slice(2)] = value;
    index += 1;
  }
  if (!values.input || !values.output) throw new Error('usage: node normalize-note.mjs --input <source.md> --output <target.md>');
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const values = parseCli(process.argv.slice(2));
    const source = await readFile(values.input, 'utf8');
    const result = normalizeNote({ ...values, source, sourcePath: path.basename(values.input), targetPath: values.output });
    await writeFile(values.output, result.content, 'utf8');
    console.log(JSON.stringify({ targetPath: result.targetPath, metadata: result.metadata, diagnostics: result.diagnostics }, null, 2));
  } catch (error) {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  }
}
