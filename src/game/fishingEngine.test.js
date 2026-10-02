import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rollFishByZone } from "./fishingEngine.js";
import { SPRITES } from "./sprites.js";
import { INITIAL_UPGRADES } from "./constants.js";
import {
  gameMode,
  fishingBiome,
  deepSeaFishingActive,
  inGameMinutes,
  seasonIndex,
  eqBaitId,
  upgrades,
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

function setScene({ mode = "normal", biome = "river", minutes = DAY, season = 0, bait = "minhoca", lucky = false }) {
  gameMode.set(mode);
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

beforeEach(() => {
  vi.spyOn(Math, "random").mockImplementation(seededRandom(42));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("rollFishByZone no modo normal", () => {
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

  it("o alto-mar de dia ainda dá peixe na zona funda", () => {
    setScene({ biome: "deep_sea", minutes: DAY });
    const fish = rollMany(3, 300).filter((f) => f.type === "fish" && !isTrash(f));
    expect(fish.length).toBeGreaterThan(0);
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
});
