import { get } from "svelte/store";
import {
  gameMode,
  savedGameMode,
  fishLog,
  money,
  playerName,
  day,
  seasonIndex,
  inGameMinutes,
  eqRodId,
  eqNetId,
  eqBaitId,
  ownedRods,
  ownedNets,
  ownedBaits,
  baitStock,
  lastWormHarvestDay,
  lastFestivalClaim,
  constructions,
  inventory,
  currentWeather,
  aquarium,
  museum,
  dailyQuest,
  upgrades,
  hasSaveGame,
  currentMessage,
  phase,
  isFading,
  currentMap,
  player,
  eveningWarned,
} from "./stores.js";
import { updateCamera } from "./movement.js";
import { generateDailyQuest } from "./quests.js";
import { INITIAL_CONSTRUCTIONS, INITIAL_UPGRADES } from "./constants.js";

const SAVE_KEY = "pkr_fishing_rpg_v18";

export function checkSaveExists() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.gameMode) {
        savedGameMode.set(parsed.gameMode);
      }
    } catch (e) {
      // ignore
    }
  }
  const exists = !!raw;
  hasSaveGame.set(exists);
  return exists;
}

export function saveGame() {
  try {
    const data = {
      gameMode: get(gameMode),
      log: get(fishLog),
      money: get(money),
      name: get(playerName),
      day: get(day),
      season: get(seasonIndex),
      time: get(inGameMinutes),
      rod: get(eqRodId),
      net: get(eqNetId),
      bait: get(eqBaitId),
      ownedRods: get(ownedRods),
      ownedNets: get(ownedNets),
      ownedBaits: get(ownedBaits),
      baitStock: get(baitStock),
      lastWormDay: get(lastWormHarvestDay),
      lastFestivalClaim: get(lastFestivalClaim),
      constructions: get(constructions),
      inv: get(inventory),
      weather: get(currentWeather),
      aquarium: get(aquarium),
      museum: get(museum),
      dailyQuest: get(dailyQuest),
      upgrades: get(upgrades),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    hasSaveGame.set(true);
    savedGameMode.set(get(gameMode));
  } catch (e) {
    console.error("Erro ao salvar jogo", e);
  }
}

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      gameMode.set(data.gameMode || "normal");
      savedGameMode.set(data.gameMode || "normal");
      fishLog.set(data.log || {});
      money.set(data.money ?? 500);
      playerName.set(data.name || "");
      day.set(data.day || 1);
      seasonIndex.set(data.season || 0);
      inGameMinutes.set(data.time || 360);
      eqRodId.set(data.rod || "vara_vime");
      eqNetId.set(data.net || null);
      eqBaitId.set(data.bait || "sem_isca");
      ownedRods.set(data.ownedRods || ["vara_vime"]);
      ownedNets.set(data.ownedNets || []);
      ownedBaits.set(data.ownedBaits || ["sem_isca"]);
      baitStock.set(data.baitStock || { minhoca: 5 });
      lastWormHarvestDay.set(data.lastWormDay || 0);
      lastFestivalClaim.set(data.lastFestivalClaim || 0);
      constructions.set(data.constructions || JSON.parse(JSON.stringify(INITIAL_CONSTRUCTIONS)));
      inventory.set(data.inv || []);
      currentWeather.set(data.weather || "sunny");
      aquarium.set(data.aquarium || {});
      museum.set(data.museum || {});
      dailyQuest.set(data.dailyQuest || null);
      upgrades.set(data.upgrades || JSON.parse(JSON.stringify(INITIAL_UPGRADES)));

      startGameSession();
    }
  } catch (e) {
    console.error("Erro ao carregar", e);
    currentMessage.set("Erro ao carregar o arquivo salvo.");
  }
}

export function deleteSave() {
  if (confirm("Deseja apagar o jogo salvo?")) {
    localStorage.removeItem(SAVE_KEY);
    hasSaveGame.set(false);
    currentMessage.set("Jogo salvo apagado.");
  }
}

export function newGame(selectedMode = "normal") {
  gameMode.set(selectedMode);
  savedGameMode.set(selectedMode);
  fishLog.set({});
  money.set(500);
  day.set(1);
  seasonIndex.set(0);
  inGameMinutes.set(360);
  eqRodId.set("vara_vime");
  eqNetId.set(null);
  eqBaitId.set("sem_isca");
  ownedRods.set(["vara_vime"]);
  ownedNets.set([]);
  ownedBaits.set(["sem_isca"]);
  baitStock.set({ minhoca: 5 });
  lastFestivalClaim.set(0);
  inventory.set([]);
  aquarium.set({});
  museum.set({});
  constructions.set(JSON.parse(JSON.stringify(INITIAL_CONSTRUCTIONS)));
  upgrades.set(JSON.parse(JSON.stringify(INITIAL_UPGRADES)));

  generateDailyQuest();
  const currentName = get(playerName);
  if (!currentName || !currentName.trim()) {
    playerName.set("Red");
  }
  startGameSession();
}

export function startGameSession() {
  phase.set("fade");
  isFading.set(true);
  setTimeout(() => {
    phase.set("playing");
    isFading.set(false);
    currentMap.set("village");
    player.set({ x: 7, y: 10, dir: "down" });
    eveningWarned.set(false);
    updateCamera();
    saveGame();
  }, 1000);
}
