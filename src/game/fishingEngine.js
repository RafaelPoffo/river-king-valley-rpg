import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import { SPRITES } from "./sprites.js";
import { BAITS, MAPS_DATA, CAST_TILES } from "./constants.js";
import {
  gameMode,
  getActiveDatabase,
  phase,
  player,
  aimPower,
  targetDistance,
  bobberPos,
  activeFish,
  shadowActive,
  shadowPos,
  shadowReaction,
  minigameBar,
  catchTargetCenter,
  catchTargetWidth,
  currentToolData,
  eqBaitId,
  baitStock,
  upgrades,
  inventory,
  maxInventorySize,
  inventoryFullPendingFish,
  fishLog,
  museum,
  currentMessage,
  currentWeather,
  unlocks,
  isNight,
  deepSeaFishingActive,
  fishingBiome,
  seasonIndex,
  eqNetId,
  currentMap,
  worldCreatureEncounter,
} from "./stores.js";
import { checkDailyQuestProgress } from "./quests.js";
import { saveGame } from "./saveSystem.js";
import { recordTournamentCatch } from "./tournament.js";
import { claimCollectionRewards, rewardMessage } from "./collections.js";
import { dishEffect } from "./dishes.js";
import { canBreakLine, lineBreakChance } from "./fight.js";
import { nearbyAquaticCreature, engageWorldCreature, removeWorldCreature, worldSpecies } from "./worldCreatures.js";

const STORM_PRIORITY = 0.02;
const BAIT_BITE_BONUS = 0.1;

export function shadowEntry(bobber, biome, mapWidth, random = Math.random) {
  const distance = 3;
  const directions = [{ x: 0, y: biome === "river" ? -distance : distance }];
  if (bobber.x >= distance + 1) directions.push({ x: -distance, y: 0 });
  if (bobber.x <= mapWidth - 2 - distance) directions.push({ x: distance, y: 0 });
  const direction = directions[Math.floor(random() * directions.length)];
  return { x: bobber.x + direction.x, y: bobber.y + direction.y };
}

let aimDir = 1;
let minigameDir = 1;
let lastTime = 0;
let castBaitId = null;
let castBaitBitten = false;
let shadowMotion = null;
const loopIds = {
  aim: null,
  wait: null,
  approach: null,
  escape: null,
  mini: null,
};

export function startAim() {
  phase.set(PHASES.FISHING_AIM);
  aimPower.set(1.0);
  aimDir = 1;
  lastTime = performance.now();
  if (loopIds.aim) cancelAnimationFrame(loopIds.aim);
  loopIds.aim = requestAnimationFrame(updateAim);
}

function updateAim(time) {
  if (get(phase) !== PHASES.FISHING_AIM) return;
  const delta = (time - lastTime) / 1000;
  lastTime = time;
  const speed = 5.0;
  let power = get(aimPower) + aimDir * delta * speed;
  const rodReach = get(currentToolData)?.maxDist || 1;
  const upperLimit = Math.min(3.99, rodReach + 0.99);
  if (power > upperLimit) {
    power = upperLimit;
    aimDir = -1;
  }
  if (power < 1) {
    power = 1;
    aimDir = 1;
  }
  aimPower.set(power);
  loopIds.aim = requestAnimationFrame(updateAim);
}

export function castTarget(p, zone, biome, map) {
  const distTiles = CAST_TILES[zone] ?? zone * 2;
  const step = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[p.dir] || [0, 0];
  const waterTop = biome === "river" ? 1 : 17;
  const waterBottom = biome === "river" ? 4 : map.length - 2;
  return {
    x: Math.max(1, Math.min(map[0].length - 2, p.x + step[0] * distTiles)),
    y: Math.max(waterTop, Math.min(waterBottom, p.y + step[1] * distTiles)),
  };
}

export function throwLine() {
  if (loopIds.aim) cancelAnimationFrame(loopIds.aim);
  const power = get(aimPower);
  const dist = Math.floor(power);
  targetDistance.set(dist);

  phase.set(PHASES.FISHING_WAIT);
  shadowActive.set(false);
  shadowReaction.set(null);
  shadowMotion = null;
  const equippedBait = get(eqBaitId);
  castBaitId = equippedBait === "sem_isca" || (get(baitStock)[equippedBait] || 0) > 0
    ? equippedBait
    : "sem_isca";
  castBaitBitten = false;
  if (castBaitId !== equippedBait) eqBaitId.set(castBaitId);

  const map = MAPS_DATA[get(currentMap)];
  const biome = get(deepSeaFishingActive) ? "sea" : get(fishingBiome);
  const waterTop = biome === "river" ? 1 : 17;
  const waterBottom = biome === "river" ? 4 : map.length - 2;
  bobberPos.set(castTarget(get(player), dist, biome, map));

  const isFastBite = Math.random() < 0.2;
  let waitTime = isFastBite
    ? 6000 + Math.random() * 10000
    : 16000 + Math.random() * 4000;

  const weather = get(currentWeather);
  if (weather === "rainy") waitTime *= 0.8;
  if (weather === "storm") waitTime *= 0.6;
  const nearbyCreature = get(currentMap) === "village"
    ? nearbyAquaticCreature(get(bobberPos), dist, biome)
    : null;
  if (nearbyCreature) waitTime = 600;

  clearTimeout(loopIds.wait);
  loopIds.wait = setTimeout(() => {
    if (get(phase) !== PHASES.FISHING_WAIT) return;

    const encounter = nearbyCreature ? engageWorldCreature(nearbyCreature.id) : null;
    const species = worldSpecies(encounter);
    const rolled = species ? decorateCatch(species) : rollFishByZone(dist);
    if (!rolled) {
      resetAction("Não fisgou nada...");
      return;
    }
    worldCreatureEncounter.set(encounter?.id || null);
    activeFish.set(rolled);

    phase.set(PHASES.FISHING_APPROACH);
    const bPos = get(bobberPos);
    const entry = encounter
      ? { x: encounter.x + (encounter.size - 1) / 2, y: encounter.y + (encounter.size - 1) / 2 }
      : shadowEntry(bPos, biome, map[0].length);
    if (!encounter) entry.y = Math.max(waterTop - 0.5, Math.min(waterBottom + 0.5, entry.y));
    shadowPos.set(entry);
    shadowMotion = {
      stage: "approach",
      entry,
      angle: Math.atan2(entry.y - bPos.y, entry.x - bPos.x),
      elapsed: 0,
      duration: 3 + Math.random() * 2,
      radius: Math.max(0.15, Math.min(0.65, bPos.x - 0.5, map[0].length - 1.5 - bPos.x, bPos.y - waterTop + 0.5, waterBottom + 0.5 - bPos.y)),
      chance: baitBiteChance(rolled, castBaitId),
    };
    shadowActive.set(true);
    lastTime = performance.now();
    if (loopIds.approach) cancelAnimationFrame(loopIds.approach);
    loopIds.approach = requestAnimationFrame(updateApproach);
  }, waitTime);
}

function updateApproach(time) {
  if (get(phase) !== PHASES.FISHING_APPROACH || !shadowMotion) return;
  const delta = Math.min(0.1, Math.max(0, (time - lastTime) / 1000));
  lastTime = time;

  const bPos = get(bobberPos);
  const sPos = get(shadowPos);
  const motion = shadowMotion;
  motion.elapsed += delta;

  if (motion.stage === "orbit" || motion.stage === "react") {
    motion.angle += delta * 0.8;
    shadowPos.set({
      x: bPos.x + Math.cos(motion.angle) * motion.radius,
      y: bPos.y + Math.sin(motion.angle) * motion.radius,
    });
    if (motion.stage === "orbit" && motion.elapsed >= motion.duration) {
      motion.stage = "react";
      motion.elapsed = 0;
      shadowReaction.set(motion.chance > 0 ? "heart" : "reject");
    } else if (motion.stage === "react" && motion.elapsed >= 1.2) {
      if (Math.random() < motion.chance) {
        beginBite();
        return;
      }
      motion.stage = "leave";
      motion.elapsed = 0;
    }
  } else {
    const destination = motion.stage === "leave" ? motion.entry : {
      x: bPos.x + Math.cos(motion.angle) * motion.radius,
      y: bPos.y + Math.sin(motion.angle) * motion.radius,
    };
    const dx = destination.x - sPos.x;
    const dy = destination.y - sPos.y;
    const distance = Math.hypot(dx, dy);
    const step = Math.min(distance, delta * (motion.stage === "leave" ? 1.2 : 0.9));
    if (distance <= 0.05) {
      if (motion.stage === "leave") {
        resetAction(motion.chance === 0 ? "Não gostou da isca e foi embora." : "Analisou a isca, mas foi embora.");
        return;
      }
      motion.stage = "orbit";
      motion.elapsed = 0;
    } else {
      shadowPos.set({ x: sPos.x + dx / distance * step, y: sPos.y + dy / distance * step });
    }
  }
  loopIds.approach = requestAnimationFrame(updateApproach);
}

export function baitBiteChance(fish, baitId) {
  if (isTrashSprite(fish) || fish.type === "treasure") return 1;
  const preference = fish.baitPreferences?.[baitId] || 0;
  return preference > 0 ? Math.min(1, preference + BAIT_BITE_BONUS) : 0;
}

function beginBite() {
  castBaitBitten = true;
  shadowActive.set(false);
  shadowReaction.set(null);
  phase.set(PHASES.FISHING_BITE);
  const currentFish = get(activeFish);
  const biteDuration = Math.max(0.4, 1.2 - (currentFish?.rarity || 1) * 0.15) + dishEffect("biteBonus", 0);
  clearTimeout(loopIds.escape);
  loopIds.escape = setTimeout(() => {
    resetAction("O peixe escapou! Você foi muito lento.");
  }, biteDuration * 1000);
}

function consumeCastBait() {
  const baitId = castBaitId;
  castBaitId = null;
  const wasBitten = castBaitBitten;
  castBaitBitten = false;
  if (!wasBitten) return;
  if (!baitId || baitId === "sem_isca") return;
  baitStock.update((stock) => ({ ...stock, [baitId]: Math.max(0, (stock[baitId] || 0) - 1) }));
  if (get(eqBaitId) === baitId && !get(baitStock)[baitId]) eqBaitId.set("sem_isca");
  saveGame();
}

function clearWorldEncounter() {
  const id = get(worldCreatureEncounter);
  if (!id) return;
  removeWorldCreature(id);
  worldCreatureEncounter.set(null);
  saveGame();
}

function isTrashSprite(fish) {
  return fish.sprite === SPRITES.trash;
}

function matchesTime(fish, night) {
  const when = fish.times || "all";
  if (when === "night") return night;
  if (when === "day") return !night;
  return true;
}

function matchesDist(fish, zone) {
  if (!Array.isArray(fish.dist) || fish.dist.length === 0) return true;
  return fish.dist.includes(zone);
}

function matchesSeason(fish, season) {
  if (!Array.isArray(fish.seasons) || fish.seasons.length === 0) return true;
  return fish.seasons.includes(season);
}

function matchesBiome(fish, biome) {
  return fish.biome === biome || fish.biome === "all";
}

function matchesWeather(fish, weather) {
  return !fish.weather || fish.weather === weather;
}

function isUnlocked(fish, unlocked) {
  return !fish.requires || unlocked.includes(fish.requires);
}

export function availableDatabase() {
  const weather = get(currentWeather);
  const unlocked = get(unlocks);
  return getActiveDatabase().filter(
    (f) => matchesWeather(f, weather) && isUnlocked(f, unlocked)
  );
}

function isRodFish(fish) {
  return (
    fish.type === "fish" &&
    !isTrashSprite(fish) &&
    !fish.id.startsWith("poke_") &&
    !fish.id.includes("bola")
  );
}

function firstPool(list, predicates) {
  for (const pred of predicates) {
    const found = list.filter(pred);
    if (found.length > 0) return found;
  }
  return [];
}

function decorateCatch(fishBase) {
  let stars =
    fishBase.stage === 3 || fishBase.rarity >= 5
      ? 5
      : fishBase.stage === 2 || fishBase.rarity >= 3
        ? 3
        : 1;
  const lucky = !!get(upgrades).shinyLuck?.bought;
  const rare = stars >= 5 || !!fishBase.preferDeep;
  const junk = isTrashSprite(fishBase) || fishBase.type === "treasure";
  let chance = 0;
  if (!junk && rare) chance = lucky ? 0.22 : 0.08;
  else if (!junk && lucky) chance = 0.06;
  chance *= dishEffect("shinyMult", 1);
  const isShiny = chance > 0 && Math.random() < chance;
  if (isShiny) stars = 6;
  return {
    ...fishBase,
    stars,
    isShiny,
    priceFinal: (fishBase.price || 0) * stars * (isShiny ? 3 : 1),
  };
}

export function rollFishByZone(zone) {
  const isPokeMode = get(gameMode) === "pokemon";
  const database = availableDatabase();
  const stormRoll = get(currentWeather) === "storm" && Math.random() < STORM_PRIORITY;
  const night = get(isNight);
  const deepSea = get(deepSeaFishingActive);
  const biomeTarget = deepSea ? "deep_sea" : get(fishingBiome);
  const bait = get(eqBaitId);
  const baitTier = BAITS.find((item) => item.id === bait)?.tier || 0;
  const curSeason = get(seasonIndex);

  const trashChance = bait === "sem_isca" ? 0.35 : 0.05;
  if (Math.random() < trashChance) {
    const trashes = database.filter(
      (f) =>
        isTrashSprite(f) &&
        matchesBiome(f, biomeTarget) &&
        matchesDist(f, zone)
    );
    if (trashes.length > 0) {
      const trashBase = trashes[Math.floor(Math.random() * trashes.length)];
      return {
        ...trashBase,
        stars: 1,
        isShiny: false,
        priceFinal: trashBase.price,
        weight: trashBase.weight || trashBase.minW,
      };
    }
  }

  if (
    zone >= 2 &&
    Math.random() < 0.05 &&
    (biomeTarget === "sea" || biomeTarget === "deep_sea" || isPokeMode)
  ) {
    const treasures = database.filter(
      (f) =>
        f.type === "treasure" &&
        matchesBiome(f, biomeTarget) &&
        matchesDist(f, zone) &&
        matchesTime(f, night) &&
        matchesSeason(f, curSeason)
    );
    if (treasures.length > 0) {
      const treasureBase =
        treasures[Math.floor(Math.random() * treasures.length)];
      return {
        ...treasureBase,
        isShiny: false,
        priceFinal: treasureBase.price,
        weight: treasureBase.weight || treasureBase.minW,
        stars: treasureBase.rarity || 1,
      };
    }
  }

  let pool = [];

  if (isPokeMode) {
    const rods = database.filter(isRodFish);
    pool = rods.filter((fish) =>
      matchesBiome(fish, biomeTarget) && matchesDist(fish, zone) &&
      matchesTime(fish, night) && matchesSeason(fish, curSeason)
    );
  } else {
    const rods = database.filter(isRodFish);
    const inReach = (f) => matchesBiome(f, biomeTarget) && matchesDist(f, zone);
    const openSea = (f) => deepSea && matchesBiome(f, "sea") && matchesDist(f, zone);
    pool = firstPool(rods, [
      (f) => stormRoll && inReach(f) && !!f.weather && matchesTime(f, night),
      (f) => (inReach(f) || openSea(f)) && matchesSeason(f, curSeason) && matchesTime(f, night),
      (f) => (inReach(f) || openSea(f)) && matchesTime(f, night),
    ]);
  }

  if (pool.length === 0) return null;

  const weights = pool.map((fish) => {
    const rarity = Math.max(1, Math.min(6, fish.rarity || 1));
    const rareBonus = rarity >= 3
      ? 1 + baitTier * 0.1 + Math.min(0.5, dishEffect("rarityBonus", 0) / 100)
      : 1;
    if (isPokeMode) {
      const stageWeight = [0, 100, 8, 0.6][fish.stage || 1];
      const rarityWeight = [0, 1, 0.75, 0.45, 0.2, 0.07, 0.003][rarity];
      return stageWeight * rarityWeight * rareBonus;
    }
    return [0, 100, 20, 6, 1.2, 0.15, 0.015][rarity] *
      Math.pow(1 + (zone - 1) * 0.3, rarity - 1) * rareBonus;
  });
  let roll = Math.random() * weights.reduce((total, weight) => total + weight, 0);
  let fishBase = pool[pool.length - 1];
  for (let index = 0; index < pool.length; index++) {
    roll -= weights[index];
    if (roll < 0) {
      fishBase = pool[index];
      break;
    }
  }
  return decorateCatch(fishBase);
}

// Heavy fish are rare: the curve keeps most catches in the lower third of the range.
const WEIGHT_CURVE = 2.5;
const RECORD_PUSH_CHANCE = 0.015;

export function rollWeight(minW, maxW, random = Math.random) {
  return Number((minW + Math.pow(random(), WEIGHT_CURVE) * (maxW - minW)).toFixed(2));
}

export function rollCatchWeight(fishBase) {
  const minW = fishBase.minW || 0.2;
  const maxW = fishBase.maxW || 5.0;
  const record = get(fishLog)[fishBase.id]?.recordWeight || minW;
  if (Math.random() < RECORD_PUSH_CHANCE) {
    return Number(Math.min(maxW, record * (1 + Math.random() * 0.03)).toFixed(2));
  }
  return rollWeight(minW, maxW);
}

export function processCaughtFish(fishBase) {
  const minW = fishBase.minW || 0.2;

  let currentLog = get(fishLog);
  if (!currentLog[fishBase.id]) {
    currentLog[fishBase.id] = {
      count: 0,
      maxStars: 0,
      recordWeight: minW,
      lastWeight: minW,
      shinyCount: 0,
    };
  }

  const currentRecord = currentLog[fishBase.id].recordWeight || minW;
  const weight = fishBase.rolledWeight ?? rollCatchWeight(fishBase);

  if (weight > currentRecord) currentLog[fishBase.id].recordWeight = weight;
  currentLog[fishBase.id].lastWeight = weight;
  currentLog[fishBase.id].count++;
  if (fishBase.stars > currentLog[fishBase.id].maxStars) {
    currentLog[fishBase.id].maxStars = fishBase.stars;
  }
  if (fishBase.isShiny) {
    currentLog[fishBase.id].shinyCount =
      (currentLog[fishBase.id].shinyCount || 0) + 1;
  }
  fishLog.set({ ...currentLog });

  const { rolledWeight, ...caught } = fishBase;
  return { ...caught, weight };
}

const MIN_CATCH_WIDTH = 8;
const MINIGAME_SPEED = 150;

export function catchZoneWidth(diff, toolPower) {
  return Math.max(MIN_CATCH_WIDTH, 40 - diff * toolPower * 1.5);
}

export function startMinigame() {
  clearTimeout(loopIds.escape);
  const tool = get(currentToolData);
  const hooked = get(activeFish);
  if (hooked && canBreakLine(hooked)) {
    const rolledWeight = rollCatchWeight(hooked);
    activeFish.set({ ...hooked, rolledWeight });
    if (Math.random() < lineBreakChance(tool, hooked, rolledWeight)) {
      resetAction("A linha arrebentou! O peixe era forte demais para a sua vara e fugiu com a isca.");
      return;
    }
  }
  phase.set(PHASES.FISHING_MINIGAME);

  const curFish = get(activeFish);
  const up = get(upgrades);

  let baseWidth = catchZoneWidth(curFish?.diff || 10, tool?.power || 1);
  if (up.widerBar.bought) baseWidth *= 1.2;
  baseWidth *= dishEffect("catchBar", 1);

  catchTargetWidth.set(baseWidth);
  catchTargetCenter.set(20 + Math.random() * 60);
  minigameBar.set(0);
  minigameDir = 1;
  lastTime = performance.now();
  if (loopIds.mini) cancelAnimationFrame(loopIds.mini);
  loopIds.mini = requestAnimationFrame(updateMinigame);
}

function updateMinigame(time) {
  if (get(phase) !== PHASES.FISHING_MINIGAME) return;
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  const curFish = get(activeFish);
  let bar = get(minigameBar) + minigameDir * (curFish?.spd || 1) * MINIGAME_SPEED * delta;
  if (bar > 100) {
    bar = 100;
    minigameDir = -1;
  }
  if (bar < 0) {
    bar = 0;
    minigameDir = 1;
  }
  minigameBar.set(bar);
  loopIds.mini = requestAnimationFrame(updateMinigame);
}

export function attemptCatch() {
  if (get(phase) !== PHASES.FISHING_MINIGAME) return;
  if (loopIds.mini) cancelAnimationFrame(loopIds.mini);

  const bar = get(minigameBar);
  const center = get(catchTargetCenter);
  const width = get(catchTargetWidth);

  if (bar >= center - width / 2 && bar <= center + width / 2) {
    clearWorldEncounter();
    consumeCastBait();
    const finalFish = processCaughtFish(get(activeFish));
    addFishToInventory(finalFish);
  } else {
    resetAction("A linha arrebentou! O peixe escapou.");
  }
}

export function addFishToInventory(fishObj) {
  if (fishObj.type === "treasure") {
    museum.update((m) => ({
      ...m,
      [fishObj.id]: {
        donated: true,
        name: fishObj.name,
        sprite: fishObj.sprite,
        weight: fishObj.weight,
        stars: fishObj.stars,
        desc: fishObj.desc,
      },
    }));
    currentMessage.set(
      `Tesouro Histórico encontrado: ${fishObj.name}! Enviado diretamente ao Museu.`
    );
    finishCatchSequence(fishObj);
    return;
  }

  const inv = get(inventory);
  const maxSize = get(maxInventorySize);

  if (inv.length < maxSize) {
    inventory.set([fishObj, ...inv]);
    checkDailyQuestProgress(fishObj);
    finishCatchSequence(fishObj);
  } else {
    inventoryFullPendingFish.set(fishObj);
  }
}

export function finishCatchSequence(finalFish) {
  const tournamentRecord = recordTournamentCatch(finalFish);
  const isTreasure = finalFish.type === "treasure";
  const museumRewards = isTreasure ? claimCollectionRewards("museum") : [];
  saveGame();
  phase.set(PHASES.CAUGHT);
  activeFish.set(finalFish);
  const caughtMsg = isTreasure
    ? `TESOURO! Você desenterrou um artefato histórico (${finalFish.name})!`
    : `BOA! Você fisgou um ${finalFish.isShiny ? "✨ " : ""}${finalFish.name} de ${finalFish.weight}kg!`;
  const tournamentMsg = tournamentRecord ? " 🏆 Novo melhor peixe do torneio!" : "";
  const legendMsg = finalFish.requires ? " 👑 A LENDA! Conte ao Velho Joe!" : "";
  currentMessage.set(
    caughtMsg + legendMsg + tournamentMsg + rewardMessage("museum", museumRewards)
  );
}

export function isNetCreature(fish) {
  return fish.type === "net" || !!fish.netCatch;
}

export function useNetAtShore(biome) {
  if (!get(eqNetId)) return;
  const isPokeMode = get(gameMode) === "pokemon";
  const database = availableDatabase();
  const curSeason = get(seasonIndex);
  const night = get(isNight);
  const atShore = database.filter(
    (f) => isNetCreature(f) && matchesBiome(f, biome) && matchesDist(f, 1)
  );
  let pool = atShore.filter(
    (f) => matchesTime(f, night) && (isPokeMode || matchesSeason(f, curSeason))
  );
  if (pool.length === 0) pool = atShore;
  if (pool.length === 0) {
    resetAction("A rede voltou vazia.");
    return;
  }
  phase.set(PHASES.CAUGHT);
  const caughtBase = decorateCatch(
    pool[Math.floor(Math.random() * pool.length)]
  );
  const fishObj = processCaughtFish(caughtBase);
  addFishToInventory(fishObj);
}

export function resetAction(msg) {
  if (loopIds.aim) cancelAnimationFrame(loopIds.aim);
  if (loopIds.approach) cancelAnimationFrame(loopIds.approach);
  if (loopIds.mini) cancelAnimationFrame(loopIds.mini);
  clearTimeout(loopIds.wait);
  clearTimeout(loopIds.escape);

  clearWorldEncounter();
  if (get(activeFish)) consumeCastBait();
  castBaitId = null;
  shadowMotion = null;
  shadowReaction.set(null);
  phase.set(PHASES.PLAYING);
  shadowActive.set(false);
  activeFish.set(null);
  if (msg) currentMessage.set(msg);
}

export function cleanupFishing() {
  if (loopIds.aim) cancelAnimationFrame(loopIds.aim);
  if (loopIds.approach) cancelAnimationFrame(loopIds.approach);
  if (loopIds.mini) cancelAnimationFrame(loopIds.mini);
  clearTimeout(loopIds.wait);
  clearTimeout(loopIds.escape);
  clearWorldEncounter();
  if (get(activeFish)) consumeCastBait();
  castBaitId = null;
  shadowMotion = null;
  shadowActive.set(false);
  shadowReaction.set(null);
}
