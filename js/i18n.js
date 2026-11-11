const LANGS = ['fr', 'en'];

export function pickLang(navLang, storage) {
  try {
    const stored = storage?.getItem('lang');
    if (LANGS.includes(stored)) return stored;
  } catch { /* storage blocked (private mode): fall back to the browser language */ }
  return String(navLang ?? '').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

// **x** marks bold text inside long texts: [[bold, text], ...]
export const splitBold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => [i % 2 === 1, part]).filter(([, part]) => part);

// data-i18n: plain text; data-i18n-html: long text, rendered as escaped <p> paragraphs.
export function applyLang(root, lang, strings) {
  const dict = strings[lang];
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = dict[el.dataset.i18n] ?? '';
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    el.replaceChildren(...(dict[el.dataset.i18nHtml] ?? '').split('\n\n').map((t) => {
      const p = root.createElement('p');
      // **x** becomes <b>x</b>; built from text nodes, never parsed as HTML
      for (const [bold, part] of splitBold(t)) {
        if (bold) { const b = root.createElement('b'); b.textContent = part; p.append(b); } else p.append(part);
      }
      return p;
    }));
  }
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', dict[el.dataset.i18nAria] ?? '');
  root.documentElement.lang = lang;
}
