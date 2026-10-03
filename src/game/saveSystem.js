import { get } from "svelte/store";
import { PHASES } from "./phases.js";
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
  tournament,
  unlocks,
  claimedRewards,
  friendship,
  joeQuest,
  activeDish,
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
  worldCreatures,
  worldPopulationDay,
} from "./stores.js";
import { updateCamera } from "./movement.js";
import { generateDailyQuest } from "./quests.js";
import { INITIAL_CONSTRUCTIONS, INITIAL_UPGRADES, PLAYER_START } from "./constants.js";
import { ensureWorldPopulation } from "./worldCreatures.js";

const SAVE_KEY = "pkr_fishing_rpg_v18";
export const SAVE_VERSION = 2;

const clone = (value) => JSON.parse(JSON.stringify(value));

// The key names are kept as-is so saves written before the registry still load.
export const PERSISTED_FIELDS = [
  { key: "gameMode", store: gameMode, initial: () => "normal" },
  { key: "log", store: fishLog, initial: () => ({}) },
  { key: "money", store: money, initial: () => 500 },
  { key: "name", store: playerName, initial: () => "", keepOnNewGame: true },
  { key: "day", store: day, initial: () => 1 },
  { key: "season", store: seasonIndex, initial: () => 0 },
  { key: "time", store: inGameMinutes, initial: () => 360 },
  { key: "rod", store: eqRodId, initial: () => "vara_vime" },
  { key: "net", store: eqNetId, initial: () => null },
  { key: "bait", store: eqBaitId, initial: () => "sem_isca" },
  { key: "ownedRods", store: ownedRods, initial: () => ["vara_vime"] },
  { key: "ownedNets", store: ownedNets, initial: () => [] },
  { key: "ownedBaits", store: ownedBaits, initial: () => ["sem_isca"] },
  { key: "baitStock", store: baitStock, initial: () => ({ minhoca: 5 }) },
  { key: "lastWormDay", store: lastWormHarvestDay, initial: () => 0 },
  { key: "lastFestivalClaim", store: lastFestivalClaim, initial: () => 0 },
  { key: "tournament", store: tournament, initial: () => null },
  { key: "unlocks", store: unlocks, initial: () => [] },
  { key: "claimedRewards", store: claimedRewards, initial: () => [] },
  { key: "friendship", store: friendship, initial: () => ({}) },
  { key: "joeQuest", store: joeQuest, initial: () => 0 },
  { key: "activeDish", store: activeDish, initial: () => null },
  { key: "constructions", store: constructions, initial: () => clone(INITIAL_CONSTRUCTIONS) },
  { key: "inv", store: inventory, initial: () => [] },
  { key: "weather", store: currentWeather, initial: () => "sunny" },
  { key: "aquarium", store: aquarium, initial: () => ({}) },
  { key: "museum", store: museum, initial: () => ({}) },
  { key: "dailyQuest", store: dailyQuest, initial: () => null },
  { key: "upgrades", store: upgrades, initial: () => clone(INITIAL_UPGRADES) },
  { key: "worldCreatures", store: worldCreatures, initial: () => [] },
  { key: "worldPopulationDay", store: worldPopulationDay, initial: () => null },
];

// Each entry upgrades a save from version N to N + 1.
const MIGRATIONS = {
  1: (data) => ({
    ...data,
    constructions: { ...clone(INITIAL_CONSTRUCTIONS), ...(data.constructions || {}) },
    upgrades: { ...clone(INITIAL_UPGRADES), ...(data.upgrades || {}) },
  }),
};

export function migrateSave(data) {
  let migrated = { ...data };
  let version = migrated.version || 1;
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (step) migrated = step(migrated);
    version += 1;
  }
  migrated.version = SAVE_VERSION;
  return migrated;
}

export function serializeState() {
  const data = { version: SAVE_VERSION };
  for (const field of PERSISTED_FIELDS) {
    data[field.key] = get(field.store);
  }
  return data;
}

export function applyState(data) {
  for (const field of PERSISTED_FIELDS) {
    field.store.set(data[field.key] ?? field.initial());
  }
  savedGameMode.set(get(gameMode));
}

export function resetState(selectedMode = "normal") {
  for (const field of PERSISTED_FIELDS) {
    if (!field.keepOnNewGame) field.store.set(field.initial());
  }
  gameMode.set(selectedMode);
  savedGameMode.set(selectedMode);
}

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
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState()));
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
      applyState(migrateSave(JSON.parse(saved)));
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
  resetState(selectedMode);
  generateDailyQuest();
  const currentName = get(playerName);
  if (!currentName || !currentName.trim()) {
    playerName.set("Red");
  }
  startGameSession();
}

export function startGameSession() {
  phase.set(PHASES.FADE);
  isFading.set(true);
  setTimeout(() => {
    phase.set(PHASES.PLAYING);
    isFading.set(false);
    currentMap.set("village");
    player.set({ ...PLAYER_START });
    eveningWarned.set(false);
    ensureWorldPopulation();
    updateCamera();
    saveGame();
  }, 1000);
}
