import { pickLang, applyLang } from './i18n.js?v=ded31e8faf';
import { revealContact } from './contact.js?v=ded31e8faf';
import { mountGitLine } from './gitline.js?v=ded31e8faf';
import { STRINGS } from './strings.js?v=ded31e8faf';
import { mountBoard } from './board.js?v=ded31e8faf';
import { mountHero } from './hero.js?v=ded31e8faf';
import { hit } from './count.js?v=ded31e8faf';

// GitHub Pages cannot send frame-ancestors / X-Frame-Options: refuse to be shown inside another site's frame
try { if (window.top !== window.self && window.top.location.origin !== location.origin) throw 0; } catch { document.documentElement.hidden = true; }

if (new URLSearchParams(location.search).get('police') === 'libre') document.documentElement.classList.add('free-font');

let storage = null;
try { storage = window.localStorage; } catch { /* blocked: language just won't be remembered */ }

let lang = pickLang(navigator.language, storage, location.search);
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

mountGitLine(document.querySelector('main.page'), document.querySelector('.rail'));

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
import('./stations.js?v=ded31e8faf').then((m) => m.mountStations({ t, onLangChange, currentLang })).catch(() => {});


// the hero CV link follows the page language
const cvLink = document.querySelector('[data-cv]');
const setCv = () => { if (cvLink) cvLink.href = `cv/CV_Dimitri_Nguyen_${currentLang() === 'fr' ? 'FR' : 'EN'}.pdf`; };
setCv();
onLangChange(setCv);

// Hero: on desktop the last words bite into the photo by about one letter (see hero.js)
const h1 = document.querySelector('.hero h1'), disc = document.querySelector('.hero .disc');
if (h1 && disc) mountHero(h1, disc, onLangChange);

// visit counting (GoatCounter, see count.js): the page view, then every CV download as an event
hit(location.pathname);
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href*="cv/CV_Dimitri_Nguyen_"]');
  if (a) hit(`cv-download-${a.getAttribute('href').includes('_FR') ? 'fr' : 'en'}`, true);
});

// Visuals mount lazily and change the page height while a smooth scroll to a section is running: once it
// has settled, bring the section back to the top if it ended up away from it.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  const target = a && a.hash.length > 1 && document.getElementById(a.hash.slice(1));
  if (!target || target.hidden) return;
  const settle = () => { if (Math.abs(target.getBoundingClientRect().top) > 60) target.scrollIntoView({ behavior: 'auto' }); };
  for (const ms of [900, 2000]) setTimeout(settle, ms);
});
