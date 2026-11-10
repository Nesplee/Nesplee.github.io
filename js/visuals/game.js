import { canPlay, detectEnv } from './game-env.js?v=12e5eeaca9';

// A poster until the visitor clicks "Play"; then the owner's game (WebAssembly) in an iframe.
// Keys reach the game only while its iframe has focus, so scrolling the page never moves the player.
export function mount(el, { t, onLangChange }) {
  const stage = el.querySelector('[data-game="stage"]');
  const poster = el.querySelector('[data-game="poster"]');
  const play = el.querySelector('[data-game="play"]');
  const msg = el.querySelector('[data-game="msg"]');
  const maps = [...el.querySelectorAll('[data-game-map]')];
  let state = canPlay(detectEnv()), frame = null, timer = 0, map = maps[0]?.dataset.gameMap;

  const say = (key) => { msg.dataset.key = key; msg.textContent = key ? t(key) : ''; };
  onLangChange(() => { if (msg.dataset.key) msg.textContent = t(msg.dataset.key); });

  if (state !== 'play') { play.hidden = true; maps.forEach((m) => (m.hidden = true)); say(state === 'touch' ? 'game.touch' : 'game.nowasm'); return; }

  function load() {
    clearTimeout(timer);
    frame?.remove();
    say('game.loading');
    frame = document.createElement('iframe');
    frame.title = el.dataset.gameTitle;
    const url = new URL(el.dataset.gamePage, location.href);
    if (map) url.searchParams.set('map', map);
    frame.src = url.href;
    frame.style.aspectRatio = el.dataset.gameAspect;
    frame.hidden = true;
    stage.append(frame);
    timer = setTimeout(() => { if (frame.hidden) { frame.remove(); frame = null; say('game.failed'); } }, 15000);
  }
  addEventListener('message', (e) => {
    if (!frame || e.source !== frame.contentWindow) return;
    if (e.data?.type === 'size' && e.data.w > 0 && e.data.h > 0) frame.style.aspectRatio = `${e.data.w} / ${e.data.h}`;
    if (e.data === 'ready') { clearTimeout(timer); poster.hidden = true; frame.hidden = false; play.textContent = t('game.restart'); say('game.help'); frame.focus(); }
    if (e.data === 'failed') { clearTimeout(timer); frame.remove(); frame = null; poster.hidden = false; say('game.failed'); }
  });
  play.addEventListener('click', load);
  maps.forEach((m) => m.addEventListener('click', () => {
    map = m.dataset.gameMap;
    maps.forEach((x) => x.setAttribute('aria-pressed', String(x === m)));
    if (frame) load();
  }));
}
