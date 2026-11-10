// push_swap stack semantics (subject of the 42 project). Top of a stack is index 0.
const swap = (s) => (s.length < 2 ? s : [s[1], s[0], ...s.slice(2)]);
const up = (s) => (s.length < 2 ? s : [...s.slice(1), s[0]]);
const down = (s) => (s.length < 2 ? s : [s.at(-1), ...s.slice(0, -1)]);

export function applyOp({ a, b }, op) {
  switch (op) {
    case 'sa': return { a: swap(a), b };
    case 'sb': return { a, b: swap(b) };
    case 'ss': return { a: swap(a), b: swap(b) };
    case 'pa': return b.length ? { a: [b[0], ...a], b: b.slice(1) } : { a, b };
    case 'pb': return a.length ? { a: a.slice(1), b: [a[0], ...b] } : { a, b };
    case 'ra': return { a: up(a), b };
    case 'rb': return { a, b: up(b) };
    case 'rr': return { a: up(a), b: up(b) };
    case 'rra': return { a: down(a), b };
    case 'rrb': return { a, b: down(b) };
    case 'rrr': return { a: down(a), b: down(b) };
    default: throw new Error(`unknown operation: ${op}`);
  }
}

export function shuffled(n, rand = Math.random) {
  const v = Array.from({ length: n }, (_, i) => i * 7 - Math.floor(n * 3.5));
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
  return v;
}
