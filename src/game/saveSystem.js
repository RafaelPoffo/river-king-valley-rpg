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
  insectInventory,
  wildInsects,
  insectPopulationDay,
  dailyBirds,
  birdPopulationDay,
  birdLog,
  birdwatchingLuck,
  forestFeathers,
  garden, gardenDay, gardenBuffs, gardenVisitor, seedStock, eqSeedId,
  cardCollection, cardDecks, cardTradeUsed, cardVictories, cardChampionship, currentToolType,
  questLog, questFlags, questStats,
} from "./stores.js";
import { updateCamera } from "./movement.js";
import { generateDailyQuest, ensureQuestLog } from "./quests.js";
import { INITIAL_CONSTRUCTIONS, INITIAL_UPGRADES, PLAYER_START } from "./constants.js";
import { CARD_THEMES, themeDeck, themeById } from "./cardCatalog.js";
import { ensureWorldPopulation } from "./worldCreatures.js";
import { ensureDailyInsects } from "./insectHunt.js";
import { ensureDailyBirds } from "./birdWatching.js";
import { initialGarden } from "./garden.js";

const SAVE_KEY = "pkr_fishing_rpg_v18";
export const SAVE_VERSION = 6;

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
  { key: "insectInventory", store: insectInventory, initial: () => [] },
  { key: "wildInsects", store: wildInsects, initial: () => [] },
  { key: "insectPopulationDay", store: insectPopulationDay, initial: () => null },
  { key: "dailyBirds", store: dailyBirds, initial: () => [] },
  { key: "birdPopulationDay", store: birdPopulationDay, initial: () => null },
  { key: "birdLog", store: birdLog, initial: () => ({}) },
  { key: "birdwatchingLuck", store: birdwatchingLuck, initial: () => 0 },
  { key: "forestFeathers", store: forestFeathers, initial: () => [] },
  { key: "garden", store: garden, initial: initialGarden },
  { key: "gardenDay", store: gardenDay, initial: () => 0 },
  { key: "gardenBuffs", store: gardenBuffs, initial: () => [] },
  { key: "gardenVisitor", store: gardenVisitor, initial: () => null },
  { key: "seedStock", store: seedStock, initial: () => ({ pear: 1 }) },
  { key: "eqSeedId", store: eqSeedId, initial: () => "pear" },
  { key: "toolType", store: currentToolType, initial: () => "rod" },
  { key: "cardCollection", store: cardCollection, initial: () => ({}) },
  { key: "cardDecks", store: cardDecks, initial: () => [] },
  { key: "cardTradeUsed", store: cardTradeUsed, initial: () => false },
  { key: "cardVictories", store: cardVictories, initial: () => [] },
  { key: "cardChampionship", store: cardChampionship, initial: () => ({ dayKey: null, wins: 0, claimed: false, opponents: [] }) },
  { key: "questLog", store: questLog, initial: () => ({}) },
  { key: "questFlags", store: questFlags, initial: () => ({}) },
  { key: "questStats", store: questStats, initial: () => ({ catches: 0, river: 0, sea: 0, pier: 0, cold: 0 }) },
];

// Each entry upgrades a save from version N to N + 1.
const MIGRATIONS = {
  1: (data) => ({
    ...data,
    constructions: { ...clone(INITIAL_CONSTRUCTIONS), ...(data.constructions || {}) },
    upgrades: { ...clone(INITIAL_UPGRADES), ...(data.upgrades || {}) },
  }),
  // The docks now require the pier; saves that already paid for the docks
  // get the pier for free.
  2: (data) => {
    const saved = data.constructions || {};
    const constructions = Object.fromEntries(Object.entries(clone(INITIAL_CONSTRUCTIONS)).map(([key, info]) => [
      key,
      { ...info, status: saved[key]?.status || "none", orderDay: saved[key]?.orderDay || 0 },
    ]));
    if (constructions.docks.status !== "none" && constructions.pier.status === "none") {
      constructions.pier.status = "built";
    }
    return { ...data, constructions };
  },
  3: (data) => {
    const legacy = {
      aves: "voador", fada: "planta", rei: "lutador", mago: "psiquico", lich: "fantasma",
      orc: "lutador", dragao: "dragao", fera: "normal", demonio: "fantasma", pirata: "agua",
      gelo: "lendas_gelo", ninja: "voador", inseto: "inseto", espirito: "fantasma",
      iniciais: "fogo", colonia: "inseto", dragoes: "dragao", psiquicos: "psiquico",
      eletricos: "eletrico", ramificacoes: "agua",
    };
    const seen = new Set();
    const decks = (data.cardDecks || []).map((deck, index) => {
      const themeId = themeById(deck.themeId)?.id || legacy[deck.themeId] || CARD_THEMES[index % CARD_THEMES.length].id;
      const unique = seen.has(themeId)
        ? CARD_THEMES.find((theme) => !seen.has(theme.id))?.id || themeId
        : themeId;
      seen.add(unique);
      const theme = themeById(unique);
      return { id: `deck-${unique}`, name: theme.name, themeId: unique, cards: themeDeck(unique) };
    });
    const collection = { ...(data.cardCollection || {}) };
    for (const deck of decks) {
      for (const id of deck.cards) collection[id] = (collection[id] || 0) + 1;
    }
    return { ...data, cardDecks: decks, cardCollection: collection };
  },
  4: (data) => ({
    ...data,
    questLog: data.questLog || {},
    questFlags: data.questFlags || {},
    questStats: data.questStats || { catches: 0, river: 0, sea: 0, pier: 0, cold: 0 },
  }),
  5: (data) => ({
    ...data,
    forestFeathers: data.forestFeathers || [],
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
  ensureQuestLog();
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
    ensureDailyInsects();
    ensureDailyBirds();
    updateCamera();
    saveGame();
  }, 1000);
}
