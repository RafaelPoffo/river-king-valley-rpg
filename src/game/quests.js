import { get } from "svelte/store";
import { getActiveDatabase, dailyQuest, money, currentMessage } from "./stores.js";
import { grantSeed } from "./garden.js";
import { grantRareCard } from "./cards.js";

export function generateDailyQuest() {
  const database = getActiveDatabase();
  const pool = database.filter(
    (f) =>
      f.type === "fish" &&
      f.rarity > 0 &&
      !f.weather &&
      !f.requires &&
      !f.id.startsWith("poke_") &&
      !f.id.includes("bota") &&
      !f.id.includes("lata")
  );
  const randFish = pool[Math.floor(Math.random() * pool.length)] || pool[0];
  dailyQuest.set({
    fishId: randFish.id,
    fishName: randFish.name,
    targetCount: Math.floor(Math.random() * 2) + 1,
    current: 0,
    reward: Math.max(100, Math.floor(randFish.price * 2.5)),
    completed: false,
  });
}

export function checkDailyQuestProgress(fishObj) {
  const quest = get(dailyQuest);
  if (quest && !quest.completed && quest.fishId === fishObj.id) {
    const updated = { ...quest, current: quest.current + 1 };
    if (updated.current >= updated.targetCount) {
      updated.completed = true;
      money.update((m) => m + updated.reward);
      const seed = grantSeed();
      const card = grantRareCard("quest");
      updated.extraReward = `${seed.seedName}${card ? ` e carta ${card.name}` : ""}`;
      currentMessage.set(
        `Missão Concluída! Você recebeu ¥${updated.reward}!`
      );
    }
    dailyQuest.set(updated);
    if (updated.completed) return `Voce recebeu ${updated.reward}, ${updated.extraReward}.`;
  }
  return null;
}
