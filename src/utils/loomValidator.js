// Validate a design's warp width against an electronic-jacquard loom's hook capacity.
// A jacquard design is woven one warp end per hook; total ends = EPI × fabric width.

export function totalEnds(epi, fabricWidthCm) {
  const widthIn = fabricWidthCm / 2.54;
  return Math.round((epi || 0) * widthIn);
}

export function validateLoom(loom, epi, fabricWidthCm) {
  const ends = totalEnds(epi, fabricWidthCm);
  const fits = ends <= loom.hooks;
  const usedPct = loom.hooks ? Math.min(100, (ends / loom.hooks) * 100) : 0;
  return {
    ends,
    hooks: loom.hooks,
    fits,
    usedPct: +usedPct.toFixed(1),
    headroom: loom.hooks - ends,
    message: fits
      ? `${ends.toLocaleString()} ends fit ${loom.name} (${loom.hooks.toLocaleString()} hooks, ${usedPct.toFixed(0)}% used)`
      : `${ends.toLocaleString()} ends exceed ${loom.name} by ${(ends - loom.hooks).toLocaleString()} — reduce EPI, width, or repeat, or pick a larger loom`,
  };
}
