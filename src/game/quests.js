import { get } from "svelte/store";
import { FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./pokemonConstants.js";
import { gameMode, dailyQuest, money, currentMessage } from "./stores.js";

export function generateDailyQuest() {
  const isPokeMode = get(gameMode) === "pokemon";
  const database = isPokeMode ? POKEMON_DB : FISH_DB;
  const pool = database.filter(
    (f) => f.type === "fish" && f.rarity > 0 && !f.id.startsWith("poke_") && !f.id.includes("bota") && !f.id.includes("lata")
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
      currentMessage.set(
        `Missão Concluída! Você recebeu ¥${updated.reward}!`
      );
    }
    dailyQuest.set(updated);
  }
}
