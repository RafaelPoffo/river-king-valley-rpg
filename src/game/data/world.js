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

export const MAPS_DATA = {
  village: [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
    "T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T",
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
