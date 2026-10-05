export const TILE_SIZE = 40;
// Visible map area inside the 12px frame and above the 100px message box.
export const VIEW_WIDTH = 776;
export const VIEW_HEIGHT = 468;

// How far from the shore the bobber lands for each zone. Only visual: the
// zone itself still decides which species can bite.
export const CAST_TILES = { 1: 2, 2: 3, 3: 4 };

export const FESTIVAL_STALL = { x: 22, y: 14 };
export const PLAYER_START = { x: 6, y: 9, dir: "up" };
// The pier is a short walkway; the docks widen and lengthen it around the
// pier, and the boat moors in the water just east of the docks.
export const PIER_BOUNDS = { x1: 19, x2: 19, y1: 17, y2: 18 };
export const DOCK_BOUNDS = { x1: 18, x2: 20, y1: 17, y2: 19 };
export const BOAT_BOUNDS = { x1: 21, x2: 22, y1: 18, y2: 18 };
export const BOAT_BOARDING = { x: 20, y: 18, dir: "right" };

// The deep sea map: the deck occupies DEEP_SEA_DECK, with a mast and the
// captain at fixed tiles. Boats leave until 16h and come back at sunset.
export const DEEP_SEA_DECK = { x1: 10, x2: 13, y1: 5, y2: 11 };
export const DEEP_SEA_MAST = { x: 12, y: 7 };
export const DEEP_SEA_CAPTAIN = { x: 12, y: 11 };
export const DEEP_SEA_SPAWN = { x: 10, y: 8, dir: "left" };
export const LAST_DEPARTURE_HOUR = 16;
export const AQUARIUM_FOOTPRINT = { x1: 28, x2: 32, y1: 10, y2: 11 };

// Signs sit on the roof row, centered over the building's door column.
export const BUILDING_SIGNS = [
  { x: 6, y: 6, label: "SUA CASA" },
  { x: 14, y: 6, label: "EQUIPAMENTOS" },
  { x: 22, y: 6, label: "ISCAS" },
  { x: 32, y: 6, label: "OFICINA" },
  { x: 6, y: 10, label: "CABANA DO JOE" },
  { x: 14, y: 10, label: "TAVERNA" },
  { x: 30, y: 10, label: "AQUÁRIO", requires: "aquarium_building", fallback: "AQUÁRIO (FECHADO)" },
];

export function inBounds(x, y, box) {
  return x >= box.x1 && x <= box.x2 && y >= box.y1 && y <= box.y2;
}

function createBugForest() {
  const width = 40;
  const height = 25;
  const rows = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      x === 0 || x === width - 1 || y === 0 || y === height - 1 ? "T" : "G"
    )
  );

  for (const [x, y] of [
    [6, 24], [6, 23], [6, 22], [6, 21], [6, 20], [6, 19],
    [17, 12], [18, 12], [20, 12], [21, 12], [22, 12], [23, 12], [24, 12], [25, 12], [26, 12],
    [27, 12], [28, 12], [29, 12], [30, 12], [31, 12], [32, 12],
    [33, 12], [34, 12], [35, 12], [36, 12], [37, 12], [38, 12],
  ]) rows[y][x] = ".";

  rows[24][6] = "J";
  rows[2][9] = "N";
  rows[12][29] = "+";
  rows[10][29] = "G";
  rows[11][28] = "h";
  rows[11][30] = "h";

  for (const [x, y] of [
    [3, 4], [9, 3], [14, 6], [4, 9], [11, 11], [17, 15], [3, 18],
    [9, 20], [15, 22], [23, 7], [25, 5], [35, 5], [37, 8], [22, 17],
    [36, 18], [33, 21], [25, 21], [19, 4], [19, 5], [19, 6], [19, 7],
    [19, 8], [19, 9], [19, 10], [19, 11], [19, 13], [19, 14], [19, 15],
    [19, 16], [19, 17], [19, 18], [19, 19], [19, 20], [19, 21],
  ]) rows[y][x] = "T";

  for (let y = 1; y < height - 1; y++) {
    if (y !== 12) rows[y][19] = "T";
  }

  for (const [x, y] of [[2, 5], [12, 4], [7, 13], [15, 18], [32, 8], [34, 16]]) {
    rows[y][x] = "F";
  }

  return rows.map((row) => row.join(""));
}

export const MAPS_DATA = {
  village: [
    "TTTTTTJTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "T~~~~~J~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~J~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~J~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~J~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
    "TGGGHHHHHGGGHHHHHGGGHHHHHGGGGGHHHHHGGGGT",
    "TGGGWWPWWGGGWWEWWGGGWWBWWGGGGGWWKWWGGGGT",
    "TGGG...............................GGGGT",
    "TGGGGGGFGGGGGGGFGGGGGGGF.GGGGGGGGGGGGGGT",
    "TGGGHHHHHGGGHHHHHGGGGGGG.GGGHHHHHGGGGGGT",
    "TGGGWWDWWGGGWWRWWGGGGGGG.GGGWWZWWGGGGGGT",
    "TGGG...............................GGGGT",
    "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGFGGTTGT",
    "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGTTGT",
    "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
    "TSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSST",
    "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXT",
    "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXT",
    "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXT",
    "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXT",
    "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXT",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ],
  bug_forest: createBugForest(),
  deep_sea: [
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXbbbbXXXXXXXXXX",
    "XXXXXXXXXXbbbbXXXXXXXXXX",
    "XXXXXXXXXXbbmbXXXXXXXXXX",
    "XXXXXXXXXXbbbbXXXXXXXXXX",
    "XXXXXXXXXXbbbbXXXXXXXXXX",
    "XXXXXXXXXXbbbbXXXXXXXXXX",
    "XXXXXXXXXXbbcbXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
  ],
  player_house: [
    "0000000000000000",
    "0##############0",
    "0#__==========#0",
    "0#============#0",
    "0#+h==========#0",
    "0#============#0",
    "0#============#0",
    "0######--######0",
    "0000000000000000",
  ],
  shop_gear: [
    "0000000000000000",
    "0##############0",
    "0#============#0",
    "0#CCCCCC======#0",
    "0#============#0",
    "0#============#0",
    "0#============#0",
    "0######--######0",
    "0000000000000000",
  ],
  shop_bait: [
    "0000000000000000",
    "0##############0",
    "0#============#0",
    "0#CCC=========#0",
    "0#============#0",
    "0#============#0",
    "0#============#0",
    "0######--######0",
    "0000000000000000",
  ],
  carpenter_shop: [
    "0000000000000000",
    "0##############0",
    "0#UU==========#0",
    "0#============#0",
    "0#CCCC========#0",
    "0#============#0",
    "0#============#0",
    "0#============#0",
    "0######--######0",
    "0000000000000000",
  ],
  hut_old: [
    "0000000000000000",
    "0##############0",
    "0#_===========#0",
    "0#============#0",
    "0#M===========#0",
    "0#============#0",
    "0#============#0",
    "0######--######0",
    "0000000000000000",
  ],
  tavern: [
    "0000000000000000",
    "0##############0",
    "0#Q===========#0",
    "0#============#0",
    "0#A==CCCC=====#0",
    "0#============#0",
    "0#============#0",
    "0######--######0",
    "0000000000000000",
  ],
};
