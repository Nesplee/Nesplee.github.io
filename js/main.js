import { pickLang, applyLang } from './i18n.js?v=6f1248b217';
import { revealContact } from './contact.js?v=6f1248b217';
import { mountLine } from './line.js?v=6f1248b217';
import { STRINGS } from './strings.js?v=6f1248b217';
import { mountBoard } from './board.js?v=6f1248b217';
import { mountHero } from './hero.js?v=6f1248b217';

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

mountLine(document.querySelector('.rail'), document.getElementById('fill'), [...document.querySelectorAll('section.stop')]);

const reveal = document.getElementById('contact-reveal');
reveal.hidden = false;
reveal.addEventListener('click', () => {
  const { email } = revealContact();
  const mail = Object.assign(document.createElement('a'), { href: 'mailto:' + email, textContent: email });
  const box = document.createElement('p');
  box.className = 'revealed';
  box.append(mail);
  reveal.replaceWith(box);
  mail.focus();
});

// School projects: one open at a time under the 42 board.
const board = document.querySelector('.board');
if (board) mountBoard(board);

// Station visuals are loaded lazily, each in its own module (see stations.js).
import('./stations.js?v=6f1248b217').then((m) => m.mountStations({ t, onLangChange, currentLang })).catch(() => {});

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

// Hero: on desktop the last words bite into the photo by about one letter (see hero.js)
const h1 = document.querySelector('.hero h1'), disc = document.querySelector('.hero .disc');
if (h1 && disc) mountHero(h1, disc, onLangChange);
