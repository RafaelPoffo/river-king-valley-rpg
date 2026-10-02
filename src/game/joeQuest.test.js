import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { LEGEND_STAGE, legendId, questStatus, advanceJoeQuest } from "./joeQuest.js";
import { JOE_QUEST_STAGES, LEGEND_UNLOCK, FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { SPRITES } from "./sprites.js";
import { joeQuest, unlocks, inventory, museum, fishLog, gameMode, money } from "./stores.js";

beforeEach(() => {
  gameMode.set("normal");
  joeQuest.set(0);
  unlocks.set([]);
  inventory.set([]);
  museum.set({});
  fishLog.set({});
  money.set(0);
});

function completeStage() {
  const { def } = questStatus();
  switch (def.goal.kind) {
    case "inventory_river_stars":
      inventory.set([{ type: "fish", biome: "river", stars: def.goal.stars }]);
      break;
    case "museum": {
      const relics = FISH_DB.filter((f) => f.type === "treasure").slice(0, def.goal.count);
      museum.set(Object.fromEntries(relics.map((f) => [f.id, { donated: true }])));
      break;
    }
    case "catalog": {
      const species = FISH_DB.filter((f) => f.type === "fish" && f.sprite !== SPRITES.trash).slice(
        0,
        def.goal.count
      );
      fishLog.set(Object.fromEntries(species.map((f) => [f.id, { count: 1 }])));
      break;
    }
    case "legend":
      fishLog.update((log) => ({ ...log, [legendId()]: { count: 1 } }));
      break;
  }
}

describe("lendas", () => {
  it("nenhum banco tem ids repetidos", () => {
    for (const db of [FISH_DB, POKEMON_DB]) {
      const ids = db.map((f) => f.id);
      expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    }
  });

  it("o lendário existe nos dois modos e exige o desbloqueio", () => {
    for (const [mode, db] of [["normal", FISH_DB], ["pokemon", POKEMON_DB]]) {
      gameMode.set(mode);
      const legend = db.find((f) => f.id === legendId());
      expect(legend).toBeTruthy();
      expect(legend.requires).toBe(LEGEND_UNLOCK);
    }
  });

  it("a etapa final é pescar a lenda", () => {
    expect(JOE_QUEST_STAGES[LEGEND_STAGE].goal.kind).toBe("legend");
    expect(LEGEND_STAGE).toBe(JOE_QUEST_STAGES.length - 1);
  });
});

describe("missão", () => {
  it("não avança sem cumprir a etapa", () => {
    expect(questStatus().met).toBe(false);
    expect(advanceJoeQuest()).toBeNull();
    expect(get(joeQuest)).toBe(0);
  });

  it("cada etapa paga a recompensa e só a última libera a lenda depois da penúltima", () => {
    let expectedMoney = 0;
    for (let stage = 0; stage < JOE_QUEST_STAGES.length; stage++) {
      expect(get(unlocks).includes(LEGEND_UNLOCK)).toBe(stage >= LEGEND_STAGE);
      completeStage();
      expect(questStatus().met).toBe(true);
      expect(advanceJoeQuest()).toBe(JOE_QUEST_STAGES[stage]);
      expectedMoney += JOE_QUEST_STAGES[stage].reward.money || 0;
      expect(get(money)).toBe(expectedMoney);
    }
    expect(questStatus().done).toBe(true);
    expect(advanceJoeQuest()).toBeNull();
  });
});
