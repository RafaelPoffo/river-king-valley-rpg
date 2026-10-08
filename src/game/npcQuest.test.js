import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { INITIAL_VILLAGERS, cardTableCount, isCardEventDay, CARD_VISITOR_SEATS } from "./constants.js";
import { extrasForDay, travelersForDay, cardVisitorsForDay, isBirthday, extraOccupantAt } from "./npcLife.js";
import { ensureQuestLog, questJournal, goalProgress, advanceNpcQuest } from "./quests.js";
import { tradeBasicCard, addCards } from "./cards.js";
import { BASIC_SHOP_CARDS } from "./cardCatalog.js";
import { resetState } from "./saveSystem.js";
import { questLog, cardCollection, constructions, insectInventory } from "./stores.js";
import { MAPS_DATA } from "./constants.js";

describe("npcs e ciclo", () => {
  it("cada morador tem gênero, ofício e gosto alinhados ao papel", () => {
    for (const npc of INITIAL_VILLAGERS.filter((item) => !item.cardTheme)) {
      expect(npc.gender).toMatch(/^[mf]$/);
      expect(npc.personality).toBeTruthy();
      expect(npc.utility).toBeTruthy();
      expect(npc.birthday).toEqual(expect.objectContaining({ season: expect.any(Number), day: expect.any(Number) }));
    }
    expect(INITIAL_VILLAGERS.find((npc) => npc.id === "fishing_guide")).toMatchObject({ gender: "f", name: "Nina Pescadora" });
    expect(INITIAL_VILLAGERS.find((npc) => npc.id === "river_fisher")).toMatchObject({ gender: "m", role: "fisher" });
    expect(INITIAL_VILLAGERS.find((npc) => npc.id === "carpenter").name).toBe("Mestre Gino");
    expect(INITIAL_VILLAGERS.find((npc) => npc.id === "bird_guide").gender).toBe("m");
  });

  it("viajantes e visitantes da loja cabem no chão e não duelam", () => {
    const extras = extrasForDay(7, 0, "pokemon");
    expect(cardVisitorsForDay(7, 0, "pokemon").length).toBeGreaterThanOrEqual(2);
    expect(cardVisitorsForDay(7, 0, "pokemon").length).toBeLessThanOrEqual(CARD_VISITOR_SEATS.length);
    for (const visitor of extras.filter((npc) => npc.role === "shop_visitor")) {
      expect(MAPS_DATA.game_house[visitor.homeY][visitor.homeX]).toBe("=");
      expect(visitor.wantCard.startsWith("shop:")).toBe(true);
    }
    const travelers = travelersForDay(3, 1, "pokemon");
    for (const traveler of travelers) {
      expect(MAPS_DATA.village[traveler.homeY][traveler.homeX]).toMatch(/[G.]/);
      if (traveler.companion) {
        expect(extraOccupantAt("village", traveler.companion.x, traveler.companion.y, 600, 3, 1, "pokemon")).toBeTruthy();
      }
    }
  });

  it("dias de evento enchem a casa e marcam lenda", () => {
    expect(isCardEventDay(7)).toBe(true);
    expect(cardTableCount(7)).toBe(7);
    expect(cardTableCount(1)).toBe(4);
    expect(isBirthday({ birthday: { season: 0, day: 6 } }, 0, 6)).toBe(true);
  });
});

describe("diário de missões", () => {
  beforeEach(() => {
    resetState("normal");
    ensureQuestLog();
  });

  it("abre as quests iniciais e descreve o próximo passo", () => {
    const journal = questJournal();
    expect(journal.some((entry) => entry.id === "nina_apprentice")).toBe(true);
    expect(journal.find((entry) => entry.id === "nina_apprentice").hint).toMatch(/rio/i);
  });

  it("avança a missão do Bento quando há insetos", () => {
    insectInventory.set([{ id: "a" }, { id: "b" }, { id: "c" }]);
    expect(goalProgress({ kind: "insects", count: 3 }).current).toBe(3);
    const result = advanceNpcQuest("bug_guide");
    expect(result.met).toBe(true);
    expect(get(questLog).bento_bugs.status).toBe("done");
  });

  it("troca só cartas básicas", () => {
    const give = BASIC_SHOP_CARDS[0].id;
    const receive = BASIC_SHOP_CARDS[1].id;
    addCards([give]);
    expect(tradeBasicCard(give, receive).ok).toBe(true);
    expect(get(cardCollection)[receive]).toBe(1);
    expect(tradeBasicCard("lendas_gelo:0144", receive).ok).toBe(false);
  });

  it("o píer encomendado conta na missão do capitão", () => {
    constructions.update((all) => ({ ...all, pier: { ...all.pier, status: "ordered" } }));
    expect(goalProgress({ kind: "construction", id: "pier" }).current).toBe(1);
  });
});
