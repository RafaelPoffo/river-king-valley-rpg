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

export function bugFansForDay(today = get(day), season = get(seasonIndex)) {
  const random = dailyRandom(`bugfans:${season}:${today}`);
  const fans = [
    { name: "Tina das Antenas", sprite: "visitor_f", line: "Olhe o ritmo, não a força. Um inseto calmo vence um agressivo apressado." },
    { name: "Guto da Mesa", sprite: "visitor_m", line: "Sorte de observação ajuda nas jogadas. Joe não admite, mas todo mundo sente." },
    { name: "Bela do Pólen", sprite: "traveler_f", line: "Três insetos, duas vitórias. Se o primeiro cair, não entre em pânico." },
    { name: "Nico do Tronco", sprite: "traveler_m", line: "Eu às vezes entro no campeonato. Meu time é fraco, mas eu ensino o ritmo." },
  ];
  const count = 2 + Math.floor(random() * 2);
  const seats = [{ x: 27, y: 11 }, { x: 31, y: 11 }, { x: 28, y: 15 }, { x: 30, y: 15 }];
  return Array.from({ length: count }, (_, index) => {
    const fan = fans[(Math.floor(random() * fans.length) + index) % fans.length];
    const seat = seats[index];
    return {
      id: `bug_fan_${index}`,
      name: fan.name,
      sprite: fan.sprite,
      role: "bug_fan",
      freq: "always",
      homeMap: "bug_forest",
      homeX: seat.x,
      homeY: seat.y,
      dialogNormal: fan.line,
      dialogTavern: "Na taverna eu só falo de insetos.",
      friendLines: [fan.line, "Amanhã eu talvez duelo."],
    };
  });
}

export function shopkeepersForDay() {
  return [
    {
      id: "shopkeep_gear",
      name: "Iara da Loja",
      sprite: "visitor_f",
      role: "shopkeep",
      shop: "gear",
      freq: "always",
      homeMap: "shop_gear",
      homeX: 3,
      homeY: 2,
      dialogNormal: "Varas, redes, iscas e terrários. Fale comigo ou com o balcão.",
      dialogTavern: "Depois do expediente eu só quero sopa.",
      friendLines: ["A ração do pet custa só 10.", "Rede só na beirada, nunca na ponte."],
    },
    {
      id: "shopkeep_museum",
      name: "Curador Eliseu",
      sprite: "traveler_m",
      role: "curator",
      freq: "always",
      homeMap: "shop_bait",
      homeX: 6,
      homeY: 4,
      dialogNormal: "Doe fósseis e relíquias. Pokémon fóssil ganha baralho especial.",
      dialogTavern: "Museu de dia, taverna de noite.",
      friendLines: ["Olhe as vitrines. Cada peça tem uma história.", "A rede às vezes traz antiguidades."],
    },
    {
      id: "shopkeep_carpenter",
      name: "Mestre Gino",
      sprite: "traveler_m",
      role: "carpenter",
      freq: "always",
      homeMap: "carpenter_shop",
      homeX: 3,
      homeY: 3,
      dialogNormal: "A ponte da floresta custa 1000 e um dia de trabalho.",
      dialogTavern: "Madeira e cerveja, nessa ordem.",
      friendLines: ["Píer e docas são obras diferentes.", "O barco só atraca nas docas."],
    },
  ];
}

export function festivalFishersForDay(today = get(day), season = get(seasonIndex)) {
  const random = dailyRandom(`festfish:${season}:${today}`);
  return [
    { name: "Dona Lídia", sprite: "visitor_f", x: 10, y: 16 },
    { name: "Seu Bento", sprite: "traveler_m", x: 16, y: 16 },
    { name: "Nando da Praia", sprite: "visitor_m", x: 24, y: 16 },
  ].map((npc, index) => ({
    id: `fest_fisher_${index}`,
    name: npc.name,
    sprite: npc.sprite,
    role: "festival_fisher",
    freq: "always",
    homeMap: "village",
    homeX: npc.x,
    homeY: npc.y,
    dialogNormal: random() < 0.35
      ? "Fisguei um agora! Vou levar à barraca do festival."
      : "Hoje o mar está bonito. Quero o prêmio da avaliação.",
    dialogTavern: "No festival até a taverna enfeita as mesas.",
    friendLines: ["O ancião avalia o melhor peixe.", "Pesque e leve à barraca."],
  }));
}

export function cardOrganizerForDay(today = get(day), season = get(seasonIndex)) {
  if (!isCardEventDay(today)) return [];
  const theme = today === 7 ? "eletrico" : today === 22 ? "fogo" : null;
  const name = today === 7 ? "Festival Elétrico" : today === 22 ? "Festival de Fogo" : "Campeonato das Cartas";
  return [{
    id: "card_organizer",
    name: "Árbitro Lino",
    sprite: "traveler_m",
    role: "card_organizer",
    cardFestival: name,
    cardTheme: theme,
    freq: "always",
    homeMap: "game_house",
    homeX: 8,
    homeY: 3,
    dialogNormal: `Organizo o ${name}. Fale comigo para entrar no torneio.`,
    dialogTavern: "Árbitro também come.",
    friendLines: ["Decks raros só saem de campeonato.", "Hoje as mesas estão temáticas."],
  }];
}

export function extrasForDay(today = get(day), season = get(seasonIndex), mode = get(gameMode)) {
  const festival = extrasFestival(today, season);
  return [
    ...travelersForDay(today, season, mode),
    ...cardVisitorsForDay(today, season, mode),
    ...bugFansForDay(today, season),
    ...shopkeepersForDay(),
    ...cardOrganizerForDay(today, season),
    ...(festival ? festivalFishersForDay(today, season) : []),
  ];
}

function extrasFestival(today, season) {
  return [5, 10, 15].includes(today);
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
