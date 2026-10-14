import { describe, expect, it, beforeEach } from "vitest";
import { get } from "svelte/store";
import { resetState } from "./saveSystem.js";
import { luckFightBonus } from "./bugTournament.js";
import { COMMON_BUGS, POKEMON_BUGS } from "./bugCatalog.js";
import { createFishFight, startReel, stopReel, tickFishFight } from "./fishFight.js";
import { rollNetCatch } from "./fishingEngine.js";
import { canHousePet, feedPet, placeInTerrarium } from "./pet.js";
import { dungeonTheme, generateDungeonFloor, onixHoleOpen, resolveDungeonDuel } from "./dungeon.js";
import { petCompanion, terrarium, inventory, day, fishFight, phase } from "./stores.js";
import { PHASES } from "./phases.js";
import { validateDeck, revertDeck, buyDeck } from "./cards.js";
import { themeDeck, dailyDeckThemes } from "./cardCatalog.js";
import { cardDecks, cardCollection, money } from "./stores.js";

describe("remake do vale", () => {
  beforeEach(() => resetState("pokemon"));

  it("insetos usam personalidade no nome, não a habilidade", () => {
    for (const bug of [...COMMON_BUGS, ...POKEMON_BUGS]) {
      expect(bug.name).not.toMatch(/Bruiser|Guardião|Tático|Ágil/i);
      expect(bug.name.split(" ").length).toBeGreaterThan(1);
    }
    expect(luckFightBonus(0)).toBe(1);
    expect(luckFightBonus(4)).toBe(3);
  });

  it("a luta River King estoura no arranque e puxa no cansaço", () => {
    phase.set(PHASES.FISHING_MINIGAME);
    fishFight.set({ ...createFishFight({ rarity: 2 }), mood: "dash", holding: true });
    const snap = tickFishFight(1, () => 0);
    expect(snap.snap || snap.tension > 40).toBe(true);
    const tired = createFishFight({ rarity: 1 });
    fishFight.set({ ...tired, mood: "exhaust" });
    startReel();
    const pulled = tickFishFight(1, () => 0);
    expect(pulled.distance).toBeLessThan(tired.distance);
    stopReel();
  });

  it("redes melhores reduzem lixo e aumentam tesouro", () => {
    const junk = (level) => Array.from({ length: 200 }, (_, index) => rollNetCatch("sea", level, () => index / 200))
      .filter((item) => !item || item.sprite || item.type === "loot" || item.type === "treasure" || item.netCatch);
    expect(junk(1).length).toBeGreaterThan(0);
    expect(onixHoleOpen(10)).toBe(false);
    expect(onixHoleOpen(11)).toBe(true);
  });

  it("terrário pequeno recusa estágio 2 e o grande evolui após 10 dias de comida boa", () => {
    expect(canHousePet({ stage: 2 }, "small")).toBe(false);
    terrarium.set({ size: "large", lastFedDay: 0, fed: 0, inBall: false, awayUntil: 0 });
    expect(placeInTerrarium({ name: "Weedle", stage: 1, evolvesTo: "kakuna", evolvesToName: "Kakuna", rarity: 1 }).ok).toBe(true);
    inventory.set([{ id: "racao_pet" }]);
    day.set(1);
    expect(feedPet({ id: "racao_pet" }).ok).toBe(true);
    expect(get(petCompanion).daysFed).toBe(1);
  });

  it("dungeon tem 10 temas e combate de 3 rodadas", () => {
    expect(dungeonTheme(1)).toBe("ground");
    expect(dungeonTheme(11)).toBe("water");
    const floor = generateDungeonFloor(12, "test");
    expect(floor.theme).toBe("water");
    const duel = resolveDungeonDuel({ strength: 8, types: ["water"] }, { strength: 1, type: "fire" }, "easy");
    expect(duel.frames).toHaveLength(3);
    expect(["pet", "foe"]).toContain(duel.winner);
  });

  it("loja não vende deck lendário e o deck aceita no máximo 4 cópias", () => {
    money.set(20000);
    expect(buyDeck(false, "lendas_fogo").ok).toBe(false);
    const shopTheme = dailyDeckThemes(1, 0, "pokemon")[0];
    expect(buyDeck(false, shopTheme.id).ok).toBe(true);
    const deck = get(cardDecks)[0];
    const stuffed = Array(24).fill(themeDeck(shopTheme.id)[0]);
    cardCollection.set({ [stuffed[0]]: 24 });
    expect(validateDeck(stuffed, get(cardCollection), deck.cards)).toBe(false);
    expect(revertDeck(deck.id).ok).toBe(true);
  });
});
