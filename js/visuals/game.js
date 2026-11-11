import { canPlay, detectEnv } from './game-env.js?v=1d70629a91';

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
    if (!frame || e.source !== frame.contentWindow || e.origin !== location.origin) return; // only our own game frame
    if (e.data?.type === 'size') { const w = Math.round(Number(e.data.w)), h = Math.round(Number(e.data.h)); if (w > 0 && h > 0 && w < 10000 && h < 10000) frame.style.aspectRatio = `${w} / ${h}`; }
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
