// Each [data-visual="<name>"] element gets its visual module, imported when it nears the viewport.
const MODULES = {
  pushswap: () => import('./visuals/pushswap.js?v=bfb5fa888b'),
  game: () => import('./visuals/game.js?v=bfb5fa888b'),
  tracker: () => import('./visuals/tracker.js?v=bfb5fa888b'),
  annonces: () => import('./visuals/annonces.js?v=bfb5fa888b'),
  philo: () => import('./visuals/philo.js?v=bfb5fa888b'),
  minishell: () => import('./visuals/minishell.js?v=bfb5fa888b'),
  inception: () => import('./visuals/inception.js?v=bfb5fa888b'),
  kepler: () => import('./visuals/kepler.js?v=bfb5fa888b'),
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
