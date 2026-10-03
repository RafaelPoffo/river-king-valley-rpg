import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { get } from "svelte/store";
import {
  MAPS_DATA,
  PLAYER_START,
  FESTIVAL_STALL,
  INITIAL_VILLAGERS,
  INITIAL_CONSTRUCTIONS,
  CAST_TILES,
  getNpcLocation,
} from "./constants.js";
import { canWalkOn, houseForDoor, interiorSpawn, isInterior, setDirectionHeld, releaseMovement } from "./movement.js";
import { creatureOccupies, canPlaceCreature, createDailyPopulation, ensureWorldPopulation, tickWorldCreatures, worldCreatureBlocks, creaturePosition, worldSpecies, removeWorldCreature, nearbyAquaticCreature, engageWorldCreature } from "./worldCreatures.js";
import { phase, player, currentMap, gameMode, day, seasonIndex, worldCreatures, worldPopulationDay } from "./stores.js";
import { resetState } from "./saveSystem.js";
import { sleep } from "./gameActions.js";
import { PHASES } from "./phases.js";
import { CHARACTER_SPRITES, POKEMON_SPRITES, atlasFrame, clearFrameBackground } from "./overworldAtlas.js";

describe("folha de sprites do overworld", () => {
  it("recorta quadros de 16 pixels sem incluir as faixas e usa o centro em repouso", () => {
    expect(atlasFrame(CHARACTER_SPRITES.player, "up")).toEqual({ x: 68, y: 0, width: 16, height: 16 });
    expect([0, 1, 2, 3].map((step) => atlasFrame(CHARACTER_SPRITES.player, "down", true, step).x)).toEqual([17, 0, 17, 34]);
    expect(atlasFrame(POKEMON_SPRITES["0025"], "up", true, 1)).toEqual({ x: 51, y: 1453, width: 16, height: 16 });
    for (const sprite of [...Object.values(CHARACTER_SPRITES), ...Object.values(POKEMON_SPRITES)]) {
      expect(sprite.y + 16).toBeLessThanOrEqual(1668);
      expect(Math.max(...Object.values(sprite.directions).flat()) * 17 + 16).toBeLessThanOrEqual(170);
    }
  });

  it("remove o fundo externo sem apagar cores iguais dentro do personagem", () => {
    const pixels = new Uint8ClampedArray(16 * 16 * 4).fill(255);
    for (let row = 5; row <= 10; row++) {
      for (let column = 5; column <= 10; column++) {
        if (row !== 5 && row !== 10 && column !== 5 && column !== 10) continue;
        const offset = (row * 16 + column) * 4;
        pixels.set([0, 0, 0, 255], offset);
      }
    }
    const cleared = clearFrameBackground(pixels);
    expect(cleared[3]).toBe(0);
    expect(cleared[(7 * 16 + 7) * 4 + 3]).toBe(255);
    expect(cleared[(5 * 16 + 5) * 4 + 3]).toBe(255);
    expect(pixels[3]).toBe(255);
  });
});

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

describe("população diária da vila", () => {
  const land = [{ id: "pikachu", worldSize: 1 }, { id: "snorlax", worldSize: 2 }];
  const water = [{ id: "magikarp", worldSize: 1, biome: "all", dist: [1, 2, 3] }];

  it("gera de 2 a 8 criaturas sem sobreposição e conserva a população do dia", () => {
    for (let day = 1; day <= 60; day++) {
      const key = `pokemon:0:${day}`;
      const creatures = createDailyPopulation(key, land, water);
      expect(creatures.length).toBeGreaterThanOrEqual(2);
      expect(creatures.length).toBeLessThanOrEqual(8);
      expect(creatures).toEqual(createDailyPopulation(key, land, water));
      expect(creatures.some((creature) => creature.aquatic)).toBe(true);
      expect(creatures.some((creature) => !creature.aquatic)).toBe(true);
      for (const creature of creatures) {
        expect(canPlaceCreature(creature, creatures.filter((other) => other.id !== creature.id))).toBe(true);
        if (creature.aquatic) expect(creature.y).toBe(creature.biome === "river" ? 5 - CAST_TILES[creature.zone] : 16 + CAST_TILES[creature.zone]);
      }
    }
  });

  it("muda a população quando o dia muda", () => {
    expect(createDailyPopulation("pokemon:0:1", land, water)).not.toEqual(createDailyPopulation("pokemon:0:2", land, water));
  });

  it("criaturas grandes bloqueiam quatro quadrados e reservam o destino", () => {
    const creature = { x: 10, y: 13, size: 2, target: { x: 11, y: 13 } };
    for (const [x, y] of [[10, 13], [11, 13], [10, 14], [11, 14], [12, 13], [12, 14]]) {
      expect(creatureOccupies(creature, x, y)).toBe(true);
    }
    expect(creatureOccupies(creature, 9, 13)).toBe(false);
    expect(creatureOccupies({ ...creature, size: 1, target: null }, 11, 13)).toBe(false);
  });
});

describe("criaturas persistentes e movimento", () => {
  beforeEach(() => {
    resetState("normal");
    phase.set(PHASES.PLAYING);
    currentMap.set("village");
    player.set({ ...PLAYER_START });
  });

  afterEach(() => {
    releaseMovement();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    worldCreatures.set([]);
    worldPopulationDay.set(null);
  });

  it("todos os dias e estações geram 2 a 8 criaturas não muito raras nos dois modos", () => {
    for (const mode of ["normal", "pokemon"]) {
      gameMode.set(mode);
      for (let season = 0; season < 4; season++) {
        seasonIndex.set(season);
        for (let today = 1; today <= 15; today++) {
          day.set(today);
          expect(ensureWorldPopulation()).toBe(true);
          const creatures = get(worldCreatures);
          expect(creatures.length).toBeGreaterThanOrEqual(2);
          expect(creatures.length).toBeLessThanOrEqual(8);
          expect(creatures.some((creature) => creature.aquatic)).toBe(true);
          if (mode === "normal") {
            expect(creatures.every((creature) => creature.aquatic)).toBe(true);
          } else {
            expect(creatures.some((creature) => !creature.aquatic)).toBe(true);
          }
          for (const creature of creatures) {
            expect(canPlaceCreature(creature, creatures.filter((other) => other.id !== creature.id))).toBe(true);
            if (creature.aquatic) {
              expect(worldSpecies(creature).rarity).toBeLessThanOrEqual(3);
              expect(worldSpecies(creature).dist).toContain(creature.zone);
            }
          }
        }
      }
    }
  });

  it("não recria criaturas removidas até o próximo dia", () => {
    ensureWorldPopulation();
    const original = get(worldCreatures);
    removeWorldCreature(original[0].id);
    expect(ensureWorldPopulation()).toBe(false);
    expect(get(worldCreatures)).toHaveLength(original.length - 1);
    day.set(2);
    expect(ensureWorldPopulation()).toBe(true);
    expect(get(worldCreatures).some((creature) => creature.id === original[0].id)).toBe(false);
  });

  it("Pokemon do atlas ocupam um tile e não iniciam encontros nem aceitam interação", () => {
    gameMode.set("pokemon");
    ensureWorldPopulation();
    for (const creature of get(worldCreatures)) {
      expect(creature.size).toBe(1);
      expect(creature.decorative).toBe(true);
      expect(POKEMON_SPRITES[worldSpecies(creature).dexId]).toBeDefined();
      expect(worldCreatureBlocks("village", creature.x, creature.y)).toBe(true);
      expect(engageWorldCreature(creature.id)).toBeNull();
      if (creature.aquatic) {
        expect(nearbyAquaticCreature({ x: creature.x, y: creature.y }, creature.zone, creature.biome)).toBeNull();
      }
    }
  });

  it("adapta saves antigos sem repovoar o mapa ou deixar sprites antigos interativos", () => {
    gameMode.set("pokemon");
    worldPopulationDay.set("pokemon:0:1");
    worldCreatures.set([
      { id: "old-land", speciesId: "eevee", x: 16, y: 14, size: 2, aquatic: false, state: "wild" },
      { id: "old-water", speciesId: "magikarp", x: 10, y: 18, size: 2, aquatic: true, biome: "sea", zone: 1, state: "wild" },
    ]);
    expect(ensureWorldPopulation()).toBe(false);
    expect(get(worldCreatures).map((creature) => creature.id)).toEqual(["old-land", "old-water"]);
    expect(get(worldCreatures).every((creature) => creature.decorative && creature.size === 1)).toBe(true);
    expect(get(worldCreatures).every((creature) => POKEMON_SPRITES[worldSpecies(creature).dexId])).toBe(true);
    expect(get(worldCreatures).map((creature) => worldSpecies(creature).name)).toEqual(["Pikachu", "Magikarp"]);
    expect(get(worldCreatures).every((creature) => creature.speciesId)).toBe(true);
  });

  it("dormir renova a população sem recarregar a página", () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", { setItem: vi.fn() });
    ensureWorldPopulation();
    const previous = get(worldPopulationDay);
    sleep();
    vi.advanceTimersByTime(1500);
    expect(get(day)).toBe(2);
    expect(get(worldPopulationDay)).not.toBe(previous);
    expect(get(worldCreatures).length).toBeGreaterThanOrEqual(2);
    expect(get(currentMap)).toBe("player_house");
  });

  it("o jogador não atravessa uma criatura grande", () => {
    player.set({ x: 9, y: 13, dir: "right" });
    worldCreatures.set([{ id: "large", x: 10, y: 13, size: 2, state: "wild", target: null }]);
    setDirectionHeld("right", true);
    expect(get(player)).toEqual({ x: 9, y: 13, dir: "right" });
    expect(worldCreatureBlocks("village", 11, 14)).toBe(true);
    expect(worldCreatureBlocks("player_house", 11, 14)).toBe(false);
  });

  it("anda lentamente, reserva o destino e pausa durante a pesca", () => {
    worldCreatures.set([{ id: "walker", x: 16, y: 14, size: 1, state: "wild", aquatic: false, target: null, progress: 0, cooldown: 0 }]);
    tickWorldCreatures(0.1, () => 0);
    expect(get(worldCreatures)[0].target).toEqual({ x: 15, y: 14 });
    expect(worldCreatureBlocks("village", 15, 14)).toBe(true);
    expect(worldCreatureBlocks("village", 16, 14)).toBe(true);
    tickWorldCreatures(0.9, () => 0);
    expect(creaturePosition(get(worldCreatures)[0])).toEqual({ x: 15.5, y: 14 });
    const paused = get(worldCreatures);
    phase.set(PHASES.FISHING_APPROACH);
    tickWorldCreatures(10, () => 0);
    expect(get(worldCreatures)).toEqual(paused);
    phase.set(PHASES.PLAYING);
    tickWorldCreatures(0.9, () => 0);
    expect(get(worldCreatures)[0].x).toBe(15);
    expect(get(worldCreatures)[0].target).toBeNull();
  });

  it("às vezes fica parado, e criaturas aquáticas não saem da zona de pesca", () => {
    worldCreatures.set([{ id: "swimmer", x: 10, y: 18, zone: 1, size: 1, state: "wild", aquatic: true, target: null, progress: 0, cooldown: 0 }]);
    tickWorldCreatures(0.1, () => 0.9);
    expect(get(worldCreatures)[0].target).toBeNull();
    tickWorldCreatures(10, () => 0);
    expect(get(worldCreatures)[0].target).toEqual({ x: 9, y: 18 });
    tickWorldCreatures(1.8, () => 0);
    expect(get(worldCreatures)[0].y).toBe(18);
    expect(get(worldCreatures)[0].zone).toBe(1);
  });
});

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
