import { applyOp, shuffled } from './pushswap-ops.js?v=6f1248b217';
import { runProgram } from '../run-wasm.js?v=6f1248b217';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// The owner's push_swap computes the operations, the owner's checker validates them; this file only draws.
export function mount(el, { t, onLangChange }) {
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const count = el.querySelector('[data-ps="count"]');
  const verdict = el.querySelector('[data-ps="verdict"]');
  let initial = [], state = { a: [], b: [] }, ops = [], step = 0, raf = 0, rank = new Map(), result = '';

  function draw() {
    const W = canvas.width, H = canvas.height, half = W / 2, n = Math.max(initial.length, 1), rowH = H / n;
    ctx.fillStyle = '#0b0c0e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2b2f35'; ctx.fillRect(half - 1, 0, 2, H);
    for (const [stack, x0] of [[state.a, 8], [state.b, half + 8]]) {
      stack.forEach((v, i) => {
        const r = rank.get(v) / Math.max(1, n - 1);
        ctx.fillStyle = `hsl(${12 + 30 * r} 85% ${38 + 30 * r}%)`;
        ctx.fillRect(x0, i * rowH, 8 + (half - 24) * r, Math.max(1, rowH - (rowH > 3 ? 1 : 0)));
      });
    }
    ctx.fillStyle = '#8b8f96'; ctx.font = '12px "IBM Plex Mono", monospace';
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
    initial = shuffled(size);
    rank = new Map([...initial].sort((x, y) => x - y).map((v, i) => [v, i]));
    state = { a: [...initial], b: [] }; ops = []; step = 0; result = ''; draw();
    verdict.textContent = t('ps.running');
    const args = initial.map(String);
    try {
      ops = await runProgram('push_swap', args);
      result = (await runProgram('checker', args, ops.join('\n') + '\n')).join(' ');
      verdict.textContent = `${t('ps.checker')} ${result}`;
    } catch {
      verdict.textContent = t('ps.failed');
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
}
