import { bootOrder } from './inception-order.js?v=66daa4c9ac';
import { el, reduced } from './svg.js?v=66daa4c9ac';

// The owner's Inception stack, drawn from data/inception.json (exported from the real docker-compose.yml).
// Start order comes from depends_on; the links between services are the ones the project README describes.
const POS = {
  nginx: [250, 70], website: [250, 150], adminer: [250, 230], ftp: [250, 310],
  wordpress: [430, 70], n8n: [430, 150], mariadb: [610, 70], redis: [610, 150],
};
const LINKS = [['nginx', 'wordpress', 'php-fpm'], ['nginx', 'n8n', 'SNI'], ['wordpress', 'mariadb', 'SQL'], ['wordpress', 'redis', 'cache'], ['adminer', 'mariadb', 'SQL']];
const ranges = (ports) => {
  const nums = ports.filter((p) => /^\d+$/.test(p)).map(Number).sort((a, b) => a - b), out = ports.filter((p) => !/^\d+$/.test(p));
  for (let i = 0; i < nums.length; i++) {
    let j = i;
    while (nums[j + 1] === nums[j] + 1) j++;
    out.push(j > i ? `${nums[i]}–${nums[j]}` : String(nums[i]));
    i = j;
  }
  return out;
};

export async function mount(root, { t, onLangChange }) {
  const data = await (await fetch(new URL('../../data/inception.json', import.meta.url))).json();
  const svg = root.querySelector('[data-in="map"]');
  const order = bootOrder(data.services);
  const list = root.querySelector('[data-in="order"]');
  let up = new Set(), gen = 0;

  function draw() {
    svg.replaceChildren();
    el(svg, 'rect', { x: 170, y: 22, width: 520, height: 330, rx: 10, class: 'net' });
    el(svg, 'text', { x: 184, y: 42, class: 'nl small' }, t('in.network'));
    el(svg, 'rect', { x: 14, y: 52, width: 110, height: 36, rx: 6, class: 'node' });
    el(svg, 'text', { x: 69, y: 75, 'text-anchor': 'middle', class: 'nl' }, t('in.visitor'));
    el(svg, 'path', { d: 'M124 70H190', class: 'edge' });
    el(svg, 'text', { x: 157, y: 63, 'text-anchor': 'middle', class: 'nl small' }, '443 · TLS');
    for (const [a, b, label] of LINKS) {
      if (!POS[a] || !POS[b]) continue;
      const [x1, y1] = POS[a], [x2, y2] = POS[b];
      el(svg, 'path', { d: `M${x1 + 60} ${y1}C${(x1 + x2) / 2 + 30} ${y1} ${(x1 + x2) / 2 - 30} ${y2} ${x2 - 60} ${y2}`, class: 'edge' });
      el(svg, 'text', { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6, 'text-anchor': 'middle', class: 'nl small' }, label);
    }
    for (const [name, s] of Object.entries(data.services)) {
      const [x, y] = POS[name] ?? [610, 230 + 40 * Object.keys(POS).indexOf(name)];
      el(svg, 'rect', { x: x - 60, y: y - 22, width: 120, height: 44, rx: 6, class: `node ${up.has(name) ? 'on' : 'off'} ${name === 'nginx' ? 'hot' : ''}` });
      el(svg, 'text', { x, y: y - 2, 'text-anchor': 'middle', class: 'nl' }, name);
      const sub = s.ports.length ? ranges(s.ports).join(' · ') : s.volumes.length ? `vol: ${s.volumes.join(', ')}` : t('in.internal');
      el(svg, 'text', { x, y: y + 13, 'text-anchor': 'middle', class: 'nl small' }, sub);
    }
    list.replaceChildren(...order.map((n, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${n}${data.services[n].depends_on.length ? `  ← ${data.services[n].depends_on.join(', ')}` : ''}`;
      if (up.has(n)) li.className = 'on';
      return li;
    }));
  }

  function request() {
    // one request: visitor -> nginx -> wordpress -> mariadb, with a cache lookup in redis
    const path = [[69, 70], [250, 70], [430, 70], [610, 150], [430, 70], [610, 70], [430, 70], [250, 70], [69, 70]];
    const c = el(svg, 'circle', { r: 6, cx: path[0][0], cy: path[0][1], class: 'dot ok' });
    c.animate(path.map(([x, y]) => ({ transform: `translate(${x - path[0][0]}px, ${y - path[0][1]}px)` })), { duration: 4200, easing: 'ease-in-out' }).onfinish = () => c.remove();
  }

  function boot() {
    const my = ++gen;
    up = new Set(); draw();
    order.forEach((n, i) => setTimeout(() => { if (my === gen) { up.add(n); draw(); } }, 450 * (i + 1)));
    setTimeout(() => { if (my === gen) request(); }, 450 * (order.length + 1));
  }

  root.querySelector('[data-in="boot"]').addEventListener('click', boot);
  root.querySelector('[data-in="request"]').addEventListener('click', () => { if (up.size === order.length) request(); else boot(); });
  onLangChange(draw);
  if (reduced()) { up = new Set(order); draw(); }
  else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); boot(); } }, { threshold: 0.3 }).observe(root);
  draw();
}
