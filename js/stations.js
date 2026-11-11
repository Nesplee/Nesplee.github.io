// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=f3953f36ff'),
  game: () => import('./visuals/game.js?v=f3953f36ff'),
  tracker: () => import('./visuals/tracker.js?v=f3953f36ff'),
  annonces: () => import('./visuals/annonces.js?v=f3953f36ff'),
  philo: () => import('./visuals/philo.js?v=f3953f36ff'),
  minishell: () => import('./visuals/minishell.js?v=f3953f36ff'),
  inception: () => import('./visuals/inception.js?v=f3953f36ff'),
  kepler: () => import('./visuals/kepler.js?v=f3953f36ff'),
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
