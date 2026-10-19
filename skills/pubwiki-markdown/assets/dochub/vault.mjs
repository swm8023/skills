import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { marked } from 'marked';

export function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}
export async function regularFiles(root, prefix = '') {
  const result = [];
  for (const entry of (await readdir(path.join(root, prefix), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.')) continue;
    const relative = path.posix.join(prefix, entry.name);
    const info = await lstat(path.join(root, relative));
    if (info.isSymbolicLink()) throw new Error(`Vault links are not allowed: ${relative}`);
    if (info.isDirectory()) result.push(...await regularFiles(root, relative));
    else if (info.isFile()) result.push(relative);
    else throw new Error(`Unsupported Vault file: ${relative}`);
  }
  return result;
}
export function splitNote(source) {
  const match = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source);
  if (!match) return { properties: {}, body: source };
  const properties = parse(match[1]) ?? {};
  if (typeof properties !== 'object' || Array.isArray(properties)) throw new Error('Invalid note frontmatter');
  return { properties, body: source.slice(match[0].length) };
}
export const encodedPath = value => value.split('/').map(encodeURIComponent).join('/');
export const headingSlug = value => String(value).normalize('NFC').toLocaleLowerCase('en-US')
  .replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/gu, '').slice(0, 100) || 'heading';
export function anchor(value) {
  const text = decodeURIComponent(value || '');
  return text ? `#${text.startsWith('^') ? 'block-' + text.slice(1) : 'section-' + headingSlug(text)}` : '';
}

export async function loadVault(input, prefix) {
  const content = path.join(input, 'content');
  if ((await lstat(content)).isSymbolicLink()) throw new Error('Vault content must be a regular directory');
  const filenames = await regularFiles(content);
  const notes = [];
  for (const filename of filenames.filter(name => /\.md$/i.test(name) && !name.startsWith('assets/'))) {
    const { properties, body } = splitNote(await readFile(path.join(content, filename), 'utf8'));
    if (properties.draft === true || properties.draft === 'true' || properties.deleted_at) continue;
    const slug = filename.replace(/\.md$/i, '');
    const inlineTags = [];
    marked.walkTokens(marked.lexer(body), token => {
      if (token.type === 'text' && !token.tokens)
        inlineTags.push(...[...token.text.matchAll(/(?:^|\s)#([\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*)/gu)].map(match => match[1]));
    });
    const tags = [...new Set([
      ...(Array.isArray(properties.tags) ? properties.tags : typeof properties.tags === 'string' ? [properties.tags] : []),
      ...inlineTags
    ].filter(value => typeof value === 'string').map(value => value.replace(/^#+/, '')))];
    notes.push({ filename, slug, body, properties,
      document_id: `doc_${createHash('sha256').update(filename).digest('hex').slice(0, 32)}`,
      title: String(properties.title || path.posix.basename(slug)),
      description: typeof properties.description === 'string' ? properties.description : '',
      author: typeof properties.author === 'string' ? properties.author : '',
      date: properties.date instanceof Date ? properties.date.toISOString().slice(0, 10) : properties.date ?? '',
      directory: path.posix.dirname(filename) === '.' ? '' : path.posix.dirname(filename), tags,
      url: `${prefix}/${encodedPath(slug)}.html` });
  }
  const lookup = new Map();
  for (const note of notes) {
    for (const key of new Set([note.slug, path.posix.basename(note.slug), note.title,
      ...(Array.isArray(note.properties.aliases) ? note.properties.aliases : typeof note.properties.aliases === 'string' ? [note.properties.aliases] : [])])) {
      if (typeof key !== 'string') continue;
      const normalized = key.normalize('NFC').toLowerCase();
      if (!lookup.has(normalized)) lookup.set(normalized, new Set());
      lookup.get(normalized).add(note);
    }
  }
  const resolveNote = (target, from) => {
    const clean = decodeURIComponent(target).replace(/\.md$/i, '').replace(/^content\//, '');
    const relative = path.posix.normalize(path.posix.join(path.posix.dirname(from.filename), clean));
    const exact = notes.find(note => note.slug === relative) ?? notes.find(note => note.slug === clean);
    if (exact) return exact;
    const matches = lookup.get(clean.normalize('NFC').toLowerCase());
    return matches?.size === 1 ? [...matches][0] : null;
  };
  const assets = new Map();
  const resolveAsset = async (target, from) => {
    const clean = decodeURIComponent(target).replace(/[?#].*$/, '').replace(/^content\//, '');
    if (path.isAbsolute(clean) || clean.includes('\\')) throw new Error(`Asset escapes the Vault: ${target}`);
    const options = [path.posix.normalize(path.posix.join(path.posix.dirname(from.filename), clean)), clean];
    let selected = options.find(name => filenames.includes(name));
    if (!selected) {
      const matches = filenames.filter(name => !/\.md$/i.test(name) && path.posix.basename(name) === clean);
      if (matches.length === 1) selected = matches[0];
    }
    if (!selected || !inside(content, path.resolve(content, selected)) || /\.md$/i.test(selected))
      throw new Error(`Missing, ambiguous or outside Vault asset: ${target} (${from.filename})`);
    const file = path.resolve(content, selected);
    if (!inside(content, await realpath(file))) throw new Error(`Asset escapes the Vault: ${target}`);
    if (!assets.has(selected)) {
      const bytes = await readFile(file);
      const name = `${createHash('sha256').update(bytes).digest('hex').slice(0, 20)}${path.extname(selected).toLowerCase()}`;
      assets.set(selected, { name, bytes, url: `${prefix}/static/assets/${name}` });
    }
    return assets.get(selected).url;
  };
  return { notes, assets, resolveNote, resolveAsset };
}

export async function prepareMarkdown(note, vault, diagnostics, ancestors = []) {
  const identity = note.filename + ':' + createHash('sha256').update(note.body).digest('hex');
  if (ancestors.includes(identity) || ancestors.length > 8) throw new Error(`Circular or excessive note embed: ${note.filename}`);
  const rewrite = async line => {
    const matches = [...line.matchAll(/(!?)\[\[([^\]]+)\]\]|(!?)\[([^\]]*)\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)];
    let output = '', last = 0;
    for (const match of matches) {
      output += line.slice(last, match.index);
      const wiki = match[2] !== undefined;
      const [target, alias] = wiki ? match[2].split('|') : [match[5].replace(/^<|>$/g, ''), match[4]];
      const embedded = (wiki ? match[1] : match[3]) === '!';
      if (/^(?:https?:|mailto:|data:|javascript:)/i.test(target)) {
        output += match[0]; last = match.index + match[0].length; continue;
      }
      const [destination, fragment] = target.split('#');
      const linked = destination ? vault.resolveNote(destination, note) : note;
      if (linked) {
        if (embedded) {
          let embeddedNote = linked;
          if (fragment) {
            if (fragment.startsWith('^')) {
              const block = linked.body.split(/\n\s*\n/).find(part => part.trimEnd().endsWith(fragment));
              if (block) embeddedNote = { ...linked, body: block.slice(0, block.lastIndexOf(fragment)).trimEnd() };
              else diagnostics.push(`Unresolved embedded block: ${target} (${note.filename})`);
            } else {
              const headings = [...linked.body.matchAll(/^(#{1,6})\s+(.+)$/gm)];
              const found = headings.findIndex(item => headingSlug(item[2]) === headingSlug(fragment));
              if (found >= 0) {
                const next = headings.slice(found + 1).find(item => item[1].length <= headings[found][1].length);
                embeddedNote = { ...linked, body: linked.body.slice(headings[found].index, next?.index) };
              } else diagnostics.push(`Unresolved embedded heading: ${target} (${note.filename})`);
            }
          }
          output += '\n\n' + await prepareMarkdown(embeddedNote, vault, diagnostics, [...ancestors, identity]) + '\n\n';
        } else output += `[${alias || destination || fragment}](${linked.url}${anchor(fragment)})`;
      } else if (embedded || /\.[a-z0-9]{1,10}(?:[?#]|$)/i.test(target) && !/\.md(?:#|$)/i.test(target)) {
        const url = await vault.resolveAsset(target, note);
        output += `${embedded ? '!' : ''}[${alias || path.posix.basename(destination)}](${url})`;
      } else {
        diagnostics.push(`Unresolved note link: ${target} (${note.filename})`);
        output += alias || destination;
      }
      last = match.index + match[0].length;
    }
    return output + line.slice(last);
  };
  let fenced = false, fence = '', result = [];
  for (const line of note.body.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fenced) { fenced = true; fence = marker[0]; }
      else if (marker[0] === fence) fenced = false;
      result.push(line); continue;
    }
    if (fenced) { result.push(line); continue; }
    const parts = line.split(/(`+[^`]*`+)/g);
    result.push((await Promise.all(parts.map((part, i) => i % 2 ? part : rewrite(part)))).join(''));
  }
  return result.join('\n');
}
