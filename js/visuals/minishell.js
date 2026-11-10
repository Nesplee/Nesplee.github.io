import { treeFor } from './minishell-tree.js?v=1deb225520';
import { el, reduced } from './svg.js?v=1deb225520';

// Replays a real session of the owner's minishell (recordings/minishell.json): the terminal as it was,
// and, for each command, the processes it forked (logged by link-time wrappers, code unchanged).
export async function mount(root, { t, onLangChange }) {
  const rec = await (await fetch(new URL('../../recordings/minishell.json', import.meta.url))).json();
  const term = root.querySelector('[data-ms="term"]');
  const svg = root.querySelector('[data-ms="tree"]');
  const stats = root.querySelector('[data-ms="stats"]');
  const chunks = rec.screen;
  let shown = 0, timer = 0, current = -1;

  function drawTree(i) {
    current = i;
    svg.replaceChildren();
    if (i < 0) { stats.textContent = ''; return; }
    const r = treeFor(rec.proc, chunks[i].t, chunks[i + 1]?.t ?? Infinity);
    const W = 360, rows = [[{ pid: r.shell, cmd: 'minishell' }]];
    const placed = new Map();
    for (const c of r.children) {
      const depth = c.parent === r.shell || !placed.has(c.parent) ? 1 : placed.get(c.parent) + 1;
      placed.set(c.pid, depth);
      (rows[depth] ??= []).push(c);
    }
    const pos = new Map();
    rows.forEach((row, d) => row.forEach((n, k) => pos.set(n.pid, { x: ((k + 1) * W) / (row.length + 1), y: 30 + d * 70, n })));
    for (const c of r.children) {
      const a = pos.get(c.parent) ?? pos.get(r.shell), b = pos.get(c.pid);
      if (a && b) el(svg, 'path', { d: `M${a.x} ${a.y + 14}V${(a.y + b.y) / 2}H${b.x}V${b.y - 14}`, class: 'edge' });
    }
    for (const { x, y, n } of pos.values()) {
      const label = n.cmd ?? t('ms.fork');
      const w = Math.max(64, label.length * 7.4 + 18);
      el(svg, 'rect', { x: x - w / 2, y: y - 14, width: w, height: 28, rx: 4, class: n.cmd === 'minishell' ? 'node hot' : n.cmd ? 'node' : 'node q' });
      el(svg, 'text', { x, y: y + 4, 'text-anchor': 'middle', class: 'nl' }, label);
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${Math.max(120, rows.length * 70 + 10)}`);
    stats.textContent = r.children.length
      ? `fork ×${r.children.length} · pipe ×${r.pipes} · dup2 ×${r.dup2}`
      : t('ms.builtin');
  }

  function show(n) {
    shown = n;
    term.textContent = chunks.slice(0, n).map((c) => c[1]).join('');
    term.scrollTop = term.scrollHeight;
    drawTree(n >= 2 ? n - 2 : -1); // chunk n-1 holds command n-2's output: show the processes it used
  }
  function play() {
    clearTimeout(timer);
    if (shown >= chunks.length) return;
    const gap = shown === 0 ? 300 : Math.min(1800, chunks[shown][0] - chunks[shown - 1][0]);
    timer = setTimeout(() => { show(shown + 1); play(); }, gap);
  }

  root.querySelector('[data-ms="restart"]').addEventListener('click', () => { show(0); play(); });
  root.querySelector('[data-ms="all"]').addEventListener('click', () => { clearTimeout(timer); show(chunks.length); });
  onLangChange(() => drawTree(current));
  if (reduced()) show(chunks.length);
  else {
    // start when the station scrolls into view, not on page load
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); show(0); play(); } }, { threshold: 0.3 }).observe(root);
  }
}
