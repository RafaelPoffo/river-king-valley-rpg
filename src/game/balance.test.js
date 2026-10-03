import { describe, it, expect } from "vitest";
import { rollWeight, catchZoneWidth } from "./fishingEngine.js";
import { TOOLS, FISH_DB, CAST_TILES, MAPS_DATA } from "./constants.js";
import { SPRITES } from "./sprites.js";

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe("peso", () => {
  it("fica sempre dentro do intervalo da espécie", () => {
    const random = seeded(7);
    for (let i = 0; i < 2000; i++) {
      const weight = rollWeight(1, 10, random);
      expect(weight).toBeGreaterThanOrEqual(1);
      expect(weight).toBeLessThanOrEqual(10);
    }
  });

  it("peixes pesados são raros", () => {
    const random = seeded(42);
    const rolls = Array.from({ length: 5000 }, () => rollWeight(0, 100, random));
    const heavy = rolls.filter((w) => w >= 80).length / rolls.length;
    const light = rolls.filter((w) => w <= 33).length / rolls.length;
    expect(heavy).toBeLessThan(0.1);
    expect(light).toBeGreaterThan(0.6);
  });
});

describe("minigame", () => {
  it("a área verde nunca some e vara melhor sempre ajuda", () => {
    const rods = TOOLS.rod;
    for (let diff = 1; diff <= 12; diff++) {
      for (let i = 1; i < rods.length; i++) {
        expect(catchZoneWidth(diff, rods[i].power)).toBeGreaterThanOrEqual(catchZoneWidth(diff, rods[i - 1].power));
      }
      expect(catchZoneWidth(diff, rods[0].power)).toBeGreaterThanOrEqual(8);
    }
  });

  it("é menor que antes para o mesmo peixe e vara", () => {
    const oldWidth = (diff, power) => Math.max(12, 60 - diff * power);
    for (const rod of TOOLS.rod) {
      for (let diff = 1; diff <= 12; diff++) expect(catchZoneWidth(diff, rod.power)).toBeLessThan(oldWidth(diff, rod.power));
    }
  });
});

describe("economia", () => {
  it("cada vara e rede custa mais que a anterior", () => {
    for (const list of [TOOLS.rod, TOOLS.net]) {
      for (let i = 1; i < list.length; i++) expect(list[i].price).toBeGreaterThan(list[i - 1].price);
    }
  });

  it("nenhum peixe paga sozinho a vara mais cara", () => {
    const priciest = Math.max(...TOOLS.rod.map((r) => r.price));
    const sellable = FISH_DB.filter((f) => f.type === "fish" && f.sprite !== SPRITES.trash);
    for (const fish of sellable) expect(fish.price * 6 * 3).toBeLessThan(priciest);
  });
});

describe("lançamento", () => {
  it("cada zona cai mais longe que a anterior e dentro do mar da vila", () => {
    const seaRows = MAPS_DATA.village.length - 2 - 16;
    expect(CAST_TILES[1]).toBeLessThan(CAST_TILES[2]);
    expect(CAST_TILES[2]).toBeLessThan(CAST_TILES[3]);
    expect(CAST_TILES[3]).toBeLessThanOrEqual(seaRows);
  });
});
