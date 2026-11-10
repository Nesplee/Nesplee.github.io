import { el, reduced, fmtDate } from './svg.js?v=fc7e8710c8';

// Real counts from the owner's annonces database (data/annonces.json: per source host and per day,
// last 30 days — no company names or titles), shown as a funnel, two charts and a digest preview.
export async function mount(root, { t, onLangChange, currentLang }) {
  const data = await (await fetch(new URL('../../data/annonces.json', import.meta.url))).json();
  const funnel = root.querySelector('[data-an="funnel"]');
  const bars = root.querySelector('[data-an="bars"]');
  const days = root.querySelector('[data-an="days"]');
  const digest = root.querySelector('[data-an="digest"]');
  const sources = Object.entries(data.bySource).sort((a, b) => b[1] - a[1]);
  root.querySelector('[data-an="total"]').textContent = data.total;
  root.querySelector('[data-an="nsrc"]').textContent = sources.length;
  let gen = 0;

  function renderFunnel() {
    const my = ++gen;
    funnel.replaceChildren();
    const H = 220, x0 = 128, stages = [[300, 'n8n'], [420, t('an.dedup')], [540, t('an.digest')]];
    const ys = sources.map((_, i) => 14 + (i * (H - 28)) / Math.max(1, sources.length - 1));
    sources.forEach(([host], i) => {
      el(funnel, 'text', { x: x0 - 10, y: ys[i] + 4, 'text-anchor': 'end', class: 'nl small' }, host.replace(/\.(ch|com)$/, ''));
      el(funnel, 'path', { d: `M${x0} ${ys[i]}C${x0 + 90} ${ys[i]} ${stages[0][0] - 70} ${H / 2} ${stages[0][0] - 46} ${H / 2}`, class: 'edge' });
    });
    for (const [x, label] of stages) {
      el(funnel, 'rect', { x: x - 54, y: H / 2 - 18, width: 108, height: 36, rx: 8, class: `node ${label === t('an.digest') ? 'hot' : ''}` });
      el(funnel, 'text', { x, y: H / 2 + 4, 'text-anchor': 'middle', class: 'nl small' }, label);
    }
    el(funnel, 'path', { d: `M354 ${H / 2}H366M474 ${H / 2}H486`, class: 'edge' });
    if (reduced()) return;
    const g = el(funnel, 'g');
    const total = sources.reduce((s, [, n]) => s + n, 0);
    const spawn = () => {
      if (my !== gen) return;
      const box = funnel.getBoundingClientRect();
      if (document.hidden || box.bottom < 0 || box.top > innerHeight) { setTimeout(spawn, 500); return; }
      let r = Math.random() * total, i = 0;
      while (r > sources[i][1]) r -= sources[i++][1]; // a source picked in proportion to its real volume
      const c = el(g, 'circle', { r: 3.5, cx: x0, cy: ys[i], class: 'dot ok' });
      const dup = Math.random() < 0.18; // illustrative share of duplicates stopped at the dedup stage
      const pts = [[x0, ys[i]], [stages[0][0] - 46, H / 2], [stages[1][0], H / 2], ...(dup ? [[stages[1][0], H / 2 + 34]] : [[stages[2][0], H / 2]])];
      c.animate(pts.map(([x, y]) => ({ transform: `translate(${x - x0}px, ${y - ys[i]}px)`, opacity: 1 })), { duration: 2600, easing: 'ease-in-out' }).onfinish = () => c.remove();
      if (dup) c.setAttribute('class', 'dot q');
      setTimeout(spawn, 180);
    };
    spawn();
  }

  function renderBars() {
    bars.replaceChildren();
    const max = sources[0][1];
    sources.forEach(([host, n], i) => {
      const y = 6 + i * 22;
      el(bars, 'text', { x: 0, y: y + 12, class: 'nl small' }, host);
      el(bars, 'rect', { x: 120, y, width: Math.max(2, (n / max) * 260), height: 15, rx: 3, class: i === 0 ? 'bar hot' : 'bar' });
      el(bars, 'text', { x: 126 + (n / max) * 260, y: y + 12, class: 'nl small' }, n);
    });
    bars.setAttribute('viewBox', `0 0 420 ${sources.length * 22 + 8}`);
  }

  function renderDays() {
    days.replaceChildren();
    const lang = currentLang(), pts = data.byDay, max = Math.max(...pts.map((p) => p[1])), w = 400 / pts.length;
    pts.forEach(([d, n], i) => el(days, 'rect', { x: i * w + 1, y: 90 - (n / max) * 80, width: w - 2, height: (n / max) * 80, rx: 2, class: 'bar' }));
    el(days, 'text', { x: 0, y: 106, class: 'nl small' }, fmtDate(pts[0][0], lang));
    el(days, 'text', { x: 400, y: 106, class: 'nl small', 'text-anchor': 'end' }, fmtDate(pts.at(-1)[0], lang));
  }

  function renderDigest() {
    const lang = currentLang(), [d, n] = data.byDay.at(-1);
    digest.querySelector('[data-an="dgtitle"]').textContent = `${t('an.dgsubject')} ${fmtDate(d, lang)} — ${n} ${t('an.dgnew')}`;
    const list = digest.querySelector('ul');
    list.replaceChildren(...Array.from({ length: Math.min(n, 4) }, (_, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<i></i><i></i>'; // placeholders: the real digest content stays private
      li.style.setProperty('--w', `${55 + ((i * 23) % 35)}%`);
      return li;
    }));
  }

  const all = () => { renderFunnel(); renderBars(); renderDays(); renderDigest(); };
  all();
  onLangChange(all);
}
