// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=ea98f1308c'),
  game: () => import('./visuals/game.js?v=ea98f1308c'),
  tracker: () => import('./visuals/tracker.js?v=ea98f1308c'),
  annonces: () => import('./visuals/annonces.js?v=ea98f1308c'),
  philo: () => import('./visuals/philo.js?v=ea98f1308c'),
  minishell: () => import('./visuals/minishell.js?v=ea98f1308c'),
  inception: () => import('./visuals/inception.js?v=ea98f1308c'),
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
