// Visit counting with GoatCounter: no cookies, nothing personal (page, referrer, screen size).
// A few lines of our own instead of their script, so the CSP still only runs code from this site;
// the only outside address allowed is the counting endpoint below.
const ENDPOINT = 'https://nesplee.goatcounter.com/count';

export function countUrl(params) {
  return `${ENDPOINT}?${new URLSearchParams({ ...params, rnd: Math.random().toString(36).slice(2) })}`;
}

// path: page or event name; event: true for actions such as a CV download
export function hit(path, event = false) {
  if (location.hostname !== 'nesplee.github.io') return; // local previews are never counted
  const p = { p: path, t: document.title };
  if (event) p.e = 'true';
  else { p.r = document.referrer; p.s = [screen.width, screen.height, devicePixelRatio || 1].join(','); }
  const url = countUrl(p);
  if (!navigator.sendBeacon?.(url)) new Image().src = url;
}
