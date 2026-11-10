// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=9ee54cad27'),
  game: () => import('./visuals/game.js?v=9ee54cad27'),
  tracker: () => import('./visuals/tracker.js?v=9ee54cad27'),
  annonces: () => import('./visuals/annonces.js?v=9ee54cad27'),
  philo: () => import('./visuals/philo.js?v=9ee54cad27'),
  minishell: () => import('./visuals/minishell.js?v=9ee54cad27'),
  inception: () => import('./visuals/inception.js?v=9ee54cad27'),
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
