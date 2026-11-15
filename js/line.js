// The guiding line: filled down to 60% of the viewport; stations above that point are lit.
const MARK = 0.6;

export const fillHeight = (pageTop, pageH, viewportH) => Math.max(0, Math.min(pageH, viewportH * MARK - pageTop));

export const litStations = (stationTops, viewportH) => stationTops.map((t) => t + 20 < viewportH * MARK);

export function mountLine(page, fill, stations) {
  const update = () => {
    const r = page.getBoundingClientRect();
    fill.style.height = fillHeight(r.top, r.height, innerHeight) + 'px';
    litStations(stations.map((s) => s.getBoundingClientRect().top), innerHeight)
      .forEach((on, i) => stations[i].classList.toggle('lit', on));
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fill.style.height = '100%';
    stations.forEach((s) => s.classList.add('lit'));
    return;
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
