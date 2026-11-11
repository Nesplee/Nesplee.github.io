// Desktop hero: the lowest words of the staircase bite into the photo by about one letter, whatever the font
// and screen width (the owner's local font is narrower than the fallback, so a fixed offset is not enough).

// x of the circle's right edge at the height of a text row (null when the row does not cross the circle)
export function edgeAt(disc, row) {
  const cx = disc.left + disc.width / 2, cy = disc.top + disc.height / 2, r = disc.width / 2;
  const dy = Math.max(0, row.top - cy, cy - row.bottom);
  return dy < r ? cx + Math.sqrt(r * r - dy * dy) : null;
}

// horizontal shift to apply to the title: the lowest word that crosses the circle starts `bite` inside it,
// and the red word never touches the red circle (it keeps `clear` px of air)
export function titleShift(disc, rows, red, bite, clear) {
  const target = rows.find((r) => edgeAt(disc, r) !== null);
  if (!target) return 0;
  let shift = edgeAt(disc, target) - bite - target.left;
  const redEdge = edgeAt(disc, red);
  if (redEdge !== null) shift = Math.max(shift, redEdge + clear - red.left);
  return shift;
}

// smallest staircase step (px) that lets the target row bite while the red row keeps clear of the circle;
// `gap` = how many steps separate the red row from the target row
export function neededStep(disc, target, red, bite, clear, gap) {
  const te = edgeAt(disc, target), re = edgeAt(disc, red);
  if (te === null || re === null) return 0;
  return ((re + clear) - (te - bite)) / gap;
}

export function mountHero(h1, disc, onLangChange) {
  const box = (a) => { const q = document.createRange(); q.selectNodeContents(a); return q.getBoundingClientRect(); };
  const place = () => {
    h1.style.marginLeft = '';
    h1.style.removeProperty('--step');
    if (!matchMedia('(min-width: 901px)').matches) return;
    const em = parseFloat(getComputedStyle(h1).fontSize), bite = 0.9 * em, clear = 0.1 * em;
    const measure = () => ({ d: disc.getBoundingClientRect(), rows: ['.s5', '.s4'].map((s) => box(h1.querySelector(s))), red: box(h1.querySelector('.s3')) });
    let m = measure();
    // on wide screens the circle curves more than one step: widen the step just enough (it stays regular)
    const i = m.rows.findIndex((r) => edgeAt(m.d, r) !== null);
    if (i >= 0) {
      const step = parseFloat(getComputedStyle(h1).getPropertyValue('--step')) * em;
      const need = neededStep(m.d, m.rows[i], m.red, bite, clear, 2 - i);
      if (need > step) { h1.style.setProperty('--step', `${need}px`); m = measure(); }
    }
    h1.style.marginLeft = `${titleShift(m.d, m.rows, m.red, bite, clear)}px`;
  };
  place();
  addEventListener('resize', place);
  document.fonts?.ready.then(place);
  onLangChange(place);
}
