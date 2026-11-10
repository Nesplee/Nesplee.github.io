import { pickLang, applyLang } from './i18n.js?v=f9c94eb668';
import { revealContact } from './contact.js?v=f9c94eb668';
import { mountLine } from './line.js?v=f9c94eb668';
import { STRINGS } from './strings.js?v=f9c94eb668';

// GitHub Pages cannot send frame-ancestors / X-Frame-Options: refuse to be shown inside another site's frame
try { if (window.top !== window.self && window.top.location.origin !== location.origin) throw 0; } catch { document.documentElement.hidden = true; }

if (new URLSearchParams(location.search).get('police') === 'libre') document.documentElement.classList.add('free-font');

let storage = null;
try { storage = window.localStorage; } catch { /* blocked: language just won't be remembered */ }

let lang = pickLang(navigator.language, storage);
const listeners = [];
export const onLangChange = (fn) => listeners.push(fn);
export const currentLang = () => lang;
export const t = (key) => STRINGS[lang][key] ?? '';

function setLang(next) {
  lang = next;
  applyLang(document, lang, STRINGS);
  document.getElementById('lang-toggle').lang = lang === 'fr' ? 'en' : 'fr';
  listeners.forEach((fn) => fn(lang));
}
setLang(lang);

document.getElementById('lang-toggle').addEventListener('click', () => {
  setLang(lang === 'fr' ? 'en' : 'fr');
  try { storage?.setItem('lang', lang); } catch { /* ignore */ }
});

mountLine(document.querySelector('main.page'), document.getElementById('fill'), [...document.querySelectorAll('section.stop')]);

const reveal = document.getElementById('contact-reveal');
reveal.hidden = false;
reveal.addEventListener('click', () => {
  const { email, phone, phoneHref } = revealContact();
  const mail = Object.assign(document.createElement('a'), { href: 'mailto:' + email, textContent: email });
  const tel = Object.assign(document.createElement('a'), { href: phoneHref, textContent: phone });
  const box = document.createElement('p');
  box.className = 'revealed';
  box.append(mail, document.createElement('br'), tel);
  reveal.replaceWith(box);
  mail.focus();
});

// Station visuals are loaded lazily, each in its own module (see stations.js).
import('./stations.js?v=f9c94eb668').then((m) => m.mountStations({ t, onLangChange, currentLang })).catch(() => {});

// certificates block: the big number counts up once, when it comes into view
const counter = document.querySelector('[data-count]');
if (counter && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const end = Number(counter.dataset.count);
  counter.textContent = '0';
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    const t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 1200); counter.textContent = String(Math.round(end * (1 - (1 - k) ** 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, { threshold: 0.5 }).observe(counter);
}
