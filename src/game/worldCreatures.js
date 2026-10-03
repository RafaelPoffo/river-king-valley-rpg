import { MAPS_DATA, PLAYER_START, FESTIVAL_STALL, INITIAL_VILLAGERS, AQUARIUM_FOOTPRINT, DOCK_BOUNDS, CAST_TILES, getNpcLocation, inBounds } from "./constants.js";
import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import { SPRITES } from "./sprites.js";
import { LAND_VISITORS, WORLD_SPRITES } from "./data/worldCreatures.js";
import { worldSizeFor } from "./overworldAtlas.js";
import {
  worldCreatures, worldPopulationDay, day, seasonIndex, gameMode, getActiveDatabase,
  currentWeather, phase, currentMap, player, villagers, inGameMinutes,
} from "./stores.js";

export function creatureOccupies(creature, tileX, tileY) {
  const occupies = (position) => tileX >= position.x && tileX < position.x + creature.size &&
    tileY >= position.y && tileY < position.y + creature.size;
  return occupies(creature) || !!creature.target && occupies(creature.target);
}

export function dailyRandom(key) {
  let seed = 2166136261;
  for (const character of key) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

export function canPlaceCreature(creature, creatures, blocked = []) {
  const rows = MAPS_DATA.village;
  for (let offsetY = 0; offsetY < creature.size; offsetY++) {
    for (let offsetX = 0; offsetX < creature.size; offsetX++) {
      const tileX = creature.x + offsetX;
      const tileY = creature.y + offsetY;
      const tile = rows[tileY]?.[tileX];
      if (creature.aquatic ? !["X", "~"].includes(tile) : tile !== "G") return false;
      if (inBounds(tileX, tileY, AQUARIUM_FOOTPRINT) || inBounds(tileX, tileY, DOCK_BOUNDS)) return false;
      if (Math.abs(tileX - PLAYER_START.x) + Math.abs(tileY - PLAYER_START.y) <= 1) return false;
      if (Math.abs(tileX - FESTIVAL_STALL.x) + Math.abs(tileY - FESTIVAL_STALL.y) <= 1) return false;
      if (blocked.some((position) => Math.abs(tileX - position.x) <= 1 && Math.abs(tileY - position.y) <= 1)) return false;
      if (creatures.some((other) => creatureOccupies(other, tileX, tileY))) return false;
      for (const npc of INITIAL_VILLAGERS) {
        const position = getNpcLocation(npc, 600, 1);
        if (position.map === "village" && Math.abs(tileX - position.x) <= 1 && Math.abs(tileY - position.y) <= 1) return false;
      }
    }
  }
  return true;
}

export function createDailyPopulation(key, landSpecies, waterSpecies, blocked = []) {
  const random = dailyRandom(key);
  const count = 2 + Math.floor(random() * 7);
  const creatures = [];
  for (let index = 0; index < count; index++) {
    const aquatic = !landSpecies.length || waterSpecies.length > 0 && (index === 1 || index > 1 && random() < 0.4);
    const catalog = aquatic ? waterSpecies : landSpecies;
    if (!catalog.length) continue;
    const species = catalog[Math.floor(random() * catalog.length)];
    const size = species.worldSize || 1;
    const biome = aquatic ? species.biome === "all" ? species.dist.some((zone) => zone <= 2) && random() < 0.5 ? "river" : "sea" : species.biome : null;
    const zones = aquatic ? species.dist.filter((zone) => zone >= 1 && zone <= (biome === "river" ? 2 : 3)) : [];
    if (aquatic && !zones.length) continue;
    const zone = aquatic ? zones[Math.floor(random() * zones.length)] : null;
    for (let attempt = 0; attempt < 250; attempt++) {
      const creature = {
        id: `${key}:${index}`,
        speciesId: species.id,
        dexId: species.dexId,
        decorative: !!species.dexId && !aquatic,
        aquatic,
        biome,
        zone,
        size,
        x: 2 + Math.floor(random() * (36 - size)),
        y: aquatic ? biome === "river" ? 5 - CAST_TILES[zone] : 16 + CAST_TILES[zone] : 5 + Math.floor(random() * 11),
        direction: "down",
        target: null,
        progress: 0,
        cooldown: 3 + random() * 5,
        state: "wild",
      };
      if (!canPlaceCreature(creature, creatures, blocked)) continue;
      creatures.push(creature);
      break;
    }
  }
  return creatures;
}

export function worldSpecies(creature) {
  if (!creature) return null;
  const species = creature.aquatic
    ? getActiveDatabase().find((species) => species.id === creature.speciesId)
    : LAND_VISITORS.find((species) => species.id === creature.speciesId);
  return species || { name: "Pokemon", dexId: creature.dexId || "0025" };
}

export function creaturePosition(creature) {
  return creature.target ? {
    x: creature.x + (creature.target.x - creature.x) * creature.progress,
    y: creature.y + (creature.target.y - creature.y) * creature.progress,
  } : { x: creature.x, y: creature.y };
}

function occupiedPositions() {
  const positions = get(villagers).map((npc) => getNpcLocation(npc, get(inGameMinutes), get(day)))
    .filter((position) => position.map === "village");
  if (get(currentMap) === "village") {
    const position = get(player);
    positions.push({ x: Math.floor(position.x), y: Math.floor(position.y) });
    positions.push({ x: Math.ceil(position.x), y: Math.ceil(position.y) });
  }
  return positions;
}

export function ensureWorldPopulation() {
  const key = `${get(gameMode)}:${get(seasonIndex)}:${get(day)}`;
  if (get(worldPopulationDay) === key) {
    if (get(gameMode) === "pokemon") {
      worldCreatures.update((creatures) => creatures.map((creature) => {
        const catalog = creature.aquatic ? getActiveDatabase() : LAND_VISITORS;
        const previous = catalog.find((candidate) => candidate.id === creature.speciesId);
        const species = WORLD_SPRITES[previous?.dexId]
          ? previous
          : catalog.find((candidate) => candidate.dexId === (creature.aquatic ? "0129" : "0025"));
        const decorative = !creature.aquatic;
        const size = Math.min(creature.size || 1, worldSizeFor(species.dexId));
        if (creature.speciesId === species.id && creature.dexId === species.dexId &&
          creature.decorative === decorative && creature.size === size) return creature;
        return { ...creature, speciesId: species.id, dexId: species.dexId, decorative, size, state: "wild" };
      }));
    }
    return false;
  }
  const waterSpecies = getActiveDatabase().filter((species) =>
    species.type === "fish" && species.sprite !== SPRITES.trash &&
    (species.rarity <= 3 || worldSizeFor(species.dexId) > 1) &&
    (!species.stage || species.stage <= 2) && !species.requires &&
    (!species.weather || species.weather === get(currentWeather)) &&
    (!species.seasons || species.seasons.includes(get(seasonIndex))) &&
    ["all", "river", "sea"].includes(species.biome) &&
    (species.biome !== "river" || species.dist.some((zone) => zone <= 2)) &&
    (get(gameMode) !== "pokemon" || WORLD_SPRITES[species.dexId])
  ).map((species) => ({
    ...species,
    worldSize: species.dexId ? worldSizeFor(species.dexId) : Math.max(species.weight || 0, species.maxW || 0) >= 30 ? 2 : 1,
  }));
  const landSpecies = get(gameMode) === "pokemon" ? LAND_VISITORS : [];
  worldCreatures.set(createDailyPopulation(key, landSpecies, waterSpecies, occupiedPositions()));
  worldPopulationDay.set(key);
  return true;
}

export function worldCreatureBlocks(mapName, tileX, tileY) {
  return mapName === "village" && get(worldCreatures).some((creature) => creatureOccupies(creature, tileX, tileY));
}

export function tickWorldCreatures(delta, random = Math.random) {
  if (get(phase) !== PHASES.PLAYING || get(currentMap) !== "village") return;
  const blocked = occupiedPositions();
  worldCreatures.update((creatures) => {
    const next = [...creatures];
    for (let index = 0; index < next.length; index++) {
      const creature = { ...next[index] };
      if (creature.state !== "wild") continue;
      if (creature.target) {
        creature.progress = Math.min(1, creature.progress + delta / 1.8);
        if (creature.progress >= 1) {
          creature.x = creature.target.x;
          creature.y = creature.target.y;
          creature.target = null;
          creature.progress = 0;
          creature.cooldown = 3 + random() * 6;
        }
      } else {
        creature.cooldown -= delta;
        if (creature.cooldown <= 0) {
          creature.cooldown = 3 + random() * 6;
          if (random() < 0.45) {
            const directions = creature.aquatic
              ? [{ x: -1, y: 0, name: "left" }, { x: 1, y: 0, name: "right" }]
              : [{ x: -1, y: 0, name: "left" }, { x: 1, y: 0, name: "right" }, { x: 0, y: -1, name: "up" }, { x: 0, y: 1, name: "down" }];
            const direction = directions[Math.floor(random() * directions.length)];
            const candidate = { ...creature, x: creature.x + direction.x, y: creature.y + direction.y, target: null };
            if (canPlaceCreature(candidate, next.filter((other) => other.id !== creature.id), blocked)) {
              creature.target = { x: candidate.x, y: candidate.y };
              creature.progress = 0;
              creature.direction = direction.name;
            }
          }
        }
      }
      next[index] = creature;
    }
    return next;
  });
}

export function startWorldCreatureLoop() {
  const timer = setInterval(() => {
    if (get(phase) !== PHASES.PLAYING) return;
    ensureWorldPopulation();
    tickWorldCreatures(0.1);
  }, 100);
  return () => clearInterval(timer);
}

export function nearbyAquaticCreature(bobber, zone, biome) {
  const candidates = get(worldCreatures).filter((creature) =>
    creature.aquatic && !creature.decorative && creature.state === "wild" && creature.zone === zone && creature.biome === biome
  ).map((creature) => {
    const position = creaturePosition(creature);
    const dx = Math.max(position.x - bobber.x - 0.5, 0, bobber.x + 0.5 - position.x - creature.size);
    const dy = Math.max(position.y - bobber.y - 0.5, 0, bobber.y + 0.5 - position.y - creature.size);
    return { creature, distance: Math.hypot(dx, dy) };
  }).filter((candidate) => candidate.distance <= 0.75).sort((first, second) => first.distance - second.distance);
  return candidates[0]?.creature || null;
}

export function engageWorldCreature(id) {
  const creature = get(worldCreatures).find((candidate) => candidate.id === id && !candidate.decorative && candidate.state === "wild");
  if (!creature) return null;
  const position = creaturePosition(creature);
  const engaged = { ...creature, ...position, target: null, progress: 0, state: "engaged" };
  worldCreatures.update((creatures) => creatures.map((candidate) => candidate.id === id ? engaged : candidate));
  return engaged;
}

export function removeWorldCreature(id) {
  worldCreatures.update((creatures) => creatures.filter((creature) => creature.id !== id));
}