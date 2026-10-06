import { writable, derived, get } from "svelte/store";
import { PHASES } from "./phases.js";
import {
  INITIAL_CONSTRUCTIONS,
  INITIAL_UPGRADES,
  INITIAL_VILLAGERS,
  TOOLS,
  BAITS,
  SEASONS,
  FESTIVALS,
  FISH_DB,
  PLAYER_START,
} from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";

// Game Mode: 'normal' | 'pokemon'
export const gameMode = writable("normal");
export const savedGameMode = writable("normal");

export const currentDatabase = derived(gameMode, ($mode) => {
  return $mode === "pokemon" ? POKEMON_DB : FISH_DB;
});

export function getActiveDatabase() {
  return get(gameMode) === "pokemon" ? POKEMON_DB : FISH_DB;
}

export const phase = writable(PHASES.MENU);

// Player state
export const playerName = writable("");
export const player = writable({ ...PLAYER_START });
export const money = writable(500);

// Time & Weather
export const inGameMinutes = writable(6 * 60);
export const day = writable(1);
export const seasonIndex = writable(0);
export const currentWeather = writable("sunny");
export const eveningWarned = writable(false);

export const hours = derived(inGameMinutes, ($m) => Math.floor($m / 60));
export const isNight = derived(hours, ($h) => $h >= 18 || $h < 6);

export const currentFestival = derived(
  [seasonIndex, day],
  ([$season, $day]) => FESTIVALS[$season]?.[$day] || null
);

// Equipment
export const ownedRods = writable(["vara_vime"]);
export const ownedNets = writable([]);
export const ownedBaits = writable(["sem_isca"]);
export const baitStock = writable({
  minhoca: 5,
  massa_pao: 0,
  camarao_vivo: 0,
  isca_metalica: 0,
  sardinha_alto_mar: 0,
  isca_brilhante: 0,
});
export const eqRodId = writable("vara_vime");
export const eqNetId = writable(null);
export const eqBaitId = writable("sem_isca");
export const currentToolType = writable("rod"); // 'rod' | 'net'
export const eqSeedId = writable("pear");
export const seedStock = writable({ pear: 1 });
export const gardenDay = writable(0);
export const garden = writable([{ fruitId: "apple", x: 24, y: 19, grownAt: 0, readyAt: 0 }]);
export const gardenBuffs = writable([]);
export const gardenVisitor = writable(null);

export const currentToolData = derived(
  [currentToolType, eqRodId, eqNetId],
  ([$type, $rod, $net]) => {
    if ($type === "seed") return null;
    const id = $type === "rod" ? $rod : $net;
    if (!id) return null;
    return TOOLS[$type]?.find((t) => t.id === id) || null;
  }
);

export const currentBaitData = derived(eqBaitId, ($id) => {
  return BAITS.find((b) => b.id === $id) || BAITS[0];
});

// Upgrades & Constructions
export const upgrades = writable(JSON.parse(JSON.stringify(INITIAL_UPGRADES)));
export const constructions = writable(
  JSON.parse(JSON.stringify(INITIAL_CONSTRUCTIONS))
);

export const maxInventorySize = derived(upgrades, ($up) =>
  $up.backpack.bought ? 15 : 10
);

// World & Map
export const currentMap = writable("village");
export const lastEnteringHouse = writable(null);
export const deepSeaFishingActive = writable(false);
export const lastWormHarvestDay = writable(0);
export const lastFestivalClaim = writable(0);
export const tournament = writable(null);
export const unlocks = writable([]);
export const claimedRewards = writable([]);
export const friendship = writable({});
export const joeQuest = writable(0);
export const activeDish = writable(null);
export const cameraX = writable(0);
export const cameraY = writable(0);
export const villagers = writable([...INITIAL_VILLAGERS]);
export const worldCreatures = writable([]);
export const worldPopulationDay = writable(null);
export const worldCreatureEncounter = writable(null);
export const insectInventory = writable([]);
export const wildInsects = writable([]);
export const insectPopulationDay = writable(null);
export const showBugTournament = writable(false);
export const dailyBirds = writable([]);
export const birdPopulationDay = writable(null);
export const birdLog = writable({});
export const birdwatchingLuck = writable(0);
export const cardCollection = writable({});
export const cardDecks = writable([]);
export const cardTradeUsed = writable(false);
export const cardVictories = writable([]);
export const cardOpponent = writable(null);

// Collections & Quests
export const inventory = writable([]);
export const selectedBackpackIndex = writable(null);
export const inventoryFullPendingFish = writable(null);
export const fishLog = writable({});
export const aquarium = writable({});
export const museum = writable({});
export const dailyQuest = writable({
  fishId: "lambari",
  targetCount: 3,
  current: 0,
  reward: 150,
  completed: false,
  fishName: "Lambari",
});

// Fishing State
export const activeFish = writable(null);
export const targetDistance = writable(1);
export const aimPower = writable(1);
export const bobberPos = writable({ x: 0, y: 0 });
export const fishingBiome = writable("");
export const shadowActive = writable(false);
export const shadowPos = writable({ x: 0, y: 0 });
export const shadowReaction = writable(null);
export const minigameBar = writable(0);
export const catchTargetCenter = writable(50);
export const catchTargetWidth = writable(35);

// UI & Dialog
export const currentMessage = writable("Setas para andar. ESPAÇO para interagir.");
export const dialogActions = writable(null);
export const isFading = writable(false);
export const hasSaveGame = writable(false);
export const shopTab = writable("buy_rod");

// Modals
export const showAquariumModal = writable(false);
export const showTavernQuestModal = writable(false);
export const showCalendarModal = writable(false);
export const showKitchenModal = writable(false);
export const showBirdWatching = writable(false);
