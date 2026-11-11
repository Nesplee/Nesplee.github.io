// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=5aef843221'),
  game: () => import('./visuals/game.js?v=5aef843221'),
  tracker: () => import('./visuals/tracker.js?v=5aef843221'),
  annonces: () => import('./visuals/annonces.js?v=5aef843221'),
  philo: () => import('./visuals/philo.js?v=5aef843221'),
  minishell: () => import('./visuals/minishell.js?v=5aef843221'),
  inception: () => import('./visuals/inception.js?v=5aef843221'),
  kepler: () => import('./visuals/kepler.js?v=5aef843221'),
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
