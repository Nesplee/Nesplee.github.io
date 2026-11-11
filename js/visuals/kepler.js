import { el, reduced } from './svg.js?v=1d70629a91';

// Illustrative diagram of the Kepler data flow: no real data, only the shape of the pipeline.
// Dots travel from the sources to client reports; some branch off to an issuer reminder.
// Horizontal on wide screens, vertical on phones so the labels stay readable.
const H = 36;
const LAYOUTS = {
  wide: {
    box: '0 0 840 220', w: 116, out: 152,
    nodes: { api: [70, 60], sftp: [70, 160], etl: [260, 110], lex: [420, 110], chk: [580, 110], rep: [762, 50], rem: [762, 170] },
    edges: ['M128 60C170 60 170 110 202 110', 'M128 160C170 160 170 110 202 110', 'M318 110H362', 'M478 110H522', 'M638 110C670 110 650 50 686 50'],
    retry: 'M638 110C670 110 650 170 686 170',
    path: (src, bad) => [[128, src ? 160 : 60], [202, 110], [318, 110], [362, 110], [478, 110], [522, 110], [638, 110], ...(bad ? [[686, 170], [762, 170]] : [[686, 50], [762, 50]])],
  },
  tall: {
    box: '0 0 360 430', w: 132, out: 150,
    nodes: { api: [92, 30], sftp: [268, 30], etl: [180, 120], lex: [180, 205], chk: [180, 290], rep: [92, 400], rem: [268, 400] },
    edges: ['M92 48C92 80 180 70 180 102', 'M268 48C268 80 180 70 180 102', 'M180 138V187', 'M180 223V272', 'M180 308C180 350 92 340 92 382'],
    retry: 'M180 308C180 350 268 340 268 382',
    path: (src, bad) => [[src ? 268 : 92, 48], [180, 102], [180, 138], [180, 187], [180, 223], [180, 272], [180, 308], ...(bad ? [[268, 382], [268, 400]] : [[92, 382], [92, 400]])],
  },
};

export function mount(root, { t, onLangChange }) {
  const svg = root.querySelector('[data-kp="flow"]');
  let gen = 0, mode = '';

  function render() {
    const my = ++gen;
    mode = svg.parentElement.clientWidth < 560 ? 'tall' : 'wide';
    const L = LAYOUTS[mode];
    svg.setAttribute('viewBox', L.box);
    svg.replaceChildren();
    const node = (key, label, cls = '', W = L.w) => {
      const [x, y] = L.nodes[key];
      el(svg, 'rect', { x: x - W / 2, y: y - H / 2, width: W, height: H, rx: 8, class: `node ${cls}` });
      el(svg, 'text', { x, y: y + 4, 'text-anchor': 'middle', class: 'nl small' }, label);
    };
    for (const d of L.edges) el(svg, 'path', { d, class: 'edge' });
    el(svg, 'path', { d: L.retry, class: 'edge retry' });
    const g = el(svg, 'g'); // dots run under the nodes, as if processed inside them
    node('api', 'API'); node('sftp', 'SFTP'); node('etl', 'Airflow ETL'); node('lex', 'LexiFi'); node('chk', t('kp.check'), 'hot');
    node('rep', t('kp.reports'), '', L.out); node('rem', t('kp.remind'), 'q', L.out);
    if (reduced()) return;
    const spawn = () => {
      if (my !== gen) return;
      const box = svg.getBoundingClientRect();
      if (document.hidden || box.bottom < 0 || box.top > innerHeight) { setTimeout(spawn, 500); return; }
      const bad = Math.random() < 0.15; // illustrative share, not a real rate
      const c = el(g, 'circle', { r: 3.5, cx: 0, cy: 0, class: bad ? 'dot retry' : 'dot ok' });
      c.animate(L.path(Math.random() < 0.5, bad).map(([x, y]) => ({ transform: `translate(${x}px, ${y}px)` })), { duration: 3200, easing: 'linear' }).onfinish = () => c.remove();
      setTimeout(spawn, 260);
    };
    spawn();
  }
  render();
  onLangChange(render);
  addEventListener('resize', () => { if ((svg.parentElement.clientWidth < 560 ? 'tall' : 'wide') !== mode) render(); });
}
