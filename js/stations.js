// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=c9a760f9ac'),
  game: () => import('./visuals/game.js?v=c9a760f9ac'),
  tracker: () => import('./visuals/tracker.js?v=c9a760f9ac'),
  annonces: () => import('./visuals/annonces.js?v=c9a760f9ac'),
  philo: () => import('./visuals/philo.js?v=c9a760f9ac'),
  minishell: () => import('./visuals/minishell.js?v=c9a760f9ac'),
  inception: () => import('./visuals/inception.js?v=c9a760f9ac'),
  kepler: () => import('./visuals/kepler.js?v=c9a760f9ac'),
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
