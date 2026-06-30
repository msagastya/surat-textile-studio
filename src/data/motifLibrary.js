// ── Motif generators — returns 2D array [r][c] = colorIdx (0=bg, 1=main, 2=accent, 3=highlight)

function makeGrid(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function diamondMotif(n = 16) {
  const g = makeGrid(n);
  const cx = (n - 1) / 2, cy = (n - 1) / 2, half = n / 2;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const d = (Math.abs(r - cy) + Math.abs(c - cx)) / half;
      if (d <= 0.15) g[r][c] = 3;
      else if (d <= 0.45) g[r][c] = 2;
      else if (d <= 0.78) g[r][c] = 1;
      else if (d <= 1.0) g[r][c] = 2;
    }
  }
  return g;
}

function lotusMotif(n = 24) {
  const g = makeGrid(n);
  const cx = (n - 1) / 2, cy = (n - 1) / 2, rMax = n / 2 - 1;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const dx = c - cx, dy = r - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / rMax;
      const angle = Math.atan2(dy, dx);
      const petal = Math.pow(Math.abs(Math.cos(4 * angle)), 1.5);
      if (dist < 0.18) {
        g[r][c] = 3;
      } else if (dist < 1.0 - 0.08) {
        const shape = petal * (1 - Math.pow(dist, 1.8) * 0.4);
        if (shape > 0.62) g[r][c] = 1;
        else if (shape > 0.38) g[r][c] = 2;
      }
    }
  }
  return g;
}

function paislKeyMotif(n = 24) {
  const g = makeGrid(n);
  const cx = n * 0.5, cy = n * 0.5;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const dx = (c - cx) / (n * 0.38);
      const dy = (r - cy) / (n * 0.48);
      // Cardioid-like shape for paisley
      const dist = Math.sqrt(dx * dx + dy * dy);
      const bend = dx * 0.5;
      const d = Math.sqrt((dx - bend) * (dx - bend) + (dy + 0.15) * (dy + 0.15));
      if (d < 0.55) {
        if (d < 0.15) g[r][c] = 3;
        else if (d < 0.32) g[r][c] = 2;
        else g[r][c] = 1;
      }
    }
  }
  // Hook curl at top
  const hookR = Math.floor(n * 0.12), hookC = Math.floor(cx + n * 0.15);
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const rr = hookR + dr, cc = hookC + dc;
      if (rr >= 0 && rr < n && cc >= 0 && cc < n)
        if (Math.abs(dr) + Math.abs(dc) <= 2) g[rr][cc] = 2;
    }
  }
  return g;
}

function jaaliMotif(n = 16) {
  const g = makeGrid(n);
  const pitch = Math.max(3, Math.floor(n / 5));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const d1 = (r + c) % pitch;
      const d2 = ((r - c) % pitch + pitch) % pitch;
      if (d1 === 0 || d2 === 0) g[r][c] = 1;
      if (d1 === 0 && d2 === 0) g[r][c] = 3;
    }
  }
  return g;
}

function starMotif(n = 16) {
  const g = makeGrid(n);
  const cx = (n - 1) / 2, cy = (n - 1) / 2, rMax = n / 2;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const dx = c - cx, dy = r - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / rMax;
      const angle = Math.atan2(dy, dx);
      const star = Math.pow(Math.abs(Math.cos(4 * angle)), 2.5);
      const shape = star - dist * 1.4;
      if (dist < 0.18) g[r][c] = 3;
      else if (shape > 0.35) g[r][c] = 2;
      else if (shape > 0.1 && dist < 0.85) g[r][c] = 1;
    }
  }
  return g;
}

function chevronMotif(n = 16) {
  const g = makeGrid(n);
  const half = n / 2, pitch = Math.floor(n / 3);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const fold = Math.abs(c - half);
      const v = (r + fold) % pitch;
      if (v === 0) g[r][c] = 1;
      else if (v === 1) g[r][c] = 2;
      else if (v === 2) g[r][c] = 3;
    }
  }
  return g;
}

function trellisMotif(n = 16) {
  const g = makeGrid(n);
  const pitch = Math.max(4, Math.floor(n / 4));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const p = pitch;
      const dr = r % p, dc = c % p;
      const atDiag1 = (dr + dc) % p === 0 || (dr + dc) % p === 1;
      const atDiag2 = (dr - dc + n * p) % p === 0 || (dr - dc + n * p) % p === 1;
      if (atDiag1 && atDiag2) g[r][c] = 3;
      else if (atDiag1 || atDiag2) g[r][c] = 1;
    }
  }
  return g;
}

function mangoButtaMotif(n = 20) {
  // Mango / paisley variant common in Surat sarees
  const g = makeGrid(n);
  const cx = n / 2, cy = n * 0.6;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const dx = (c - cx) / (n * 0.3);
      const dy = (r - cy) / (n * 0.5);
      // Offset circle for mango shape
      const d = Math.sqrt(dx * dx + Math.pow(dy + dx * dx * 0.5, 2));
      if (d < 0.22) g[r][c] = 3;
      else if (d < 0.5) g[r][c] = 2;
      else if (d < 0.8) g[r][c] = 1;
      // Tip curl
      if (r < n * 0.18 && Math.abs(c - cx - n * 0.1) < n * 0.1) {
        const dd = Math.sqrt(Math.pow((c - cx - n * 0.1) / (n * 0.1), 2) + Math.pow((r - n * 0.14) / (n * 0.08), 2));
        if (dd < 0.8) g[r][c] = 2;
      }
    }
  }
  return g;
}

function stripeMotif(n = 16) {
  const g = makeGrid(n);
  const step = Math.floor(n / 5);
  for (let r = 0; r < n; r++) {
    const band = Math.floor(r / step) % 3;
    for (let c = 0; c < n; c++) {
      g[r][c] = band === 0 ? 1 : band === 1 ? 2 : 0;
    }
  }
  return g;
}

function buttiMotif(n = 16) {
  // Scattered small butti (dotted) motif
  const g = makeGrid(n);
  const positions = [
    [n * 0.2, n * 0.2], [n * 0.2, n * 0.8],
    [n * 0.5, n * 0.5],
    [n * 0.8, n * 0.2], [n * 0.8, n * 0.8],
    [n * 0.35, n * 0.5], [n * 0.65, n * 0.5],
    [n * 0.5, n * 0.25], [n * 0.5, n * 0.75],
  ];
  for (const [pr, pc] of positions) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const dist = Math.sqrt(dr * dr + dc * dc);
        const rr = Math.round(pr) + dr, cc = Math.round(pc) + dc;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n && dist <= 2)
          g[rr][cc] = dist <= 0.5 ? 3 : dist <= 1.2 ? 2 : 1;
      }
    }
  }
  return g;
}

// ── Public library ──────────────────────────────────────────────────────────

export const MOTIF_LIBRARY = [
  { id: "diamond",    name: "Diamond (Hira)",     category: "Geometric",  size: 16, fn: () => diamondMotif(16) },
  { id: "lotus",      name: "Lotus (Kamal)",       category: "Floral",     size: 24, fn: () => lotusMotif(24) },
  { id: "paisley",    name: "Paisley (Kalka)",     category: "Traditional",size: 24, fn: () => paislKeyMotif(24) },
  { id: "mango",      name: "Mango Buta",          category: "Traditional",size: 20, fn: () => mangoButtaMotif(20) },
  { id: "jaal",       name: "Jaal (Net)",          category: "Geometric",  size: 16, fn: () => jaaliMotif(16) },
  { id: "star",       name: "Star (Tara)",         category: "Geometric",  size: 16, fn: () => starMotif(16) },
  { id: "chevron",    name: "Chevron (Lehar)",     category: "Border",     size: 16, fn: () => chevronMotif(16) },
  { id: "trellis",    name: "Trellis (Jali)",      category: "Geometric",  size: 16, fn: () => trellisMotif(16) },
  { id: "butti",      name: "Butti (Scattered)",   category: "Floral",     size: 16, fn: () => buttiMotif(16) },
  { id: "stripe",     name: "Stripe (Dharia)",     category: "Border",     size: 16, fn: () => stripeMotif(16) },
];

export function getMotifGrid(motifId) {
  const m = MOTIF_LIBRARY.find((m) => m.id === motifId);
  return m ? m.fn() : null;
}

// Scale a 2D motif to target width×height
export function scaleMotif(motif2d, targetW, targetH) {
  const srcH = motif2d.length, srcW = motif2d[0]?.length || 0;
  return Array.from({ length: targetH }, (_, r) =>
    Array.from({ length: targetW }, (_, c) => {
      const sr = Math.floor((r / targetH) * srcH);
      const sc = Math.floor((c / targetW) * srcW);
      return motif2d[sr]?.[sc] ?? 0;
    })
  );
}

// Place a 2D motif onto a flat grid at position (startR, startC)
// motifColorMap: [unused, paletteIdx1, paletteIdx2, paletteIdx3] (1-indexed into palette)
export function placeMotif(grid, gridW, gridH, motif2d, startR, startC, colorMap) {
  const next = [...grid];
  for (let mr = 0; mr < motif2d.length; mr++) {
    for (let mc = 0; mc < motif2d[mr].length; mc++) {
      const v = motif2d[mr][mc];
      if (v === 0) continue;
      const r = startR + mr, c = startC + mc;
      if (r >= 0 && r < gridH && c >= 0 && c < gridW) {
        next[r * gridW + c] = colorMap[v] || v;
      }
    }
  }
  return next;
}
