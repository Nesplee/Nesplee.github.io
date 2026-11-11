// The 42 board: one school project shown at a time, opened under the board (Inception by default).
export function mountBoard(board) {
  const buttons = [...board.querySelectorAll('[data-open]')];
  const ids = buttons.map((b) => b.dataset.open);
  const show = (id) => buttons.forEach((b) => {
    const on = b.dataset.open === id;
    b.setAttribute('aria-expanded', String(on));
    document.getElementById(b.dataset.open).hidden = !on;
  });
  buttons.forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('aria-expanded') === 'true' ? null : b.dataset.open;
    show(id);
    const sec = id && document.getElementById(id);
    if (sec && sec.getBoundingClientRect().top > innerHeight * 0.75) sec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
  // links to a project (index, deep link) open it first, so the browser can scroll to it
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && ids.includes(a.hash.slice(1))) show(a.hash.slice(1));
  });
  const fromHash = location.hash.slice(1);
  show(ids.includes(fromHash) ? fromHash : 'st-inception');
  if (ids.includes(fromHash)) document.getElementById(fromHash).scrollIntoView();
}
