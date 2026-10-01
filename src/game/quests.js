import { get } from "svelte/store";
import { FISH_DB } from "./constants.js";
import { dailyQuest, money, currentMessage } from "./stores.js";

export function generateDailyQuest() {
  const fishPool = FISH_DB.filter((f) => f.type === "fish" && f.rarity > 0);
  const randFish = fishPool[Math.floor(Math.random() * fishPool.length)];
  dailyQuest.set({
    fishId: randFish.id,
    fishName: randFish.name,
    targetCount: Math.floor(Math.random() * 2) + 1,
    current: 0,
    reward: randFish.price * 6,
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
      currentMessage.set(
        `Missão Concluída! Você recebeu ¥${updated.reward}!`
      );
    }
    dailyQuest.set(updated);
  }
}
