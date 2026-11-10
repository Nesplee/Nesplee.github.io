import { pickLang, applyLang } from './i18n.js?v=12e5eeaca9';
import { revealContact } from './contact.js?v=12e5eeaca9';
import { mountLine } from './line.js?v=12e5eeaca9';
import { STRINGS } from './strings.js?v=12e5eeaca9';

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
import('./stations.js?v=12e5eeaca9').then((m) => m.mountStations({ t, onLangChange, currentLang })).catch(() => {});
