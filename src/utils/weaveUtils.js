// ── Threading generators ────────────────────────────────────────────────────

export function genThreading(numEnds, numShafts, pattern = "straight") {
  if (pattern === "pointed") {
    const cycle = 2 * (numShafts - 1);
    return Array.from({ length: numEnds }, (_, i) => {
      const pos = i % cycle;
      return pos < numShafts ? pos : cycle - pos;
    });
  }
  if (pattern === "broken") {
    const half = Math.ceil(numShafts / 2);
    return Array.from({ length: numEnds }, (_, i) =>
      i % 2 === 0 ? Math.floor(i / 2) % half : half + (Math.floor(i / 2) % (numShafts - half))
    );
  }
  if (pattern === "rosepath") {
    const seq = [0, 2, 1, 3];
    return Array.from({ length: numEnds }, (_, i) => seq[i % seq.length] % numShafts);
  }
  // straight
  return Array.from({ length: numEnds }, (_, i) => i % numShafts);
}

// ── Tie-up presets ──────────────────────────────────────────────────────────

export function genTieup(numShafts, numTreadles, pattern = "straight") {
  if (pattern === "plain") {
    return Array.from({ length: numShafts }, (_, s) =>
      Array.from({ length: numTreadles }, (_, t) => s % 2 === t % 2 ? 1 : 0)
    );
  }
  if (pattern === "twill-z") {
    return Array.from({ length: numShafts }, (_, s) =>
      Array.from({ length: numTreadles }, (_, t) => {
        const lifts = Math.ceil(numShafts / 2);
        return ((t - s + numShafts) % numShafts) < lifts ? 1 : 0;
      })
    );
  }
  if (pattern === "twill-s") {
    return Array.from({ length: numShafts }, (_, s) =>
      Array.from({ length: numTreadles }, (_, t) => {
        const lifts = Math.ceil(numShafts / 2);
        return ((s - t + numShafts) % numShafts) < lifts ? 1 : 0;
      })
    );
  }
  if (pattern === "satin") {
    const step = numShafts > 4 ? Math.floor(numShafts / 2) - 1 : 2;
    return Array.from({ length: numShafts }, (_, s) =>
      Array.from({ length: numTreadles }, (_, t) => (s * step) % numShafts === t % numShafts ? 1 : 0)
    );
  }
  if (pattern === "basket") {
    return Array.from({ length: numShafts }, (_, s) =>
      Array.from({ length: numTreadles }, (_, t) => {
        const gs = Math.floor(s / 2);
        const gt = Math.floor(t / 2);
        return gs % 2 === gt % 2 ? 1 : 0;
      })
    );
  }
  // straight: each treadle lifts exactly one shaft
  return Array.from({ length: numShafts }, (_, s) =>
    Array.from({ length: numTreadles }, (_, t) => t % numShafts === s ? 1 : 0)
  );
}

// ── Treadling generators ────────────────────────────────────────────────────

export function genTreadling(numPicks, numTreadles, pattern = "straight") {
  if (pattern === "reverse") {
    return Array.from({ length: numPicks }, (_, i) =>
      (numTreadles - 1) - (i % numTreadles)
    );
  }
  if (pattern === "pointed") {
    const cycle = 2 * (numTreadles - 1);
    return Array.from({ length: numPicks }, (_, i) => {
      const pos = i % cycle;
      return pos < numTreadles ? pos : cycle - pos;
    });
  }
  return Array.from({ length: numPicks }, (_, i) => i % numTreadles);
}

// ── Core: compute draw-down ─────────────────────────────────────────────────
// threading[end]        = shaft index (0-based)
// tieup[shaft][treadle] = 1 | 0
// treadling[pick]       = treadle index (0-based)
// returns drawdown[pick][end] = 1 (warp up) | 0 (weft up)

export function computeDrawdown(threading, tieup, treadling) {
  return treadling.map((treadle) =>
    threading.map((shaft) => tieup[shaft]?.[treadle] ?? 0)
  );
}

// Derive a plausible threading from a draw-down matrix (heuristic)
export function inferThreading(matrix) {
  const numEnds = matrix[0]?.length ?? 0;
  const cols = Array.from({ length: numEnds }, (_, c) =>
    matrix.map((row) => row[c]).join("")
  );
  // assign shaft by column signature
  const sig = new Map();
  let next = 0;
  return cols.map((s) => {
    if (!sig.has(s)) sig.set(s, next++);
    return sig.get(s);
  });
}

// ── Repeat / tiling ─────────────────────────────────────────────────────────

export function applyRepeatMode(matrix, mode) {
  if (!matrix?.length || !matrix[0]?.length) return matrix;
  if (mode === "straight") return matrix;

  if (mode === "mirror-h") {
    return matrix.map((row) => [...row, ...[...row].reverse()]);
  }
  if (mode === "mirror-v") {
    return [...matrix, ...[...matrix].reverse()];
  }
  if (mode === "brick") {
    const shift = Math.floor(matrix[0].length / 2);
    return matrix.map((row, i) => {
      if (i % 2 === 0) return [...row, ...row];
      return [...row.slice(shift), ...row.slice(0, shift), ...row.slice(shift), ...row.slice(0, shift)].slice(0, row.length * 2);
    });
  }
  if (mode === "half-drop") {
    const shift = Math.floor(matrix.length / 2);
    const shifted = [...matrix.slice(shift), ...matrix.slice(0, shift)];
    return matrix.map((row, i) => [...row, ...shifted[i]]);
  }
  if (mode === "rotate-90") {
    const R = matrix.length, C = matrix[0].length;
    return Array.from({ length: C }, (_, j) =>
      Array.from({ length: R }, (_, i) => matrix[R - 1 - i][j])
    );
  }
  return matrix;
}

// ── Color reduction (k-means merge) ────────────────────────────────────────

function colorDist(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

export function reduceColors(palette, targetCount) {
  if (palette.length <= targetCount) return palette;
  let clusters = palette.map((c) => ({ ...c, members: [c] }));

  while (clusters.length > targetCount) {
    let bestI = 0, bestJ = 1, bestDist = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = colorDist(clusters[i].rgb, clusters[j].rgb);
        if (d < bestDist) { bestDist = d; bestI = i; bestJ = j; }
      }
    }
    const a = clusters[bestI], b = clusters[bestJ];
    const totalPct = (a.percentage ?? 1) + (b.percentage ?? 1);
    const wa = (a.percentage ?? 1) / totalPct, wb = (b.percentage ?? 1) / totalPct;
    const merged = {
      rgb: [
        Math.round(a.rgb[0] * wa + b.rgb[0] * wb),
        Math.round(a.rgb[1] * wa + b.rgb[1] * wb),
        Math.round(a.rgb[2] * wa + b.rgb[2] * wb),
      ],
      percentage: totalPct,
      yarnName: a.yarnName || b.yarnName,
      weaveType: a.weaveType || b.weaveType,
    };
    merged.hex = "#" + merged.rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
    clusters = [
      ...clusters.slice(0, bestI),
      ...clusters.slice(bestI + 1, bestJ),
      ...clusters.slice(bestJ + 1),
      merged,
    ];
  }
  return clusters.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
}
