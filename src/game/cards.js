import { get } from "svelte/store";
import { cardCollection, cardDecks, cardTradeUsed, cardChampionship, money, inventory, gameMode } from "./stores.js";
import {
  ALL_CARDS, CARD_THEMES, DECK_SIZE, DECK_PRICE, BASIC_CARD_PRICE, RARE_CARDS,
  cardById, themeDeck, themeById, isBasicMonster, lockedDeckIds, BASIC_SHOP_CARDS,
} from "./cardCatalog.js";

export function addCards(ids) {
  cardCollection.update((owned) => {
    const next = { ...owned };
    for (const id of ids) if (cardById(id)) next[id] = (next[id] || 0) + 1;
    return next;
  });
}

function countIds(ids) {
  const counts = {};
  for (const id of ids) counts[id] = (counts[id] || 0) + 1;
  return counts;
}

function sameLocked(original, next) {
  const first = countIds(lockedDeckIds(original));
  const second = countIds(lockedDeckIds(next));
  const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
  return [...keys].every((key) => first[key] === second[key]);
}

export function validateDeck(ids, collection = get(cardCollection), original = null) {
  if (ids.length !== DECK_SIZE) return false;
  const counts = {};
  const ownedOk = ids.every((id) => {
    counts[id] = (counts[id] || 0) + 1;
    return !!cardById(id) && counts[id] <= (collection[id] || 0);
  });
  if (!ownedOk) return false;
  if (original) return sameLocked(original, ids);
  return true;
}

export function buyDeck(trade = false, themeId = null, random = Math.random) {
  if (typeof themeId === "function") {
    random = themeId;
    themeId = null;
  }
  const fishId = get(gameMode) === "pokemon" ? "dratini" : "tilapia_dourada";
  const fishIndex = get(inventory).findIndex((fish) => fish.id === fishId);
  if (trade && (get(cardTradeUsed) || get(cardDecks).length || fishIndex < 0)) {
    return { ok: false, message: "A troca esta disponivel apenas antes do primeiro deck, com a captura certa." };
  }
  if (!trade && get(money) < DECK_PRICE) return { ok: false, message: `Um deck custa ${DECK_PRICE}.` };
  const theme = themeById(themeId) || CARD_THEMES[Math.floor(random() * CARD_THEMES.length)];
  if (!theme) return { ok: false, message: "Deck indisponivel." };
  if (get(cardDecks).some((deck) => deck.themeId === theme.id)) {
    return { ok: false, message: `Voce ja tem o ${theme.name}.` };
  }
  if (trade) inventory.update((items) => items.filter((_, index) => index !== fishIndex));
  else money.update((amount) => amount - DECK_PRICE);
  cardTradeUsed.set(true);
  const cards = themeDeck(theme.id);
  addCards(cards);
  const deck = { id: `deck-${theme.id}`, name: theme.name, themeId: theme.id, cards };
  cardDecks.update((decks) => [...decks, deck]);
  return { ok: true, deck, message: `Deck recebido: ${theme.name} (${DECK_SIZE} cartas).` };
}

export function buySingleCard(id) {
  const card = BASIC_SHOP_CARDS.find((item) => item.id === id) || ALL_CARDS.find((item) => item.id === id);
  if (!card || card.type !== "monster" || !isBasicMonster(card)) {
    return { ok: false, message: "So vendemos cartas de pokemon basico." };
  }
  const price = card.price || BASIC_CARD_PRICE;
  if (get(money) < price) return { ok: false, message: `Esta carta custa ${price}.` };
  money.update((amount) => amount - price);
  addCards([card.id]);
  return { ok: true, message: `Carta adquirida: ${card.name}.` };
}

export function saveDeck(id, cards, name) {
  const current = get(cardDecks).find((deck) => deck.id === id);
  if (!current) return { ok: false, message: "Deck nao encontrado." };
  if (!validateDeck(cards, get(cardCollection), current.cards)) {
    return { ok: false, message: `So e possivel trocar pokemon basicos. O deck precisa de ${DECK_SIZE} cartas suas.` };
  }
  cardDecks.update((decks) => decks.map((deck) => deck.id === id
    ? { ...deck, name: name.trim().slice(0, 30) || themeById(deck.themeId).name, cards: [...cards] }
    : deck));
  return { ok: true, message: "Deck salvo." };
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

export function grantChampionshipPrize(random = Math.random) {
  const basics = BASIC_SHOP_CARDS;
  const picks = [];
  for (let index = 0; index < 4; index++) {
    picks.push(basics[Math.floor(random() * basics.length)].id);
  }
  addCards(picks);
  money.update((amount) => amount + 1000);
  return picks.map((id) => cardById(id));
}

export function grantThemeDeck(themeId) {
  const theme = themeById(themeId);
  if (!theme) return { ok: false, message: "Deck indisponivel." };
  const cards = themeDeck(theme.id);
  addCards(cards);
  if (!get(cardDecks).some((deck) => deck.themeId === theme.id)) {
    cardDecks.update((decks) => [...decks, { id: `deck-${theme.id}`, name: theme.name, themeId: theme.id, cards }]);
    return { ok: true, deck: true, message: `Deck chefe recebido: ${theme.name}.` };
  }
  return { ok: true, deck: false, message: `Carta chefe adicionada ao ${theme.name}.` };
}

export function tradeBasicCard(giveId, receiveId) {
  const give = cardById(giveId);
  const receive = cardById(receiveId);
  if (!give || !receive || !isBasicMonster(give) || !isBasicMonster(receive)) {
    return { ok: false, message: "So trocamos pokemon basicos." };
  }
  if ((get(cardCollection)[giveId] || 0) < 1) return { ok: false, message: "Voce nao tem essa carta." };
  cardCollection.update((owned) => {
    const next = { ...owned, [giveId]: owned[giveId] - 1 };
    if (next[giveId] <= 0) delete next[giveId];
    return next;
  });
  addCards([receiveId]);
  return { ok: true, message: `Trocou ${give.name} por ${receive.name}.` };
}

export function championshipState(dayNum, season = 0) {
  const saved = get(cardChampionship);
  const key = `${season}:${dayNum}`;
  if (saved?.dayKey === key) return saved;
  return { dayKey: key, wins: 0, claimed: false, opponents: [] };
}
