import { el, NS, reduced } from './svg.js?v=24c3c0b506';

// Kepler bento: illustrative animations, one per mission tile. No real data, no internal names.
export function mount(root, { t, onLangChange }) {
  const $ = (k) => root.querySelector(`[data-kp="${k}"]`);
  const still = reduced();
  const visible = () => { const r = root.getBoundingClientRect(); return !document.hidden && r.bottom > 0 && r.top < innerHeight; };
  const every = (ms, fn) => { if (!still) setInterval(() => { if (visible()) fn(); }, ms); };
  const pick = (n) => Math.floor(Math.random() * n);
  root.classList.add('on');

  // ETL runs: AMC flows exist from the start; the two flows I added start partway (dashed before)
  const COLS = 16, TODAY = COLS - 1;
  const flows = [['AMC · SFTP', 'kp.existing', 0], ['AMC · API', 'kp.existing', 0], ['kp.strat', 'kp.added', 6], ['kp.indices', 'kp.added', 9]];
  const grid = [];
  function drawRuns() {
    const runs = $('runs');
    runs.replaceChildren();
    grid.length = 0;
    for (const [name, tag, start] of flows) {
      const lbl = document.createElement('span');
      lbl.className = 'lbl';
      const em = document.createElement('em');
      em.textContent = t(tag);
      if (tag === 'kp.added') em.className = 'new';
      lbl.append(name.startsWith('kp.') ? t(name) : name, em);
      const row = document.createElement('div');
      row.className = 'row';
      const cells = Array.from({ length: COLS }, (_, c) => {
        const i = document.createElement('i');
        i.className = c < start ? 'na' : c === TODAY ? 'ok' : Math.random() < 0.04 ? 'retry' : 'ok';
        return i;
      });
      row.append(...cells);
      runs.append(lbl, row);
      grid.push(cells);
    }
  }
  let k = 0;
  every(700, () => { // today's run goes through the flows one by one
    grid.forEach((cells, j) => { cells[TODAY].className = j < k ? 'ok' : j === k ? 'run' : ''; });
    k = (k + 1) % (grid.length + 1);
  });

  // price control: counter, then a log of checks
  const count = $('count');
  if (!still) {
    let t0 = null;
    const up = (ts) => {
      t0 ??= ts;
      const p = Math.min(1, (ts - t0) / 2400);
      count.textContent = p < 1 ? Math.round(6000 * (1 - (1 - p) ** 3)).toLocaleString('fr-CH') : '6 000+';
      if (p < 1) requestAnimationFrame(up);
    };
    requestAnimationFrame(up);
  }
  const checks = ['kp.ok', 'kp.ok', 'kp.bad', 'kp.ok'];
  let li = 0;
  const logLine = () => {
    const key = checks[li++ % checks.length], d = document.createElement('div');
    d.textContent = t(key);
    if (key === 'kp.bad') d.className = 'x';
    $('plog').prepend(d);
    while ($('plog').children.length > 3) $('plog').lastChild.remove();
  };
  every(1100, logLine);

  // n8n executions
  const workflows = ['kp.w1', 'kp.w3', 'kp.w2', 'kp.w4'];
  let wi = 0;
  const addExec = () => {
    const d = document.createElement('div'), b = document.createElement('b'), s = document.createElement('span');
    b.textContent = '✓';
    s.textContent = t(workflows[wi++ % workflows.length]);
    d.append(b, s);
    $('exec').prepend(d);
    while ($('exec').children.length > 4) $('exec').lastChild.remove();
  };
  every(1800, addExec);

  // terminal: a repetitive task becomes one command
  const script = [['p', 'kp.task'], ['m', 'kp.tool'], ['ok', 'kp.one']];
  let typing = 0;
  async function type() {
    const my = ++typing, term = $('term'), wait = (ms) => new Promise((r) => setTimeout(r, ms));
    term.replaceChildren();
    for (const [cls, key] of script) {
      const s = document.createElement('span');
      s.className = cls;
      term.append(s, '\n');
      if (still) { s.textContent = t(key); continue; }
      for (const ch of t(key)) { if (my !== typing) return; s.textContent += ch; await wait(45); }
      await wait(300);
    }
    if (still) return;
    const c = document.createElement('span');
    c.className = 'cursor';
    term.append(c);
    await wait(3000);
    while (!visible()) { await wait(500); if (my !== typing) return; }
    if (my === typing) type();
  }

  // LexiFi grid fills cell by cell
  let cells = [], ci = 0;
  function drawSheet() {
    const sheet = $('sheet');
    sheet.replaceChildren();
    cells = [];
    const head = [t('kp.product'), ...Array.from({ length: 5 }, (_, i) => `${t('kp.field')} ${i + 1}`)];
    for (const h of head) { const s = document.createElement('span'); s.className = 'h'; s.textContent = h; sheet.append(s); }
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
      const s = document.createElement('span');
      if (c === 0) s.textContent = `${t('kp.product')} ${r + 1}`;
      else { if (still) s.className = 'f'; cells.push(s); }
      sheet.append(s);
    }
    ci = 0;
  }
  every(160, () => {
    if (ci >= cells.length) { cells.forEach((s) => { s.className = ''; }); ci = 0; return; }
    cells[ci++].className = 'f';
  });

  // monitoring LEDs: one service sometimes flags, then recovers
  function drawLeds() {
    $('leds').replaceChildren(...['vm-1', 'vm-2', 'vm-3', 'a', 'b', 'c'].map((n, i) => {
      const d = document.createElement('div'), b = document.createElement('b');
      b.className = `d${i % 4}`;
      d.append(b, n.length === 1 ? `${t('kp.service')} ${n}` : n);
      return d;
    }));
  }
  every(3000, () => {
    const b = $('leds').querySelectorAll('b')[pick(6)];
    b.classList.add('warn');
    setTimeout(() => b.classList.remove('warn'), 1500);
  });

  // four teams around the daily
  const teams = [['kp.eng', 38, 18], ['AMC', 162, 18], ['kp.mo', 42, 96], ['kp.res', 158, 96]];
  function drawOrbit() {
    const svg = $('orbit');
    svg.replaceChildren();
    for (const [, x, y] of teams) el(svg, 'line', { x1: 100, y1: 57, x2: x, y2: y });
    el(svg, 'circle', { cx: 100, cy: 57, r: 17, fill: '#e3241b' });
    el(svg, 'text', { x: 100, y: 60.5, 'text-anchor': 'middle', class: 'me' }, t('kp.me'));
    for (const [n, x, y] of teams) {
      el(svg, 'circle', { cx: x, cy: y, r: 3.5, fill: '#f1efea' });
      el(svg, 'text', { x, y: y < 57 ? y - 7 : y + 14, 'text-anchor': 'middle' }, n.startsWith('kp.') ? t(n) : n);
    }
  }
  every(800, () => {
    const [, x, y] = teams[pick(4)], svg = $('orbit');
    const p = document.createElementNS(NS, 'circle');
    p.setAttribute('cx', 100); p.setAttribute('cy', 57); p.setAttribute('r', 3); p.setAttribute('fill', '#ff5a4a');
    svg.append(p);
    p.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${x - 100}px, ${y - 57}px)` }], { duration: 900, easing: 'ease-in-out' }).onfinish = () => p.remove();
  });

  const all = () => {
    drawRuns(); drawSheet(); drawLeds(); drawOrbit(); type();
    $('plog').replaceChildren(); for (let n = 0; n < 3; n++) logLine();
    $('exec').replaceChildren(); for (let n = 0; n < 4; n++) addExec();
  };
  all();
  onLangChange(all);
}
