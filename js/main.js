import { pickLang, applyLang } from './i18n.js?v=ed14fd1ea7';
import { revealContact } from './contact.js?v=ed14fd1ea7';
import { mountLine } from './line.js?v=ed14fd1ea7';
import { STRINGS } from './strings.js?v=ed14fd1ea7';
import { mountBoard } from './board.js?v=ed14fd1ea7';

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

// School projects: one open at a time under the 42 board.
const board = document.querySelector('.board');
if (board) mountBoard(board);

// Station visuals are loaded lazily, each in its own module (see stations.js).
import('./stations.js?v=ed14fd1ea7').then((m) => m.mountStations({ t, onLangChange, currentLang })).catch(() => {});

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

// Hero: the title copy in white, clipped to the red disc, so letters over the photo stay readable
const h1 = document.querySelector('.hero h1'), disc = document.querySelector('.hero .disc');
if (h1 && disc) {
  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.append(...[...h1.childNodes].map((n) => n.cloneNode(true))); // keeps data-i18n: language switches update it too
  h1.after(ghost);
  const clip = () => {
    const d = disc.getBoundingClientRect(), g = ghost.getBoundingClientRect();
    ghost.style.clipPath = `circle(${d.width / 2}px at ${d.left + d.width / 2 - g.left}px ${d.top + d.height / 2 - g.top}px)`;
  };
  clip();
  addEventListener('resize', clip);
  document.fonts?.ready.then(clip);
  onLangChange(clip);
}
