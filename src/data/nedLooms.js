// Electronic-jacquard loom specifications, from the NedGraphics Jacquard 16
// machine-conversion (.ncl / .lfn) library. "hooks" = the loom's harness/needle
// capacity — a design's warp ends must not exceed it (extension hooks add capacity).

export const NED_LOOMS = [
  { id: "staubli-jc5",   name: "Stäubli (JC5)",           controller: "Stäubli",  hooks: 12288, extensions: 0,   cardFormat: "JC5" },
  { id: "bonas-32",      name: "Bonas + 32 extensions",   controller: "Bonas",    hooks: 6144,  extensions: 32,  cardFormat: "JC5" },
  { id: "bonas-64",      name: "Bonas + 64 ext. hooks",   controller: "Bonas",    hooks: 12288, extensions: 64,  cardFormat: "JC5" },
  { id: "grosse",        name: "Grosse (std extensions)", controller: "Grosse",   hooks: 6144,  extensions: 16,  cardFormat: "JC5" },
  { id: "dornier",       name: "Dornier AT (standard)",   controller: "Dornier",  hooks: 5120,  extensions: 8,   cardFormat: "JC5" },
  { id: "dobby",         name: "Dobby (16-shaft)",        controller: "Dobby",    hooks: 16,    extensions: 0,   cardFormat: "WIF" },
];

export const DEFAULT_LOOM = NED_LOOMS[0];
