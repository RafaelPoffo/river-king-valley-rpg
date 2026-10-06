import { get } from "svelte/store";
import { cardCollection, cardDecks, cardTradeUsed, money, inventory, gameMode } from "./stores.js";
import { ALL_CARDS, CARD_THEMES, DECK_SIZE, RARE_CARDS, cardById, themeDeck, themeById } from "./cardCatalog.js";

export function addCards(ids) {
  cardCollection.update((owned) => {
    const next = { ...owned };
    for (const id of ids) if (cardById(id)) next[id] = (next[id] || 0) + 1;
    return next;
  });
}

export function validateDeck(ids, collection = get(cardCollection)) {
  if (ids.length !== DECK_SIZE) return false;
  const counts = {};
  return ids.every((id) => {
    counts[id] = (counts[id] || 0) + 1;
    return !!cardById(id) && counts[id] <= (collection[id] || 0);
  });
}

export function buyDeck(trade = false, random = Math.random) {
  const fishId = get(gameMode) === "pokemon" ? "dratini" : "tilapia_dourada";
  const fishIndex = get(inventory).findIndex((fish) => fish.id === fishId);
  if (trade && (get(cardTradeUsed) || get(cardDecks).length || fishIndex < 0)) return { ok:false, message:"A troca esta disponivel apenas antes do primeiro deck, com a captura certa." };
  if (!trade && get(money) < 2000) return { ok:false, message:"Um deck custa 2000." };
  const theme = CARD_THEMES[Math.floor(random() * CARD_THEMES.length)];
  if (trade) inventory.update((items) => items.filter((_,index) => index !== fishIndex));
  else money.update((amount) => amount - 2000);
  cardTradeUsed.set(true);
  const cards = themeDeck(theme.id);
  addCards(cards);
  const deck = { id:`deck-${get(cardDecks).length + 1}`, name:theme.name, themeId:theme.id, cards };
  cardDecks.update((decks) => [...decks, deck]);
  return { ok:true, deck, message:`Deck recebido: ${theme.name} (${DECK_SIZE} cartas).` };
}

export function buySingleCard(id) {
  const card = ALL_CARDS.find((item) => item.id === id);
  const price = card?.price || (card?.isBoss ? 5000 : 2500);
  if (!card || get(money) < price) return { ok:false, message:`Esta carta custa ${price}.` };
  money.update((amount) => amount - price);
  addCards([id]);
  return { ok:true, message:`Carta adquirida: ${card.name}.` };
}

export function saveDeck(id, cards, name) {
  if (!validateDeck(cards)) return { ok:false, message:`Escolha exatamente ${DECK_SIZE} cartas que voce possui.` };
  if (!get(cardDecks).some((deck) => deck.id === id)) return { ok:false, message:"Deck nao encontrado." };
  cardDecks.update((decks) => decks.map((deck) => deck.id === id ? { ...deck, name:name.trim().slice(0,30) || themeById(deck.themeId).name, cards:[...cards] } : deck));
  return { ok:true, message:"Deck salvo." };
}

export function grantRareCard(source, random = Math.random) {
  const choices = RARE_CARDS.filter((card) => card.source === source);
  const roll = random();
  let threshold = 0;
  for (const card of choices) {
    threshold += card.chance;
    if (roll < threshold) { addCards([card.id]); return card; }
  }
  return null;
}