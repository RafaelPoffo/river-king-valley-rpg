import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import { SPRITES } from "./sprites.js";
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
  minigameBar,
  catchTargetCenter,
  catchTargetWidth,
  currentToolData,
  currentBaitData,
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
} from "./stores.js";
import { checkDailyQuestProgress } from "./quests.js";
import { saveGame } from "./saveSystem.js";
import { recordTournamentCatch } from "./tournament.js";
import { claimCollectionRewards, rewardMessage } from "./collections.js";
import { dishEffect } from "./dishes.js";

const STORM_PRIORITY = 0.2;

let aimDir = 1;
let minigameDir = 1;
let lastTime = 0;
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

export function throwLine() {
  if (loopIds.aim) cancelAnimationFrame(loopIds.aim);
  const power = get(aimPower);
  const dist = Math.floor(power);
  targetDistance.set(dist);

  phase.set(PHASES.FISHING_WAIT);
  shadowActive.set(false);

  const p = get(player);
  const distTiles = dist * 2;
  const targetBobber = {
    x:
      p.dir === "left"
        ? p.x - distTiles
        : p.dir === "right"
          ? p.x + distTiles
          : p.x,
    y:
      p.dir === "up"
        ? p.y - distTiles
        : p.dir === "down"
          ? p.y + distTiles
          : p.y,
  };
  bobberPos.set(targetBobber);

  const isFastBite = Math.random() < 0.2;
  let waitTime = isFastBite
    ? 6000 + Math.random() * 10000
    : 16000 + Math.random() * 4000;

  const weather = get(currentWeather);
  if (weather === "rainy") waitTime *= 0.8;
  if (weather === "storm") waitTime *= 0.6;

  clearTimeout(loopIds.wait);
  loopIds.wait = setTimeout(() => {
    if (get(phase) !== PHASES.FISHING_WAIT) return;

    const currentBait = get(eqBaitId);
    if (currentBait !== "sem_isca") {
      baitStock.update((stock) => {
        const next = { ...stock };
        if ((next[currentBait] || 0) > 0) {
          next[currentBait] -= 1;
          if (next[currentBait] <= 0) eqBaitId.set("sem_isca");
        }
        return next;
      });
    }

    const rolled = rollFishByZone(dist);
    if (!rolled) {
      resetAction("Não fisgou nada...");
      return;
    }
    activeFish.set(rolled);

    phase.set(PHASES.FISHING_APPROACH);
    const bPos = get(bobberPos);
    shadowPos.set({
      x: bPos.x + (Math.random() > 0.5 ? 2 : -2),
      y: bPos.y + (Math.random() > 0.5 ? 2 : -2),
    });
    shadowActive.set(true);
    lastTime = performance.now();
    if (loopIds.approach) cancelAnimationFrame(loopIds.approach);
    loopIds.approach = requestAnimationFrame(updateApproach);
  }, waitTime);
}

function updateApproach(time) {
  if (get(phase) !== PHASES.FISHING_APPROACH) return;
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  const bPos = get(bobberPos);
  const sPos = get(shadowPos);
  const dx = bPos.x - sPos.x;
  const dy = bPos.y - sPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.15) {
    shadowActive.set(false);
    phase.set(PHASES.FISHING_BITE);
    const currentFish = get(activeFish);
    const biteDuration =
      Math.max(0.4, 1.2 - (currentFish?.rarity || 1) * 0.15) + dishEffect("biteBonus", 0);

    clearTimeout(loopIds.escape);
    loopIds.escape = setTimeout(() => {
      resetAction("O peixe escapou! Você foi muito lento.");
    }, biteDuration * 1000);
  } else {
    shadowPos.set({
      x: sPos.x + (dx / dist) * delta * 1.5,
      y: sPos.y + (dy / dist) * delta * 1.5,
    });
    loopIds.approach = requestAnimationFrame(updateApproach);
  }
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
  const currentBait = get(currentBaitData);
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

  let rarityTarget = 1;
  let roll = Math.random() * 100;
  if (bait !== "sem_isca" && currentBait) {
    roll -= currentBait.bonus;
  }
  roll -= dishEffect("rarityBonus", 0);

  if (zone === 1) {
    rarityTarget = roll < 75 ? 1 : roll < 95 ? 2 : 3;
  } else if (zone === 2) {
    rarityTarget = roll < 30 ? 1 : roll < 80 ? 2 : roll < 98 ? 3 : 4;
  } else {
    rarityTarget =
      roll < 5
        ? 1
        : roll < 30
          ? 2
          : roll < 75
            ? 3
            : roll < 95
              ? 4
              : roll < 99
                ? 5
                : 6;
  }

  let pool = [];

  if (isPokeMode) {
    // No modo Pokémon:
    // Zona 1 (Água Rasa): mais fácil pegar nível 1
    // Zona 2 (Água Média): mais fácil pegar nível 2
    // Zona 3 (Água Funda): mais fácil pegar nível 3 e Pokémon com preferDeep (ex: Gyarados, Lapras, Mantine)
    let targetStage = 1;
    const stageRoll = Math.random() * 100;
    if (zone === 1) {
      // 75% stage 1, 22% stage 2, 3% stage 3
      targetStage = stageRoll < 75 ? 1 : stageRoll < 97 ? 2 : 3;
    } else if (zone === 2) {
      // 25% stage 1, 65% stage 2, 10% stage 3
      targetStage = stageRoll < 25 ? 1 : stageRoll < 90 ? 2 : 3;
    } else {
      // Zona 3 (Água Funda): 5% stage 1, 35% stage 2, 60% stage 3
      targetStage = stageRoll < 5 ? 1 : stageRoll < 40 ? 2 : 3;
    }

    const rods = database.filter(isRodFish);
    pool = rods.filter((f) => {
      if (!matchesBiome(f, biomeTarget) || !matchesDist(f, zone)) return false;
      if (!matchesTime(f, night) || !matchesSeason(f, curSeason)) return false;
      if (zone === 3 && f.preferDeep) return true;
      return f.stage === targetStage;
    });

    if (pool.length === 0) {
      pool = rods.filter(
        (f) =>
          matchesBiome(f, biomeTarget) &&
          matchesDist(f, zone) &&
          matchesTime(f, night)
      );
    }
  } else {
    const rods = database.filter(isRodFish);
    const inReach = (f) => matchesBiome(f, biomeTarget) && matchesDist(f, zone);
    const openSea = (f) => deepSea && matchesBiome(f, "sea") && matchesDist(f, zone);
    pool = firstPool(rods, [
      (f) => stormRoll && inReach(f) && !!f.weather && matchesTime(f, night),
      (f) =>
        inReach(f) &&
        f.rarity === rarityTarget &&
        matchesSeason(f, curSeason) &&
        matchesTime(f, night),
      (f) => inReach(f) && matchesSeason(f, curSeason) && matchesTime(f, night),
      (f) => inReach(f) && matchesTime(f, night),
      (f) => openSea(f) && matchesSeason(f, curSeason) && matchesTime(f, night),
      (f) => openSea(f) && matchesTime(f, night),
    ]);
  }

  if (pool.length === 0) return null;

  const fishBase = pool[Math.floor(Math.random() * pool.length)];
  return decorateCatch(fishBase);
}

export function processCaughtFish(fishBase) {
  const minW = fishBase.minW || 0.2;
  const maxW = fishBase.maxW || 5.0;

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
  let weight = Number((minW + Math.random() * (maxW - minW)).toFixed(2));
  if (Math.random() < 0.05) {
    weight = Number((currentRecord * (1 + Math.random() * 0.1)).toFixed(2));
  }

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

  return { ...fishBase, weight };
}

export function startMinigame() {
  clearTimeout(loopIds.escape);
  phase.set(PHASES.FISHING_MINIGAME);

  const curFish = get(activeFish);
  const tool = get(currentToolData);
  const up = get(upgrades);

  let baseWidth = Math.max(12, 60 - (curFish?.diff || 10) * (tool?.power || 1));
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
  let bar = get(minigameBar) + minigameDir * ((curFish?.spd || 1) * 7.0) * delta * 15;
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

export function useNetAtShore(biome) {
  if (!get(eqNetId)) return;
  const isPokeMode = get(gameMode) === "pokemon";
  const database = availableDatabase();
  const curSeason = get(seasonIndex);
  const night = get(isNight);
  let pool = database.filter(
    (f) =>
      (f.type === "net" || f.rarity <= 2 || f.stage === 1) &&
      matchesBiome(f, biome) &&
      matchesDist(f, 1) &&
      matchesTime(f, night) &&
      (isPokeMode || matchesSeason(f, curSeason))
  );
  if (pool.length === 0) {
    pool = database.filter(
      (f) =>
        (f.type === "net" || f.type === "fish") &&
        matchesBiome(f, biome) &&
        matchesDist(f, 1)
    );
  }
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
}
