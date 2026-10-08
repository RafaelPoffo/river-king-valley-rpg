import { get } from "svelte/store";
import {
  CARD_VISITOR_SEATS,
  INITIAL_VILLAGERS,
  getNpcLocation,
  isCardEventDay,
} from "./data/npcs.js";
import { BASIC_SHOP_CARDS, cardName } from "./cardCatalog.js";
import { dailyRandom } from "./worldCreatures.js";
import { day, seasonIndex, gameMode, cardCollection, inventory } from "./stores.js";
import { dayKey } from "./tournament.js";
import { questHintFor } from "./quests.js";

const TRAVELER_POOL = [
  { name: "Ema Viajante", sprite: "traveler_f", gender: "f", pokemon: "0025", pokemonName: "Pikachu", taste: "quality", likes: ["pikachu"], dialog: "Caminhamos juntas desde o porto. No modo Pokémon ela nunca se afasta." },
  { name: "Rui Caminhante", sprite: "traveler_m", gender: "m", pokemon: "0007", pokemonName: "Squirtle", taste: "sea", likes: ["squirtle"], dialog: "Meu parceiro adora água fria. No inverno ele fica insuportável de tão feliz." },
  { name: "Nati das Rotas", sprite: "traveler_f", gender: "f", pokemon: "0016", pokemonName: "Pidgey", taste: "river", likes: ["pidgey"], dialog: "Só passamos quando o vento está bom. Não fique no caminho do meu pássaro." },
  { name: "Dino Errante", sprite: "traveler_m", gender: "m", pokemon: "0129", pokemonName: "Magikarp", taste: "river", likes: ["magikarp"], dialog: "Ele ainda não evoluiu. Um dia o rio inteiro vai lembrar deste salto." },
];

const VISITOR_LINES = [
  "Eu vim até esta loja de cartas tão distante pois aqui tem cartas muito raras.",
  "Cruzar o vale inteiro valeu a pena. Dizem que Ivo esconde básicos que ninguém mais vende.",
  "Não vim duelar. Só quero completar a coleção antes do inverno.",
  "As mesas estão barulhentas hoje, mas eu só troco. Sem duelo.",
];

export function isBirthday(npc, season = get(seasonIndex), today = get(day)) {
  return npc.birthday?.season === season && npc.birthday?.day === today;
}

export function travelersForDay(today = get(day), season = get(seasonIndex), mode = get(gameMode)) {
  const random = dailyRandom(`travelers:${season}:${today}`);
  if (random() > 0.42) return [];
  const count = random() < 0.3 ? 2 : 1;
  const spots = [
    { x: 8, y: 8, pokeX: 9, pokeY: 8 },
    { x: 26, y: 12, pokeX: 27, pokeY: 12 },
  ];
  return Array.from({ length: count }, (_, index) => {
    const base = TRAVELER_POOL[Math.floor(random() * TRAVELER_POOL.length)];
    const spot = spots[index];
    return {
      ...base,
      id: `traveler_${today}_${index}`,
      role: "traveler",
      freq: "rare",
      homeMap: "village",
      homeX: spot.x,
      homeY: spot.y,
      dialogNormal: base.dialog,
      dialogTavern: "Viajante também precisa de sopa.",
      friendLines: [base.dialog, "Você já é quase da estrada."],
      companion: mode === "pokemon" ? { dexId: base.pokemon, x: spot.pokeX, y: spot.pokeY, name: base.pokemonName } : null,
    };
  });
}

export function cardVisitorsForDay(today = get(day), season = get(seasonIndex), mode = get(gameMode)) {
  const random = dailyRandom(`cardvis:${season}:${today}`);
  const extra = isCardEventDay(today) ? 2 : 0;
  const count = 2 + Math.floor(random() * 5) + extra;
  const basics = BASIC_SHOP_CARDS;
  return Array.from({ length: Math.min(count, CARD_VISITOR_SEATS.length) }, (_, index) => {
    const want = basics[Math.floor(random() * basics.length)];
    let offer = basics[Math.floor(random() * basics.length)];
    if (offer.id === want.id) offer = basics[(basics.indexOf(want) + 3) % basics.length];
    const rareFish = mode === "pokemon" ? ["corsola", "qwilfish", "lapras", "dratini"] : ["garoupa", "robalo", "tilapia_dourada", "anchova"];
    const fishId = rareFish[Math.floor(random() * rareFish.length)];
    const seat = CARD_VISITOR_SEATS[index];
    const female = index % 2 === 0;
    const name = female ? `Visitante ${["Lia", "Cris", "Bia", "Nara"][index % 4]}` : `Visitante ${["Otto", "Gil", "Ruy", "Milo"][index % 4]}`;
    return {
      id: `shop_visitor_${index}`,
      name,
      gender: female ? "f" : "m",
      sprite: female ? "visitor_f" : "visitor_m",
      role: "shop_visitor",
      freq: "always",
      homeMap: "game_house",
      homeX: seat.x,
      homeY: seat.y,
      taste: "rare",
      likes: [fishId],
      wantCard: want.id,
      offerCard: offer.id,
      wantFish: fishId,
      wantName: cardName(want, mode),
      offerName: cardName(offer, mode),
      dialogNormal: `${VISITOR_LINES[index % VISITOR_LINES.length]} Eu queria tanto uma carta de ${cardName(want, mode)}.`,
      dialogTavern: "Na taverna eu só falo de cartas.",
      friendLines: ["Se você tiver essa carta, eu troco na hora.", "Depois desta troca, volto para casa feliz."],
    };
  });
}

export function extrasForDay(today = get(day), season = get(seasonIndex), mode = get(gameMode)) {
  return [...travelersForDay(today, season, mode), ...cardVisitorsForDay(today, season, mode)];
}

export function extraOccupantAt(mapName, x, y, mins, dayNum, season, mode) {
  const hour = Math.floor(mins / 60);
  if (hour >= 18 || hour < 6) return null;
  for (const npc of extrasForDay(dayNum, season, mode)) {
    if ((npc.homeMap || "village") === mapName && npc.homeX === x && npc.homeY === y) return npc;
    if (npc.companion && npc.companion.x === x && npc.companion.y === y) return npc;
  }
  return null;
}

export function actorAt(mapName, x, y, mins, dayNum, season, mode, villagers = INITIAL_VILLAGERS) {
  const villager = villagers.find((npc) => {
    const loc = getNpcLocation(npc, mins, dayNum, season);
    return loc.map === mapName && loc.x === x && loc.y === y;
  });
  if (villager) return { npc: villager, loc: getNpcLocation(villager, mins, dayNum, season) };
  const extra = extraOccupantAt(mapName, x, y, mins, dayNum, season, mode);
  if (!extra) return null;
  return { npc: extra, loc: { map: extra.homeMap || "village", x: extra.homeX, y: extra.homeY } };
}

export function pickSpokenLine(npc, atTavern) {
  const variants = atTavern
    ? [npc.dialogTavern, npc.friendLines?.[0]].filter(Boolean)
    : [npc.dialogNormal, npc.friendLines?.[0], npc.utility && `Se precisar: ${npc.utility}.`].filter(Boolean);
  const key = dayKey(get(seasonIndex), get(day));
  const random = dailyRandom(`line:${npc.id}:${key}`);
  return variants[Math.floor(random() * variants.length)] || npc.dialogNormal;
}

export function spokenLine(npc, atTavern) {
  if (isBirthday(npc)) {
    return `Hoje é meu aniversário! ${npc.gender === "f" ? "Uma pescadora" : "Um pescador"} de verdade nunca esquece a data.`;
  }
  const hint = questHintFor(npc.id);
  if (hint) return hint;
  return pickSpokenLine(npc, atTavern);
}

export function playerHasCard(id) {
  return (get(cardCollection)[id] || 0) > 0;
}

export function playerHasFish(id) {
  return get(inventory).findIndex((item) => item.id === id);
}
