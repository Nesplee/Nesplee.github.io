// Start order implied by docker compose depends_on (Kahn's algorithm, alphabetical on ties).
export function bootOrder(services) {
  const pending = new Map(Object.entries(services).map(([k, v]) => [k, new Set(v.depends_on ?? [])]));
  const order = [];
  while (pending.size) {
    const ready = [...pending].filter(([, deps]) => [...deps].every((d) => order.includes(d))).map(([k]) => k).sort();
    if (!ready.length) throw new Error('dependency cycle: ' + [...pending.keys()].join(', '));
    for (const k of ready) { order.push(k); pending.delete(k); }
  }
  return order;
}
