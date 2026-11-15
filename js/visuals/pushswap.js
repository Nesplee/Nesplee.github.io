import { applyOp, shuffled } from './pushswap-ops.js?v=16fcd39967';
import { runProgram } from '../run-wasm.js?v=16fcd39967';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// The owner's push_swap computes the operations, the owner's checker validates them; this file only draws.
export function mount(el, { t, onLangChange }) {
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  // sharp on high-density screens: the bitmap is DPR times larger, drawing stays in the 640 x 360 space
  const LW = canvas.width, LH = canvas.height, dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  canvas.width = Math.round(LW * dpr); canvas.height = Math.round(LH * dpr);
  ctx.scale(dpr, dpr);
  const count = el.querySelector('[data-ps="count"]');
  const verdict = el.querySelector('[data-ps="verdict"]');
  let initial = [], state = { a: [], b: [] }, ops = [], step = 0, raf = 0, rank = new Map(), result = '', run = 0;

  function draw() {
    const W = LW, H = LH, half = W / 2, n = Math.max(initial.length, 1), rowH = H / n;
    ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(half - 1, 0, 2, H);
    for (const [stack, x0] of [[state.a, 8], [state.b, half + 8]]) {
      stack.forEach((v, i) => {
        const r = rank.get(v) / Math.max(1, n - 1);
        ctx.fillStyle = `hsl(${3 + 3 * r} ${78 + 22 * r}% ${24 + 40 * r}%)`; // the site's red: dark for small numbers, bright for large ones
        ctx.fillRect(x0, i * rowH, 8 + (half - 24) * r, Math.max(1, rowH - (rowH > 3 ? 1 : 0)));
      });
    }
    ctx.fillStyle = '#8f8c86'; ctx.font = '12px "IBM Plex Mono", monospace';
    ctx.fillText('A', half - 18, H - 8); ctx.fillText('B', W - 18, H - 8);
    count.textContent = ops.length ? `${step} / ${ops.length} ${t('ps.ops')}` : '';
  }

  function play() {
    cancelAnimationFrame(raf);
    state = { a: [...initial], b: [] }; step = 0;
    if (reduced()) { for (const op of ops) state = applyOp(state, op); step = ops.length; draw(); return; }
    const perFrame = Math.max(1, Math.round(ops.length / ((initial.length > 100 ? 20 : 8) * 60)));
    const tick = () => {
      for (let k = 0; k < perFrame && step < ops.length; k++) state = applyOp(state, ops[step++]);
      draw();
      if (step < ops.length) raf = requestAnimationFrame(tick);
    };
    tick();
  }

  async function start(size) {
    cancelAnimationFrame(raf);
    const mine = ++run; // a later click supersedes this run: its answers are dropped
    initial = shuffled(size);
    rank = new Map([...initial].sort((x, y) => x - y).map((v, i) => [v, i]));
    state = { a: [...initial], b: [] }; ops = []; step = 0; result = ''; draw();
    verdict.textContent = t('ps.running');
    const args = initial.map(String);
    try {
      const got = await runProgram('push_swap', args);
      if (mine !== run) return;
      const verdictLines = (await runProgram('checker', args, got.join('\n') + '\n')).join(' ');
      if (mine !== run) return;
      ops = got; result = verdictLines;
      verdict.textContent = `${t('ps.checker')} ${result}`;
    } catch {
      if (mine === run) verdict.textContent = t('ps.failed');
      return;
    }
    play();
  }

  el.querySelectorAll('[data-ps-size]').forEach((b) => b.addEventListener('click', () => start(Number(b.dataset.psSize))));
  el.querySelector('[data-ps="replay"]').addEventListener('click', () => { if (ops.length) play(); });
  onLangChange(() => { draw(); verdict.textContent = result ? `${t('ps.checker')} ${result}` : ''; });
  // before the first run: 100 shuffled numbers waiting in stack A
  initial = shuffled(100);
  rank = new Map([...initial].sort((x, y) => x - y).map((v, i) => [v, i]));
  state = { a: [...initial], b: [] };
  draw();
  // the first sort starts by itself when the canvas comes into view: the page shows the program running, not a still image
  if (!reduced()) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); if (!run) start(100); } }, { threshold: 0.6 }).observe(canvas);
}
