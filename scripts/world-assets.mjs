import { readFile, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";
import { clearFrameBackground } from "../src/game/overworldAtlas.js";

const load = async (path) => new Promise((resolve,reject) => readFile(path).then((buffer) => new PNG().parse(buffer,(error,image) => error ? reject(error) : resolve(image)),reject));
const sprites = await load("public/assets/sprites.png");
const world = await load("public/assets/tudo.png");
const tiles = [
  [sprites,"garden_tree",0,1632,16,16,true],
  [sprites,"garden_empty",17,1632,16,16,true],
  [sprites,"garden_seed",34,1632,16,16,true],
  [world,"game_table_nw",384,383,16,16],
  [world,"game_table_ne",400,383,16,16],
  [world,"game_table_sw",384,399,16,16],
  [world,"game_table_se",400,399,16,16],
  [world,"game_chair",368,383,16,16],
  [world,"crystal_route_path",104,119,16,16],
  [world,"crystal_route_floor",352,351,16,16],
  [world,"crystal_route_roof",104,55,16,16],
];
for (const [source,name,x,y,width,height,transparent] of tiles) {
  if (x + width > source.width || y + height > source.height) throw new Error(`Invalid tile ${name}`);
  const tile = new PNG({ width,height });
  PNG.bitblt(source,tile,x,y,width,height,0,0);
  if (transparent) tile.data.set(clearFrameBackground(tile.data,width));
  await writeFile(`public/assets/${name}.png`,PNG.sync.write(tile));
}
console.log(`${tiles.length} Crystal tiles extracted from the supplied sheets.`);

const ink = [40,48,32,255];
const wood = [208,176,88,255];
const shadow = [120,96,40,255];
const light = [240,216,128,255];
function rectangle(image,x,y,width,height,color) {
  for (let row = Math.max(0,y); row < Math.min(image.height,y + height); row++) {
    for (let column = Math.max(0,x); column < Math.min(image.width,x + width); column++) {
      const offset = (row * image.width + column) * 4;
      image.data.set(color,offset);
    }
  }
}
for (let edges = 0; edges < 8; edges++) {
  const tile = new PNG({ width:16,height:16 });
  rectangle(tile,0,0,16,16,wood);
  for (let row = 0; row < 16; row += 4) { rectangle(tile,0,row,16,1,shadow); rectangle(tile,0,row + 1,16,1,light); rectangle(tile,row % 8 + 4,row + 1,1,3,shadow); }
  for (const column of [edges & 1 ? 0 : -2, edges & 2 ? 14 : -2]) {
    if (column < 0) continue;
    rectangle(tile,column,0,2,16,ink);
    for (const row of [2,11]) { rectangle(tile,column,row,2,3,shadow); rectangle(tile,column,row,1,1,light); }
  }
  if (edges & 4) { rectangle(tile,0,14,16,2,ink); rectangle(tile,2,14,12,1,shadow); }
  await writeFile(`public/assets/dock_${edges}.png`,PNG.sync.write(tile));
}

const ship = new PNG({ width:80,height:160 });
for (let row = 8; row < 32; row += 4) {
  const halfWidth = Math.min(34,4 + Math.floor((row - 8) * 1.25));
  rectangle(ship,40 - halfWidth,row,halfWidth * 2,4,ink);
  rectangle(ship,42 - halfWidth,row + 1,halfWidth * 2 - 4,3,shadow);
}
rectangle(ship,5,32,70,113,ink); rectangle(ship,8,32,64,112,wood);
for (let row = 32; row < 144; row += 8) { rectangle(ship,8,row,64,1,shadow); rectangle(ship,9,row + 1,62,1,light); rectangle(ship,24 + row % 24,row + 1,1,7,shadow); }
rectangle(ship,7,145,66,5,ink); rectangle(ship,10,145,60,3,shadow);
rectangle(ship,12,150,56,4,ink); rectangle(ship,16,150,48,2,shadow);
for (const column of [5,73]) { rectangle(ship,column,31,2,114,shadow); for (let row = 35; row < 144; row += 16) rectangle(ship,column,row,2,2,light); }
rectangle(ship,47,46,3,33,ink); rectangle(ship,48,47,1,31,shadow);
for (let row = 47; row <= 72; row += 2) { const width = Math.min(22,Math.floor((row - 45) * 0.8)); rectangle(ship,50,row,width,2,ink); rectangle(ship,51,row,width - 2,1,[248,248,216,255]); }
await writeFile("public/assets/crystal_ship_pixel.png",PNG.sync.write(ship));

const boat = new PNG({ width:32,height:24 });
rectangle(boat,3,14,25,3,ink); rectangle(boat,4,14,23,1,light);
rectangle(boat,5,17,23,3,ink); rectangle(boat,6,17,19,2,shadow);
rectangle(boat,8,20,17,2,ink); rectangle(boat,9,20,14,1,wood);
rectangle(boat,15,1,2,14,ink);
for (let row = 2; row < 13; row++) { const width = Math.floor((row - 1) * 0.9); rectangle(boat,17,row,width,1,ink); if (width > 2) rectangle(boat,18,row,width - 2,1,[248,248,216,255]); }
await writeFile("public/assets/crystal_boat_pixel.png",PNG.sync.write(boat));
console.log("Pixel docks and boat sprites generated.");