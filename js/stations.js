// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=120c0f30a1'),
  game: () => import('./visuals/game.js?v=120c0f30a1'),
  tracker: () => import('./visuals/tracker.js?v=120c0f30a1'),
  annonces: () => import('./visuals/annonces.js?v=120c0f30a1'),
  philo: () => import('./visuals/philo.js?v=120c0f30a1'),
  minishell: () => import('./visuals/minishell.js?v=120c0f30a1'),
  inception: () => import('./visuals/inception.js?v=120c0f30a1'),
  kepler: () => import('./visuals/kepler.js?v=120c0f30a1'),
};

export function mountStations(ctx) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const load = MODULES[e.target.dataset.visual];
      if (load) load().then((m) => m.mount(e.target, ctx)).catch((err) => console.error(err));
    }
  }, { rootMargin: '400px 0px' });
  document.querySelectorAll('[data-visual]').forEach((el) => io.observe(el));
}
