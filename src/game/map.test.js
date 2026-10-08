import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { get } from "svelte/store";
import {
  MAPS_DATA,
  PLAYER_START,
  TILE_SIZE,
  VIEW_WIDTH,
  VIEW_HEIGHT,
  FESTIVAL_STALL,
  INITIAL_VILLAGERS,
  INITIAL_CONSTRUCTIONS,
  CAST_TILES,
  DOCK_BOUNDS,
  getNpcLocation,
  isForestAccess,
} from "./constants.js";
import { canWalkOn, houseForDoor, interiorSpawn, isInterior, mapTransition, setDirectionHeld, releaseMovement, updateCamera } from "./movement.js";
import { creatureOccupies, canPlaceCreature, createDailyPopulation, ensureWorldPopulation, tickWorldCreatures, worldCreatureBlocks, creaturePosition, worldSpecies, removeWorldCreature, nearbyAquaticCreature, engageWorldCreature } from "./worldCreatures.js";
import { phase, player, currentMap, gameMode, day, seasonIndex, worldCreatures, worldPopulationDay, insectInventory, insectPopulationDay, wildInsects, dialogActions, currentMessage, showBirdWatching, cameraX, cameraY } from "./stores.js";
import { resetState } from "./saveSystem.js";
import { interact, sleep } from "./gameActions.js";
import { PHASES } from "./phases.js";
import { CHARACTER_SPRITES, POKEMON_SPRITES, atlasFrame, clearFrameBackground, worldSizeFor } from "./overworldAtlas.js";
import { LAND_VISITORS } from "./data/worldCreatures.js";
import { ambientShadows } from "./ambientShadows.js";
import { castTarget } from "./fishingEngine.js";
import { catchInsect, ensureDailyInsects, generateDailyInsects } from "./insectHunt.js";
import { COMMON_BUGS, POKEMON_BUGS } from "./bugCatalog.js";
import { TREE_FRAMES, TREE_ATLAS_SIZE, forestTrees, clearTreeBackground, forestTreeBlocks } from "./forestAtlas.js";

describe("folha de sprites do overworld", () => {
  it("remove fundos alternados de árvores retangulares sem apagar a copa", () => {
    const width = 8;
    const height = 12;
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row++) {
      for (let column = 0; column < width; column++) {
        const edge = column >= 2 && column <= 5 && row >= 3 && row <= 8 &&
          (column === 2 || column === 5 || row === 3 || row === 8);
        pixels.set(edge ? [56, 56, 56, 255] : (row + column) % 2 ? [241, 250, 254, 255] : [202, 217, 224, 255], (row * width + column) * 4);
      }
    }
    const result = clearTreeBackground(pixels, width, height);
    expect(result[3]).toBe(0);
    expect(result[(11 * width + 7) * 4 + 3]).toBe(0);
    expect(result[(5 * width + 3) * 4 + 3]).toBe(255);
    expect(result[(3 * width + 2) * 4 + 3]).toBe(255);
    expect(pixels[3]).toBe(255);
  });

  it("recorta árvores inteiras, com escala fixa e copas fora da entrada", () => {
    for (const frame of Object.values(TREE_FRAMES)) {
      expect(frame.x + frame.width).toBeLessThanOrEqual(TREE_ATLAS_SIZE);
      expect(frame.y + frame.height).toBeLessThanOrEqual(TREE_ATLAS_SIZE);
    }
    for (let season = 0; season < 4; season++) {
      const trees = forestTrees(season);
      expect(trees.length).toBeGreaterThan(30);
      for (const tree of trees) {
        expect(tree.width / tree.height).toBe(tree.frame.width / tree.frame.height);
        for (let tileY = Math.floor(tree.top / 40); tileY <= tree.y; tileY++) {
          for (let tileX = Math.floor(tree.left / 40); tileX <= Math.ceil((tree.left + tree.width) / 40) - 1; tileX++) {
            expect(isForestAccess("bug_forest", tileX, tileY)).toBe(false);
          }
        }
      }
    }
    expect(forestTrees(0)).not.toEqual(forestTrees(2));
  });

  it("o tronco das árvores bloqueia grama vizinha e poupa o caminho", () => {
    const trees = forestTrees(0);
    const oak = trees.find((tree) => tree.frame.width === 64);
    expect(oak).toBeTruthy();
    let blockedGrass = false;
    for (let tileY = 0; tileY < MAPS_DATA.bug_forest.length; tileY++) {
      for (let tileX = 0; tileX < MAPS_DATA.bug_forest[0].length; tileX++) {
        if (!forestTreeBlocks(tileX, tileY, 0)) continue;
        const tile = MAPS_DATA.bug_forest[tileY][tileX];
        expect(tile).not.toBe(".");
        expect(tile).not.toBe("J");
        if (tile === "G" || tile === "F") blockedGrass = true;
      }
    }
    expect(blockedGrass).toBe(true);
  });

  it("recorta quadros de 16 pixels sem incluir as faixas e usa o centro em repouso", () => {
    expect(atlasFrame(CHARACTER_SPRITES.player, "up")).toEqual({ x: 68, y: 0, width: 16, height: 16 });
    expect([0, 1, 2, 3].map((step) => atlasFrame(CHARACTER_SPRITES.player, "down", true, step).x)).toEqual([17, 0, 17, 34]);
    expect(atlasFrame(POKEMON_SPRITES["0025"], "up", true, 1)).toEqual({ x: 153, y: 1436, width: 16, height: 16 });
    expect(atlasFrame(POKEMON_SPRITES["0143"], "left", true, 3)).toEqual({ x: 68, y: 1538, width: 32, height: 32 });
    for (const sprite of [...Object.values(CHARACTER_SPRITES), ...Object.values(POKEMON_SPRITES)]) {
      const size = sprite.size || 16;
      expect(sprite.y + size).toBeLessThanOrEqual(1668);
      expect(Math.max(...Object.values(sprite.directions).flat()) * 17 + size).toBeLessThanOrEqual(170);
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

  it("reserva a ponte, suas margens e o desembarque para todas as dimensões", () => {
    expect(canPlaceCreature({ x: 5, y: 2, size: 1, aquatic: true }, [])).toBe(false);
    expect(canPlaceCreature({ x: 6, y: 5, size: 1, aquatic: false }, [])).toBe(false);
    expect(canPlaceCreature({ x: 3, y: 5, size: 2, aquatic: false }, [])).toBe(false);
    expect(canPlaceCreature({ x: 9, y: 5, size: 1, aquatic: false, target: { x: 8, y: 5 } }, [])).toBe(false);
    expect(canPlaceCreature({ x: 9, y: 5, size: 1, aquatic: false }, [])).toBe(true);
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

  it("mantém o personagem no centro da câmera inclusive nas bordas do mapa", () => {
    const map = MAPS_DATA.village;
    const positions = [
      { x: 0, y: 0 },
      { x: map[0].length - 1, y: map.length - 1 },
    ];

    for (const position of positions) {
      player.set({ ...PLAYER_START, ...position });
      updateCamera();
      expect(position.x * TILE_SIZE + TILE_SIZE / 2 - get(cameraX)).toBe(VIEW_WIDTH / 2);
      expect(position.y * TILE_SIZE + TILE_SIZE / 2 - get(cameraY)).toBe(VIEW_HEIGHT / 2);
    }
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
              if (worldSpecies(creature).rarity > 3) expect(creature.size).toBe(2);
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

  it("limpa criaturas de saves na passagem e impede passos em direção à ponte", () => {
    worldPopulationDay.set("normal:0:1");
    worldCreatures.set([
      { id: "bridge", x: 5, y: 2, size: 1, aquatic: true },
      { id: "landing", x: 6, y: 5, size: 1, aquatic: false },
      { id: "approaching", x: 9, y: 5, size: 1, aquatic: false, target: { x: 8, y: 5 } },
      { id: "outside", x: 9, y: 5, size: 1, aquatic: false, state: "wild", cooldown: 0 },
    ]);
    expect(ensureWorldPopulation()).toBe(false);
    expect(get(worldCreatures).map((creature) => creature.id)).toEqual(["outside"]);
    tickWorldCreatures(1, () => 0);
    expect(get(worldCreatures)[0].target).toBeUndefined();
  });

  it("visitantes terrestres são decorativos e Pokémon da água podem ser pescados", () => {
    gameMode.set("pokemon");
    for (let today = 1; today <= 15; today++) {
      day.set(today);
      ensureWorldPopulation();
      for (const creature of get(worldCreatures)) {
        const species = worldSpecies(creature);
        expect(POKEMON_SPRITES[species.dexId]).toBeDefined();
        expect(creature.size).toBe(worldSizeFor(species.dexId));
        expect(worldCreatureBlocks("village", creature.x, creature.y)).toBe(true);
        if (creature.aquatic) {
          expect(creature.decorative).toBe(false);
          expect(nearbyAquaticCreature({ x: creature.x, y: creature.y }, creature.zone, creature.biome)?.id).toBe(creature.id);
        } else {
          expect(creature.decorative).toBe(true);
          expect(engageWorldCreature(creature.id)).toBeNull();
        }
      }
    }
  });

  it("Lapras, Onix e Snorlax ocupam quatro quadrados", () => {
    expect(["0131", "0095", "0143"].map(worldSizeFor)).toEqual([2, 2, 2]);
    expect(worldSizeFor("0025")).toBe(1);
    expect(LAND_VISITORS.filter((visitor) => visitor.worldSize === 2).map((visitor) => visitor.id)).toEqual(["onix", "snorlax"]);
    for (const visitor of LAND_VISITORS) expect(POKEMON_SPRITES[visitor.dexId]).toBeDefined();
  });

  it("adapta saves antigos sem repovoar o mapa", () => {
    gameMode.set("pokemon");
    worldPopulationDay.set("pokemon:0:1");
    worldCreatures.set([
      { id: "old-land", speciesId: "eevee", x: 16, y: 14, size: 2, aquatic: false, state: "wild" },
      { id: "old-water", speciesId: "magikarp", x: 10, y: 18, size: 2, aquatic: true, biome: "sea", zone: 1, decorative: true, state: "wild" },
    ]);
    expect(ensureWorldPopulation()).toBe(false);
    const creatures = get(worldCreatures);
    expect(creatures.map((creature) => creature.id)).toEqual(["old-land", "old-water"]);
    expect(creatures.map((creature) => worldSpecies(creature).name)).toEqual(["Pikachu", "Magikarp"]);
    expect(creatures.map((creature) => [creature.size, creature.decorative])).toEqual([[1, true], [1, false]]);
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

  it("a ponte conecta a vila à clareira no mapa contínuo da floresta", () => {
    const constr = constructionsWith("none");
    const village = reachable("village", { x: 6, y: 5 }, new Set(), constr);
    const forest = reachable("bug_forest", { x: 6, y: 23 }, new Set(), constr);
    expect(MAPS_DATA.village[0][6]).toBe("J");
    expect(MAPS_DATA.bug_forest[24][6]).toBe("J");
    expect(mapTransition("village", "J", 6, 4)).toBeNull();
    expect(mapTransition("village", "J", 6, 0).map).toBe("bug_forest");
    expect(mapTransition("bug_forest", "J", 6, 24).map).toBe("village");
    expect(village.has(key(6, 0))).toBe(true);
    expect(forest.has(key(29, 11))).toBe(true);
    expect(MAPS_DATA.bug_forest.slice(1, 24).every((row, index) => row[19] === (index + 1 === 12 ? "." : "T"))).toBe(true);
  });

  it("o banco de observação fica acessível na parte norte da floresta", () => {
    const seen = reachable("bug_forest", { x: 6, y: 23 }, new Set(), constructionsWith("none"));
    expect(MAPS_DATA.bug_forest[2][9]).toBe("N");
    expect(MAPS_DATA.bug_forest[3][9]).toBe("G");
    expect(hasReachableNeighbor(seen, 9, 2)).toBe(true);
  });

  it("o banco confirma a observação e inicia a fase binocular", () => {
    gameMode.set("normal");
    currentMap.set("bug_forest");
    phase.set(PHASES.PLAYING);
    player.set({ x: 9, y: 3, dir: "up" });
    interact();
    expect(get(phase)).toBe(PHASES.DIALOG);
    expect(get(currentMessage)).toContain("Deseja observar os pássaros?");
    get(dialogActions)[" "]();
    expect(get(phase)).toBe(PHASES.BIRD_WATCHING);
    expect(get(showBirdWatching)).toBe(true);
    phase.set(PHASES.PLAYING);
    showBirdWatching.set(false);
  });
});

describe("caça diária de insetos", () => {
  it("gera população determinística que soma exatamente 18 pontos nos dois modos", () => {
    for (const mode of ["normal", "pokemon"]) {
      for (let today = 1; today <= 15; today++) {
        const population = generateDailyInsects(`0:${today}`, mode);
        expect(population.length).toBeGreaterThanOrEqual(3);
        expect(population.length).toBeLessThanOrEqual(9);
        expect(population.reduce((total, insect) => total + insect.points, 0)).toBe(18);
        if (mode === "pokemon") expect(new Set(population.map((insect) => POKEMON_BUGS.find((bug) => bug.id === insect.speciesId).dexId)).size).toBe(population.length);
        expect(population).toEqual(generateDailyInsects(`0:${today}`, mode));
        expect(population.every((insect) => !isForestAccess("bug_forest", insect.x, insect.y))).toBe(true);
      }
    }
  });

  it("mantém força, orçamento e arquétipo iguais entre as skins Pokémon e comuns", () => {
    expect(POKEMON_BUGS.length).toBeGreaterThan(65);
    for (let index = 0; index < 65; index++) {
      const pokemonBug = POKEMON_BUGS[index];
      const commonBug = COMMON_BUGS[index < 22 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 55, 41, 42, 43][index] : index];
      expect(pokemonBug.strength).toBe(commonBug.strength);
      expect(pokemonBug.points).toBe(commonBug.points);
      expect(pokemonBug.archetypeId).toBe(commonBug.archetypeId);
      expect(POKEMON_SPRITES[pokemonBug.dexId]).toBeDefined();
      expect(pokemonBug.pixelSprite).toBeUndefined();
    }
    expect(POKEMON_BUGS.every((bug) => COMMON_BUGS.some((profile) => profile.points === bug.points && profile.strength === bug.strength))).toBe(true);
  });

  it("reposiciona insetos de saves antigos sem mudar o orçamento ou repovoar", () => {
    gameMode.set("normal");
    seasonIndex.set(0);
    day.set(1);
    insectPopulationDay.set("normal:0:1");
    const insect = { ...generateDailyInsects("0:1")[0], x: 5, y: 22 };
    wildInsects.set([insect]);
    expect(ensureDailyInsects()).toBe(false);
    const relocated = get(wildInsects);
    expect(relocated).toHaveLength(1);
    expect(relocated[0].id).toBe(insect.id);
    expect(relocated[0].points).toBe(insect.points);
    expect(isForestAccess("bug_forest", relocated[0].x, relocated[0].y)).toBe(false);
  });

  it("não permite que a mochila acumule mais que o orçamento secreto de um dia", () => {
    gameMode.set("normal");
    const bug = generateDailyInsects("0:1", "normal")[0];
    wildInsects.set([bug]);
    insectInventory.set([{ id: "already-carried", points: 18 }]);
    expect(catchInsect(bug.id)).toBeNull();
    expect(get(wildInsects)).toHaveLength(1);
    expect(get(insectInventory)).toHaveLength(1);
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
        if (loc.map === "away") continue;
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

describe("sombras de ambiente e mira", () => {
  const rows = MAPS_DATA.village;
  const isWater = (x, y) => ["~", "X"].includes(rows[y]?.[Math.floor(x)]);

  it("nadam só na água, longe da doca, e se repetem no mesmo dia", () => {
    for (let today = 1; today <= 30; today++) {
      const shadows = ambientShadows(`normal:0:${today}`);
      expect(shadows.filter((shadow) => shadow.biome === "river")).toHaveLength(3);
      expect(shadows.filter((shadow) => shadow.biome === "sea")).toHaveLength(4);
      for (const shadow of shadows) {
        for (let x = shadow.x1; x <= shadow.x2 + shadow.size; x += 0.5) expect(isWater(x, shadow.y)).toBe(true);
        expect(shadow.y < DOCK_BOUNDS.y1 || shadow.y > DOCK_BOUNDS.y2).toBe(true);
        if (shadow.biome === "river") {
          expect(shadow.x1).toBeGreaterThanOrEqual(9);
          expect(rows[shadow.y][6]).toBe("J");
          expect(shadow.x1 > 6 || shadow.x2 + shadow.size < 6).toBe(true);
        }
      }
      expect(shadows).toEqual(ambientShadows(`normal:0:${today}`));
    }
  });

  it.each([
    ["river", { x: 10, y: 5, dir: "up" }],
    ["sea", { x: 10, y: 16, dir: "down" }],
  ])("a mira no %s cai na água e fica mais longe a cada zona", (biome, from) => {
    const targets = [1, 2, 3].map((zone) => castTarget(from, zone, biome, rows));
    for (const target of targets) expect(isWater(target.x, target.y)).toBe(true);
    const distances = targets.map((target) => Math.abs(target.y - from.y));
    expect(distances[0]).toBeLessThan(distances[1]);
    expect(distances[1]).toBeLessThanOrEqual(distances[2]);
  });
});
