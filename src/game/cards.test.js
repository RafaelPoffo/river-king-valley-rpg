import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "svelte/server";
import CardsModal from "../components/CardsModal.svelte";
import CardFace from "../components/CardFace.svelte";
import { get } from "svelte/store";
import { cardCollection, cardDecks, cardTradeUsed, cardChampionship, money, inventory, gameMode } from "./stores.js";
import { buyDeck, buySingleCard, grantRareCard, grantChampionshipPrize, saveDeck, validateDeck } from "./cards.js";
import { ALL_CARDS, CARD_THEMES, DECK_SIZE, DECK_PRICE, BASIC_SHOP_CARDS, cardName, cardPortrait, pokemonCardStats, pokemonEvolutionInfo, themeDeck, isBasicMonster, canNormalSummon } from "./cardCatalog.js";
import { CARD_NPC_THEMES, INITIAL_VILLAGERS, getNpcLocation, CARD_CHAMPIONSHIP_DAY, cardPlayersForDay, cardTableCount } from "./constants.js";
import { createCardDuel, cardStats, performCardAction, nextCardAIAction, resolveCardTrap, canAttack } from "./cardGame.js";
import { FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { rollFishByZone } from "./fishingEngine.js";
import { currentWeather, fishingBiome, eqBaitId, birdwatchingLuck, currentMap, phase, player, dialogActions, cardOpponent, inGameMinutes, day, garden, gardenDay, gardenBuffs, eqSeedId, seedStock, currentToolType } from "./stores.js";
import { PHASES } from "./phases.js";
import { interact } from "./gameActions.js";
import { resetState } from "./saveSystem.js";
import { cardById } from "./cardCatalog.js";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pokemonNames from "./data/pokemonNames.json";

describe("colecao de cartas", () => {
  beforeEach(() => { cardCollection.set({}); cardDecks.set([]); cardTradeUsed.set(false); money.set(DECK_PRICE * 2); inventory.set([]); gameMode.set("normal"); });

  it("gera decks tematicos de 24 cartas e vende por 4000", () => {
    expect(CARD_THEMES.length).toBeGreaterThanOrEqual(12);
    expect(CARD_NPC_THEMES).toHaveLength(CARD_THEMES.length);
    for (const theme of CARD_THEMES) expect(themeDeck(theme.id)).toHaveLength(DECK_SIZE);
    expect(buyDeck(false, "agua").ok).toBe(true);
    expect(buyDeck(false, "fogo").ok).toBe(true);
    expect(get(money)).toBe(0);
    expect(get(cardDecks)[0].themeId).toBe("agua");
    expect(buyDeck(false, "planta").ok).toBe(false);
  });

  it("aceita uma troca apenas antes de qualquer compra", () => {
    for (const [mode, id] of [["normal", "tilapia_dourada"], ["pokemon", "dratini"]]) {
      cardDecks.set([]); cardTradeUsed.set(false); gameMode.set(mode); inventory.set([{ id }, { id }]);
      expect(buyDeck(true, "agua").ok).toBe(true);
      expect(get(inventory)).toHaveLength(1);
      expect(buyDeck(true).ok).toBe(false);
    }
    cardDecks.set([]); cardTradeUsed.set(false); buyDeck(false, "fogo");
    expect(buyDeck(true).ok).toBe(false);
  });

  it("so troca pokemon basicos no editor e so vende basicos na loja", () => {
    const { deck } = buyDeck(false, "agua");
    expect(validateDeck(deck.cards)).toBe(true);
    expect(saveDeck(deck.id, deck.cards.slice(1), "Teste").ok).toBe(false);
    const locked = deck.cards.find((id) => !isBasicMonster(cardById(id)));
    const swapped = deck.cards.map((id) => id === locked ? deck.cards.find((item) => isBasicMonster(cardById(item))) : id);
    expect(saveDeck(deck.id, swapped, "Ilegal").ok).toBe(false);
    money.set(2000);
    expect(buySingleCard("agua:0007").ok).toBe(false);
    expect(buySingleCard(BASIC_SHOP_CARDS[0].id).ok).toBe(true);
  });

  it("ganha cartas de fontes raras e do campeonato", () => {
    expect(grantRareCard("sea", () => 0).id).toBe("rare:sea_guardian");
    expect(grantRareCard("sea", () => 0.02).id).toBe("rare:sea_song");
    expect(grantRareCard("sea", () => 0.9)).toBeNull();
    const prize = grantChampionshipPrize(() => 0);
    expect(prize).toHaveLength(4);
    expect(prize.every((card) => card.kind === "básico")).toBe(true);
  });

  it("mantem no maximo tres cartas na mao inicial e ao comprar no turno", () => {
    const duel = createCardDuel(themeDeck("agua"), themeDeck("fogo"), () => 0.5);
    expect(duel.p1.hand).toHaveLength(3);
    expect(duel.p2.hand).toHaveLength(3);
    expect(duel.p1.spells).toHaveLength(2);
    duel.p1.hand.pop();
    performCardAction(duel, "p1", { type: "end" });
    performCardAction(duel, "p2", { type: "end" });
    expect(duel.p1.hand).toHaveLength(3);
  });

  it("usa fase, basico e atributos iguais nos dois modos", () => {
    expect(pokemonEvolutionInfo(cardById("fogo:0004"))).toMatchObject({ stage: 1, kind: "fase 1", next: [{ dexId: "0005", name: "Charmeleon" }] });
    expect(pokemonCardStats(cardById("fogo:0005"))).toEqual({ atk: 3, def: 1 });
    expect(pokemonCardStats(cardById("fogo:0006"))).toEqual({ atk: 5, def: 3 });
    expect(cardById("voador:0083").kind).toBe("básico");
    const normal = createCardDuel(themeDeck("fogo"), themeDeck("agua"), () => 0.5);
    const poke = createCardDuel(themeDeck("fogo"), themeDeck("agua"), () => 0.5, "pokemon");
    expect([...normal.p1.deck, ...normal.p1.hand].find((card) => card.id === "fogo:0004")).toMatchObject({ atk: 1, def: 1 });
    expect([...poke.p1.deck, ...poke.p1.hand].find((card) => card.id === "fogo:0004")).toMatchObject({ atk: 1, def: 1 });
  });

  it("oferece Tilapia Dourada e Dratini com os mesmos atributos e chance de encontro", () => {
    const golden = FISH_DB.find((fish) => fish.id === "tilapia_dourada");
    const dragon = POKEMON_DB.find((fish) => fish.id === "dratini");
    expect(golden.price).toBe(3000);
    for (const field of ["rarity", "biome", "dist", "seasons", "times", "minW", "maxW", "diff", "spd"]) expect(golden[field]).toEqual(dragon[field]);
    currentWeather.set("sunny"); fishingBiome.set("river"); eqBaitId.set("minhoca"); birdwatchingLuck.set(0);
    for (const [mode, id] of [["normal", "tilapia_dourada"], ["pokemon", "dratini"]]) {
      gameMode.set(mode);
      const random = vi.spyOn(Math, "random").mockReturnValueOnce(0.9).mockReturnValue(0.01);
      try { expect(rollFishByZone(1).id).toBe(id); } finally { random.mockRestore(); }
    }
  });

  it("mantem quatro duelistas por dia e seis no campeonato, sem sobreposicao na taverna", () => {
    const seen = new Set();
    for (let today = 1; today <= 15; today++) {
      const cards = INITIAL_VILLAGERS.filter((npc) => npc.cardTheme && getNpcLocation(npc, 600, today).map === "game_house");
      expect(cards).toHaveLength(cardTableCount(today));
      cards.forEach((npc) => seen.add(npc.cardTheme));
      const locations = INITIAL_VILLAGERS.map((npc) => getNpcLocation(npc, 1200, today)).filter((loc) => loc.map === "tavern");
      expect(new Set(locations.map((loc) => `${loc.x}:${loc.y}`)).size).toBe(locations.length);
    }
    expect(seen.size).toBe(CARD_NPC_THEMES.length);
    expect(cardPlayersForDay(15, 0)).toHaveLength(6);
    expect(cardPlayersForDay(15, 0)).not.toEqual(cardPlayersForDay(1, 1));
  });
});

describe("regras do duelo de cartas", () => {
  const card = (duel, owner, id) => [...duel[owner].deck, ...duel[owner].hand].find((item) => item.id === id);
  function putInHand(duel, owner, id) {
    const picked = card(duel, owner, id);
    duel[owner].deck = duel[owner].deck.filter((item) => item !== picked);
    if (!duel[owner].hand.includes(picked)) duel[owner].hand.push(picked);
    return picked;
  }

  it("protege turnos, exige sacrificio so de lendarios e impede ataques ao invocar", () => {
    const duel = createCardDuel(themeDeck("lendas_gelo"), themeDeck("agua"), () => 0.5);
    const boss = putInHand(duel, "p1", "lendas_gelo:0144");
    expect(performCardAction(duel, "p2", { type: "end" }).ok).toBe(false);
    expect(performCardAction(duel, "p1", { type: "summon", uid: boss.uid }).ok).toBe(false);
    const grunt = putInHand(duel, "p1", "lendas_gelo:0086");
    expect(performCardAction(duel, "p1", { type: "summon", uid: grunt.uid }).ok).toBe(true);
    expect(canAttack(duel.p1.monsters[0])).toBe(false);
    performCardAction(duel, "p1", { type: "battle" });
    expect(performCardAction(duel, "p1", { type: "attack", index: 0, target: "direct" }).ok).toBe(false);
    performCardAction(duel, "p1", { type: "end" });
    performCardAction(duel, "p2", { type: "end" });
    expect(performCardAction(duel, "p1", { type: "summon", uid: boss.uid, target: 0 }).ok).toBe(true);
    expect(duel.p1.graveyard.some((item) => item.uid === grunt.uid)).toBe(true);
  });

  it("so evolui na linha correta, nos dois modos, uma vez por turno", () => {
    const duel = createCardDuel(themeDeck("fogo"), themeDeck("agua"), () => 0.5, "pokemon");
    const base = putInHand(duel, "p1", "fogo:0004");
    duel.p1.hand = duel.p1.hand.filter((item) => item !== base);
    base.pos = "def"; base.hasAttacked = true; base.gear = ["equip_atk"];
    duel.p1.monsters[0] = base;
    const finalForm = putInHand(duel, "p1", "fogo:0006");
    expect(performCardAction(duel, "p1", { type: "evolve", uid: finalForm.uid }).ok).toBe(false);
    const middleForm = putInHand(duel, "p1", "fogo:0005");
    expect(performCardAction(duel, "p1", { type: "evolve", uid: middleForm.uid }).ok).toBe(true);
    expect(duel.p1.monsters[0]).toMatchObject({ dexId: "0005", pos: "def", hasAttacked: true, gear: ["equip_atk"], atk: 3, def: 1 });
    expect(performCardAction(duel, "p1", { type: "evolve", uid: finalForm.uid }).ok).toBe(false);
    performCardAction(duel, "p1", { type: "end" });
    performCardAction(duel, "p2", { type: "end" });
    expect(performCardAction(duel, "p1", { type: "evolve", uid: finalForm.uid }).ok).toBe(true);
    expect(duel.p1.monsters[0]).toMatchObject({ dexId: "0006", atk: 5, def: 3 });

    const normal = createCardDuel(themeDeck("fogo"), themeDeck("agua"), () => 0.5, "normal");
    const grown = putInHand(normal, "p1", "fogo:0005");
    expect(canNormalSummon(grown)).toBe(false);
    expect(performCardAction(normal, "p1", { type: "summon", uid: grown.uid }).ok).toBe(false);
  });

  it("campo e um unico equipamento somam no tipo certo", () => {
    const duel = createCardDuel(themeDeck("agua"), themeDeck("fogo"));
    const monster = putInHand(duel, "p1", "agua:0007");
    performCardAction(duel, "p1", { type: "summon", uid: monster.uid });
    const field = putInHand(duel, "p1", "agua:field");
    performCardAction(duel, "p1", { type: "activate", uid: field.uid });
    expect(cardStats(monster, duel.p1)).toEqual({ atk: 2, def: 2 });
    const equip = putInHand(duel, "p1", "agua:s1");
    expect(performCardAction(duel, "p1", { type: "activate", uid: equip.uid, target: 0 }).ok).toBe(true);
    expect(cardStats(monster, duel.p1).atk).toBe(3);
    const second = { ...equip, uid: "p1:extra-equip" };
    duel.p1.hand.push(second);
    expect(performCardAction(duel, "p1", { type: "activate", uid: second.uid, target: 0 }).ok).toBe(false);
  });

  it("IA conclui o turno e resolve a armadilha humana sem pular ataques", () => {
    const duel = createCardDuel(themeDeck("inseto"), themeDeck("voador"), () => 0.3);
    const trap = putInHand(duel, "p1", "inseto:t0");
    performCardAction(duel, "p1", { type: "set", uid: trap.uid });
    performCardAction(duel, "p1", { type: "end" });
    for (let step = 0; step < 100 && !duel.winner; step++) {
      if (duel.turn === "p1") performCardAction(duel, "p1", { type: "end" });
      else if (duel.state === "trap") resolveCardTrap(duel, true);
      else if (duel.state === "dice") break;
      else {
        const action = nextCardAIAction(duel);
        expect(action).toBeTruthy();
        expect(performCardAction(duel, "p2", action).ok).toBe(true);
      }
    }
    expect(duel.winner || duel.state === "dice").toBeTruthy();
  });
});

describe("interacoes e telas de cartas e jardim", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { setItem: vi.fn(), getItem: vi.fn() });
    resetState("pokemon"); phase.set(PHASES.PLAYING); inGameMinutes.set(600); day.set(1);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("abre a loja no balcao e pergunta antes de iniciar o duelo", () => {
    currentMap.set("game_house"); player.set({ x: 10, y: 4, dir: "up" }); interact();
    expect(get(phase)).toBe(PHASES.CARD_SHOP);
    phase.set(PHASES.PLAYING); player.set({ x: 6, y: 4, dir: "down" }); interact();
    expect(get(phase)).toBe(PHASES.DIALOG);
    get(dialogActions)[" "]();
    expect(get(phase)).toBe(PHASES.CARD_DUEL);
    expect(get(cardOpponent).cardTheme).toBeTruthy();
  });

  it("planta e come um fruto com Espaco sem prender o seletor de ferramentas", () => {
    currentMap.set("bug_forest"); player.set({ x: 27, y: 20, dir: "up" });
    currentToolType.set("seed"); eqSeedId.set("pear"); seedStock.set({ pear: 1 }); interact();
    const tree = get(garden).find((item) => item.fruitId === "pear");
    expect(tree.grownAt).toBeGreaterThanOrEqual(3);
    expect(tree.grownAt).toBeLessThanOrEqual(5);
    expect(get(currentToolType)).toBe("rod");
    gardenDay.set(tree.grownAt); interact();
    expect(get(gardenBuffs).some((buff) => buff.id === "pear")).toBe(true);
  });

  it("renderiza loja, colecao e escolha de deck com portraits frontais", () => {
    phase.set(PHASES.CARD_SHOP); inventory.set([{ id: "dratini" }]);
    expect(render(CardsModal).body).toContain("Trocar Dratini");
    money.set(DECK_PRICE); buyDeck(false, "voador");
    phase.set(PHASES.CARD_COLLECTION);
    expect(render(CardsModal).body).toContain("Cartas e Decks");
    cardOpponent.set({ id: "card_voador", name: "Ari das Asas", cardTheme: "voador" }); phase.set(PHASES.CARD_DUEL);
    expect(render(CardsModal).body).toContain("Duelo com Ari das Asas");
    const face = render(CardFace, { props: { card: cardById("fogo:0006"), mode: "pokemon" } }).body;
    expect(face).toContain("Charizard");
    expect(face).toContain("/assets/portraits/0006.png");
    const magicFace = render(CardFace, { props: { card: cardById("agua:s1"), mode: "pokemon" } }).body;
    expect(magicFace).toContain("magic-symbol");
    expect(magicFace).not.toContain("/assets/portraits/");
    for (const card of ALL_CARDS.filter((item) => item.type === "monster")) {
      expect(cardPortrait(card), card.id).toBe(`/assets/portraits/${card.dexId}.png`);
      expect(cardName(card, "pokemon"), card.id).toBe(`${pokemonNames[card.dexId]}${card.isBoss ? " Chefe" : ""}`);
    }
  });

  it("tem 251 portraits frontais locais", () => {
    expect(Object.keys(pokemonNames)).toHaveLength(251);
    for (const id of Object.keys(pokemonNames)) {
      const path = fileURLToPath(new URL(`../../public/assets/portraits/${id}.png`, import.meta.url));
      expect(existsSync(path), id).toBe(true);
      expect(statSync(path).size, id).toBeGreaterThan(80);
    }
  });
});
