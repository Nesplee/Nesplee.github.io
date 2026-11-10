import { stateAt } from './philo-state.js?v=61c49a6ea3';
import { el, reduced } from './svg.js?v=61c49a6ea3';

// Replays a real run of the owner's philo binary (recordings/philo-*.json): table, forks held, meals,
// and the very lines the program printed, in time.
const COLORS = { thinking: '#8f8c86', fork: '#d9a520', eating: '#2fbf71', sleeping: '#5b7bd5', dead: '#e3241b' };

export async function mount(root, { t, onLangChange }) {
  const load = async (name) => (await fetch(new URL(`../../recordings/${name}.json`, import.meta.url))).json();
  const runs = { ok: await load('philo-ok'), death: await load('philo-death') };
  const svg = root.querySelector('[data-ph="table"]');
  const log = root.querySelector('[data-ph="log"]');
  const clock = root.querySelector('[data-ph="clock"]');
  const args = root.querySelector('[data-ph="args"]');
  let run = runs.ok, time = 0, speed = 0.5, playing = !reduced(), last = 0, raf = 0;

  function draw() {
    const n = Number(run.args[0]), s = stateAt(run.events, time, n);
    svg.replaceChildren();
    const C = 170, R = 112;
    el(svg, 'circle', { cx: C, cy: C, r: 70, class: 'tbl' });
    el(svg, 'text', { x: C, y: C - 4, 'text-anchor': 'middle', class: 'nl' }, `${Math.round(time)} ms`);
    el(svg, 'text', { x: C, y: C + 16, 'text-anchor': 'middle', class: 'nl small' }, `${n} × ${t('ph.philo')}`);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
      const st = s.philos[i];
      el(svg, 'circle', { cx: x, cy: y, r: 26, fill: COLORS[st], class: st === 'dead' ? 'dead' : '' });
      el(svg, 'text', { x, y: y + 5, 'text-anchor': 'middle', class: 'pid' }, i + 1);
      // forks held, drawn on the table side
      for (let f = 0; f < s.forks[i]; f++) {
        const fx = C + (R - 44) * Math.cos(a + (f ? 0.18 : -0.18)), fy = C + (R - 44) * Math.sin(a + (f ? 0.18 : -0.18));
        el(svg, 'rect', { x: fx - 2, y: fy - 9, width: 4, height: 18, rx: 2, class: 'fork', transform: `rotate(${(a * 180) / Math.PI + 90} ${fx} ${fy})` });
      }
      const lx = C + (R + 44) * Math.cos(a), ly = C + (R + 44) * Math.sin(a);
      el(svg, 'text', { x: lx, y: ly + 4, 'text-anchor': 'middle', class: 'nl small' }, `${t('ph.' + st)} · ${s.meals[i]}`);
    }
    const past = run.events.filter((e) => e.t <= time).slice(-7);
    log.replaceChildren(...past.map((e) => {
      const li = document.createElement('li');
      li.textContent = `${e.t} ${e.id} ${e.action}`;
      if (e.action === 'died') li.className = 'died';
      return li;
    }));
    clock.textContent = `${Math.round(time)} / ${run.events.at(-1).t} ms`;
    args.textContent = `./philo ${run.args.join(' ')}`;
  }

  function frame(now) {
    if (playing) {
      time = Math.min(run.events.at(-1).t, time + (now - last) * speed);
      if (time >= run.events.at(-1).t) playing = false;
    }
    last = now;
    draw();
    if (playing) raf = requestAnimationFrame(frame);
  }
  const play = () => { cancelAnimationFrame(raf); playing = true; last = performance.now(); raf = requestAnimationFrame(frame); };

  root.querySelectorAll('[data-ph-run]').forEach((b) => b.addEventListener('click', () => {
    run = runs[b.dataset.phRun]; time = 0;
    root.querySelectorAll('[data-ph-run]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    play();
  }));
  root.querySelector('[data-ph="toggle"]').addEventListener('click', () => { if (playing) { playing = false; cancelAnimationFrame(raf); } else { if (time >= run.events.at(-1).t) time = 0; play(); } });
  root.querySelector('[data-ph="restart"]').addEventListener('click', () => { time = 0; play(); });
  root.querySelector('[data-ph="speed"]').addEventListener('change', (e) => { speed = Number(e.target.value); });
  onLangChange(draw);
  draw();
  if (playing) play();
}
