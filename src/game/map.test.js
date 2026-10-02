import { describe, it, expect } from "vitest";
import {
  MAPS_DATA,
  PLAYER_START,
  FESTIVAL_STALL,
  INITIAL_VILLAGERS,
  INITIAL_CONSTRUCTIONS,
  getNpcLocation,
} from "./constants.js";
import { canWalkOn, houseForDoor, interiorSpawn, isInterior } from "./movement.js";

const NEIGHBORS = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];
const NON_OBJECT_TILES = new Set(["0", "#", "="]);
const NIGHT = 20 * 60;
const TAVERN_NIGHT_DAY = 4;

const key = (x, y) => `${x},${y}`;
const tileAt = (rows, x, y) => rows[y]?.[x] ?? "0";

function constructionsWith(status) {
  const result = {};
  for (const [id, data] of Object.entries(INITIAL_CONSTRUCTIONS)) {
    result[id] = { ...data, status };
  }
  return result;
}

function reachable(mapName, start, blocked, constr) {
  const rows = MAPS_DATA[mapName];
  const seen = new Set([key(start.x, start.y)]);
  const queue = [[start.x, start.y]];
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      const k = key(nx, ny);
      if (seen.has(k) || blocked.has(k)) continue;
      if (!canWalkOn(tileAt(rows, nx, ny), nx, ny, constr)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  return seen;
}

function hasReachableNeighbor(seen, x, y) {
  return NEIGHBORS.some(([dx, dy]) => seen.has(key(x + dx, y + dy)));
}

function npcCellsOn(mapName, mins, dayNum) {
  const cells = new Set();
  for (const npc of INITIAL_VILLAGERS) {
    const loc = getNpcLocation(npc, mins, dayNum);
    if (loc.map === mapName) cells.add(key(loc.x, loc.y));
  }
  return cells;
}

function forEachTile(rows, fn) {
  rows.forEach((row, y) => [...row].forEach((tile, x) => fn(tile, x, y)));
}

describe("formato dos mapas", () => {
  for (const [name, rows] of Object.entries(MAPS_DATA)) {
    it(`${name} é retangular`, () => {
      const widths = new Set(rows.map((row) => row.length));
      expect([...widths]).toHaveLength(1);
    });
  }

  it("toda porta da vila leva a um interior que existe", () => {
    forEachTile(MAPS_DATA.village, (tile) => {
      const house = houseForDoor(tile);
      if (house) expect(MAPS_DATA[house], `porta ${tile}`).toBeDefined();
    });
  });
});

describe("vila", () => {
  const constr = constructionsWith("none");
  const blocked = npcCellsOn("village", 10 * 60, 1);
  blocked.add(key(FESTIVAL_STALL.x, FESTIVAL_STALL.y));
  const rows = MAPS_DATA.village;
  const seen = reachable("village", PLAYER_START, blocked, constr);

  it("o ponto inicial é andável", () => {
    expect(canWalkOn(tileAt(rows, PLAYER_START.x, PLAYER_START.y), PLAYER_START.x, PLAYER_START.y, constr)).toBe(true);
  });

  it("todo chão da vila é alcançável a partir do início", () => {
    const stuck = [];
    forEachTile(rows, (tile, x, y) => {
      if (blocked.has(key(x, y))) return;
      if (canWalkOn(tile, x, y, constr) && !seen.has(key(x, y))) stuck.push(key(x, y));
    });
    expect(stuck).toEqual([]);
  });

  it("toda porta e o terreno do aquário têm acesso", () => {
    const closed = [];
    forEachTile(rows, (tile, x, y) => {
      if ((houseForDoor(tile) || tile === "Z") && !hasReachableNeighbor(seen, x, y)) {
        closed.push(`${tile}@${key(x, y)}`);
      }
    });
    expect(closed).toEqual([]);
  });

  it("a barraca do festival tem por onde ser usada", () => {
    expect(hasReachableNeighbor(seen, FESTIVAL_STALL.x, FESTIVAL_STALL.y)).toBe(true);
  });

  it("o cais construído é alcançável", () => {
    const built = constructionsWith("built");
    const withDocks = reachable("village", PLAYER_START, blocked, built);
    const dockTiles = [];
    forEachTile(rows, (tile, x, y) => {
      if (tile === "X" && canWalkOn(tile, x, y, built)) dockTiles.push(key(x, y));
    });
    expect(dockTiles.length).toBeGreaterThan(0);
    expect(dockTiles.filter((k) => !withDocks.has(k))).toEqual([]);
  });
});

describe("interiores", () => {
  const constr = constructionsWith("none");
  const interiors = Object.keys(MAPS_DATA).filter(isInterior);

  it("todo interior tem porta de saída", () => {
    expect(interiors.length).toBeGreaterThan(0);
    for (const name of interiors) {
      expect(MAPS_DATA[name].some((row) => row.includes("-")), name).toBe(true);
    }
  });

  for (const name of interiors) {
    describe(name, () => {
      const rows = MAPS_DATA[name];
      const spawn = interiorSpawn(name);
      const blocked = npcCellsOn(name, NIGHT, TAVERN_NIGHT_DAY);
      const seen = reachable(name, spawn, blocked, constr);

      it("o jogador nasce em chão livre", () => {
        expect(canWalkOn(tileAt(rows, spawn.x, spawn.y), spawn.x, spawn.y, constr)).toBe(true);
        expect(blocked.has(key(spawn.x, spawn.y))).toBe(false);
      });

      it("todo chão é alcançável", () => {
        const stuck = [];
        forEachTile(rows, (tile, x, y) => {
          if (tile === "=" && !blocked.has(key(x, y)) && !seen.has(key(x, y))) stuck.push(key(x, y));
        });
        expect(stuck).toEqual([]);
      });

      it("todo móvel pode ser usado e a saída é alcançável", () => {
        const closed = [];
        forEachTile(rows, (tile, x, y) => {
          if (!NON_OBJECT_TILES.has(tile) && !hasReachableNeighbor(seen, x, y)) closed.push(`${tile}@${key(x, y)}`);
        });
        expect(closed).toEqual([]);
      });
    });
  }
});

describe("NPCs", () => {
  const constr = constructionsWith("none");

  it("ficam em chão andável de dia e de noite", () => {
    for (const npc of INITIAL_VILLAGERS) {
      for (const [mins, dayNum] of [[10 * 60, 1], [NIGHT, TAVERN_NIGHT_DAY]]) {
        const loc = getNpcLocation(npc, mins, dayNum);
        const tile = tileAt(MAPS_DATA[loc.map], loc.x, loc.y);
        expect(canWalkOn(tile, loc.x, loc.y, constr), `${npc.id} em ${loc.map}`).toBe(true);
      }
    }
  });

  it("não ocupam o ponto inicial nem a barraca", () => {
    const cells = npcCellsOn("village", 10 * 60, 1);
    expect(cells.has(key(PLAYER_START.x, PLAYER_START.y))).toBe(false);
    expect(cells.has(key(FESTIVAL_STALL.x, FESTIVAL_STALL.y))).toBe(false);
  });
});
