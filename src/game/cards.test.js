import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "svelte/server";
import CardsModal from "../components/CardsModal.svelte";
import CardFace from "../components/CardFace.svelte";
import { get } from "svelte/store";
import { cardCollection, cardDecks, cardTradeUsed, money, inventory, gameMode } from "./stores.js";
import { buyDeck, buySingleCard, grantRareCard, saveDeck, validateDeck } from "./cards.js";
import { CARD_THEMES, DECK_SIZE, themeDeck } from "./cardCatalog.js";
import { INITIAL_VILLAGERS, getNpcLocation } from "./constants.js";
import { createCardDuel, cardStats, performCardAction, nextCardAIAction, resolveCardTrap } from "./cardGame.js";
import { FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { rollFishByZone } from "./fishingEngine.js";
import { currentWeather, fishingBiome, eqBaitId, birdwatchingLuck, currentMap, phase, player, dialogActions, cardOpponent, inGameMinutes, day, garden, gardenDay, gardenBuffs, eqSeedId, seedStock, currentToolType } from "./stores.js";
import { PHASES } from "./phases.js";
import { interact } from "./gameActions.js";
import { resetState } from "./saveSystem.js";
import { cardById } from "./cardCatalog.js";
import { cardPlayersForDay } from "./constants.js";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import pokemonNames from "./data/pokemonNames.json";

describe("colecao de cartas", () => {
  beforeEach(() => { cardCollection.set({}); cardDecks.set([]); cardTradeUsed.set(false); money.set(4000); inventory.set([]); gameMode.set("normal"); });
  it("gera todos os temas com 32 cartas e compra decks aleatorios", () => {
    expect(CARD_THEMES).toHaveLength(14);
    for (const theme of CARD_THEMES) expect(themeDeck(theme.id)).toHaveLength(DECK_SIZE);
    expect(buyDeck(false, () => 0).ok).toBe(true);
    expect(buyDeck(false, () => 0.99).ok).toBe(true);
    expect(get(money)).toBe(0);
    expect(get(cardDecks)[0].themeId).not.toBe(get(cardDecks)[1].themeId);
    expect(buyDeck().ok).toBe(false);
  });
  it("aceita uma troca apenas antes de qualquer compra", () => {
    for (const [mode,id] of [["normal","tilapia_dourada"],["pokemon","dratini"]]) {
      cardDecks.set([]); cardTradeUsed.set(false); gameMode.set(mode); inventory.set([{id},{id}]);
      expect(buyDeck(true, () => 0).ok).toBe(true);
      expect(get(inventory)).toHaveLength(1);
      expect(buyDeck(true).ok).toBe(false);
    }
    cardDecks.set([]); cardTradeUsed.set(false); buyDeck(false);
    expect(buyDeck(true).ok).toBe(false);
  });
  it("nao permite salvar cartas inexistentes ou quantidades alem da colecao", () => {
    const {deck} = buyDeck(false, () => 0);
    expect(validateDeck(deck.cards)).toBe(true);
    expect(saveDeck(deck.id, deck.cards.slice(1), "Teste").ok).toBe(false);
    expect(validateDeck(Array(32).fill(deck.cards[0]))).toBe(false);
    expect(saveDeck(deck.id, [...deck.cards].reverse(), "Meu deck").ok).toBe(true);
  });
  it("ganha cartas de fontes raras e protege compras sem saldo", () => {
    expect(grantRareCard("sea", () => 0).id).toBe("rare:sea_guardian");
    expect(grantRareCard("sea", () => 0.02).id).toBe("rare:sea_song");
    expect(grantRareCard("sea", () => 0.9)).toBeNull();
    expect(buySingleCard("rare:sea_guardian").ok).toBe(false);
  });
  it("oferece Tilapia Dourada e Dratini com os mesmos atributos e chance de encontro", () => {
    const golden = FISH_DB.find((fish) => fish.id === "tilapia_dourada");
    const dragon = POKEMON_DB.find((fish) => fish.id === "dratini");
    for (const field of ["price","rarity","biome","dist","seasons","times","minW","maxW","diff","spd"]) expect(golden[field]).toEqual(dragon[field]);
    currentWeather.set("sunny"); fishingBiome.set("river"); eqBaitId.set("minhoca"); birdwatchingLuck.set(0);
    for (const [mode,id] of [["normal","tilapia_dourada"],["pokemon","dratini"]]) {
      gameMode.set(mode);
      const random = vi.spyOn(Math,"random").mockReturnValueOnce(0.9).mockReturnValue(0.01);
      try { expect(rollFishByZone(1).id).toBe(id); } finally { random.mockRestore(); }
    }
  });
  it("mantem quatro duelistas diferentes por dia, sem sobreposicao na taverna", () => {
    const seen = new Set();
    for (let day = 1; day <= 15; day++) {
      const cards = INITIAL_VILLAGERS.filter((npc) => npc.cardTheme && getNpcLocation(npc, 600, day).map === "game_house");
      expect(cards).toHaveLength(4);
      cards.forEach((npc) => seen.add(npc.cardTheme));
      const locations = INITIAL_VILLAGERS.map((npc) => getNpcLocation(npc, 1200, day)).filter((loc) => loc.map === "tavern");
      expect(new Set(locations.map((loc) => `${loc.x}:${loc.y}`)).size).toBe(locations.length);
    }
    expect(seen.size).toBe(14);
    expect(cardPlayersForDay(15,0)).not.toEqual(cardPlayersForDay(1,1));
  });
});

describe("regras do duelo de cartas", () => {
  const card = (duel, owner, id) => [...duel[owner].deck,...duel[owner].hand].find((item) => item.id === id);
  function putInHand(duel, owner, id) {
    const picked = card(duel,owner,id);
    duel[owner].deck = duel[owner].deck.filter((item) => item !== picked);
    if (!duel[owner].hand.includes(picked)) duel[owner].hand.push(picked);
    return picked;
  }
  it("protege turnos, exige sacrificio e impede ataques ao invocar", () => {
    const duel = createCardDuel(themeDeck("aves"),themeDeck("aves"),() => 0.5);
    const boss = putInHand(duel,"p1","aves:m0");
    expect(performCardAction(duel,"p2",{type:"end"}).ok).toBe(false);
    expect(performCardAction(duel,"p1",{type:"summon",uid:boss.uid}).ok).toBe(false);
    const grunt = putInHand(duel,"p1","aves:m8");
    expect(performCardAction(duel,"p1",{type:"summon",uid:grunt.uid}).ok).toBe(true);
    performCardAction(duel,"p1",{type:"battle"});
    expect(performCardAction(duel,"p1",{type:"attack",index:0,target:"direct"}).ok).toBe(false);
    performCardAction(duel,"p1",{type:"end"}); performCardAction(duel,"p2",{type:"end"});
    expect(performCardAction(duel,"p1",{type:"summon",uid:boss.uid,target:0}).ok).toBe(true);
    expect(duel.p1.graveyard.some((item) => item.uid === grunt.uid)).toBe(true);
  });
  it("substituir campo nao acumula bonus e equipamentos so aceitam o subtipo certo", () => {
    const duel = createCardDuel(themeDeck("aves"),themeDeck("fada"));
    const monster = putInHand(duel,"p1","aves:m8");
    performCardAction(duel,"p1",{type:"summon",uid:monster.uid});
    for (let index = 0; index < 2; index++) {
      const field = putInHand(duel,"p1","aves:field");
      performCardAction(duel,"p1",{type:"activate",uid:field.uid});
      expect(cardStats(monster,duel.p1).atk).toBe(2);
    }
    const equip = putInHand(duel,"p1","aves:s1");
    monster.subtype = "agua";
    expect(performCardAction(duel,"p1",{type:"activate",uid:equip.uid,target:0}).ok).toBe(false);
    expect(duel.p1.hand).toContain(equip);
  });
  it("revive apenas monstros e consome a magia ao concluir, nao ao escolher", () => {
    const duel = createCardDuel(themeDeck("lich"),themeDeck("aves"));
    const spell = putInHand(duel,"p1","lich:s2");
    const dead = putInHand(duel,"p1","lich:m8");
    duel.p1.hand = duel.p1.hand.filter((item) => item !== dead); duel.p1.graveyard.push(dead);
    expect(performCardAction(duel,"p1",{type:"activate",uid:spell.uid,target:spell.uid}).ok).toBe(false);
    expect(performCardAction(duel,"p1",{type:"activate",uid:spell.uid,target:dead.uid}).ok).toBe(true);
    expect(duel.p1.monsters[0].hasAttacked).toBe(true);
    expect(duel.p1.graveyard).toContainEqual(expect.objectContaining({uid:spell.uid}));
  });
  it("IA conclui o turno e resolve a armadilha humana sem pular ataques", () => {
    const duel = createCardDuel(themeDeck("inseto"),themeDeck("aves"),() => 0.3);
    const trap = putInHand(duel,"p1","inseto:trap");
    performCardAction(duel,"p1",{type:"set",uid:trap.uid});
    performCardAction(duel,"p1",{type:"end"});
    for (let step = 0; step < 100 && !duel.winner; step++) {
      if (duel.turn === "p1") performCardAction(duel,"p1",{type:"end"});
      else if (duel.state === "trap") resolveCardTrap(duel,true);
      else if (duel.state === "dice") break;
      else {
        const action = nextCardAIAction(duel);
        expect(action).toBeTruthy();
        expect(performCardAction(duel,"p2",action).ok).toBe(true);
      }
    }
    expect(duel.winner || duel.state === "dice").toBeTruthy();
  });
});

describe("interacoes e telas de cartas e jardim", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage",{setItem:vi.fn(),getItem:vi.fn()});
    resetState("pokemon"); phase.set(PHASES.PLAYING); inGameMinutes.set(600); day.set(1);
  });
  afterEach(() => vi.unstubAllGlobals());
  it("abre a loja no balcao e pergunta antes de iniciar o duelo", () => {
    currentMap.set("game_house"); player.set({x:10,y:4,dir:"up"}); interact();
    expect(get(phase)).toBe(PHASES.CARD_SHOP);
    phase.set(PHASES.PLAYING); player.set({x:6,y:4,dir:"down"}); interact();
    expect(get(phase)).toBe(PHASES.DIALOG);
    get(dialogActions)[" "]();
    expect(get(phase)).toBe(PHASES.CARD_DUEL);
    expect(get(cardOpponent).cardTheme).toBeTruthy();
  });
  it("planta e come um fruto com Espaco sem prender o seletor de ferramentas", () => {
    currentMap.set("bug_forest"); player.set({x:27,y:20,dir:"up"});
    currentToolType.set("seed"); eqSeedId.set("pear"); seedStock.set({pear:1}); interact();
    const tree = get(garden).find((item) => item.fruitId === "pear");
    expect(tree.grownAt).toBeGreaterThanOrEqual(3);
    expect(tree.grownAt).toBeLessThanOrEqual(5);
    expect(get(currentToolType)).toBe("rod");
    gardenDay.set(tree.grownAt); interact();
    expect(get(gardenBuffs).some((buff) => buff.id === "pear")).toBe(true);
  });
  it("renderiza loja, colecao e escolha de deck com portraits frontais", () => {
    phase.set(PHASES.CARD_SHOP); inventory.set([{id:"dratini"}]);
    expect(render(CardsModal).body).toContain("Trocar Dratini");
    money.set(2000); buyDeck(false,() => 0);
    phase.set(PHASES.CARD_COLLECTION);
    expect(render(CardsModal).body).toContain("Cartas e Decks");
    cardOpponent.set({id:"card_aves",name:"Ari",cardTheme:"aves"}); phase.set(PHASES.CARD_DUEL);
    expect(render(CardsModal).body).toContain("Duelo com Ari");
    const face = render(CardFace,{props:{card:cardById("aves:m0"),mode:"pokemon"}}).body;
    expect(face).toContain("Moltres Chefe");
    expect(face).toContain("/assets/portraits/0146.png");
  });
  it("tem 251 portraits frontais locais, nao vazios, de 56 pixels", () => {
    expect(Object.keys(pokemonNames)).toHaveLength(251);
    for (const id of Object.keys(pokemonNames)) {
      const portrait = PNG.sync.read(readFileSync(new URL(`../../public/assets/portraits/${id}.png`,import.meta.url)));
      expect([portrait.width,portrait.height]).toEqual([56,56]);
      expect(portrait.data.some((value,index) => index % 4 === 3 && value > 0)).toBe(true);
    }
  });
});