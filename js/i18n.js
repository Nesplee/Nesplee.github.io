const LANGS = ['fr', 'en'];

export function pickLang(navLang, storage) {
  try {
    const stored = storage?.getItem('lang');
    if (LANGS.includes(stored)) return stored;
  } catch { /* storage blocked (private mode): fall back to the browser language */ }
  return String(navLang ?? '').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

// data-i18n: plain text; data-i18n-html: long text, rendered as escaped <p> paragraphs.
export function applyLang(root, lang, strings) {
  const dict = strings[lang];
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = dict[el.dataset.i18n] ?? '';
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    el.replaceChildren(...(dict[el.dataset.i18nHtml] ?? '').split('\n\n').map((t) => {
      const p = root.createElement('p');
      p.textContent = t;
      return p;
    }));
  }
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', dict[el.dataset.i18nAria] ?? '');
  root.documentElement.lang = lang;
}
