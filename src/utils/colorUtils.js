// Color conversion + k-means color extraction utilities.

export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function colorDistance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/** Sample pixels evenly from raw RGBA image data for faster clustering. */
export function samplePixels(data, maxSamples = 4000) {
  const pixels = [];
  const step = Math.max(1, Math.floor(data.length / 4 / maxSamples));
  for (let i = 0; i < data.length; i += step * 4) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  return pixels;
}

/** Basic k-means clustering to find the dominant colors (yarn palette). */
export function kMeansColors(pixels, k = 16, iterations = 24) {
  let centers = Array.from({ length: k }, (_, i) => [
    ...pixels[Math.floor(i * (pixels.length / k))],
  ]);

  for (let iter = 0; iter < iterations; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const px of pixels) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < k; i++) {
        const d = colorDistance(px, centers[i]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      clusters[best].push(px);
    }
    centers = clusters.map((cluster, i) => {
      if (!cluster.length) return centers[i];
      return [
        Math.round(cluster.reduce((s, p) => s + p[0], 0) / cluster.length),
        Math.round(cluster.reduce((s, p) => s + p[1], 0) / cluster.length),
        Math.round(cluster.reduce((s, p) => s + p[2], 0) / cluster.length),
      ];
    });
  }
  return centers;
}

/** Compute usage % for each center against the sampled pixel population. */
export function computeUsage(pixels, centers) {
  const usage = new Array(centers.length).fill(0);
  for (const px of pixels) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < centers.length; i++) {
      const d = colorDistance(px, centers[i]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    usage[best]++;
  }
  const total = usage.reduce((s, v) => s + v, 0) || 1;
  return usage.map((u) => (u / total) * 100);
}
