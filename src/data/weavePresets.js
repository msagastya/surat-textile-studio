// Weave structure presets: 1 = warp up (interlacing point), 0 = warp down.
// Each row represents one shaft; each column represents one pick.
export const WEAVE_PRESETS = {
  plain: {
    matrix: [
      [1, 0],
      [0, 1],
    ],
    desc: "Georgette, Chiffon, Rayon",
  },
  twill: {
    matrix: [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
      [1, 0, 0, 1],
    ],
    desc: "Denim, Suiting",
  },
  satin5: {
    matrix: [
      [1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
    ],
    desc: "Satin Sarees, Lining",
  },
  jacquard: {
    matrix: [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 1, 1, 0, 0],
    ],
    desc: "Jacquard Sarees, Banarasi",
  },
  dobby: {
    matrix: [
      [1, 1, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0, 1],
    ],
    desc: "Dobby Sarees, Dress material",
  },
  crepe: {
    matrix: [
      [1, 0, 0, 1, 0],
      [0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0],
      [0, 0, 1, 0, 1],
      [0, 1, 0, 1, 0],
    ],
    desc: "Crepe Fabric",
  },
  velvet: {
    matrix: [
      [1, 1, 1, 0],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
    ],
    desc: "Velvet Blouses, Lehengas",
  },
  basket: {
    matrix: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    desc: "Basket Weave, Canvas",
  },
};
