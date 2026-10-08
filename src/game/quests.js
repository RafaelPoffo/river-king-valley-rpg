import { get } from "svelte/store";
import { QUEST_DEFS, JOE_QUEST_STAGES, LEGEND_IDS } from "./data/quests.js";
import {
  getActiveDatabase, dailyQuest, money, currentMessage, questLog, questFlags, questStats,
  inventory, museum, fishLog, gameMode, constructions, cardDecks, cardCollection,
  garden, insectInventory, birdLog, ownedRods, baitStock, ownedBaits, joeQuest,
} from "./stores.js";
import { grantSeed } from "./garden.js";
import { grantRareCard, addCards, grantThemeDeck } from "./cards.js";
import { SPRITES } from "./sprites.js";
import { isBasicMonster, cardById } from "./cardCatalog.js";
import { BAITS } from "./constants.js";

export function generateDailyQuest() {
  const database = getActiveDatabase();
  const pool = database.filter(
    (f) =>
      f.type === "fish" &&
      f.rarity > 0 &&
      !f.weather &&
      !f.requires &&
      !f.pierOnly &&
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
      currentMessage.set(`Missão Concluída! Você recebeu ¥${updated.reward}!`);
    }
    dailyQuest.set(updated);
    if (updated.completed) return `Voce recebeu ${updated.reward}, ${updated.extraReward}.`;
  }
  noteCatch(fishObj);
  return null;
}

export function noteCatch(fish) {
  if (!fish || fish.sprite === SPRITES.trash) return;
  questStats.update((stats) => {
    const next = {
      catches: stats.catches + 1,
      river: stats.river + (fish.biome === "river" ? 1 : 0),
      sea: stats.sea + (fish.biome === "sea" || fish.biome === "deep_sea" ? 1 : 0),
      pier: stats.pier + (fish.pierOnly ? 1 : 0),
      cold: stats.cold + (isColdType(fish) ? 1 : 0),
    };
    return next;
  });
  if (fish.pierOnly) setQuestFlag("caught_pier");
}

export function isColdType(fish) {
  return (fish.types || []).some((type) => /água|agua|gelo/i.test(type));
}

export function setQuestFlag(id) {
  questFlags.update((flags) => (flags[id] ? flags : { ...flags, [id]: true }));
}

export function ensureQuestLog() {
  const log = { ...get(questLog) };
  let changed = false;
  for (const def of QUEST_DEFS) {
    if (!log[def.id] && def.autoStart) {
      log[def.id] = { stage: 0, status: "active" };
      changed = true;
    }
  }
  if (log.joe_legend === undefined) {
    log.joe_legend = { stage: get(joeQuest) || 0, status: get(joeQuest) >= JOE_QUEST_STAGES.length ? "done" : "active" };
    changed = true;
  }
  if (changed) questLog.set(log);
  return log;
}

function speciesCaught(database) {
  const log = get(fishLog);
  return database.filter((f) => f.type === "fish" && f.sprite !== SPRITES.trash && log[f.id]).length;
}

export function goalProgress(goal, database = getActiveDatabase()) {
  const stats = get(questStats);
  switch (goal.kind) {
    case "inventory_river_stars": {
      const has = get(inventory).some((f) => f.biome === "river" && (f.stars || 0) >= goal.stars);
      return { current: has ? 1 : 0, needed: 1 };
    }
    case "inventory_stars": {
      const has = get(inventory).some((f) => (f.stars || 0) >= goal.stars);
      return { current: has ? 1 : 0, needed: 1 };
    }
    case "museum": {
      const relics = database.filter((f) => f.type === "treasure");
      const needed = Math.min(goal.count, relics.length);
      return { current: relics.filter((f) => get(museum)[f.id]).length, needed };
    }
    case "catalog":
      return { current: speciesCaught(database), needed: goal.count };
    case "legend":
      return { current: get(fishLog)[LEGEND_IDS[get(gameMode)] || LEGEND_IDS.normal] ? 1 : 0, needed: 1 };
    case "catch_count":
      return { current: Math.min(stats[goal.biome] || stats.catches || 0, goal.count), needed: goal.count };
    case "catch_flag":
      return { current: stats[goal.flag] ? 1 : stats[goal.flag] || 0, needed: 1 };
    case "catch_cold":
      return { current: Math.min(stats.cold || 0, goal.count), needed: goal.count };
    case "construction":
      return { current: ["built", "building", "ordered"].includes(get(constructions)[goal.id]?.status) ? 1 : 0, needed: 1 };
    case "flag":
      return { current: get(questFlags)[goal.id] ? 1 : 0, needed: 1 };
    case "decks":
      return { current: Math.min(get(cardDecks).length, goal.count), needed: goal.count };
    case "basic_cards": {
      const count = Object.entries(get(cardCollection)).reduce((sum, [id, qty]) => sum + (isBasicMonster(cardById(id)) ? qty : 0), 0);
      return { current: Math.min(count, goal.count), needed: goal.count };
    }
    case "deck_or_basics": {
      if (get(cardDecks).some((deck) => deck.themeId === goal.theme)) return { current: 1, needed: 1 };
      const count = Object.entries(get(cardCollection)).reduce((sum, [id, qty]) => sum + (isBasicMonster(cardById(id)) ? qty : 0), 0);
      return { current: count >= goal.basics ? 1 : 0, needed: 1 };
    }
    case "birds":
      return { current: Math.min(Object.keys(get(birdLog)).length, goal.count), needed: goal.count };
    case "garden":
      return { current: Math.min(get(garden).length, goal.count), needed: goal.count };
    case "insects":
      return { current: Math.min(get(insectInventory).length, goal.count), needed: goal.count };
    case "hand_over": {
      const have = get(inventory).filter((f) => !goal.biome || f.biome === goal.biome).length;
      return { current: Math.min(have, goal.count), needed: goal.count };
    }
    case "hand_over_ids": {
      const has = get(inventory).some((f) => goal.ids.includes(f.id));
      return { current: has ? 1 : 0, needed: 1 };
    }
    default:
      return { current: 0, needed: 1 };
  }
}

export function describeQuestReward(reward = {}) {
  const parts = [];
  if (reward.money) parts.push(`¥${reward.money}`);
  for (const [id, qty] of Object.entries(reward.baits || {})) {
    const bait = BAITS.find((item) => item.id === id);
    parts.push(`${qty}x ${bait ? bait.name : id}`);
  }
  if (reward.rod) parts.push(reward.rod.replace("vara_", "vara "));
  if (reward.cards) parts.push(`${reward.cards.length} carta(s)`);
  if (reward.bossDeck) parts.push(`deck chefe ${reward.bossDeck}`);
  return parts.join(" + ") || "a gratidão do povo";
}

export function grantQuestReward(reward = {}) {
  if (reward.money) money.update((value) => value + reward.money);
  const baits = Object.entries(reward.baits || {});
  if (baits.length) {
    baitStock.update((stock) => {
      const next = { ...stock };
      for (const [id, qty] of baits) next[id] = (next[id] || 0) + qty;
      return next;
    });
    ownedBaits.update((list) => [...new Set([...list, ...baits.map(([id]) => id)])]);
  }
  if (reward.rod) ownedRods.update((list) => (list.includes(reward.rod) ? list : [...list, reward.rod]));
  if (reward.cards) addCards(reward.cards);
  if (reward.bossDeck) grantThemeDeck(reward.bossDeck);
}

function consumeHandOver(goal) {
  if (goal.kind === "hand_over") {
    let left = goal.count;
    inventory.update((items) => items.filter((item) => {
      if (left > 0 && (!goal.biome || item.biome === goal.biome) && item.type === "fish") {
        left -= 1;
        return false;
      }
      return true;
    }));
  }
  if (goal.kind === "hand_over_ids") {
    const index = get(inventory).findIndex((item) => goal.ids.includes(item.id));
    if (index >= 0) inventory.update((items) => items.filter((_, i) => i !== index));
  }
}

export function activateGiverQuests(npcId) {
  const log = { ...ensureQuestLog() };
  for (const def of QUEST_DEFS) {
    if (def.giver === npcId && !log[def.id]) log[def.id] = { stage: 0, status: "active" };
  }
  questLog.set(log);
}

export function advanceNpcQuest(npcId) {
  activateGiverQuests(npcId);
  const log = { ...get(questLog) };
  const def = QUEST_DEFS.find((quest) => quest.giver === npcId && log[quest.id] && log[quest.id].status !== "done");
  if (!def) return null;
  const entry = log[def.id];
  const stage = def.stages[entry.stage];
  if (!stage) return null;
  const progress = goalProgress(stage.goal);
  if (progress.current < progress.needed) {
    return { def, stage, progress, met: false, done: false };
  }
  consumeHandOver(stage.goal);
  grantQuestReward(stage.reward);
  grantSeed();
  const nextStage = entry.stage + 1;
  log[def.id] = nextStage >= def.stages.length
    ? { stage: nextStage, status: "done" }
    : { stage: nextStage, status: "active" };
  questLog.set(log);
  return { def, stage, progress, met: true, done: log[def.id].status === "done", next: def.stages[nextStage] };
}

export function questHintFor(npcId) {
  const log = ensureQuestLog();
  const def = QUEST_DEFS.find((quest) => quest.giver === npcId && log[quest.id] && log[quest.id].status !== "done");
  if (!def) return null;
  const stage = def.stages[log[def.id].stage];
  if (!stage) return null;
  const progress = goalProgress(stage.goal);
  const mark = progress.needed > 1 ? ` [${progress.current}/${progress.needed}]` : "";
  if (progress.current >= progress.needed) {
    return `${stage.title}: você já tem o que eu pedi. Fale comigo de novo para entregar.${mark}`;
  }
  return `${def.title} — ${stage.title}: ${stage.hint}${mark}`;
}

export function questJournal() {
  ensureQuestLog();
  const log = get(questLog);
  const joeStage = get(joeQuest);
  const entries = [];
  if (joeStage < JOE_QUEST_STAGES.length) {
    const stage = JOE_QUEST_STAGES[joeStage];
    const progress = goalProgress(stage.goal);
    entries.push({
      id: "joe_legend",
      title: "A Lenda do Rei do Rio",
      giver: "Velho Joe",
      stage: `${stage.title} (${joeStage + 1}/${JOE_QUEST_STAGES.length})`,
      task: stage.task,
      hint: stage.hint,
      progress,
      reward: describeQuestReward(stage.reward),
      status: progress.current >= progress.needed ? "pronta" : "ativa",
    });
  } else {
    entries.push({
      id: "joe_legend",
      title: "A Lenda do Rei do Rio",
      giver: "Velho Joe",
      stage: "Concluída",
      task: "Você pescou a lenda.",
      hint: "A história agora é sua.",
      progress: { current: 1, needed: 1 },
      reward: "",
      status: "feita",
    });
  }
  const daily = get(dailyQuest);
  if (daily) {
    entries.push({
      id: "daily",
      title: "Pedido do dia",
      giver: "Quadro da taverna",
      stage: daily.completed ? "Concluído" : "Em andamento",
      task: `Traga ${daily.targetCount}x ${daily.fishName}.`,
      hint: "Pesque a espécie pedida e o quadro se atualiza sozinho.",
      progress: { current: daily.current, needed: daily.targetCount },
      reward: `¥${daily.reward}`,
      status: daily.completed ? "feita" : "ativa",
    });
  }
  for (const def of QUEST_DEFS) {
    const entry = log[def.id];
    if (!entry) continue;
    const stage = def.stages[Math.min(entry.stage, def.stages.length - 1)];
    const progress = entry.status === "done" ? { current: 1, needed: 1 } : goalProgress(stage.goal);
    entries.push({
      id: def.id,
      title: def.title,
      giver: def.giver,
      stage: entry.status === "done" ? "Concluída" : `${stage.title} (${entry.stage + 1}/${def.stages.length})`,
      task: stage.task,
      hint: stage.hint,
      summary: def.summary,
      progress,
      reward: describeQuestReward(stage.reward),
      status: entry.status === "done" ? "feita" : progress.current >= progress.needed ? "pronta" : "ativa",
    });
  }
  return entries;
}

export function offerQuestOnTalk(npcId) {
  activateGiverQuests(npcId);
  return advanceNpcQuest(npcId);
}
