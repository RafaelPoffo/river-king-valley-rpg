import { get } from "svelte/store";
import { FRIENDSHIP, TASTE_LABELS, INITIAL_VILLAGERS } from "./constants.js";
import { SPRITES } from "./sprites.js";
import { friendship, inventory, seasonIndex, day, getActiveDatabase, claimedRewards } from "./stores.js";
import { grantSeed } from "./garden.js";
import { dayKey } from "./tournament.js";

const TASTES = {
  sea: (fish) => fish.biome === "sea" || fish.biome === "deep_sea",
  river: (fish) => fish.biome === "river",
  quality: (fish) => (fish.stars || 0) >= 3,
  rare: (fish) => (fish.rarity || 0) >= 4,
};

const today = () => dayKey(get(seasonIndex), get(day));

function entryFor(npcId) {
  return get(friendship)[npcId] || { points: 0, talkDay: 0, giftDay: 0 };
}

function saveEntry(npcId, entry) {
  friendship.update((all) => ({ ...all, [npcId]: entry }));
}

function addPoints(entry, amount) {
  const max = FRIENDSHIP.maxHearts * FRIENDSHIP.pointsPerHeart;
  return Math.max(0, Math.min(max, entry.points + amount));
}

export function heartsOf(npcId) {
  return Math.floor(entryFor(npcId).points / FRIENDSHIP.pointsPerHeart);
}

export function hasPerk(npcId) {
  return heartsOf(npcId) >= FRIENDSHIP.perkHearts[npcId];
}

export function tasteLabel(npc) {
  return TASTE_LABELS[npc.taste] || "peixes";
}

export function giftValue(npc, fish) {
  if (!fish || fish.type !== "fish" || fish.sprite === SPRITES.trash) return 0;
  return TASTES[npc.taste]?.(fish) ? FRIENDSHIP.lovedGift : FRIENDSHIP.likedGift;
}

export function pickGift(npc, inv = get(inventory)) {
  let best = -1;
  let bestValue = 0;
  inv.forEach((fish, index) => {
    const value = giftValue(npc, fish);
    if (value > bestValue) {
      best = index;
      bestValue = value;
    }
  });
  return best;
}

export function friendLine(npc) {
  const hearts = heartsOf(npc.id);
  if (hearts >= 6) return npc.friendLines?.[1] || npc.dialogNormal;
  if (hearts >= 3) return npc.friendLines?.[0] || npc.dialogNormal;
  return npc.dialogNormal;
}

export function heartsText(npcId) {
  const hearts = heartsOf(npcId);
  return `❤️ ${hearts}/${FRIENDSHIP.maxHearts}`;
}

export function talkTo(npcId) {
  const entry = entryFor(npcId);
  if (entry.talkDay === today()) return false;
  saveEntry(npcId, { ...entry, points: addPoints(entry, FRIENDSHIP.dailyTalk), talkDay: today() });
  return true;
}

export function canGiftToday(npcId) {
  return entryFor(npcId).giftDay !== today();
}

export function giveGift(npc, index) {
  const inv = get(inventory);
  const fish = inv[index];
  const value = giftValue(npc, fish);
  if (!value || !canGiftToday(npc.id)) return null;

  const before = heartsOf(npc.id);
  const entry = entryFor(npc.id);
  saveEntry(npc.id, { ...entry, points: addPoints(entry, value), giftDay: today() });
  inventory.set(inv.filter((_, i) => i !== index));
  const unlockedPerk = before < FRIENDSHIP.perkHearts[npc.id] && hasPerk(npc.id);
  const milestone = Math.floor(heartsOf(npc.id) / 3);
  let seed = null;
  for (let level = 1; level <= milestone; level++) {
    const rewardKey = `friend-seed:${npc.id}:${level}`;
    if (get(claimedRewards).includes(rewardKey)) continue;
    seed = grantSeed();
    claimedRewards.update((keys) => [...keys, rewardKey]);
  }
  return { fish, loved: value === FRIENDSHIP.lovedGift, unlockedPerk, seed };
}

export function friendPrice(cost) {
  return hasPerk("carpenter") ? Math.round(cost * (1 - FRIENDSHIP.carpenterDiscount)) : cost;
}

export function dishPrice(cost) {
  return hasPerk("anna") ? Math.round(cost * FRIENDSHIP.annaDishDiscount) : cost;
}

const ZONE_NAMES = { 1: "na água rasa", 2: "na água média", 3: "na água funda" };
const TIME_NAMES = { day: "de dia", night: "à noite", all: "a qualquer hora" };

export function captainTip() {
  const season = get(seasonIndex);
  const candidates = getActiveDatabase().filter(
    (f) =>
      f.type === "fish" &&
      (f.biome === "sea" || f.biome === "deep_sea") &&
      (f.rarity || 0) >= 4 &&
      !f.requires &&
      (!f.seasons || f.seasons.includes(season))
  );
  if (candidates.length === 0) return null;
  const fish = candidates[today() % candidates.length];
  const zone = ZONE_NAMES[Math.max(...(fish.dist || [3]))];
  const where = fish.biome === "deep_sea" ? "no alto-mar" : "no mar";
  const weather = fish.weather === "storm" ? ", só com tempestade" : "";
  return `Dica: o ${fish.name} aparece ${where}, ${zone}, ${TIME_NAMES[fish.times || "all"]}${weather}.`;
}

export function villagerById(id) {
  return INITIAL_VILLAGERS.find((n) => n.id === id);
}
