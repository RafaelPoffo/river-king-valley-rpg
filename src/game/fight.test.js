import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { get } from "svelte/store";
import { fishStrength, lineBreakChance, strengthRange } from "./fight.js";
import { isNetCreature, resetAction, useNetAtShore } from "./fishingEngine.js";
import { harvestWorms } from "./gameActions.js";
import { TOOLS, FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { SPRITES } from "./sprites.js";
import {
  baitStock,
  day,
  eqNetId,
  gameMode,
  inGameMinutes,
  inventory,
  lastWormHarvestDay,
  seasonIndex,
  unlocks,
} from "./stores.js";

const rod = (id) => TOOLS.rod.find((r) => r.id === id);
const fish = (rarity, minW = 1, maxW = 10) => ({ type: "fish", sprite: SPRITES.fish, rarity, minW, maxW });

describe("força da vara contra o peixe", () => {
  it("peixes mais pesados da mesma espécie são mais fortes", () => {
    const species = fish(3);
    expect(fishStrength(species, 10)).toBeGreaterThan(fishStrength(species, 5));
    expect(fishStrength(species, 5)).toBeGreaterThan(fishStrength(species, 1));
    const [min, max] = strengthRange(species);
    expect(min).toBe(fishStrength(species, 1));
    expect(max).toBe(fishStrength(species, 10));
  });

  it("vara mais forte sempre arrebenta menos", () => {
    for (let rarity = 1; rarity <= 6; rarity++) {
      for (let i = 1; i < TOOLS.rod.length; i++) {
        const target = fish(rarity);
        expect(lineBreakChance(TOOLS.rod[i], target, 10)).toBeLessThan(lineBreakChance(TOOLS.rod[i - 1], target, 10));
      }
    }
  });

  it("vara fraca contra lenda pesada quase sempre arrebenta", () => {
    expect(lineBreakChance(rod("vara_vime"), fish(6), 10)).toBeGreaterThan(0.8);
  });

  it("vara adequada raramente arrebenta e vara forte quase nunca", () => {
    expect(lineBreakChance(rod("vara_amadora"), fish(3), 5)).toBeLessThan(0.1);
    expect(lineBreakChance(rod("vara_mitica"), fish(1), 1)).toBeCloseTo(0.02, 2);
  });

  it("lixo e tesouros nunca arrebentam a linha", () => {
    const trash = FISH_DB.find((f) => f.sprite === SPRITES.trash);
    const treasure = FISH_DB.find((f) => f.type === "treasure");
    expect(lineBreakChance(rod("vara_vime"), trash, trash.maxW)).toBe(0);
    if (treasure) expect(lineBreakChance(rod("vara_vime"), treasure, treasure.maxW)).toBe(0);
  });
});

describe("rede", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { setItem: vi.fn() });
    eqNetId.set("rede_1");
    unlocks.set([]);
    inGameMinutes.set(10 * 60);
    seasonIndex.set(0);
  });

  afterEach(() => {
    resetAction();
    eqNetId.set(null);
    inventory.set([]);
    gameMode.set("normal");
    vi.unstubAllGlobals();
  });

  it.each([
    ["normal", "river"],
    ["normal", "sea"],
    ["pokemon", "river"],
    ["pokemon", "sea"],
  ])("no modo %s (%s) só pega crustáceos e criaturas de rede", (mode, biome) => {
    gameMode.set(mode);
    for (let i = 0; i < 40; i++) {
      inventory.set([]);
      useNetAtShore(biome);
      const caught = get(inventory)[0];
      expect(caught).toBeDefined();
      expect(isNetCreature(caught)).toBe(true);
      resetAction();
    }
  });

  it("o modo Pokémon tem criaturas de rede no rio e no mar", () => {
    const net = POKEMON_DB.filter(isNetCreature);
    expect(net.some((p) => p.biome === "river")).toBe(true);
    expect(net.some((p) => p.biome === "sea")).toBe(true);
  });
});

describe("minhocas do Joe", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { setItem: vi.fn() });
    seasonIndex.set(1);
    day.set(3);
    lastWormHarvestDay.set(0);
    baitStock.set({ minhoca: 0 });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("a coleta diária dá de 2 a 4 minhocas", () => {
    harvestWorms();
    const qty = get(baitStock).minhoca;
    expect(qty).toBeGreaterThanOrEqual(2);
    expect(qty).toBeLessThanOrEqual(4);
  });

  it("sem minhocas, a caixa sempre dá uma reserva", () => {
    harvestWorms();
    baitStock.set({ minhoca: 0 });
    harvestWorms();
    expect(get(baitStock).minhoca).toBe(2);
  });

  it("com minhocas sobrando, a caixa não dá mais no mesmo dia", () => {
    harvestWorms();
    const qty = get(baitStock).minhoca;
    harvestWorms();
    expect(get(baitStock).minhoca).toBe(qty);
  });
});
