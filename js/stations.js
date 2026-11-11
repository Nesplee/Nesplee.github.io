// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=e0f784ef9d'),
  game: () => import('./visuals/game.js?v=e0f784ef9d'),
  tracker: () => import('./visuals/tracker.js?v=e0f784ef9d'),
  annonces: () => import('./visuals/annonces.js?v=e0f784ef9d'),
  philo: () => import('./visuals/philo.js?v=e0f784ef9d'),
  minishell: () => import('./visuals/minishell.js?v=e0f784ef9d'),
  inception: () => import('./visuals/inception.js?v=e0f784ef9d'),
  kepler: () => import('./visuals/kepler.js?v=e0f784ef9d'),
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
