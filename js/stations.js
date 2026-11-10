// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=1deb225520'),
  game: () => import('./visuals/game.js?v=1deb225520'),
  tracker: () => import('./visuals/tracker.js?v=1deb225520'),
  annonces: () => import('./visuals/annonces.js?v=1deb225520'),
  philo: () => import('./visuals/philo.js?v=1deb225520'),
  minishell: () => import('./visuals/minishell.js?v=1deb225520'),
  inception: () => import('./visuals/inception.js?v=1deb225520'),
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
