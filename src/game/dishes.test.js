import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { cookDish, dishEffect, todaysDish, ingredientIndexes, dishById } from "./dishes.js";
import { DISHES } from "./constants.js";
import { activeDish, inventory, money, friendship, seasonIndex, day } from "./stores.js";

const fish = (biome, extra = {}) => ({ type: "fish", biome, stars: 1, rarity: 1, priceFinal: 50, ...extra });

beforeEach(() => {
  activeDish.set(null);
  inventory.set([]);
  money.set(10000);
  friendship.set({});
  seasonIndex.set(0);
  day.set(1);
});

describe("pratos", () => {
  it("todo prato tem um efeito conhecido", () => {
    const known = ["catchBar", "biteBonus", "rarityBonus", "shinyMult"];
    for (const dish of DISHES) expect(Object.keys(dish.effect).every((k) => known.includes(k))).toBe(true);
  });

  it("usa os peixes mais baratos que servem", () => {
    inventory.set([fish("river", { priceFinal: 500 }), fish("sea"), fish("river", { priceFinal: 10 }), fish("river")]);
    expect(ingredientIndexes(dishById("sopa_rio"))).toEqual([2, 3]);
  });

  it("peixe do alto-mar conta como peixe do mar", () => {
    inventory.set([fish("deep_sea"), fish("sea")]);
    expect(ingredientIndexes(dishById("ensopado_mar"))).toHaveLength(2);
  });

  it("cozinhar cobra, consome os peixes e ativa o efeito do dia", () => {
    inventory.set([fish("river"), fish("river"), fish("sea")]);
    const result = cookDish("sopa_rio");
    expect(result.ok).toBe(true);
    expect(get(money)).toBe(10000 - dishById("sopa_rio").price);
    expect(get(inventory)).toEqual([fish("sea")]);
    expect(dishEffect("catchBar", 1)).toBe(1.15);
    expect(dishEffect("biteBonus", 0)).toBe(0);
  });

  it("o efeito acaba no dia seguinte", () => {
    inventory.set([fish("river", { stars: 3 })]);
    cookDish("moqueca_real");
    expect(todaysDish().id).toBe("moqueca_real");
    day.set(2);
    expect(todaysDish()).toBeNull();
    expect(dishEffect("rarityBonus", 0)).toBe(0);
  });

  it("recusa sem ingredientes ou sem dinheiro, sem gastar nada", () => {
    expect(cookDish("caldo_sorte").ok).toBe(false);
    inventory.set([fish("sea", { rarity: 5 })]);
    money.set(10);
    expect(cookDish("caldo_sorte").ok).toBe(false);
    expect(get(inventory)).toHaveLength(1);
    expect(get(money)).toBe(10);
  });
});
