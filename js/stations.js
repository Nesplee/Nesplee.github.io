// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=bc9d6a2890'),
  game: () => import('./visuals/game.js?v=bc9d6a2890'),
  tracker: () => import('./visuals/tracker.js?v=bc9d6a2890'),
  annonces: () => import('./visuals/annonces.js?v=bc9d6a2890'),
  philo: () => import('./visuals/philo.js?v=bc9d6a2890'),
  minishell: () => import('./visuals/minishell.js?v=bc9d6a2890'),
  inception: () => import('./visuals/inception.js?v=bc9d6a2890'),
  kepler: () => import('./visuals/kepler.js?v=bc9d6a2890'),
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
