import { get } from "svelte/store";
import { MAPS_DATA, TILE_SIZE, getNpcLocation } from "./constants.js";
import {
  player,
  currentMap,
  phase,
  deepSeaFishingActive,
  cameraX,
  cameraY,
  lastEnteringHouse,
  villagers,
  inGameMinutes,
  day,
  constructions,
} from "./stores.js";

export function getTile(m, x, y) {
  const mapArr = MAPS_DATA[m];
  if (!mapArr || y < 0 || y >= mapArr.length || x < 0 || x >= mapArr[0].length) {
    return "0";
  }
  return mapArr[y][x];
}

export function updateCamera() {
  const cMap = get(currentMap);
  const p = get(player);
  const mapArr = MAPS_DATA[cMap];
  if (!mapArr) return;

  const viewW = 800;
  const viewH = 450;
  const cx = p.x * TILE_SIZE - viewW / 2 + TILE_SIZE / 2;
  const cy = p.y * TILE_SIZE - viewH / 2 + TILE_SIZE / 2;
  cameraX.set(Math.max(0, Math.min(cx, mapArr[0].length * TILE_SIZE - viewW)));
  cameraY.set(Math.max(0, Math.min(cy, mapArr.length * TILE_SIZE - viewH)));
}

export function enterHouse(houseMapName, doorX, doorY) {
  lastEnteringHouse.set({ map: "village", x: doorX, y: doorY + 1, dir: "down" });
  currentMap.set(houseMapName);
  player.set({ x: 8, y: 6, dir: "up" });
  updateCamera();
}

export function exitHouse() {
  const last = get(lastEnteringHouse);
  if (last) {
    currentMap.set(last.map);
    player.set({ x: last.x, y: last.y, dir: last.dir });
  } else {
    currentMap.set("village");
    player.set({ x: 7, y: 10, dir: "down" });
  }
  updateCamera();
}

export function movePlayer(dx, dy, dirStr) {
  if (get(phase) !== "playing" || get(deepSeaFishingActive)) return;
  const p = get(player);
  const cMap = get(currentMap);
  const mins = get(inGameMinutes);
  const curDay = get(day);
  const constr = get(constructions);

  const nx = p.x + dx;
  const ny = p.y + dy;
  const tile = getTile(cMap, nx, ny);

  // Check NPC collision
  const npcOccupying = get(villagers).find((n) => {
    const loc = getNpcLocation(n, mins, curDay);
    return loc.map === cMap && loc.x === nx && loc.y === ny;
  });
  if (npcOccupying) {
    player.update((pl) => ({ ...pl, dir: dirStr }));
    return;
  }

  // Door triggers
  if (["P", "S", "B", "K", "D", "R", "I"].includes(tile)) {
    const houseMaps = {
      P: "player_house",
      S: "shop_gear",
      B: "shop_bait",
      K: "carpenter_shop",
      D: "hut_old",
      R: "tavern",
      I: "tavern",
    };
    enterHouse(houseMaps[tile], nx, ny);
    return;
  }

  // Exit door trigger
  if (tile === "-" || (cMap !== "village" && tile === "0" && p.y >= 6)) {
    exitHouse();
    return;
  }

  const walkableTiles = ["G", ".", "=", "F", "S"]; // S = Shallow water
  let canWalk = false;

  if (walkableTiles.includes(tile)) {
    canWalk = true;
  } else if (tile === "X") {
    const isDockArea = nx >= 14 && nx <= 16 && ny >= 17 && ny <= 18;
    const hasDocks =
      constr.docks.status === "built" || constr.pier.status === "built";
    if (isDockArea && hasDocks) canWalk = true;
  }

  player.set({
    x: canWalk ? nx : p.x,
    y: canWalk ? ny : p.y,
    dir: dirStr,
  });

  if (canWalk) {
    updateCamera();
  }
}

export function getTileInFront() {
  const p = get(player);
  const cMap = get(currentMap);
  let tx = p.x;
  let ty = p.y;
  if (p.dir === "up") ty--;
  if (p.dir === "down") ty++;
  if (p.dir === "left") tx--;
  if (p.dir === "right") tx++;
  return { x: tx, y: ty, tile: getTile(cMap, tx, ty) };
}
