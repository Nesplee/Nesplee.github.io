import { el, reduced, fmtUSD, fmtPct, fmtDate, fmtDay } from './svg.js?v=691aa6b196';
import { splitGaps, change } from './series.js?v=691aa6b196';
import { getJson } from './data.js?v=691aa6b196';

// Real TCGplayer prices (mid, USD) exported from the owner's tracker API (data/tracker.json),
// plus an animated sketch of the pipeline described in the card-price-tracker README.
export async function mount(el0, { t, onLangChange, currentLang }) {
  const data = await getJson('../../data/tracker.json', import.meta.url);
  const chart = el0.querySelector('[data-tr="chart"]');
  const tabs = el0.querySelector('[data-tr="tabs"]');
  const flow = el0.querySelector('[data-tr="flow"]');
  const total = el0.querySelector('[data-tr="total"]');
  const renderTotal = () => { total.textContent = new Intl.NumberFormat(currentLang() === 'fr' ? 'fr-FR' : 'en-GB').format(data.totalCards); };
  // the day the snapshot was exported
  const asof = el0.querySelector('[data-tr="asof"]');
  const renderAsof = () => { asof.textContent = `${t('asof.data')} ${fmtDay(data.exportedAt, currentLang())}.`; };
  renderTotal();
  renderAsof();
  el0.querySelector('[data-tr="days"]').textContent = data.cards[0].points.length;
  let current = data.cards.find((c) => c.id === 'base1-4') ?? data.cards[0];

  function sparkline(svg, points) {
    const vs = points.map((p) => p[1]), lo = Math.min(...vs), hi = Math.max(...vs);
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1)) * 100} ${28 - ((p[1] - lo) / (hi - lo || 1)) * 24}`).join(' ');
    el(svg, 'path', { d, fill: 'none', stroke: 'currentColor', class: change(points) >= 0 ? 'up' : 'down', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' });
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
      b.querySelector('.p').textContent = `${fmtUSD(c.points.at(-1)[1], lang)} · ${fmtPct(ch)}`;
      sparkline(b.querySelector('svg'), c.points);
      b.addEventListener('click', () => { current = c; renderTabs(); renderChart(); });
      return b;
    }));
  }

  let geo = null; // scales of the chart on screen, read by the pointer handlers below

  function renderChart() {
    const lang = currentLang(), pts = current.points;
    chart.replaceChildren();
    geo = null;
    const L = 56, R = 624, T = 40, B = 262; // the dates sit under B and must stay inside the 300-high viewBox
    const vs = pts.map((p) => p[1]);
    const pad = (Math.max(...vs) - Math.min(...vs)) * 0.15 || 10;
    const lo = Math.max(0, Math.min(...vs) - pad), hi = Math.max(...vs) + pad;
    const t0 = Date.parse(pts[0][0]), t1 = Date.parse(pts.at(-1)[0]);
    const X = (d) => L + ((Date.parse(d) - t0) / (t1 - t0)) * (R - L), Y = (v) => B - ((v - lo) / (hi - lo)) * (B - T);
    for (let k = 0; k <= 3; k++) {
      const v = lo + ((hi - lo) * k) / 3;
      el(chart, 'line', { x1: L, x2: R, y1: Y(v), y2: Y(v), class: 'grid' });
      el(chart, 'text', { x: 6, y: Y(v) + 4, class: 'ax' }, fmtUSD(v, lang));
    }
    for (const i of [0, Math.floor(pts.length / 2), pts.length - 1]) el(chart, 'text', { x: X(pts[i][0]), y: B + 20, class: 'ax', 'text-anchor': i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle' }, fmtDate(pts[i][0], lang));
    const segs = splitGaps(pts);
    const lines = segs.map((sg) => {
      el(chart, 'path', { d: sg.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`).join(' ') + ` L${X(sg.at(-1)[0])} ${B} L${X(sg[0][0])} ${B} Z`, class: 'area' });
      return el(chart, 'path', { d: sg.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`).join(' '), class: 'line' });
    });
    for (let i = 1; i < segs.length; i++) el(chart, 'text', { x: (X(segs[i - 1].at(-1)[0]) + X(segs[i][0][0])) / 2, y: B - 8, class: 'ax', 'text-anchor': 'middle' }, t('tr.gap'));
    const max = pts.reduce((a, b) => (b[1] > a[1] ? b : a)), last = pts.at(-1);
    el(chart, 'circle', { cx: X(max[0]), cy: Y(max[1]), r: 5, class: 'peak' });
    el(chart, 'text', { x: Math.min(X(max[0]), R - 60), y: Y(max[1]) - 12, class: 'lbl', 'text-anchor': 'middle' }, `${t('tr.peak')} ${fmtUSD(max[1], lang)}`);
    el(chart, 'circle', { cx: X(last[0]), cy: Y(last[1]), r: 5, class: 'last' });
    // last price: above or below its point, on the side where the curve passes less (the label is ~150 wide)
    const near = pts.filter((p) => X(p[0]) > X(last[0]) - 160).map((p) => Y(p[1]));
    const above = Y(last[1]) - 14, below = Math.min(B - 8, Y(last[1]) + 26);
    const hits = (y) => near.filter((v) => v > y - 18 && v < y + 6).length;
    el(chart, 'text', { x: X(last[0]) - 8, y: above > T + 30 && hits(above) <= hits(below) ? above : below, class: 'lbl ok', 'text-anchor': 'end' }, `${fmtDate(last[0], lang)} · ${fmtUSD(last[1], lang)}`);
    el(chart, 'text', { x: L, y: 22, class: 'ttl' }, `${current.name} · ${current.set} — ${t('tr.trend')}`);
    // hover / touch: vertical guide, dot and the price of the day under the pointer
    const hov = el(chart, 'g', { class: 'hov', display: 'none' });
    el(hov, 'line', { y1: T, y2: B, class: 'cross' });
    el(hov, 'circle', { r: 5, class: 'hovdot' });
    el(hov, 'text', { class: 'lbl hovlbl' });
    geo = { pts, X, Y, L, R, T, B, hov, lang };
    if (!reduced()) for (const [i, p] of lines.entries()) {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset 1s ease-out ${i * 0.9}s`; p.style.strokeDashoffset = 0;
    }
  }

  function showHover(e) {
    if (!geo) return;
    const m = chart.getScreenCTM();
    if (!m) return;
    const pt = chart.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const x = pt.matrixTransform(m.inverse()).x;
    const { pts, X, Y, L, R, T, hov, lang } = geo;
    let best = pts[0];
    for (const p of pts) if (Math.abs(X(p[0]) - x) < Math.abs(X(best[0]) - x)) best = p;
    const bx = X(best[0]), by = Y(best[1]);
    if (x < L - 6 || x > R + 6 || Math.abs(bx - x) > 14) { hov.setAttribute('display', 'none'); chart.classList.remove('is-hov'); return; } // outside the curve or in a data gap
    const [ln, dot, lbl] = hov.children;
    ln.setAttribute('x1', bx); ln.setAttribute('x2', bx);
    dot.setAttribute('cx', bx); dot.setAttribute('cy', by);
    lbl.textContent = `${fmtDate(best[0], lang)} · ${fmtUSD(best[1], lang)}`;
    lbl.setAttribute('x', bx); lbl.setAttribute('y', by - 14 > T + 12 ? by - 14 : by + 26);
    lbl.setAttribute('text-anchor', bx < L + 80 ? 'start' : bx > R - 80 ? 'end' : 'middle');
    hov.setAttribute('display', 'inline'); chart.classList.add('is-hov');
  }
  const hideHover = () => { geo?.hov.setAttribute('display', 'none'); chart.classList.remove('is-hov'); };
  chart.addEventListener('pointermove', showHover);
  chart.addEventListener('pointerdown', showHover);
  chart.addEventListener('pointerleave', hideHover);

  // Pipeline sketch (static): catalogue and price sources -> Airflow -> staging -> star schema -> dashboard;
  // failed calls loop back to the sources for a retry, rejected rows go to quarantine.
  function renderFlow() {
    flow.replaceChildren();
    const defs = el(flow, 'defs');
    const mk = el(defs, 'marker', { id: 'tr-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
    el(mk, 'path', { d: 'M0 0L10 5L0 10z', class: 'arrow' });
    const W = 110, H = 40, gap = 30, y = 74; // box centre line
    const nodes = [
      ['api', ['pokemontcg.io', 'TCGCSV']], ['dag', 'Airflow DAG'], ['stg', 'staging'],
      ['dwh', t('tr.star')], ['out', 'dashboard'],
    ].map(([id, label], i) => ({ id, label, x: 4 + i * (W + gap) }));
    for (let i = 0; i < nodes.length - 1; i++) el(flow, 'path', { d: `M${nodes[i].x + W + 2} ${y}H${nodes[i + 1].x - 3}`, class: 'edge', 'marker-end': 'url(#tr-arrow)' });
    for (const { id, label, x } of nodes) {
      el(flow, 'rect', { x, y: y - H / 2, width: W, height: H, rx: 8, class: `node ${id === 'dwh' ? 'hot' : ''}` });
      const lines = [label].flat();
      for (const [i, s] of lines.entries()) el(flow, 'text', { x: x + W / 2, y: y + 4 + (i - (lines.length - 1) / 2) * 13, 'text-anchor': 'middle', class: 'nl small' }, s);
    }
    // quarantine: under staging
    const stg = nodes[2];
    el(flow, 'path', { d: `M${stg.x + W / 2} ${y + H / 2 + 2}V${y + 40}`, class: 'edge', 'marker-end': 'url(#tr-arrow)' });
    el(flow, 'rect', { x: stg.x, y: y + 42, width: W, height: 28, rx: 8, class: 'node q' });
    el(flow, 'text', { x: stg.x + W / 2, y: y + 60, 'text-anchor': 'middle', class: 'nl' }, t('tr.quarantine'));
    // retry: from the DAG back to the sources, above the row
    const a = nodes[1].x + W / 2, b = nodes[0].x + W / 2, top = y - H / 2 - 2;
    el(flow, 'path', { d: `M${a} ${top}C${a} ${top - 46} ${b} ${top - 46} ${b} ${top}`, class: 'edge retry', 'marker-end': 'url(#tr-arrow)' });
    el(flow, 'text', { x: (a + b) / 2, y: 14, 'text-anchor': 'middle', class: 'nl small' }, `~37 % · ${t('tr.retry')}`);
  }

  renderTabs(); renderChart(); renderFlow();
  onLangChange(() => { renderTotal(); renderAsof(); renderTabs(); renderChart(); renderFlow(); });
}
