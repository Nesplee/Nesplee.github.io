// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=fc7e8710c8'),
  game: () => import('./visuals/game.js?v=fc7e8710c8'),
  tracker: () => import('./visuals/tracker.js?v=fc7e8710c8'),
  annonces: () => import('./visuals/annonces.js?v=fc7e8710c8'),
  philo: () => import('./visuals/philo.js?v=fc7e8710c8'),
  minishell: () => import('./visuals/minishell.js?v=fc7e8710c8'),
  inception: () => import('./visuals/inception.js?v=fc7e8710c8'),
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
