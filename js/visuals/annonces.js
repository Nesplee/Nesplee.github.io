import { reduced } from './svg.js?v=5aef843221';

// Real counts from the owner's annonces database (data/annonces.json: per source host and per day,
// last 30 days — no company names or titles), laid out as the front page of a morning paper.
export async function mount(root, { t, onLangChange, currentLang }) {
  const data = await (await fetch(new URL('../../data/annonces.json', import.meta.url))).json();
  const $ = (k) => root.querySelector(`[data-an="${k}"]`);
  const sources = Object.entries(data.bySource).sort((a, b) => b[1] - a[1]);
  const days = data.byDay, [lastDay, lastN] = days.at(-1);
  const max = Math.max(...days.map((d) => d[1]));
  const [recDay, recN] = days.reduce((a, b) => (b[1] > a[1] ? b : a));
  const short = (host) => host.replace(/\.(ch|com)$/, '');
  const date = (d, o) => new Intl.DateTimeFormat(currentLang() === 'fr' ? 'fr-CH' : 'en-GB', o).format(new Date(d + 'T00:00:00Z'));
  let shown = false;

  function render() {
    $('edition').textContent = `${t('an.edition')} ${date(lastDay, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    $('nsrc').textContent = sources.length;
    $('total').textContent = data.total;
    $('today').textContent = `${lastN} ${t(lastN > 1 ? 'an.new' : 'an.new1')}`;
    $('recd').textContent = `${t('an.rec')} ${date(recDay, { weekday: 'long', day: 'numeric', month: 'long' })}.`;
    $('rec').textContent = recN;
    // sources: the size of each name follows its real volume
    $('cloud').replaceChildren(...sources.map(([host, n]) => {
      const s = document.createElement('span'), sup = document.createElement('sup');
      s.style.fontSize = `${14 + 70 * Math.sqrt(n / sources[0][1])}px`;
      sup.textContent = n;
      s.append(short(host), sup);
      if (!shown && !reduced()) s.classList.add('hide');
      return s;
    }));
    // the last five digests, today in red
    $('week').replaceChildren(...days.slice(-5).map(([d, n], i, a) => {
      const col = document.createElement('div'), bar = document.createElement('i'), lbl = document.createElement('span');
      bar.textContent = n;
      if (i === a.length - 1) bar.className = 'today';
      bar.dataset.h = `${18 + 78 * (n / max)}%`;
      if (shown || reduced()) bar.style.height = bar.dataset.h;
      lbl.textContent = date(d, { weekday: 'short' });
      col.append(bar, lbl);
      return col;
    }));
  }

  // first time the page is in view: names appear one by one, bars grow
  function reveal() {
    shown = true;
    root.querySelectorAll('.cloud span').forEach((s, i) => setTimeout(() => s.classList.remove('hide'), 90 * i));
    root.querySelectorAll('.week i').forEach((b) => { b.style.height = b.dataset.h; });
  }
  render();
  onLangChange(render);
  if (reduced()) { shown = true; return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); reveal(); } }, { threshold: 0.3 });
  io.observe(root);
}
