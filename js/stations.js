// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=a9ea34af8f'),
  game: () => import('./visuals/game.js?v=a9ea34af8f'),
  tracker: () => import('./visuals/tracker.js?v=a9ea34af8f'),
  annonces: () => import('./visuals/annonces.js?v=a9ea34af8f'),
  philo: () => import('./visuals/philo.js?v=a9ea34af8f'),
  minishell: () => import('./visuals/minishell.js?v=a9ea34af8f'),
  inception: () => import('./visuals/inception.js?v=a9ea34af8f'),
  kepler: () => import('./visuals/kepler.js?v=a9ea34af8f'),
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
