// The guiding line drawn as a git history: `main` runs down the left gutter, and each part of the page
// (the sections that open with a chapter word) forks a branch at its start and merges back at its end.
// Everything is grey; red fills main and the branches down to the reading position (60% of the viewport).
import { fillHeight } from './line.js?v=a9ea34af8f';

const NS = 'http://www.w3.org/2000/svg';

// one branch: fork from main at `top`, run down the lane, merge back into main at `bottom`
export function branchPath(main, lane, top, bottom) {
  const r = Math.min(26, (bottom - top) / 4);
  return `M${main} ${top}C${main} ${top + r} ${lane} ${top + r * 0.4} ${lane} ${top + r * 1.6}`
    + `V${bottom - r * 1.6}C${lane} ${bottom - r * 0.4} ${main} ${bottom - r} ${main} ${bottom}`;
}

// sections grouped by chapter: a group starts at a section holding a .chap and runs until the next one
export function groups(sections) {
  const out = [];
  for (const s of sections) {
    if (s.chap || !out.length) out.push({ top: s.top, bottom: s.bottom });
    else out.at(-1).bottom = s.bottom;
  }
  return out;
}

export function mountGitLine(page, rail) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'gitline');
  svg.setAttribute('aria-hidden', 'true');
  page.prepend(svg);
  const mk = (parent, name, attrs) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };
  let clip, dots = [];

  function layout() {
    const p = page.getBoundingClientRect(), y0 = p.top;
    const main = rail.getBoundingClientRect().left - p.left + 2;
    const lane = main + (innerWidth <= 700 ? 14 : 20);
    const secs = [...page.querySelectorAll('section.stop')].filter((s) => !s.hidden && s.offsetParent !== null)
      .map((s) => { const r = s.getBoundingClientRect(); return { top: r.top - y0 + 70, bottom: r.bottom - y0 - 40, chap: !!s.querySelector('.chap') }; });
    const gs = groups(secs);
    const start = rail.getBoundingClientRect().top - y0, end = p.height;
    svg.setAttribute('width', p.width); svg.setAttribute('height', p.height);
    svg.replaceChildren();
    const defs = mk(svg, 'defs', {});
    const cp = mk(defs, 'clipPath', { id: 'gitline-read' });
    clip = mk(cp, 'rect', { x: 0, y: 0, width: p.width, height: 0 });
    const d = [`M${main} ${start}V${end}`, ...gs.map((g) => branchPath(main, lane, g.top, g.bottom))];
    const base = mk(svg, 'g', { class: 'gl-base' }), read = mk(svg, 'g', { class: 'gl-read', 'clip-path': 'url(#gitline-read)' });
    for (const g of [base, read]) for (const path of d) mk(g, 'path', { d: path });
    // commits: fork and merge on main, first commit on each branch
    dots = [];
    for (const g of gs) {
      dots.push(mk(svg, 'circle', { cx: main, cy: g.top, r: 5, class: 'gl-dot' }));
      dots.push(mk(svg, 'circle', { cx: lane, cy: g.top + 48, r: 4, class: 'gl-dot' }));
      dots.push(mk(svg, 'circle', { cx: main, cy: g.bottom, r: 6, class: 'gl-merge' }));
    }
    scroll();
  }

  function scroll() {
    if (!clip) return;
    const top = page.getBoundingClientRect().top;
    const h = matchMedia('(prefers-reduced-motion: reduce)').matches ? Number(svg.getAttribute('height')) : fillHeight(top, Number(svg.getAttribute('height')), innerHeight);
    clip.setAttribute('height', h);
    for (const c of dots) c.classList.toggle('on', Number(c.getAttribute('cy')) <= h);
  }

  layout();
  addEventListener('scroll', scroll, { passive: true });
  addEventListener('resize', layout);
  document.fonts?.ready.then(layout);
  new ResizeObserver(layout).observe(page); // sections open and close (42 board), fonts and visuals load
}
