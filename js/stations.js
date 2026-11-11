// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=ee2d8f8fdf'),
  game: () => import('./visuals/game.js?v=ee2d8f8fdf'),
  tracker: () => import('./visuals/tracker.js?v=ee2d8f8fdf'),
  annonces: () => import('./visuals/annonces.js?v=ee2d8f8fdf'),
  philo: () => import('./visuals/philo.js?v=ee2d8f8fdf'),
  minishell: () => import('./visuals/minishell.js?v=ee2d8f8fdf'),
  inception: () => import('./visuals/inception.js?v=ee2d8f8fdf'),
  kepler: () => import('./visuals/kepler.js?v=ee2d8f8fdf'),
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
