export const TILE_SIZE = 40;

export const FESTIVAL_STALL = { x: 22, y: 14 };
export const PLAYER_START = { x: 6, y: 9, dir: "up" };
export const DOCK_BOUNDS = { x1: 18, x2: 20, y1: 17, y2: 18 };
export const BOAT_BOUNDS = { x1: 18, x2: 19, y1: 17, y2: 17 };
export const AQUARIUM_FOOTPRINT = { x1: 28, x2: 32, y1: 10, y2: 11 };

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
