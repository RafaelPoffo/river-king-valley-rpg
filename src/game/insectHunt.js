import { get } from "svelte/store";
import { MAPS_DATA } from "./constants.js";
import { bugsForMode } from "./bugCatalog.js";
import { day, gameMode, insectInventory, insectPopulationDay, seasonIndex, wildInsects } from "./stores.js";

const DAY_COUNTS = [3, 4, 5, 6, 7, 8, 9];
const COUNT_WEIGHTS = [7, 6, 5, 4, 3, 2, 1];

export function seededRandom(key) {
  let seed = 2166136261;
  for (const character of key) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

function chooseCount(random) {
  const total = COUNT_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  let roll = random() * total;
  for (let index = 0; index < COUNT_WEIGHTS.length; index++) {
    roll -= COUNT_WEIGHTS[index];
    if (roll < 0) return DAY_COUNTS[index];
  }
  return DAY_COUNTS[0];
}

function canAllocate(total, slots, pointValues, memo = new Map()) {
  if (slots === 0) return total === 0;
  const key = `${total}:${slots}`;
  if (memo.has(key)) return memo.get(key);
  const possible = pointValues.some((points) =>
    total >= points && canAllocate(total - points, slots - 1, pointValues, memo)
  );
  memo.set(key, possible);
  return possible;
}

function budgetValues(count, random, pointValues) {
  const values = [];
  let remaining = 18;
  for (let index = 0; index < count; index++) {
    const slotsAfter = count - index - 1;
    const options = pointValues.filter((points) => canAllocate(remaining - points, slotsAfter, pointValues));
    const value = options[Math.floor(random() * options.length)];
    values.push(value);
    remaining -= value;
  }
  return values;
}

function spawnTiles(random) {
  const rows = MAPS_DATA.bug_forest;
  const tiles = [];
  for (let y = 2; y <= 22; y++) {
    for (let x = 2; x <= 17; x++) {
      if (["G", "F"].includes(rows[y]?.[x])) tiles.push({ x, y });
    }
  }
  return tiles.sort(() => random() - 0.5);
}

export function generateDailyInsects(key, mode = "normal") {
  const random = seededRandom(`${mode}:${key}`);
  const catalog = bugsForMode(mode);
  const count = chooseCount(random);
  const pointValues = [...new Set(catalog.map((bug) => bug.points))];
  const values = budgetValues(count, random, pointValues);
  const tiles = spawnTiles(random);
  const creatures = [];

  for (let index = 0; index < count; index++) {
    const available = catalog.filter((bug) => bug.points === values[index]);
    const species = available[Math.floor(random() * available.length)];
    if (!species || !tiles[index]) continue;
    creatures.push({
      id: `${key}:${index}`,
      speciesId: species.id,
      points: values[index],
      strength: species.strength,
      x: tiles[index].x,
      y: tiles[index].y,
    });
  }
  return creatures;
}

export function ensureDailyInsects() {
  const key = `${get(gameMode)}:${get(seasonIndex)}:${get(day)}`;
  if (get(insectPopulationDay) === key) return false;
  wildInsects.set(generateDailyInsects(`${get(seasonIndex)}:${get(day)}`, get(gameMode)));
  insectPopulationDay.set(key);
  return true;
}

export function insectSpecies(creature) {
  if (!creature) return null;
  return bugsForMode(get(gameMode)).find((bug) => bug.id === creature.speciesId) || null;
}

export function catchInsect(id) {
  const creature = get(wildInsects).find((item) => item.id === id);
  const species = insectSpecies(creature);
  if (!creature || !species) return null;
  const carriedPoints = get(insectInventory).reduce((total, insect) => total + insect.points, 0);
  if (carriedPoints + creature.points > 18) return null;
  const captured = { ...species, type: "insect", points: creature.points, caughtId: creature.id };
  insectInventory.update((inventory) => [...inventory, captured]);
  wildInsects.update((creatures) => creatures.filter((item) => item.id !== id));
  return captured;
}