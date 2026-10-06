import { get } from "svelte/store";
import { JOE_QUEST_STAGES, LEGEND_UNLOCK, LEGEND_IDS } from "./constants.js";
import { PHASES } from "./phases.js";
import { SPRITES } from "./sprites.js";
import {
  joeQuest,
  unlocks,
  inventory,
  museum,
  fishLog,
  gameMode,
  phase,
  currentMessage,
  dialogActions,
  getActiveDatabase,
} from "./stores.js";
import { grant, describeReward } from "./collections.js";
import { grantSeed } from "./garden.js";
import { grantRareCard } from "./cards.js";
import { saveGame } from "./saveSystem.js";

export const LEGEND_STAGE = JOE_QUEST_STAGES.findIndex((s) => s.goal.kind === "legend");

export function legendId() {
  return LEGEND_IDS[get(gameMode)] || LEGEND_IDS.normal;
}

function speciesCaught(database) {
  const log = get(fishLog);
  return database.filter((f) => f.type === "fish" && f.sprite !== SPRITES.trash && log[f.id]).length;
}

export function goalProgress(goal, database = getActiveDatabase()) {
  switch (goal.kind) {
    case "inventory_river_stars": {
      const has = get(inventory).some((f) => f.biome === "river" && (f.stars || 0) >= goal.stars);
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
      return { current: get(fishLog)[legendId()] ? 1 : 0, needed: 1 };
    default:
      return { current: 0, needed: 1 };
  }
}

export function questStatus() {
  const stage = get(joeQuest);
  const def = JOE_QUEST_STAGES[stage];
  if (!def) return { stage, done: true };
  const progress = goalProgress(def.goal);
  return { stage, def, progress, met: progress.current >= progress.needed, done: false };
}

function unlockLegend() {
  unlocks.update((list) => (list.includes(LEGEND_UNLOCK) ? list : [...list, LEGEND_UNLOCK]));
}

export function advanceJoeQuest() {
  const status = questStatus();
  if (status.done || !status.met) return null;
  grant(status.def.reward);
  grantSeed();
  grantRareCard("quest");
  joeQuest.set(status.stage + 1);
  if (status.stage + 1 === LEGEND_STAGE) unlockLegend();
  return status.def;
}

function close() {
  phase.set(PHASES.PLAYING);
  currentMessage.set("Setas para andar. [ENTER] para o Menu.");
}

export function openJoeQuest() {
  phase.set(PHASES.DIALOG);
  const status = questStatus();

  if (status.done) {
    currentMessage.set('Velho Joe: "Você pescou a lenda. Agora a história é sua, pescador."');
    dialogActions.set({ " ": close });
    return;
  }

  const { def, progress, stage } = status;
  const header = `A Lenda do Rei do Rio (${stage + 1}/${JOE_QUEST_STAGES.length}) — ${def.title}`;
  const progressText = progress.needed > 1 ? ` [${progress.current}/${progress.needed}]` : "";

  if (!status.met) {
    currentMessage.set(`${header}: "${def.task}"${progressText} Recompensa: ${describeReward(def.reward)}.`);
    dialogActions.set({ " ": close });
    return;
  }

  currentMessage.set(`${header}: "Isso mesmo!" [SPACE] Receber ${describeReward(def.reward)}`);
  dialogActions.set({
    " ": () => {
      advanceJoeQuest();
      saveGame();
      const next = JOE_QUEST_STAGES[get(joeQuest)];
      currentMessage.set(
        next
          ? `Velho Joe: "Muito bem. Agora: ${next.task}"`
          : 'Velho Joe: "Eu sabia que você conseguiria. A lenda é verdadeira!"'
      );
      dialogActions.set({ " ": close });
    },
  });
}
