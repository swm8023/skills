import { createHighlighterCore } from '@shikijs/core';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
import { languageNames, languageAliasNames } from '@shikijs/langs';
import dark from '@shikijs/themes/dark-plus';
import light from '@shikijs/themes/light-plus';

// Independent copy of WheelMaker's Shiki engine and adaptive export themes.
const supported = new Set([...languageNames, ...languageAliasNames]);
let highlighterPromise;
const decode = text => text.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) =>
  ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity]);

export async function highlightCodeBlocks(html) {
  const blocks = [...html.matchAll(/<pre><code(?: class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g)];
  if (!blocks.length) return html;
  highlighterPromise ??= createHighlighterCore({ engine: createJavaScriptRegexEngine(), themes: [dark, light], langs: [] });
  const highlighter = await highlighterPromise;
  const languages = new Set(blocks.map(match => decode(match[1] || '').toLowerCase()));
  for (const language of languages) {
    if (supported.has(language) && !highlighter.getLoadedLanguages().includes(language))
      await highlighter.loadLanguage((await import(`@shikijs/langs/${language}`)).default);
  }
  let result = '', end = 0;
  for (const match of blocks) {
    const language = decode(match[1] || 'text').toLowerCase();
    const source = decode(match[2]).replace(/\n$/, '');
    const highlighted = highlighter.codeToHtml(source, {
      lang: supported.has(language) ? language : 'text',
      themes: { light: 'light-plus', dark: 'dark-plus' }, defaultColor: false,
      transformers: [{ name: 'pubwiki-code', pre(node) { node.properties['data-language'] = language; } }],
    });
    result += html.slice(end, match.index) + highlighted;
    end = match.index + match[0].length;
  }
  return result + html.slice(end);
}
