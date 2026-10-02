import { get } from "svelte/store";
import { COLLECTION_MILESTONES, BAITS } from "./constants.js";
import { SPRITES } from "./sprites.js";
import {
  museum,
  aquarium,
  claimedRewards,
  money,
  baitStock,
  ownedBaits,
  getActiveDatabase,
} from "./stores.js";

export function collectionEntries(kind, database) {
  if (kind === "museum") return database.filter((f) => f.type === "treasure");
  return database.filter((f) => f.type === "fish" && f.rarity > 0 && f.sprite !== SPRITES.trash);
}

export function milestoneNeed(total, fraction) {
  return Math.max(1, Math.ceil(total * fraction));
}

export function collectionProgress(kind, database = getActiveDatabase()) {
  const owned = kind === "museum" ? get(museum) : get(aquarium);
  const entries = collectionEntries(kind, database);
  const count = entries.filter((f) => owned[f.id]).length;
  const claimed = get(claimedRewards);
  const milestones = COLLECTION_MILESTONES[kind].map((m, index) => ({
    ...m,
    id: `${kind}-${index}`,
    need: milestoneNeed(entries.length, m.fraction),
    claimed: claimed.includes(`${kind}-${index}`),
  }));
  return { count, total: entries.length, milestones };
}

export function describeReward(reward) {
  const parts = [];
  if (reward.money) parts.push(`¥${reward.money}`);
  for (const [id, qty] of Object.entries(reward.baits || {})) {
    const bait = BAITS.find((b) => b.id === id);
    parts.push(`${qty}x ${bait ? bait.name : id}`);
  }
  return parts.join(" + ");
}

export function grant(reward) {
  if (reward.money) money.update((m) => m + reward.money);
  const baits = Object.entries(reward.baits || {});
  if (baits.length === 0) return;
  baitStock.update((stock) => {
    const next = { ...stock };
    for (const [id, qty] of baits) next[id] = (next[id] || 0) + qty;
    return next;
  });
  ownedBaits.update((list) => [...new Set([...list, ...baits.map(([id]) => id)])]);
}

export function claimCollectionRewards(kind) {
  const { count, milestones } = collectionProgress(kind);
  const earned = milestones.filter((m) => !m.claimed && count >= m.need);
  if (earned.length === 0) return [];
  for (const m of earned) grant(m.reward);
  claimedRewards.update((list) => [...list, ...earned.map((m) => m.id)]);
  return earned;
}

export function rewardMessage(kind, earned) {
  if (earned.length === 0) return "";
  const place = kind === "museum" ? "Museu" : "Aquário";
  const titles = earned.map((m) => `${m.title}: ${describeReward(m.reward)}`).join(" | ");
  return ` 🎁 ${place} — ${titles}!`;
}
