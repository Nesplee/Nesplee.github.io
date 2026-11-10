// Tiny SVG builder shared by the data visuals.
export const NS = 'http://www.w3.org/2000/svg';

export function el(parent, name, attrs = {}, text) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text != null) e.textContent = text;
  parent.appendChild(e);
  return e;
}

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fmtEUR = (v, lang) => new Intl.NumberFormat(lang === 'fr' ? 'fr-CH' : 'en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
export const fmtPct = (v) => `${v > 0 ? '+' : ''}${Math.round(v * 100)} %`;
export const fmtDate = (d, lang) => new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CH' : 'en-GB', { day: 'numeric', month: 'short' }).format(new Date(d + 'T00:00:00Z'));
