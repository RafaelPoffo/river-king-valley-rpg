import { get } from "svelte/store";
import { DISHES } from "./constants.js";
import { SPRITES } from "./sprites.js";
import { activeDish, inventory, money, seasonIndex, day } from "./stores.js";
import { dayKey } from "./tournament.js";
import { dishPrice } from "./friendship.js";

const today = () => dayKey(get(seasonIndex), get(day));

export function dishById(id) {
  return DISHES.find((d) => d.id === id) || null;
}

export function todaysDish() {
  const current = get(activeDish);
  return current && current.key === today() ? dishById(current.id) : null;
}

export function dishEffect(name, fallback) {
  const dish = todaysDish();
  return dish?.effect[name] ?? fallback;
}

export function isIngredient(dish, fish) {
  if (!fish || fish.type !== "fish" || fish.sprite === SPRITES.trash) return false;
  const need = dish.ingredients;
  if (need.biome === "sea" && fish.biome !== "sea" && fish.biome !== "deep_sea") return false;
  if (need.biome && need.biome !== "sea" && fish.biome !== need.biome) return false;
  if (need.minStars && (fish.stars || 0) < need.minStars) return false;
  if (need.minRarity && (fish.rarity || 0) < need.minRarity) return false;
  return true;
}

export function ingredientIndexes(dish, inv = get(inventory)) {
  return inv
    .map((fish, index) => ({ fish, index }))
    .filter(({ fish }) => isIngredient(dish, fish))
    .sort((a, b) => (a.fish.priceFinal || 0) - (b.fish.priceFinal || 0))
    .slice(0, dish.ingredients.count)
    .map(({ index }) => index);
}

export function canCook(dish) {
  return (
    ingredientIndexes(dish).length >= dish.ingredients.count && get(money) >= dishPrice(dish.price)
  );
}

export function cookDish(id) {
  const dish = dishById(id);
  if (!dish) return { ok: false, reason: "Prato desconhecido." };
  const indexes = ingredientIndexes(dish);
  if (indexes.length < dish.ingredients.count) {
    return { ok: false, reason: `Faltam ingredientes: ${dish.ingredientsLabel}.` };
  }
  const price = dishPrice(dish.price);
  if (get(money) < price) return { ok: false, reason: `Custa ¥${price}.` };

  money.update((m) => m - price);
  inventory.set(get(inventory).filter((_, i) => !indexes.includes(i)));
  activeDish.set({ id: dish.id, key: today() });
  return { ok: true, dish, price };
}
