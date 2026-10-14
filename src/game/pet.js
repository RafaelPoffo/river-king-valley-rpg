import { get } from "svelte/store";
import { day, inventory, petCompanion, terrarium, seedStock } from "./stores.js";

export const TERRARIUMS = [
  { id: "terrario_pequeno", name: "Terrário Pequeno", price: 400, size: "small", desc: "Cabe só estágio 1." },
  { id: "terrario_grande", name: "Terrário Grande", price: 1800, size: "large", desc: "Cabe até estágio 2." },
];

export const PET_FOOD = { id: "racao_pet", name: "Ração para pet", price: 10, type: "loot" };
export const HOUSE_TERRARIUM = { x: 2, y: 3 };

export function canHousePet(creature, size) {
  const stage = creature.stage || 1;
  if (size === "small") return stage <= 1;
  return stage <= 2;
}

export function placeInTerrarium(item) {
  const home = get(terrarium);
  if (!home.size) return { ok: false, message: "Compre um terrário na loja e coloque em casa." };
  if (get(petCompanion)) return { ok: false, message: "Já existe um pet no terrário." };
  if (!canHousePet(item, home.size)) return { ok: false, message: "Este Pokémon não cabe neste terrário." };
  petCompanion.set({
    ...item,
    strength: Math.max(1, item.rarity || item.strength || 1),
    skill: item.archetypeId || "balanced",
    daysFed: 0,
  });
  return { ok: true, message: `${item.name} foi colocado no terrário.` };
}

export function feedPet(item) {
  const pet = get(petCompanion);
  if (!pet) return { ok: false, message: "Não há pet para alimentar." };
  const home = get(terrarium);
  if (home.lastFedDay === get(day)) return { ok: false, message: "Ele já comeu hoje." };
  let gain = 1;
  if (item?.id === "racao_pet") gain = 1;
  else if (item?.type === "insect" && (item.points || 0) >= 7) gain = 2;
  else if (item?.type === "fish" && (item.rarity || 1) >= 4) gain = 2;
  else if (item?.type === "seed") gain = 2;
  const daysFed = (pet.daysFed || 0) + gain;
  petCompanion.set({ ...pet, daysFed });
  terrarium.update((value) => ({ ...value, lastFedDay: get(day), fed: (value.fed || 0) + gain }));
  if (home.size === "large" && daysFed >= 10 && (pet.stage || 1) === 1 && pet.evolvesTo) {
    petCompanion.set({ ...pet, daysFed: 0, stage: 2, name: pet.evolvesToName || pet.name });
    return { ok: true, message: `${pet.name} evoluiu no terrário grande!` };
  }
  return { ok: true, message: `Você alimentou ${pet.name}.` };
}

export function buyTerrarium(id) {
  const item = TERRARIUMS.find((entry) => entry.id === id);
  if (!item) return { ok: false, message: "Terrário indisponível." };
  terrarium.update((value) => ({ ...value, size: item.size, id: item.id }));
  return { ok: true, message: `${item.name} foi instalado na sua casa.` };
}

export function buyPetFood(count = 1) {
  inventory.update((items) => [
    ...Array.from({ length: count }, () => ({ ...PET_FOOD, type: "loot" })),
    ...items,
  ]);
  return { ok: true, message: "Ração para pet comprada." };
}

export function pickUpPet() {
  const pet = get(petCompanion);
  if (!pet) return { ok: false, message: "Não há pet para recolher." };
  terrarium.update((value) => ({ ...value, inBall: true, roaming: false }));
  return { ok: true, message: `${pet.name} voltou para a mochila.` };
}

export function togglePetBall() {
  terrarium.update((value) => ({ ...value, inBall: !value.inBall, roaming: false }));
  return get(terrarium).inBall;
}

export function petRoamState(minutes) {
  const pet = get(petCompanion);
  const home = get(terrarium);
  if (!pet || home.inBall) return null;
  const hour = Math.floor(minutes / 60);
  if (hour < 8 || hour >= 18) return { place: "terrarium" };
  if (home.awayUntil > get(day)) return { place: "away" };
  return { place: "roam" };
}
