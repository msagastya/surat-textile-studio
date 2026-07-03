// Yarn + material data recovered from NedGraphics Jacquard 16's shipped databases:
//   Materials.xml  → physical/optical constants per material
//   NedGraphics_Yarn_Database.xml → the real per-yarn field schema
// Used to give the Yarn and Simulate tabs a professionally-grounded model instead of guesses.

// ── Materials: optical + physical constants that drive realistic fabric rendering ──
// specular = sheen (0-100), diffuse = matte body (0-100),
// sizeCompressed/Uncompressed = yarn thickness woven vs. loose.
export const NED_MATERIALS = [
  { name: "Chenille",   specular: 1,  diffuse: 40, sizeCompressed: 1.094, sizeUncompressed: 3.397, twisted: true,  heatSet: true  },
  { name: "Cotton",     specular: 15, diffuse: 80, sizeCompressed: 0.88,  sizeUncompressed: 1.52,  twisted: true,  heatSet: false },
  { name: "Cotton Shiny",      specular: 40, diffuse: 50, sizeCompressed: 0.88,  sizeUncompressed: 1.52,  twisted: true,  heatSet: false },
  { name: "Cotton Very Shiny", specular: 70, diffuse: 30, sizeCompressed: 0.88,  sizeUncompressed: 1.52,  twisted: true,  heatSet: false },
  { name: "Silk",       specular: 45, diffuse: 30, sizeCompressed: 0.423, sizeUncompressed: 1.230, twisted: true,  heatSet: true  },
  { name: "Sisal",      specular: 1,  diffuse: 60, sizeCompressed: 0.876, sizeUncompressed: 1.150, twisted: true,  heatSet: false },
  { name: "Terry",      specular: 5,  diffuse: 30, sizeCompressed: 0.891, sizeUncompressed: 1.500, twisted: true,  heatSet: true  },
  { name: "Wool",       specular: 1,  diffuse: 90, sizeCompressed: 2.174, sizeUncompressed: 5.434, twisted: true,  heatSet: true  },
];

// Base material list (Jacquard 16 material.ini)
export const NED_BASE_MATERIALS = [
  "Cotton", "Cottonblend", "Linen", "Silk", "Trevira CS", "Wool", "Woolblend",
];

// ── Yarns: the real NedGraphics yarn record fields ──
// twistSense: S or Z · twist in turns per 10 cm · plies · count (internal Nm-like)
// These sample yarns come straight from NedGraphics_Yarn_Database.xml.
export const NED_YARNS = [
  { name: "Silk 1",        material: "Silk",     plies: 1, twist: 8,  twistSense: "S", count: 10000, spaceDye: "Standard" },
  { name: "Cotton 1",      material: "Cotton",   plies: 2, twist: 12, twistSense: "Z", count: 500,   spaceDye: "Standard" },
  { name: "Cotton Twist 1",material: "Cotton Shiny", plies: 2, twist: 18, twistSense: "S", count: 340, spaceDye: "Standard" },
  { name: "Chenille 1",    material: "Chenille", plies: 1, twist: 4,  twistSense: "S", count: 125,   spaceDye: "Standard" },
  { name: "Chenille 2",    material: "Chenille", plies: 1, twist: 4,  twistSense: "Z", count: 110,   spaceDye: "Standard" },
  { name: "Boucle 1",      material: "Wool",     plies: 2, twist: 6,  twistSense: "S", count: 90,    spaceDye: "Standard" },
  { name: "Mouline 1",     material: "Cotton",   plies: 2, twist: 14, twistSense: "Z", count: 200,   spaceDye: "SpaceDye"  },
  { name: "Slub 1",        material: "Cotton",   plies: 1, twist: 6,  twistSense: "S", count: 150,   spaceDye: "Standard" },
  { name: "Frise 1",       material: "Wool",     plies: 2, twist: 10, twistSense: "S", count: 120,   spaceDye: "Standard" },
  { name: "Sisal 1",       material: "Sisal",    plies: 1, twist: 6,  twistSense: "S", count: 10000, spaceDye: "Standard" },
  { name: "Terry Yarn 1",  material: "Terry",    plies: 1, twist: 20, twistSense: "S", count: 125,   spaceDye: "Standard" },
  { name: "Nub 1",         material: "Wool",     plies: 2, twist: 8,  twistSense: "Z", count: 100,   spaceDye: "Standard" },
];

export function materialByName(name) {
  return NED_MATERIALS.find((m) => m.name === name) || NED_MATERIALS[1];
}
