import { controlButton } from './reader-controls.mjs';

export function initializeCodeBlocks(copy) {
  document.querySelectorAll('.article-body pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const block = document.createElement('div'); block.className = 'code-block';
    const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
    const label = document.createElement('span');
    label.textContent = (pre.dataset.language || [...code.classList].find(name => name.startsWith('language-'))?.slice(9) || 'text').toUpperCase();
    const actions = document.createElement('div'); actions.className = 'code-actions';
    const lines = controlButton('lines', '显示行号'), wrap = controlButton('wrap', '自动换行');
    for (const [button, name] of [[lines, 'code-numbered'], [wrap, 'code-wrapped']]) {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => button.setAttribute('aria-pressed', String(block.classList.toggle(name))));
    }
    lines.hidden = !pre.classList.contains('shiki');
    const button = document.createElement('button'); button.type = 'button'; button.textContent = '复制代码';
    button.addEventListener('click', async () => {
      if (await copy(code.textContent, '代码已复制')) {
        button.textContent = '已复制'; setTimeout(() => { button.textContent = '复制代码'; }, 2200);
      }
    });
    actions.append(lines, wrap, button); toolbar.append(label, actions);
    pre.before(block); block.append(toolbar, pre);
  });
}
