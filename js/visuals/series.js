// Helpers for [YYYY-MM-DD, value] series.
const DAY = 86400000;
const t = (d) => Date.parse(d + 'T00:00:00Z');

export function splitGaps(points, maxGapDays = 3) {
  const segs = [];
  for (const p of points) {
    const last = segs.at(-1)?.at(-1);
    if (!last || (t(p[0]) - t(last[0])) / DAY > maxGapDays) segs.push([p]); else segs.at(-1).push(p);
  }
  return segs;
}

export const change = (points) => points.at(-1)[1] / points[0][1] - 1;
