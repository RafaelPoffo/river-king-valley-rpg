import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { get } from "svelte/store";
import { rollFishByZone, shadowEntry, baitBiteChance, throwLine, resetAction, cleanupFishing, startMinigame, attemptCatch, playerOnPier } from "./fishingEngine.js";
import { PHASES } from "./phases.js";
import { SPRITES } from "./sprites.js";
import { BAITS, FISH_DB, INITIAL_UPGRADES, INITIAL_CONSTRUCTIONS, PIER_BOUNDS } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import {
  gameMode,
  fishingBiome,
  deepSeaFishingActive,
  inGameMinutes,
  seasonIndex,
  eqBaitId,
  upgrades,
  currentWeather,
  unlocks,
  phase,
  player,
  aimPower,
  currentMap,
  baitStock,
  activeFish,
  activeDish,
  shadowPos,
  shadowReaction,
  shadowActive,
  bobberPos,
  minigameBar,
  catchTargetCenter,
  inventory,
  worldCreatures,
  worldCreatureEncounter,
  currentToolType,
  constructions,
} from "./stores.js";

const DAY = 10 * 60;
const NIGHT = 22 * 60;

function seededRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setScene({ mode = "normal", biome = "river", minutes = DAY, season = 0, bait = "minhoca", lucky = false, weather = "sunny", unlocked = [] }) {
  gameMode.set(mode);
  currentWeather.set(weather);
  unlocks.set(unlocked);
  deepSeaFishingActive.set(biome === "deep_sea");
  fishingBiome.set(biome === "deep_sea" ? "sea" : biome);
  inGameMinutes.set(minutes);
  seasonIndex.set(season);
  eqBaitId.set(bait);
  const ups = JSON.parse(JSON.stringify(INITIAL_UPGRADES));
  if (ups.shinyLuck) ups.shinyLuck.bought = lucky;
  upgrades.set(ups);
}

function rollMany(zone, times) {
  const results = [];
  for (let i = 0; i < times; i++) {
    const fish = rollFishByZone(zone);
    if (fish) results.push(fish);
  }
  return results;
}

const isTrash = (fish) => fish.sprite === SPRITES.trash;

describe("entrada das sombras", () => {
  it.each(["sea", "river"])("evita a parede esquerda no %s", (biome) => {
    const bobber = { x: 1, y: 8 };
    for (const random of [0, 0.5, 0.99]) {
      const entry = shadowEntry(bobber, biome, 30, () => random);
      expect(entry.x).toBeGreaterThanOrEqual(bobber.x);
      expect(biome === "river" ? entry.y <= bobber.y : entry.y >= bobber.y).toBe(true);
    }
  });

  it.each(["sea", "river"])("evita a parede direita no %s", (biome) => {
    const bobber = { x: 28, y: 8 };
    for (const random of [0, 0.5, 0.99]) {
      const entry = shadowEntry(bobber, biome, 30, () => random);
      expect(entry.x).toBeLessThanOrEqual(bobber.x);
      expect(biome === "river" ? entry.y <= bobber.y : entry.y >= bobber.y).toBe(true);
    }
  });

  it("oferece os três lados longe das paredes", () => {
    expect([0, 0.4, 0.8].map((random) => shadowEntry({ x: 10, y: 8 }, "sea", 30, () => random)))
      .toEqual([{ x: 10, y: 11 }, { x: 7, y: 8 }, { x: 13, y: 8 }]);
    expect(shadowEntry({ x: 10, y: 8 }, "river", 30, () => 0)).toEqual({ x: 10, y: 5 });
  });
});

describe("preferências das iscas e preços", () => {
  it("cada espécie gosta de três iscas com chances-base de 80% e 50%", () => {
    for (const fish of [...FISH_DB, ...POKEMON_DB].filter((fish) => !isTrash(fish))) {
      const preferences = Object.entries(fish.baitPreferences);
      expect(preferences, fish.id).toHaveLength(3);
      expect(preferences.map(([, chance]) => chance).sort()).toEqual([0.5, 0.5, 0.8]);
      for (const [baitId, chance] of preferences) {
        expect(BAITS.some((bait) => bait.id === baitId), fish.id).toBe(true);
        if (fish.type !== "treasure") expect(baitBiteChance(fish, baitId), fish.id).toBe(chance + 0.1);
      }
    }
  });

  it("comuns preferem minhocas, raros preferem a isca lendária e rejeitam as baratas", () => {
    const common = FISH_DB.find((fish) => fish.type === "fish" && fish.rarity === 1 && !isTrash(fish));
    const rare = POKEMON_DB.find((fish) => fish.stage === 3 && fish.type === "fish");
    expect(baitBiteChance(common, "minhoca")).toBe(0.9);
    expect(baitBiteChance(common, "isca_brilhante")).toBe(0);
    expect(baitBiteChance(rare, "isca_brilhante")).toBe(0.9);
    expect(baitBiteChance(rare, "minhoca")).toBe(0);
  });

  it("Pokémon comuns têm preços comparáveis aos peixes e evoluções valem menos", () => {
    expect(POKEMON_DB.find((fish) => fish.id === "squirtle").price).toBe(18);
    const pokemon = POKEMON_DB.filter((fish) => fish.dexNum);
    expect(pokemon.filter((fish) => fish.stage === 1 && fish.id !== "porigon").every((fish) => fish.price <= 50)).toBe(true);
    expect(pokemon.filter((fish) => fish.id !== "porigon").every((fish) => fish.price <= 800)).toBe(true);
    expect(POKEMON_DB.find((fish) => fish.id === "porigon").price).toBe(3000);
  });

  it("Megabit é gratuita e garante Porigon no modo Pokémon e Tilápia Dourada no modo normal", () => {
    expect(BAITS.find((bait) => bait.id === "megabit").price).toBe(0);
    currentToolType.set("rod");
    setScene({ mode: "pokemon", biome: "river", bait: "megabit" });

    for (const zone of [1, 2, 3]) {
      const fish = rollFishByZone(zone);
      expect(fish.id).toBe("porigon");
      expect(fish.priceFinal).toBe(3000);
      expect(baitBiteChance(fish, "megabit")).toBe(1);
    }

    setScene({ mode: "normal", biome: "river", bait: "megabit" });
    for (const zone of [1, 2, 3]) {
      const fish = rollFishByZone(zone);
      expect(fish.id).toBe("tilapia_dourada");
      expect(fish.priceFinal).toBe(3000);
      expect(baitBiteChance(fish, "megabit")).toBe(1);
    }
  });
});

beforeEach(() => {
  vi.spyOn(Math, "random").mockImplementation(seededRandom(42));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("análise da isca e consumo", () => {
  let frame;
  let time;

  beforeEach(() => {
    vi.useFakeTimers();
    frame = null;
    time = 0;
    vi.spyOn(performance, "now").mockImplementation(() => time);
    vi.stubGlobal("requestAnimationFrame", (callback) => { frame = callback; return 1; });
    vi.stubGlobal("cancelAnimationFrame", () => { frame = null; });
    vi.stubGlobal("localStorage", { setItem: vi.fn() });
    Math.random.mockReturnValue(0.5);
    setScene({ biome: "river" });
    currentMap.set("village");
    player.set({ x: 10, y: 6, dir: "up" });
    aimPower.set(1);
    activeFish.set(null);
    activeDish.set(null);
    inventory.set([]);
    worldCreatures.set([]);
    worldCreatureEncounter.set(null);
    baitStock.set({ minhoca: 5, massa_pao: 5, isca_brilhante: 5 });
  });

  afterEach(() => {
    cleanupFishing();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function cast(bait = "minhoca", waitTime = 21000) {
    eqBaitId.set(bait);
    throwLine();
    vi.advanceTimersByTime(waitTime);
    expect(get(phase)).toBe(PHASES.FISHING_APPROACH);
    expect(get(baitStock)[bait]).toBe(5);
  }

  function advanceUntil(predicate) {
    for (let index = 0; index < 200 && !predicate(); index++) {
      expect(frame).toBeTypeOf("function");
      const callback = frame;
      frame = null;
      time += 100;
      callback(time);
    }
    expect(predicate()).toBe(true);
  }

  function visibleFish(position = { x: 10, y: 3 }, zone = 1) {
    const species = FISH_DB.find((fish) => fish.type === "fish" && fish.rarity === 1 &&
      !isTrash(fish) && fish.dist.includes(1) && ["river", "all"].includes(fish.biome));
    worldCreatures.set([{
      id: "visible-fish", speciesId: species.id, ...position, size: 1,
      aquatic: true, biome: "river", zone, state: "wild", target: null, progress: 0,
    }]);
    return species;
  }

  it("Megabit garante o peixe especial do modo e ignora encontros próximos no rio", () => {
    visibleFish();
    setScene({ mode: "pokemon", biome: "river" });
    currentToolType.set("rod");
    baitStock.set({ ...get(baitStock), megabit: 5 });

    cast("megabit", 250);

    expect(get(activeFish).id).toBe("porigon");
    expect(get(worldCreatureEncounter)).toBe(null);
    expect(get(worldCreatures)[0].state).toBe("wild");

    setScene({ mode: "normal", biome: "river", bait: "megabit" });
    baitStock.set({ ...get(baitStock), megabit: 5 });
    cast("megabit", 250);

    expect(get(activeFish).id).toBe("tilapia_dourada");
    expect(get(worldCreatureEncounter)).toBe(null);
    expect(get(worldCreatures)[0].state).toBe("wild");
  });

  it("lançar perto de uma criatura inicia o encontro com aquela espécie", () => {
    const species = visibleFish();
    throwLine();
    vi.advanceTimersByTime(600);
    expect(get(activeFish).id).toBe(species.id);
    expect(get(worldCreatureEncounter)).toBe("visible-fish");
    expect(get(worldCreatures)[0].state).toBe("engaged");
    expect(get(shadowPos)).toEqual({ x: 10, y: 3 });
    expect(get(baitStock).minhoca).toBe(5);
  });

  it("criatura rejeita a isca com X e desaparece do mapa ao fugir", () => {
    visibleFish();
    cast("isca_brilhante");
    advanceUntil(() => get(shadowReaction) === "reject");
    expect(get(worldCreatures)).toHaveLength(1);
    advanceUntil(() => get(phase) === PHASES.PLAYING);
    expect(get(worldCreatures)).toEqual([]);
    expect(get(worldCreatureEncounter)).toBeNull();
    expect(get(baitStock).isca_brilhante).toBe(5);
  });

  it("criatura interessada mostra coração e pode ser capturada uma única vez", () => {
    const species = visibleFish();
    cast();
    advanceUntil(() => get(shadowReaction) === "heart");
    Math.random.mockReturnValue(0);
    advanceUntil(() => get(phase) === PHASES.FISHING_BITE);
    Math.random.mockReturnValue(0.99);
    startMinigame();
    minigameBar.set(get(catchTargetCenter));
    attemptCatch();
    expect(get(phase)).toBe(PHASES.CAUGHT);
    expect(get(inventory)[0].id).toBe(species.id);
    expect(get(worldCreatures)).toEqual([]);
    resetAction();
    expect(get(worldCreatures)).toEqual([]);
    expect(get(baitStock).minhoca).toBe(4);
  });

  it("Pokémon visível na água reage à isca e pode ser pescado", () => {
    setScene({ mode: "pokemon", biome: "river" });
    const species = POKEMON_DB.find((pokemon) => pokemon.id === "magikarp");
    worldCreatures.set([{
      id: "visible-pokemon", speciesId: species.id, dexId: species.dexId, x: 10, y: 3, size: 1,
      aquatic: true, decorative: false, biome: "river", zone: 1, state: "wild", target: null, progress: 0,
    }]);
    cast();
    expect(get(worldCreatureEncounter)).toBe("visible-pokemon");
    advanceUntil(() => get(shadowReaction) === "heart");
    Math.random.mockReturnValue(0);
    advanceUntil(() => get(phase) === PHASES.FISHING_BITE);
    Math.random.mockReturnValue(0.99);
    startMinigame();
    minigameBar.set(get(catchTargetCenter));
    attemptCatch();
    expect(get(phase)).toBe(PHASES.CAUGHT);
    expect(get(inventory)[0].id).toBe("magikarp");
    expect(get(worldCreatures)).toEqual([]);
  });

  it.each([
    [{ x: 15, y: 3 }, 1],
    [{ x: 10, y: 3 }, 2],
  ])("lançamento distante ou em outra zona não engaja a criatura", (position, zone) => {
    visibleFish(position, zone);
    throwLine();
    vi.advanceTimersByTime(600);
    expect(get(phase)).toBe(PHASES.FISHING_WAIT);
    expect(get(worldCreatures)[0].state).toBe("wild");
    expect(get(worldCreatureEncounter)).toBeNull();
  });

  it.each([
    ["river", 6, "up", 1, 4],
    ["sea", 18, "down", 17, 23],
  ])("lançamentos longos no %s mantêm boia e órbita na água", (biome, playerY, direction, waterTop, waterBottom) => {
    fishingBiome.set(biome);
    player.set({ x: 1, y: playerY, dir: direction });
    aimPower.set(3);
    throwLine();
    const bobber = get(bobberPos);
    expect(bobber.y).toBeGreaterThanOrEqual(waterTop);
    expect(bobber.y).toBeLessThanOrEqual(waterBottom);
    vi.advanceTimersByTime(21000);
    expect(get(shadowPos).x).toBeGreaterThanOrEqual(bobber.x);
    expect(biome === "river" ? get(shadowPos).y <= bobber.y : get(shadowPos).y >= bobber.y).toBe(true);
    advanceUntil(() => get(shadowReaction) !== null);
    const position = get(shadowPos);
    expect(position.x).toBeGreaterThanOrEqual(0.5);
    expect(position.y).toBeGreaterThanOrEqual(waterTop - 0.5);
    expect(position.y).toBeLessThanOrEqual(waterBottom + 0.5);
  });

  it("circula devagar antes de reagir e rejeita uma isca incompatível", () => {
    cast("isca_brilhante");
    expect(get(shadowReaction)).toBeNull();
    advanceUntil(() => get(shadowReaction) === "reject");
    expect(time).toBeGreaterThanOrEqual(6000);
    expect(get(shadowActive)).toBe(true);
    const bobber = get(bobberPos);
    const position = get(shadowPos);
    expect(Math.hypot(position.x - bobber.x, position.y - bobber.y)).toBeCloseTo(0.5);
    advanceUntil(() => get(phase) === PHASES.PLAYING);
    expect(get(shadowActive)).toBe(false);
    expect(get(shadowReaction)).toBeNull();
    expect(get(baitStock).isca_brilhante).toBe(5);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it.each([
    ["minhoca", 0.89, true],
    ["minhoca", 0.91, false],
    ["massa_pao", 0.59, true],
    ["massa_pao", 0.61, false],
  ])("%s respeita o sorteio %f de mordida", (bait, roll, bites) => {
    cast(bait);
    advanceUntil(() => get(shadowReaction) === "heart");
    Math.random.mockReturnValue(roll);
    advanceUntil(() => get(phase) !== PHASES.FISHING_APPROACH);
    expect(get(phase)).toBe(bites ? PHASES.FISHING_BITE : PHASES.PLAYING);
    if (!bites) expect(get(baitStock)[bait]).toBe(5);
  });

  it("perder a janela de fisgada consome a última isca e desequipa", () => {
    baitStock.set({ minhoca: 1 });
    throwLine();
    vi.advanceTimersByTime(21000);
    Math.random.mockReturnValue(0);
    advanceUntil(() => get(phase) === PHASES.FISHING_BITE);
    vi.advanceTimersByTime(2000);
    expect(get(phase)).toBe(PHASES.PLAYING);
    expect(get(baitStock).minhoca).toBe(0);
    expect(get(eqBaitId)).toBe("sem_isca");
    resetAction();
    expect(get(baitStock).minhoca).toBe(0);
  });

  it.each([true, false])("captura bem-sucedida=%s consome só uma isca", (success) => {
    cast();
    Math.random.mockReturnValue(0);
    advanceUntil(() => get(phase) === PHASES.FISHING_BITE);
    Math.random.mockReturnValue(0.99);
    startMinigame();
    minigameBar.set(success ? get(catchTargetCenter) : 100);
    attemptCatch();
    expect(get(phase)).toBe(success ? PHASES.CAUGHT : PHASES.PLAYING);
    expect(get(inventory)).toHaveLength(success ? 1 : 0);
    expect(get(baitStock).minhoca).toBe(4);
    resetAction();
    expect(get(baitStock).minhoca).toBe(4);
  });

  it("recolher antes de surgir um peixe não gasta isca nem deixa callbacks", () => {
    throwLine();
    resetAction();
    vi.advanceTimersByTime(30000);
    expect(get(phase)).toBe(PHASES.PLAYING);
    expect(get(baitStock).minhoca).toBe(5);
    expect(get(activeFish)).toBeNull();
    expect(get(shadowActive)).toBe(false);
  });
});

describe("rollFishByZone no modo normal", () => {
  it.each(["sea", "deep_sea"])("muito raros continuam escassos no %s com isca cara", (biome) => {
    setScene({ biome, bait: "isca_brilhante", minutes: NIGHT });
    const fish = rollMany(3, 5000).filter((fish) => fish.type === "fish" && !isTrash(fish));
    expect(fish.filter((fish) => fish.rarity >= 5).length / fish.length).toBeLessThan(0.04);
  });

  const scenes = [];
  for (const biome of ["river", "sea", "deep_sea"]) {
    for (const zone of [1, 2, 3]) {
      for (const minutes of [DAY, NIGHT]) {
        for (const season of [0, 1, 2, 3]) {
          scenes.push({ biome, zone, minutes, season });
        }
      }
    }
  }

  it.each(scenes)("$biome, zona $zone, minuto $minutes, estação $season", ({ biome, zone, minutes, season }) => {
    setScene({ biome, minutes, season });
    const night = minutes === NIGHT;
    const allowedBiomes = biome === "deep_sea" ? ["deep_sea", "sea", "all"] : [biome, "all"];
    for (const fish of rollMany(zone, 150)) {
      expect(allowedBiomes, fish.id).toContain(fish.biome);
      if (Array.isArray(fish.dist) && fish.dist.length > 0) {
        expect(fish.dist, fish.id).toContain(zone);
      }
      if (isTrash(fish)) continue;
      const when = fish.times || "all";
      if (when === "night") expect(night, `${fish.id} só de noite`).toBe(true);
      if (when === "day") expect(night, `${fish.id} só de dia`).toBe(false);
    }
  });

  it("o alto-mar de dia tem espécies próprias na zona funda", () => {
    setScene({ biome: "deep_sea", minutes: DAY });
    const fish = rollMany(3, 300).filter((f) => f.type === "fish" && !isTrash(f));
    expect(fish.some((f) => f.biome === "deep_sea")).toBe(true);
  });

  it("peixe de tempestade só aparece na tempestade", () => {
    for (const weather of ["sunny", "rainy"]) {
      for (const biome of ["river", "sea", "deep_sea"]) {
        setScene({ biome, weather });
        expect(rollMany(3, 300).filter((f) => f.weather)).toEqual([]);
      }
    }
  });

  it.each(["river", "sea", "deep_sea"])("na tempestade, %s dá peixe de tempestade", (biome) => {
    setScene({ biome, weather: "storm" });
    const stormFish = rollMany(3, 500).filter((f) => f.weather === "storm");
    expect(stormFish.length).toBeGreaterThan(0);
  });

  it("lixo só sai da lista de lixo e é mais comum sem isca", () => {
    setScene({ biome: "river", bait: "sem_isca" });
    const noBait = rollMany(1, 2000);
    setScene({ biome: "river", bait: "minhoca" });
    const withBait = rollMany(1, 2000);

    const trashRate = (list) => list.filter(isTrash).length / list.length;
    for (const fish of [...noBait, ...withBait]) {
      if (fish.id.includes("bota") || fish.id.includes("lata")) expect(isTrash(fish), fish.id).toBe(true);
    }
    expect(trashRate(noBait)).toBeGreaterThan(trashRate(withBait));
  });

  it("o preço final segue estrelas e brilho", () => {
    setScene({ biome: "sea" });
    for (const fish of rollMany(2, 500)) {
      if (fish.type !== "fish" || isTrash(fish)) continue;
      const expected = (fish.price || 0) * fish.stars * (fish.isShiny ? 3 : 1);
      expect(fish.priceFinal, fish.id).toBe(expected);
    }
  });

  it("o upgrade de sorte aumenta a chance de brilhante", () => {
    const shinyRate = (lucky) => {
      setScene({ biome: "deep_sea", lucky });
      const list = rollMany(3, 4000);
      return list.filter((f) => f.isShiny).length / list.length;
    };
    expect(shinyRate(true)).toBeGreaterThan(shinyRate(false));
  });
});

describe("rollFishByZone no modo Pokémon", () => {
  it("na zona funda, níveis 2 e 3 continuam menos frequentes que nível 1", () => {
    setScene({ mode: "pokemon", biome: "sea", bait: "isca_brilhante" });
    const pokemon = rollMany(3, 10000).filter((fish) => fish.dexNum);
    expect(pokemon.filter((fish) => fish.stage === 2).length / pokemon.length).toBeLessThan(0.3);
    const stage3Rate = pokemon.filter((fish) => fish.stage === 3).length / pokemon.length;
    expect(stage3Rate).toBeGreaterThan(0);
    expect(stage3Rate).toBeLessThan(0.02);
    expect(pokemon.filter((fish) => fish.rarity === 6).length / pokemon.length).toBeLessThan(0.005);
  });

  it.each([1, 2, 3])("zona %i respeita bioma e distância", (zone) => {
    for (const biome of ["river", "sea"]) {
      setScene({ mode: "pokemon", biome });
      for (const fish of rollMany(zone, 300)) {
        expect(fish.biome === biome || fish.biome === "all", fish.id).toBe(true);
        if (Array.isArray(fish.dist) && fish.dist.length > 0) {
          expect(fish.dist, fish.id).toContain(zone);
        }
      }
    }
  });

  it("o píer tem espécies exclusivas e a margem não", () => {
    constructions.set(JSON.parse(JSON.stringify(INITIAL_CONSTRUCTIONS)));
    currentMap.set("village");
    player.set({ x: 10, y: 16, dir: "down" });
    setScene({ biome: "sea" });
    expect(rollMany(1, 250).some((fish) => fish.pierOnly)).toBe(false);
    constructions.update((all) => ({ ...all, pier: { ...all.pier, status: "built" } }));
    player.set({ x: PIER_BOUNDS.x1, y: PIER_BOUNDS.y1, dir: "down" });
    expect(playerOnPier()).toBe(true);
    expect(rollMany(1, 400).some((fish) => fish.id === "peixe_cais")).toBe(true);
  });
});
