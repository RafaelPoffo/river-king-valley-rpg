import { beforeEach, describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { garden, gardenDay, gardenBuffs, gardenVisitor, seedStock, eqSeedId, currentToolType } from "./stores.js";
import { advanceGardenDay, eatFruit, gardenBonus, growthDelay, initialGarden, plantSeed } from "./garden.js";

describe("jardim", () => {
  beforeEach(() => {
    garden.set(initialGarden()); gardenDay.set(0); gardenBuffs.set([]); gardenVisitor.set(null);
    seedStock.set({ pear: 2, apple: 1 }); eqSeedId.set("pear"); currentToolType.set("seed");
  });
  it("cresce em tres a cinco dias sem gastar sementes em plantios invalidos", () => {
    expect(growthDelay(() => 0)).toBe(3);
    expect(growthDelay(() => 0.99)).toBe(5);
    expect(plantSeed(27, 19, () => 0).ok).toBe(true);
    expect(get(seedStock).pear).toBe(1);
    expect(plantSeed(30, 19).ok).toBe(false);
    expect(plantSeed(1, 1).ok).toBe(false);
    expect(get(seedStock).pear).toBe(1);
    expect(eatFruit(27, 19).ok).toBe(false);
    gardenDay.set(3);
    expect(eatFruit(27, 19, () => 0).ok).toBe(true);
    expect(gardenBonus("capture")).toBe(6);
    expect(get(garden)[1].readyAt).toBe(6);
  });
  it("frutos e bonus nao acumulam e expiram ao dormir", () => {
    expect(eatFruit(24, 19, () => 0).ok).toBe(true);
    advanceGardenDay(() => 0);
    expect(gardenBonus("strength")).toBe(0);
    expect(get(gardenVisitor).dexId).toBe("0001");
    expect(eatFruit(24, 19).ok).toBe(true);
    garden.update((trees) => trees.map((tree) => ({ ...tree, readyAt: 1 })));
    expect(eatFruit(24, 19).ok).toBe(false);
    expect(gardenBonus("strength")).toBe(1);
  });
  it("a visita ocorre abaixo de dez por cento e recarrega todas as arvores", () => {
    plantSeed(27, 19);
    expect(advanceGardenDay(() => 0.1)).toBe(false);
    expect(get(gardenVisitor)).toBeNull();
    expect(advanceGardenDay(() => 0.099)).toBe(true);
    expect(get(garden)[0].readyAt).toBe(2);
    expect(get(garden)[1].grownAt).toBeGreaterThanOrEqual(3);
    expect(eatFruit(27, 19).ok).toBe(false);
  });
});