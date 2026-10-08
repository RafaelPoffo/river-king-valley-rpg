import { MAPS_DATA, TILE_SIZE, isForestAccess, GARDEN_BOUNDS, inBounds } from "./data/world.js";

export const TREE_ATLAS_URL = "/assets/arvores.png";
export const TREE_ATLAS_SIZE = 256;
export const TREE_FRAMES = {
  pine: { x: 32, y: 0, width: 32, height: 64 },
  silverPine: { x: 64, y: 0, width: 32, height: 64 },
  amberPine: { x: 96, y: 0, width: 32, height: 64 },
  bluePine: { x: 128, y: 0, width: 32, height: 64 },
  redPine: { x: 224, y: 0, width: 32, height: 64 },
  blueOak: { x: 32, y: 96, width: 64, height: 64 },
  amberOak: { x: 96, y: 96, width: 64, height: 64 },
  redOak: { x: 160, y: 96, width: 64, height: 64 },
  greenOak: { x: 64, y: 192, width: 64, height: 64 },
  silverOak: { x: 128, y: 192, width: 64, height: 64 },
};

const SEASON_TREES = [
  ["pine", "greenOak", "blueOak"],
  ["bluePine", "greenOak", "blueOak"],
  ["amberPine", "amberOak", "redOak", "redPine"],
  ["silverPine", "silverOak", "bluePine"],
];

export function clearTreeBackground(pixels, width, height) {
  const result = new Uint8ClampedArray(pixels);
  const corners = [0, width - 1, width * (height - 1), width * height - 1];
  const colors = corners.map((position) => Array.from(pixels.slice(position * 4, position * 4 + 3)));
  const visited = new Uint8Array(width * height);
  const queue = [];
  for (let column = 0; column < width; column++) queue.push(column, width * (height - 1) + column);
  for (let row = 0; row < height; row++) queue.push(row * width, row * width + width - 1);
  while (queue.length) {
    const position = queue.pop();
    if (visited[position]) continue;
    visited[position] = 1;
    const offset = position * 4;
    if (!colors.some((color) => color.every((value, channel) => pixels[offset + channel] === value))) continue;
    result[offset + 3] = 0;
    const column = position % width;
    const row = Math.floor(position / width);
    if (column > 0) queue.push(position - 1);
    if (column < width - 1) queue.push(position + 1);
    if (row > 0) queue.push(position - width);
    if (row < height - 1) queue.push(position + width);
  }
  return result;
}

let treeAtlasPromise;
export function loadForestAtlas() {
  if (!treeAtlasPromise) {
    treeAtlasPromise = (async () => {
      const image = new Image();
      image.src = TREE_ATLAS_URL;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = TREE_ATLAS_SIZE;
      canvas.height = TREE_ATLAS_SIZE;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      for (const frame of Object.values(TREE_FRAMES)) {
        const pixels = context.getImageData(frame.x, frame.y, frame.width, frame.height);
        pixels.data.set(clearTreeBackground(pixels.data, frame.width, frame.height));
        context.putImageData(pixels, frame.x, frame.y);
      }
      return canvas.toDataURL();
    })().catch((error) => {
      treeAtlasPromise = undefined;
      throw error;
    });
  }
  return treeAtlasPromise;
}

export function forestTrees(season = 0) {
  const rows = MAPS_DATA.bug_forest;
  const variants = SEASON_TREES[season] || SEASON_TREES[0];
  return rows.flatMap((row, y) => [...row].flatMap((tile, x) => {
    if (tile !== "T") return [];
    const border = y === 0 || y === rows.length - 1 || x === 0 || x === row.length - 1;
    if (border && (y === 0 || y === rows.length - 1 ? x % 2 !== 0 : y % 2 !== 0)) return [];
    if (x === 19 && (y % 2 === 0 || y === 13)) return [];
    const frame = TREE_FRAMES[variants[(x * 7 + y * 3) % variants.length]];
    const width = frame.width / 32 * TILE_SIZE;
    const height = frame.height / 32 * TILE_SIZE;
    const left = x * TILE_SIZE + (TILE_SIZE - width) / 2;
    const top = (y + 1) * TILE_SIZE - height;
    for (let tileY = Math.floor(top / TILE_SIZE); tileY <= y; tileY++) {
      for (let tileX = Math.floor(left / TILE_SIZE); tileX <= Math.ceil((left + width) / TILE_SIZE) - 1; tileX++) {
        if (isForestAccess("bug_forest", tileX, tileY) || inBounds(tileX,tileY,GARDEN_BOUNDS)) return [];
      }
    }
    return [{ key: `${x}:${y}`, x, y, frame, left, top, width, height }];
  }));
}

export function treeOccupies(tree, tileX, tileY) {
  const baseTop = tree.top + tree.height - TILE_SIZE;
  const baseBottom = tree.top + tree.height;
  const left = tree.left;
  const right = tree.left + tree.width;
  return tileX * TILE_SIZE < right && (tileX + 1) * TILE_SIZE > left
    && tileY * TILE_SIZE < baseBottom && (tileY + 1) * TILE_SIZE > baseTop;
}

export function forestTreeBlocks(tileX, tileY, season = 0) {
  const tile = MAPS_DATA.bug_forest[tileY]?.[tileX];
  if (!tile || tile === "." || tile === "J") return false;
  if (isForestAccess("bug_forest", tileX, tileY) || inBounds(tileX, tileY, GARDEN_BOUNDS)) return false;
  return forestTrees(season).some((tree) => treeOccupies(tree, tileX, tileY));
}