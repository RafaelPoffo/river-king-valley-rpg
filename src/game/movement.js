import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import { worldCreatureBlocks } from "./worldCreatures.js";
import {
  MAPS_DATA,
  TILE_SIZE,
  VIEW_WIDTH,
  VIEW_HEIGHT,
  FESTIVAL_STALL,
  PLAYER_START,
  DOCK_BOUNDS,
  inBounds,
  getNpcLocation,
} from "./constants.js";
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
  currentFestival,
} from "./stores.js";

const STEP_MS = 165;
const VECTORS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const held = { up: false, down: false, left: false, right: false };
let lastDir = null;
let walking = false;
let walkFrame = 0;
let onStepDone = null;

export function isWalking() {
  return walking;
}

export function afterCurrentStep(fn) {
  if (!walking) fn();
  else onStepDone = fn;
}

export function getTile(m, x, y) {
  const mapArr = MAPS_DATA[m];
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (!mapArr || iy < 0 || iy >= mapArr.length || ix < 0 || ix >= mapArr[iy].length) {
    return "0";
  }
  return mapArr[iy][ix];
}

export function updateCamera() {
  const cMap = get(currentMap);
  const p = get(player);
  const mapArr = MAPS_DATA[cMap];
  if (!mapArr) return;

  const cx = p.x * TILE_SIZE - VIEW_WIDTH / 2 + TILE_SIZE / 2;
  const cy = p.y * TILE_SIZE - VIEW_HEIGHT / 2 + TILE_SIZE / 2;
  cameraX.set(Math.max(0, Math.min(cx, mapArr[0].length * TILE_SIZE - VIEW_WIDTH)));
  cameraY.set(Math.max(0, Math.min(cy, mapArr.length * TILE_SIZE - VIEW_HEIGHT)));
}

export function interiorSpawn(mapName, dir = "up") {
  const rows = MAPS_DATA[mapName];
  if (!rows) return { x: 7, y: 6, dir };
  for (let y = 0; y < rows.length; y++) {
    const x = rows[y].indexOf("-");
    if (x >= 0) return { x, y: y - 1, dir };
  }
  return { x: 7, y: 6, dir };
}

const HOUSE_DOORS = {
  P: "player_house",
  E: "shop_gear",
  B: "shop_bait",
  K: "carpenter_shop",
  D: "hut_old",
  R: "tavern",
};

const INTERIOR_MAPS = new Set(Object.values(HOUSE_DOORS));

export function isInterior(mapName) {
  return INTERIOR_MAPS.has(mapName);
}

export function houseForDoor(tile) {
  return HOUSE_DOORS[tile] || null;
}

const WALKABLE_TILES = new Set(["G", ".", "=", "F", "S"]);

export function canWalkOn(tile, x, y, constr) {
  if (WALKABLE_TILES.has(tile)) return true;
  if (tile === "X" && inBounds(x, y, DOCK_BOUNDS)) {
    return constr.docks.status === "built" || constr.pier.status === "built";
  }
  return false;
}

export function enterHouse(houseMapName, fromX, fromY) {
  lastEnteringHouse.set({ map: "village", x: fromX, y: fromY, dir: "down" });
  currentMap.set(houseMapName);
  player.set(interiorSpawn(houseMapName, "up"));
  updateCamera();
}

export function exitHouse() {
  const last = get(lastEnteringHouse);
  if (last) {
    currentMap.set(last.map);
    player.set({ x: last.x, y: last.y, dir: last.dir });
  } else {
    currentMap.set("village");
    player.set({ ...PLAYER_START });
  }
  updateCamera();
}

function activeDirection() {
  if (lastDir && held[lastDir]) return lastDir;
  return ["up", "down", "left", "right"].find((dir) => held[dir]) || null;
}

export function releaseMovement() {
  held.up = false;
  held.down = false;
  held.left = false;
  held.right = false;
  lastDir = null;
  onStepDone = null;
  if (walkFrame) cancelAnimationFrame(walkFrame);
  walkFrame = 0;
  if (!walking) return;
  walking = false;
  const p = get(player);
  player.set({ x: Math.round(p.x), y: Math.round(p.y), dir: p.dir });
  updateCamera();
}

export function setDirectionHeld(dir, isDown) {
  if (!VECTORS[dir]) return;
  held[dir] = isDown;
  if (isDown) {
    lastDir = dir;
    tryStep();
  }
}

function tryStep() {
  if (walking) return;
  if (get(phase) !== PHASES.PLAYING || get(deepSeaFishingActive)) return;
  const dir = activeDirection();
  if (!dir) return;
  const [dx, dy] = VECTORS[dir];
  beginStep(dx, dy, dir);
}

function stallBlocks(mapName, x, y) {
  return (
    !!get(currentFestival) &&
    mapName === "village" &&
    x === FESTIVAL_STALL.x &&
    y === FESTIVAL_STALL.y
  );
}

function beginStep(dx, dy, dirStr) {
  const p = get(player);
  const originX = Math.round(p.x);
  const originY = Math.round(p.y);
  const cMap = get(currentMap);
  const nx = originX + dx;
  const ny = originY + dy;
  const tile = getTile(cMap, nx, ny);
  const mins = get(inGameMinutes);
  const curDay = get(day);
  const constr = get(constructions);

  const npcOccupying = get(villagers).find((n) => {
    const loc = getNpcLocation(n, mins, curDay);
    return loc.map === cMap && loc.x === nx && loc.y === ny;
  });

  if (npcOccupying || stallBlocks(cMap, nx, ny) || worldCreatureBlocks(cMap, nx, ny)) {
    player.set({ x: originX, y: originY, dir: dirStr });
    return;
  }

  let afterMove = null;
  if (HOUSE_DOORS[tile]) {
    afterMove = () => enterHouse(HOUSE_DOORS[tile], originX, originY);
  } else if (tile === "-") {
    afterMove = () => exitHouse();
  } else if (!canWalkOn(tile, nx, ny, constr)) {
    player.set({ x: originX, y: originY, dir: dirStr });
    return;
  }

  walking = true;
  const started = performance.now();

  const tick = (now) => {
    if (get(phase) !== PHASES.PLAYING) {
      walking = false;
      walkFrame = 0;
      player.set({ x: originX, y: originY, dir: dirStr });
      updateCamera();
      return;
    }

    const t = Math.min(1, (now - started) / STEP_MS);
    player.set({
      x: originX + dx * t,
      y: originY + dy * t,
      dir: dirStr,
    });
    updateCamera();

    if (t < 1) {
      walkFrame = requestAnimationFrame(tick);
      return;
    }

    walking = false;
    walkFrame = 0;
    player.set({ x: nx, y: ny, dir: dirStr });
    updateCamera();

    if (afterMove) {
      onStepDone = null;
      afterMove();
      tryStep();
      return;
    }

    if (onStepDone) {
      const fn = onStepDone;
      onStepDone = null;
      fn();
      return;
    }

    tryStep();
  };

  walkFrame = requestAnimationFrame(tick);
}

export function movePlayer(dx, dy, dirStr) {
  const dir = Object.keys(VECTORS).find(
    (name) => VECTORS[name][0] === dx && VECTORS[name][1] === dy
  );
  if (!dir) return;
  setDirectionHeld(dirStr || dir, true);
}

export function getTileInFront() {
  const p = get(player);
  const cMap = get(currentMap);
  let tx = Math.round(p.x);
  let ty = Math.round(p.y);
  if (p.dir === "up") ty--;
  if (p.dir === "down") ty++;
  if (p.dir === "left") tx--;
  if (p.dir === "right") tx++;
  return { x: tx, y: ty, tile: getTile(cMap, tx, ty) };
}
