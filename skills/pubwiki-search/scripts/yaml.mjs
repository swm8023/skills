#!/usr/bin/env node

function errorAt(filename, line, message) {
  throw new Error(`${filename} line ${line}: ${message}`);
}

function isEscaped(source, index) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}

function stripComment(source) {
  let quote = '';
  const stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && (quote !== '"' || !isEscaped(source, index))) {
        if (quote === "'" && source[index + 1] === "'") index += 1;
        else quote = '';
      }
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === '[' || character === '{') { stack.push(character); continue; }
    if (character === ']' || character === '}') {
      const expected = character === ']' ? '[' : '{';
      if (stack.pop() !== expected) throw new Error(`unbalanced YAML flow delimiter ${character}`);
      continue;
    }
    if (character === '#' && (index === 0 || /\s/u.test(source[index - 1])) && stack.length === 0) return source.slice(0, index).trimEnd();
  }
  if (quote) throw new Error('unterminated YAML quote');
  if (stack.length) throw new Error('unterminated YAML flow collection');
  return source.trimEnd();
}

function splitTopLevel(source, separator = ',') {
  const values = [];
  let start = 0;
  let quote = '';
  const stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && (quote !== '"' || !isEscaped(source, index))) {
        if (quote === "'" && source[index + 1] === "'") index += 1;
        else quote = '';
      }
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[' || character === '{') stack.push(character);
    else if (character === ']' || character === '}') {
      const expected = character === ']' ? '[' : '{';
      if (stack.pop() !== expected) throw new Error(`unbalanced YAML flow delimiter ${character}`);
    } else if (character === separator && stack.length === 0) {
      values.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (quote) throw new Error('unterminated YAML quote');
  if (stack.length) throw new Error('unterminated YAML flow collection');
  values.push(source.slice(start).trim());
  return values;
}

function splitMapping(source, { flow = false } = {}) {
  let quote = '';
  const stack = [];
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && (quote !== '"' || !isEscaped(source, index))) {
        if (quote === "'" && source[index + 1] === "'") index += 1;
        else quote = '';
      }
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[' || character === '{') stack.push(character);
    else if (character === ']' || character === '}') {
      const expected = character === ']' ? '[' : '{';
      if (stack.pop() !== expected) throw new Error(`unbalanced YAML flow delimiter ${character}`);
    } else if (character === ':' && stack.length === 0 && (flow || index + 1 === source.length || /\s/u.test(source[index + 1]))) {
      const key = source.slice(0, index).trim();
      if (key) return { key, value: source.slice(index + 1).trim() };
    }
  }
  if (quote) throw new Error('unterminated YAML quote');
  if (stack.length) throw new Error('unterminated YAML flow collection');
  return null;
}

function parseKey(source) {
  const key = parseScalar(source);
  if (key === null || key === undefined || typeof key === 'object') throw new Error('YAML mapping keys must be scalar values');
  return String(key);
}

function parseScalar(source) {
  const value = stripComment(String(source || '').trim());
  if (value === '' || value === 'null' || value === '~') return null;
  if (/^(?:true|false)$/iu.test(value)) return value.toLowerCase() === 'true';
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(value)) return Number(value);
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || isEscaped(value, value.length - 1)) throw new Error('unterminated YAML double-quoted scalar');
    try { return JSON.parse(value); } catch (error) { throw new Error(`invalid YAML double-quoted scalar: ${error.message}`); }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) throw new Error('unterminated YAML single-quoted scalar');
    return value.slice(1, -1).replace(/''/gu, "'");
  }
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new Error('unterminated YAML sequence');
    const inner = value.slice(1, -1).trim();
    return inner ? splitTopLevel(inner).map(parseScalar) : [];
  }
  if (value.startsWith('{')) {
    if (!value.endsWith('}')) throw new Error('unterminated YAML mapping');
    const result = {};
    const inner = value.slice(1, -1).trim();
    if (!inner) return result;
    for (const entry of splitTopLevel(inner)) {
      const pair = splitMapping(entry, { flow: true });
      if (!pair) throw new Error(`invalid YAML flow mapping entry: ${entry}`);
      const key = parseKey(pair.key);
      if (Object.prototype.hasOwnProperty.call(result, key)) throw new Error(`duplicate YAML key: ${key}`);
      result[key] = parseScalar(pair.value);
    }
    return result;
  }
  if (/[\[\]{}]/u.test(value)) throw new Error(`invalid YAML scalar: ${value}`);
  return value;
}

function tokenize(source, filename) {
  return String(source || '').replace(/^\uFEFF/u, '').split(/\r?\n/u).map((raw, index) => {
    if (/\t/u.test(raw)) errorAt(filename, index + 1, 'tabs are not allowed for YAML indentation');
    const uncommented = stripComment(raw);
    const text = uncommented.trim();
    return { raw, line: index + 1, indent: uncommented.length - uncommented.trimStart().length, text, blank: text === '' };
  });
}

function nextMeaningful(lines, start) {
  let index = start;
  while (index < lines.length && lines[index].blank) index += 1;
  return index;
}

function blockScalar(lines, start, parentIndent, folded, chomping) {
  let index = start;
  let blockIndent = null;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.blank) {
      if (line.indent <= parentIndent) break;
      blockIndent ??= line.indent;
    }
    index += 1;
  }
  if (blockIndent === null) return ['', index];
  const values = [];
  for (let cursor = start; cursor < index; cursor += 1) values.push(lines[cursor].blank ? '' : lines[cursor].raw.slice(Math.min(blockIndent, lines[cursor].raw.length)));
  let result = folded ? values.join('\n').replace(/([^\n])\n([^\n])/gu, '$1 $2') : values.join('\n');
  if (chomping !== '-') result += '\n';
  if (chomping === '+') result += '\n';
  return [result, index];
}

function parseBlock(lines, start, indent, filename) {
  let index = nextMeaningful(lines, start);
  if (index >= lines.length || lines[index].indent < indent) return [null, index];
  if (lines[index].indent !== indent) errorAt(filename, lines[index].line, 'unexpected YAML indentation');
  const array = lines[index].text === '-' || lines[index].text.startsWith('- ');
  const result = array ? [] : {};
  while (true) {
    index = nextMeaningful(lines, index);
    if (index >= lines.length || lines[index].indent < indent) break;
    const line = lines[index];
    if (line.indent > indent) errorAt(filename, line.line, 'unexpected YAML indentation');
    const sequence = line.text === '-' || line.text.startsWith('- ');
    if (sequence !== array) errorAt(filename, line.line, 'cannot mix YAML sequence and mapping entries');
    if (array) {
      const rest = line.text.slice(1).trim();
      index += 1;
      if (!rest) {
        const child = nextMeaningful(lines, index);
        if (child < lines.length && lines[child].indent > indent) {
          const [value, next] = parseBlock(lines, child, lines[child].indent, filename);
          result.push(value); index = next;
        } else result.push(null);
        continue;
      }
      const pair = splitMapping(rest);
      if (!pair) {
        result.push(parseScalar(rest));
        const child = nextMeaningful(lines, index);
        if (child < lines.length && lines[child].indent > indent) errorAt(filename, lines[child].line, 'a scalar YAML item cannot have nested entries');
        continue;
      }
      const item = {};
      const key = parseKey(pair.key);
      item[key] = parseEntryValue(lines, index, indent, pair.value, filename, (next) => { index = next; }, true);
      let child = nextMeaningful(lines, index);
      if (child < lines.length && lines[child].indent > indent) {
        const continuationIndent = lines[child].indent;
        while (true) {
          child = nextMeaningful(lines, index);
          if (child >= lines.length || lines[child].indent < continuationIndent) break;
          if (lines[child].indent > continuationIndent) errorAt(filename, lines[child].line, 'unexpected YAML indentation');
          const continuation = splitMapping(lines[child].text);
          if (!continuation) errorAt(filename, lines[child].line, 'expected a YAML mapping entry');
          const continuationKey = parseKey(continuation.key);
          if (Object.prototype.hasOwnProperty.call(item, continuationKey)) errorAt(filename, lines[child].line, `duplicate YAML key: ${continuationKey}`);
          index = child + 1;
          item[continuationKey] = parseEntryValue(lines, index, continuationIndent, continuation.value, filename, (next) => { index = next; });
        }
      }
      result.push(item);
      continue;
    }
    const pair = splitMapping(line.text);
    if (!pair) errorAt(filename, line.line, 'expected a YAML mapping entry');
    const key = parseKey(pair.key);
    if (Object.prototype.hasOwnProperty.call(result, key)) errorAt(filename, line.line, `duplicate YAML key: ${key}`);
    index += 1;
    result[key] = parseEntryValue(lines, index, indent, pair.value, filename, (next) => { index = next; });
  }
  return [result, index];
}

function parseEntryValue(lines, start, parentIndent, rawValue, filename, setIndex, allowContinuation = false) {
  const value = stripComment(rawValue.trim());
  if (/^[|>][+-]?[1-9]?$/u.test(value)) {
    const [parsed, next] = blockScalar(lines, start, parentIndent, value[0] === '>', value.includes('-') ? '-' : (value.includes('+') ? '+' : ''));
    setIndex(next); return parsed;
  }
  if (value !== '') {
    const parsed = parseScalar(value);
    const child = nextMeaningful(lines, start);
    if (!allowContinuation && child < lines.length && lines[child].indent > parentIndent) errorAt(filename, lines[child].line, 'a scalar YAML value cannot have nested entries');
    return parsed;
  }
  const child = nextMeaningful(lines, start);
  if (child < lines.length && lines[child].indent > parentIndent) {
    const [parsed, next] = parseBlock(lines, child, lines[child].indent, filename);
    setIndex(next); return parsed;
  }
  return null;
}

export function parseYamlDocument(source, filename = 'YAML') {
  const lines = tokenize(source, filename);
  const first = nextMeaningful(lines, 0);
  if (first >= lines.length) return null;
  const [value, next] = parseBlock(lines, first, lines[first].indent, filename);
  const trailing = nextMeaningful(lines, next);
  if (trailing < lines.length && lines[trailing].text !== '...') errorAt(filename, lines[trailing].line, 'unexpected YAML content');
  return value;
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be a YAML mapping`);
}

function assertRelativePath(value, label) {
  if (value === undefined) return;
  if (typeof value !== 'string' || !value.trim() || value.includes('\0') || value.startsWith('/') || /^[A-Za-z]:[\\/]/u.test(value)) throw new Error(`${label} must be a relative path`);
  const normalized = value.replace(/\\/gu, '/');
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) throw new Error(`${label} cannot escape the data directory`);
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  if (!value.trim()) throw new Error(`${label} must be non-empty`);
}

export function parseWikiConfig(source, filename = 'wiki.config.yaml') {
  const config = parseYamlDocument(source, filename) ?? {};
  assertObject(config, `${filename} root`);
  if (config.version !== undefined && !((typeof config.version === 'number' && Number.isInteger(config.version)) || typeof config.version === 'string')) throw new Error(`${filename} version must be a scalar`);
  if (config.content !== undefined) {
    assertObject(config.content, `${filename} content`);
    assertRelativePath(config.content.root, `${filename} content.root`);
    assertRelativePath(config.content.assets, `${filename} content.assets`);
    for (const key of ['repo', 'directories', 'tags']) if (config.content[key] !== undefined) assertObject(config.content[key], `${filename} content.${key}`);
  }
  if (config.site !== undefined) {
    assertObject(config.site, `${filename} site`);
    if (config.site.title !== undefined) assertNonEmptyString(config.site.title, `${filename} site.title`);
    if (config.site.description !== undefined) assertNonEmptyString(config.site.description, `${filename} site.description`);
  }
  if (config.publish !== undefined && typeof config.publish !== 'boolean') assertObject(config.publish, `${filename} publish`);
  const publish = typeof config.publish === 'object' && config.publish !== null ? config.publish : {};
  if (publish.mode !== undefined && typeof publish.mode !== 'string' && typeof publish.mode !== 'boolean') throw new Error(`${filename} publish.mode must be a string or boolean`);
  if (typeof publish.mode === 'string' && !['auto', 'manual', 'off', 'disabled', 'false'].includes(publish.mode.toLowerCase())) throw new Error(`${filename} publish.mode has unsupported value: ${publish.mode}`);
  if (publish.git !== undefined) assertObject(publish.git, `${filename} publish.git`);
  return config;
}
