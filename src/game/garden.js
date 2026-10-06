import { get } from "svelte/store";
import { garden, gardenDay, gardenBuffs, gardenVisitor, seedStock, eqSeedId, currentToolType } from "./stores.js";

export const FRUITS = [
  { id: "apple", name: "Maca", seedName: "Semente de maca", bonus: "Forca da vara +1", effect: "strength", value: 1 },
  { id: "pear", name: "Pera", seedName: "Semente de pera", bonus: "Area de captura +6", effect: "capture", value: 6 },
  { id: "peach", name: "Pessego", seedName: "Semente de pessego", bonus: "Sorte de pesca +2", effect: "luck", value: 2 },
  { id: "cherry", name: "Cereja", seedName: "Semente de cereja", bonus: "Venda de peixes +20%", effect: "sale", value: 0.2 },
  { id: "plum", name: "Ameixa", seedName: "Semente de ameixa", bonus: "Movimento da captura -15%", effect: "calm", value: 0.15 },
];

export const GARDEN_PLOTS = FRUITS.map((fruit, index) => ({ id: fruit.id, x: 24 + index * 3, y: 19 }));
export const initialGarden = () => [{ fruitId: "apple", x: 24, y: 19, grownAt: 0, readyAt: 0 }];
export const growthDelay = (random = Math.random) => 3 + Math.floor(random() * 3);
export const fruitFor = (id) => FRUITS.find((fruit) => fruit.id === id);
export const gardenBonus = (effect) => Math.max(0, ...get(gardenBuffs).filter((buff) => buff.effect === effect).map((buff) => buff.value));

export function grantSeed(random = Math.random) {
  const fruit = FRUITS[Math.floor(random() * FRUITS.length)];
  seedStock.update((stock) => ({ ...stock, [fruit.id]: (stock[fruit.id] || 0) + 1 }));
  return fruit;
}

export function advanceGardenDay(random = Math.random) {
  gardenDay.update((value) => value + 1);
  gardenBuffs.set([]);
  const visitor = random() < 0.1;
  gardenVisitor.set(visitor ? { dexId: "0001", x: 29, y: 21 } : null);
  if (visitor) garden.update((trees) => trees.map((tree) => tree.grownAt <= get(gardenDay) ? { ...tree, readyAt:get(gardenDay) } : tree));
  return visitor;
}

export function plantSeed(x, y, random = Math.random) {
  const id = get(eqSeedId);
  if (get(currentToolType) !== "seed" || !fruitFor(id)) return { ok: false, message: "Equipe uma semente para plantar no jardim." };
  const plot = GARDEN_PLOTS.find((item) => item.x === x && item.y === y);
  if (!plot) return { ok: false, message: "Plante em um dos cinco canteiros do jardim." };
  const trees = get(garden);
  if (trees.some((tree) => tree.x === x && tree.y === y)) return { ok: false, message: "Este canteiro ja tem uma arvore." };
  if (trees.length >= 5 || trees.some((tree) => tree.fruitId === id)) return { ok: false, message: "Seu jardim permite apenas uma arvore de cada especie." };
  if (!(get(seedStock)[id] > 0)) return { ok: false, message: "Voce nao tem essa semente." };
  const readyAt = get(gardenDay) + growthDelay(random);
  garden.update((all) => [...all, { fruitId: id, x, y, grownAt: readyAt, readyAt }]);
  seedStock.update((stock) => ({ ...stock, [id]: stock[id] - 1 }));
  if (get(seedStock)[id] === 0) currentToolType.set("rod");
  return { ok: true, message: `${fruitFor(id).seedName} plantada. Crescera em ${readyAt - get(gardenDay)} dias.` };
}

export function eatFruit(x, y, random = Math.random) {
  const tree = get(garden).find((item) => item.x === x && item.y === y);
  if (!tree) return null;
  const remaining = Math.max(tree.grownAt, tree.readyAt) - get(gardenDay);
  if (remaining > 0) return { ok: false, message: `Esta arvore precisa de mais ${remaining} dia(s).` };
  const fruit = fruitFor(tree.fruitId);
  if (get(gardenBuffs).some((buff) => buff.id === fruit.id)) return { ok: false, message: "Voce ja recebeu este bonus hoje. O fruto fica na arvore." };
  gardenBuffs.update((buffs) => [...buffs, fruit]);
  garden.update((trees) => trees.map((item) => item === tree ? { ...item, readyAt: get(gardenDay) + growthDelay(random) } : item));
  return { ok: true, message: `Voce comeu ${fruit.name}! ${fruit.bonus} ate o fim do dia.` };
}