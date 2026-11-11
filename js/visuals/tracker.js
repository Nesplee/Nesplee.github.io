import { el, reduced, fmtEUR, fmtPct, fmtDate } from './svg.js?v=bc9d6a2890';
import { splitGaps, change } from './series.js?v=bc9d6a2890';

// Real CardMarket trend prices exported from the owner's tracker API (data/tracker.json),
// plus an animated sketch of the pipeline described in the card-price-tracker README.
export async function mount(el0, { t, onLangChange, currentLang }) {
  const data = await (await fetch(new URL('../../data/tracker.json', import.meta.url))).json();
  const chart = el0.querySelector('[data-tr="chart"]');
  const tabs = el0.querySelector('[data-tr="tabs"]');
  const flow = el0.querySelector('[data-tr="flow"]');
  el0.querySelector('[data-tr="total"]').textContent = new Intl.NumberFormat('fr-CH').format(data.totalCards);
  el0.querySelector('[data-tr="days"]').textContent = data.cards[0].points.length;
  let current = data.cards.find((c) => c.id === 'base1-4') ?? data.cards[0];

  function sparkline(svg, points) {
    const vs = points.map((p) => p[1]), lo = Math.min(...vs), hi = Math.max(...vs);
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1)) * 100} ${28 - ((p[1] - lo) / (hi - lo || 1)) * 24}`).join(' ');
    el(svg, 'path', { d, fill: 'none', stroke: change(points) >= 0 ? '#2fbf71' : '#ff7a59', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' });
  }

  function renderTabs() {
    const lang = currentLang();
    tabs.replaceChildren(...data.cards.map((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card-tab';
      b.setAttribute('aria-pressed', String(c === current));
      const ch = change(c.points);
      b.innerHTML = `<span class="n"></span><span class="s"></span><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"></svg><span class="p ${ch >= 0 ? 'up' : 'down'}"></span>`;
      b.querySelector('.n').textContent = c.name;
      b.querySelector('.s').textContent = c.set;
      b.querySelector('.p').textContent = `${fmtEUR(c.points.at(-1)[1], lang)} · ${fmtPct(ch)}`;
      sparkline(b.querySelector('svg'), c.points);
      b.addEventListener('click', () => { current = c; renderTabs(); renderChart(); });
      return b;
    }));
  }

  function renderChart() {
    const lang = currentLang(), pts = current.points;
    chart.replaceChildren();
    const L = 56, R = 624, T = 40, B = 280;
    const vs = pts.map((p) => p[1]);
    const pad = (Math.max(...vs) - Math.min(...vs)) * 0.15 || 10;
    const lo = Math.max(0, Math.min(...vs) - pad), hi = Math.max(...vs) + pad;
    const t0 = Date.parse(pts[0][0]), t1 = Date.parse(pts.at(-1)[0]);
    const X = (d) => L + ((Date.parse(d) - t0) / (t1 - t0)) * (R - L), Y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
    for (let k = 0; k <= 3; k++) {
      const v = lo + ((hi - lo) * k) / 3;
      el(chart, 'line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: '#2b2f35' });
      el(chart, 'text', { x: 6, y: Y(v) + 4, class: 'ax' }, fmtEUR(v, lang));
    }
    for (const i of [0, Math.floor(pts.length / 2), pts.length - 1]) el(chart, 'text', { x: X(pts[i][0]), y: B + 22, class: 'ax', 'text-anchor': i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle' }, fmtDate(pts[i][0], lang));
    const segs = splitGaps(pts);
    const lines = segs.map((sg) => {
      el(chart, 'path', { d: sg.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`).join(' ') + ` L${X(sg.at(-1)[0])} ${B} L${X(sg[0][0])} ${B} Z`, fill: '#d2492a22' });
      return el(chart, 'path', { d: sg.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`).join(' '), fill: 'none', stroke: '#ff7a59', 'stroke-width': 3, 'stroke-linejoin': 'round' });
    });
    for (let i = 1; i < segs.length; i++) el(chart, 'text', { x: (X(segs[i - 1].at(-1)[0]) + X(segs[i][0][0])) / 2, y: B - 8, class: 'ax', 'text-anchor': 'middle' }, t('tr.gap'));
    const max = pts.reduce((a, b) => (b[1] > a[1] ? b : a)), last = pts.at(-1);
    el(chart, 'circle', { cx: X(max[0]), cy: Y(max[1]), r: 5, fill: '#f3eee4' });
    el(chart, 'text', { x: Math.min(X(max[0]), R - 60), y: Y(max[1]) - 12, class: 'lbl', 'text-anchor': 'middle' }, `${t('tr.peak')} ${fmtEUR(max[1], lang)}`);
    el(chart, 'circle', { cx: X(last[0]), cy: Y(last[1]), r: 5, fill: '#2fbf71' });
    el(chart, 'text', { x: X(last[0]) - 8, y: Math.min(B - 26, Y(last[1]) + 24), class: 'lbl ok', 'text-anchor': 'end' }, `${fmtDate(last[0], lang)} · ${fmtEUR(last[1], lang)}`);
    el(chart, 'text', { x: L, y: 22, class: 'ttl' }, `${current.name} · ${current.set} — ${t('tr.trend')}`);
    if (!reduced()) for (const [i, p] of lines.entries()) {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset 1s ease-out ${i * 0.9}s`; p.style.strokeDashoffset = 0;
    }
  }

  // Pipeline sketch: calls leave the API, ~37 % fail and are retried, rejects go to quarantine, the rest lands in the warehouse.
  let gen = 0; // one dot loop at a time, even after a language switch redraws the flow
  function renderFlow() {
    const my = ++gen;
    flow.replaceChildren();
    const nodes = [
      ['api', 6, 'pokemontcg.io'], ['dag', 142, 'Airflow DAG'], ['stg', 278, 'staging'],
      ['dwh', 414, t('tr.star')], ['out', 550, 'Metabase · React'],
    ];
    const y = 46;
    for (const [id, x, label] of nodes) {
      el(flow, 'rect', { x, y: y - 18, width: 124, height: 36, rx: 8, class: `node ${id === 'dwh' ? 'hot' : ''}` });
      el(flow, 'text', { x: x + 62, y: y + 4, 'text-anchor': 'middle', class: 'nl small' }, label);
    }
    for (let i = 0; i < nodes.length - 1; i++) el(flow, 'path', { d: `M${nodes[i][1] + 124} ${y}H${nodes[i + 1][1]}`, class: 'edge' });
    el(flow, 'rect', { x: 278, y: 96, width: 124, height: 28, rx: 8, class: 'node q' });
    el(flow, 'text', { x: 340, y: 114, 'text-anchor': 'middle', class: 'nl' }, t('tr.quarantine'));
    el(flow, 'path', { d: `M340 ${y + 18}V96`, class: 'edge' });
    el(flow, 'path', { d: `M142 ${y - 10}C116 6 92 6 68 ${y - 18}`, class: 'edge retry' });
    el(flow, 'text', { x: 105, y: 10, 'text-anchor': 'middle', class: 'nl small' }, t('tr.retry'));
    if (reduced()) return;
    const dots = el(flow, 'g');
    const spawn = () => {
      if (my !== gen) return;
      const box = flow.getBoundingClientRect();
      if (document.hidden || box.bottom < 0 || box.top > innerHeight) { setTimeout(spawn, 500); return; } // idle off-screen
      const r = Math.random(), kind = r < 0.37 ? 'retry' : r < 0.43 ? 'q' : 'ok';
      const c = el(dots, 'circle', { r: 4, cx: 120, cy: y, class: `dot ${kind}` });
      const path = kind === 'retry' ? [[142, y], [142, y - 10], [68, y - 18]] : kind === 'q' ? [[278, y], [340, y], [340, 110]] : [[278, y], [414, y], [550, y], [660, y]];
      const keyframes = [{ cx: 120, cy: y }, ...path.map(([cx, cy]) => ({ cx, cy }))].map((p) => ({ transform: `translate(${p.cx - 120}px, ${p.cy - y}px)` }));
      c.animate(keyframes, { duration: 2200, easing: 'linear' }).onfinish = () => c.remove();
      setTimeout(spawn, 260);
    };
    spawn();
  }

  renderTabs(); renderChart(); renderFlow();
  onLangChange(() => { renderTabs(); renderChart(); renderFlow(); });
}
