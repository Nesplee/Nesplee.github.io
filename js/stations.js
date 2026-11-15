// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=785e5b2adf'),
  game: () => import('./visuals/game.js?v=785e5b2adf'),
  tracker: () => import('./visuals/tracker.js?v=785e5b2adf'),
  annonces: () => import('./visuals/annonces.js?v=785e5b2adf'),
  philo: () => import('./visuals/philo.js?v=785e5b2adf'),
  minishell: () => import('./visuals/minishell.js?v=785e5b2adf'),
  inception: () => import('./visuals/inception.js?v=785e5b2adf'),
  kepler: () => import('./visuals/kepler.js?v=785e5b2adf'),
};

export function mountStations(ctx) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const load = MODULES[e.target.dataset.visual];
      if (load) load().then((m) => m.mount(e.target, ctx)).catch((err) => { console.error(err); showError(e.target, ctx); });
    }
  }, { rootMargin: '400px 0px' });
  document.querySelectorAll('[data-visual]').forEach((el) => io.observe(el));
}

// a visual that cannot load (data file or module) says so, instead of staying empty
function showError(target, { t, onLangChange }) {
  const p = document.createElement('p');
  p.className = 'load-error';
  p.setAttribute('role', 'alert');
  const set = () => { p.textContent = t('load.failed'); };
  set();
  onLangChange(set);
  target.prepend(p);
}
