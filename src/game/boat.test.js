import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { get } from "svelte/store";
import {
  MAPS_DATA,
  INITIAL_CONSTRUCTIONS,
  PIER_BOUNDS,
  DOCK_BOUNDS,
  BOAT_BOUNDS,
  BOAT_BOARDING,
  DEEP_SEA_DECK,
  DEEP_SEA_MAST,
  DEEP_SEA_CAPTAIN,
  DEEP_SEA_SPAWN,
  LAST_DEPARTURE_HOUR,
  inBounds,
} from "./constants.js";
import { canWalkOn } from "./movement.js";
import { castTarget, shadowEntry } from "./fishingEngine.js";
import { ambientShadows } from "./ambientShadows.js";
import { canPlaceCreature } from "./worldCreatures.js";
import { migrateSave } from "./saveSystem.js";
import { resetState } from "./saveSystem.js";
import { interact, orderConstruction } from "./gameActions.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { PHASES } from "./phases.js";
import {
  phase,
  player,
  currentMap,
  constructions,
  money,
  inGameMinutes,
  dialogActions,
  deepSeaFishingActive,
  currentToolType,
} from "./stores.js";

function constructionsWith(statuses) {
  return Object.fromEntries(
    Object.entries(INITIAL_CONSTRUCTIONS).map(([id, data]) => [id, { ...data, status: statuses[id] || "none" }])
  );
}

function walkableSeaTiles(constr) {
  const tiles = [];
  MAPS_DATA.village.forEach((row, y) =>
    [...row].forEach((tile, x) => {
      if (tile === "X" && canWalkOn(tile, x, y, constr)) tiles.push(`${x},${y}`);
    })
  );
  return tiles;
}

describe("píer, docas e barco na vila", () => {
  const rows = MAPS_DATA.village;

  it("as áreas do píer, das docas e do barco ficam sobre o mar", () => {
    for (const bounds of [PIER_BOUNDS, DOCK_BOUNDS, BOAT_BOUNDS]) {
      for (let y = bounds.y1; y <= bounds.y2; y++) {
        for (let x = bounds.x1; x <= bounds.x2; x++) expect(rows[y][x]).toBe("X");
      }
    }
    expect(PIER_BOUNDS.x1 >= DOCK_BOUNDS.x1 && PIER_BOUNDS.y2 <= DOCK_BOUNDS.y2).toBe(true);
  });

  it("o píer libera só a passarela curta e as docas a estendem", () => {
    expect(walkableSeaTiles(constructionsWith({}))).toEqual([]);
    const pierOnly = walkableSeaTiles(constructionsWith({ pier: "built" }));
    expect(pierOnly.length).toBe((PIER_BOUNDS.x2 - PIER_BOUNDS.x1 + 1) * (PIER_BOUNDS.y2 - PIER_BOUNDS.y1 + 1));
    const withDocks = walkableSeaTiles(constructionsWith({ pier: "built", docks: "built" }));
    expect(withDocks.length).toBeGreaterThan(pierOnly.length);
    expect(pierOnly.every((tile) => withDocks.includes(tile))).toBe(true);
  });

  it("ninguém anda em cima do barco, e o embarque fica nas docas ao lado dele", () => {
    const all = constructionsWith({ pier: "built", docks: "built", boat: "built" });
    for (let x = BOAT_BOUNDS.x1; x <= BOAT_BOUNDS.x2; x++) expect(canWalkOn("X", x, BOAT_BOUNDS.y1, all)).toBe(false);
    expect(canWalkOn("X", BOAT_BOARDING.x, BOAT_BOARDING.y, all)).toBe(true);
    expect(BOAT_BOARDING.x + 1).toBe(BOAT_BOUNDS.x1);
    expect(BOAT_BOARDING.y).toBe(BOAT_BOUNDS.y1);
  });

  it("criaturas e sombras não aparecem sobre o cais nem o barco", () => {
    for (const bounds of [DOCK_BOUNDS, BOAT_BOUNDS]) {
      for (let y = bounds.y1; y <= bounds.y2; y++) {
        for (let x = bounds.x1; x <= bounds.x2; x++) {
          expect(canPlaceCreature({ aquatic: true, size: 1, x, y }, [])).toBe(false);
        }
      }
    }
    expect(canPlaceCreature({ aquatic: true, size: 1, x: 5, y: 21 }, [])).toBe(true);
    for (let today = 1; today <= 20; today++) {
      for (const shadow of ambientShadows(`normal:0:${today}`).filter((s) => s.biome === "sea")) {
        expect(shadow.y).toBeGreaterThan(Math.max(DOCK_BOUNDS.y2, BOAT_BOUNDS.y2));
      }
    }
  });
});

describe("mapa do alto-mar", () => {
  const rows = MAPS_DATA.deep_sea;
  const tileAt = (x, y) => rows[y]?.[x];
  const none = constructionsWith({});

  it("é cercado de mar e o convés é todo alcançável a partir do embarque", () => {
    expect(new Set(rows.map((row) => row.length)).size).toBe(1);
    expect(tileAt(DEEP_SEA_MAST.x, DEEP_SEA_MAST.y)).toBe("m");
    expect(tileAt(DEEP_SEA_CAPTAIN.x, DEEP_SEA_CAPTAIN.y)).toBe("c");
    expect(canWalkOn(tileAt(DEEP_SEA_SPAWN.x, DEEP_SEA_SPAWN.y), DEEP_SEA_SPAWN.x, DEEP_SEA_SPAWN.y, none)).toBe(true);

    const seen = new Set([`${DEEP_SEA_SPAWN.x},${DEEP_SEA_SPAWN.y}`]);
    const queue = [[DEEP_SEA_SPAWN.x, DEEP_SEA_SPAWN.y]];
    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${y + dy}`;
        if (seen.has(k) || !canWalkOn(tileAt(x + dx, y + dy), x + dx, y + dy, none)) continue;
        seen.add(k);
        queue.push([x + dx, y + dy]);
      }
    }
    const deck = [];
    rows.forEach((row, y) => [...row].forEach((tile, x) => {
      if (tile === "b") deck.push(`${x},${y}`);
      else expect(inBounds(x, y, DEEP_SEA_DECK) || tile === "X").toBe(true);
    }));
    expect(deck.filter((k) => !seen.has(k))).toEqual([]);
    expect(seen.size).toBe(deck.length);
  });

  it("de cada lado do convés a linha cai na água e longe do barco", () => {
    const edges = [
      { x: DEEP_SEA_DECK.x1, y: 8, dir: "left" },
      { x: DEEP_SEA_DECK.x2, y: 8, dir: "right" },
      { x: 11, y: DEEP_SEA_DECK.y1, dir: "up" },
      { x: 11, y: DEEP_SEA_DECK.y2, dir: "down" },
    ];
    for (const from of edges) {
      for (const zone of [1, 2, 3]) {
        const target = castTarget(from, zone, "deep_sea", rows);
        expect(tileAt(target.x, target.y), `${from.dir} zona ${zone}`).toBe("X");
        for (const random of [0, 0.5, 0.99]) {
          const entry = shadowEntry(target, "deep_sea", rows[0].length, () => random);
          expect(inBounds(Math.round(entry.x), Math.round(entry.y), DEEP_SEA_DECK)).toBe(false);
        }
      }
    }
  });

  it("o modo Pokémon tem espécies próprias do alto-mar", () => {
    const deep = POKEMON_DB.filter((p) => p.biome === "deep_sea");
    expect(deep.length).toBeGreaterThanOrEqual(5);
    expect(new Set(deep.flatMap((p) => p.dist)).has(1)).toBe(true);
  });
});

describe("encomendas e viagem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", { setItem: vi.fn(), getItem: vi.fn() });
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
    resetState("normal");
    phase.set(PHASES.PLAYING);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("as docas pedem o píer pronto antes da encomenda", () => {
    money.set(100000);
    orderConstruction("docks");
    expect(get(constructions).docks.status).toBe("none");
    expect(get(money)).toBe(100000);
    constructions.update((c) => ({ ...c, pier: { ...c.pier, status: "built" } }));
    orderConstruction("docks");
    expect(get(constructions).docks.status).toBe("ordered");
  });

  it("save antigo com docas ganha o píer e recebe as descrições novas", () => {
    const old = {
      version: 2,
      constructions: {
        pier: { name: "Píer", cost: 1500, status: "none", orderDay: 0 },
        docks: { name: "Docas", cost: 3500, status: "built", orderDay: 3 },
      },
    };
    const migrated = migrateSave(old).constructions;
    expect(migrated.pier.status).toBe("built");
    expect(migrated.docks).toMatchObject({ status: "built", orderDay: 3, required: "pier" });
    expect(migrated.boat.desc).toBe(INITIAL_CONSTRUCTIONS.boat.desc);
  });

  function boardingScene(minutes) {
    constructions.set(constructionsWith({ pier: "built", docks: "built", boat: "built" }));
    currentMap.set("village");
    player.set({ ...BOAT_BOARDING });
    inGameMinutes.set(minutes);
    interact();
  }

  it("o capitão leva ao convés do alto-mar e traz de volta às docas", () => {
    boardingScene(10 * 60);
    expect(get(phase)).toBe(PHASES.DIALOG);
    get(dialogActions)[" "]();
    vi.advanceTimersByTime(2500);
    expect(get(currentMap)).toBe("deep_sea");
    expect(get(deepSeaFishingActive)).toBe(true);
    expect(get(player)).toMatchObject({ x: DEEP_SEA_SPAWN.x, y: DEEP_SEA_SPAWN.y });

    player.set({ x: DEEP_SEA_CAPTAIN.x, y: DEEP_SEA_CAPTAIN.y - 1, dir: "down" });
    interact();
    expect(get(phase)).toBe(PHASES.DIALOG);
    get(dialogActions)[" "]();
    vi.advanceTimersByTime(2000);
    expect(get(currentMap)).toBe("village");
    expect(get(deepSeaFishingActive)).toBe(false);
    expect(get(player)).toMatchObject({ x: BOAT_BOARDING.x, y: BOAT_BOARDING.y });
  });

  it(`depois das ${LAST_DEPARTURE_HOUR}h o barco não zarpa`, () => {
    boardingScene(LAST_DEPARTURE_HOUR * 60);
    expect(get(phase)).toBe(PHASES.PLAYING);
    expect(get(currentMap)).toBe("village");
  });

  it("no alto-mar a rede vira vara ao pescar", () => {
    currentMap.set("deep_sea");
    deepSeaFishingActive.set(true);
    currentToolType.set("net");
    player.set({ x: DEEP_SEA_DECK.x1, y: 8, dir: "left" });
    interact();
    expect(get(currentToolType)).toBe("rod");
    expect(get(phase)).toBe(PHASES.FISHING_AIM);
  });
});
