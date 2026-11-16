// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=561d3767ab'),
  game: () => import('./visuals/game.js?v=561d3767ab'),
  tracker: () => import('./visuals/tracker.js?v=561d3767ab'),
  annonces: () => import('./visuals/annonces.js?v=561d3767ab'),
  philo: () => import('./visuals/philo.js?v=561d3767ab'),
  minishell: () => import('./visuals/minishell.js?v=561d3767ab'),
  inception: () => import('./visuals/inception.js?v=561d3767ab'),
  kepler: () => import('./visuals/kepler.js?v=561d3767ab'),
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
