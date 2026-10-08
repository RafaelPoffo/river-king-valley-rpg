import { CARD_THEMES } from "../cardCatalog.js";

export const CARD_NPC_THEMES = CARD_THEMES.map((theme) => theme.id);
const CARD_NPC_NAMES = {
  agua: "Marina das Mares",
  fogo: "Bruno Chama",
  planta: "Ivy Folha",
  eletrico: "Theo Volt",
  psiquico: "Ciro da Mente",
  lutador: "Rony Soco",
  inseto: "Bia Vespa",
  fantasma: "Noa Espectro",
  dragao: "Dora Drake",
  voador: "Ari das Asas",
  pedra: "Rocky Rocha",
  normal: "Nando Comum",
  lendas_gelo: "Neve Artica",
  lendas_fogo: "Magma das Lendas",
  lendas_raio: "Raio Lendario",
  lendas_mistico: "Elo Celeste",
};
const CARD_NPC_GENDER = {
  agua: "f", fogo: "m", planta: "f", eletrico: "m", psiquico: "m", lutador: "m",
  inseto: "f", fantasma: "m", dragao: "f", voador: "m", pedra: "m", normal: "m",
  lendas_gelo: "f", lendas_fogo: "m", lendas_raio: "m", lendas_mistico: "f",
};
export const CARD_SEATS = [
  { x: 6, y: 5 }, { x: 9, y: 5 }, { x: 6, y: 8 }, { x: 9, y: 8 },
  { x: 4, y: 5 }, { x: 11, y: 5 }, { x: 4, y: 8 }, { x: 11, y: 8 },
];
export const CARD_VISITOR_SEATS = [
  { x: 2, y: 4 }, { x: 3, y: 2 }, { x: 13, y: 2 }, { x: 12, y: 9 }, { x: 2, y: 9 }, { x: 13, y: 4 },
];
export const CARD_CHAMPIONSHIP_DAY = 15;
export const CARD_EVENT_DAYS = [7, 15, 22];

export function isCardEventDay(today) {
  return CARD_EVENT_DAYS.includes(today);
}

export function cardTableCount(today) {
  if (today === CARD_CHAMPIONSHIP_DAY) return 6;
  if (isCardEventDay(today)) return 7;
  return 4;
}

export function cardPlayersForDay(today, season = 0) {
  const count = cardTableCount(today);
  const start = ((season * 31 + today) * 7) % CARD_NPC_THEMES.length;
  const list = Array.from({ length: count }, (_, index) => CARD_NPC_THEMES[(start + index) % CARD_NPC_THEMES.length]);
  if (isCardEventDay(today) && !list.some((theme) => theme.startsWith("lendas_"))) {
    list[list.length - 1] = CARD_NPC_THEMES[12 + ((season + today) % 4)];
  }
  return list;
}

const lines = (a, b, c, d) => ({
  dialogNormal: a,
  dialogTavern: b,
  friendLines: [c, d],
});

export const INITIAL_VILLAGERS = [
  {
    id: "veteran",
    name: "Capitão Thomas",
    gender: "m",
    personality: "marujo ríspido e leal",
    utility: "leva o barco ao alto-mar do Norte e dá dicas de peixes raros",
    role: "fisher",
    freq: "always",
    homeX: 18,
    homeY: 15,
    cycle: [
      { from: 6, to: 12, map: "village", x: 18, y: 15 },
      { from: 12, to: 18, map: "village", x: 17, y: 15 },
    ],
    birthday: { season: 1, day: 8 },
    taste: "sea",
    likes: ["garoupa", "robalo", "lapras", "seel"],
    dislikes: ["magikarp", "lambari"],
    present: { baits: { sardinha_alto_mar: 2 } },
    ...lines(
      "O meu barco aguenta até as correntes de inverno. Quando as docas estiverem prontas, vamos para o Norte.",
      "Uma rodada de grogue para comemorar a pescaria do Norte!",
      "Você tem mão boa pro mar. Já pensou em ir comigo pro alto-mar do Norte?",
      "Velho amigo! Guardo as melhores rotas do oceano gelado pra você.",
    ),
  },
  {
    id: "carpenter",
    name: "Mestre Gino",
    gender: "m",
    personality: "artesão prático, fala grosso e mede tudo duas vezes",
    utility: "vende construções e dá desconto de amigo na oficina",
    role: "crafter",
    freq: "often",
    homeX: 34,
    homeY: 8,
    cycle: [
      { from: 6, to: 11, map: "village", x: 34, y: 8 },
      { from: 11, to: 18, map: "carpenter_shop", x: 4, y: 5 },
    ],
    birthday: { season: 2, day: 3 },
    taste: "river",
    likes: ["tilapia", "truta", "psyduck"],
    dislikes: ["baiacu", "qwilfish"],
    present: { baits: { isca_metalica: 2 } },
    ...lines(
      "Precisa de melhorias no píer? Passe na minha oficina. Madeira de lei, do jeito antigo.",
      "A madeira de lei é a melhor para cascos de barco.",
      "Seus peixes de rio dão um ótimo almoço na oficina!",
      "Pra você, faço preço de amigo em qualquer obra.",
    ),
  },
  {
    id: "anna",
    name: "Ana a Cozinheira",
    gender: "f",
    personality: "calorosa, tagarela e orgulhosa da sopa",
    utility: "cozinha pratos com bônus de pesca",
    role: "cook",
    freq: "always",
    homeX: 16,
    homeY: 12,
    cycle: [
      { from: 6, to: 11, map: "village", x: 16, y: 12 },
      { from: 11, to: 18, map: "tavern", x: 5, y: 5 },
    ],
    birthday: { season: 0, day: 6 },
    taste: "quality",
    likes: ["salmão", "lapras", "cloyster"],
    dislikes: ["magikarp", "lata"],
    present: { baits: { massa_pao: 4 } },
    ...lines(
      "Os peixes frescos vão direto para a minha sopa. Traga algo de verdade, não esses ossos de rio.",
      "Hoje o ensopado de lula está uma delícia!",
      "Seus peixes deixam minha sopa famosa na vila!",
      "Você é da família. Cozinho seus pratos pela metade do preço.",
    ),
  },
  {
    id: "old_joe",
    name: "Velho Joe",
    gender: "m",
    personality: "sábio resmungão, guarda lendas da água",
    utility: "guia a lenda do Rei do Rio e empresta minhocas",
    role: "sage",
    freq: "rare",
    homeX: 8,
    homeY: 12,
    cycle: [
      { from: 6, to: 14, map: "village", x: 8, y: 12 },
      { from: 14, to: 18, map: "hut_old", x: 3, y: 4 },
    ],
    birthday: { season: 3, day: 12 },
    taste: "rare",
    likes: ["rei_do_rio", "suicune", "dratini"],
    dislikes: ["bota", "poke_bota"],
    present: { baits: { isca_brilhante: 1 } },
    ...lines(
      "No meu tempo, pescávamos monstros de verdade com as mãos...",
      "Ah... As histórias antigas nunca morrem.",
      "Hm... Você não é como os outros. Tenho uma história pra te contar.",
      "Só confio a lenda do Rei do Rio a você.",
    ),
  },
  {
    id: "bird_guide",
    name: "Leo das Aves",
    gender: "m",
    personality: "observador calmo, fala baixo para não assustar os pássaros",
    utility: "ensina o banco de observação e a sorte das aves",
    role: "guide",
    freq: "always",
    homeMap: "bug_forest",
    homeX: 8,
    homeY: 3,
    tavernX: 2,
    tavernY: 5,
    birthday: { season: 0, day: 11 },
    taste: "river",
    likes: ["truta", "marill"],
    dislikes: ["tentacool"],
    present: { baits: { minhoca: 3 } },
    ...lines(
      "Use o banco ao norte para observar aves. Comuns dão 1 de sorte, diferentes dão 2 e raras dão 3. O limite diário é 10.",
      "Aves raras são visitas excepcionais. Explore toda a copa; cada observação ajuda na pesca.",
      "Você já tem olhar de observador. Volte ao banco quando o vento mudar.",
      "Pra você eu aponto o ninho mais quieto da floresta.",
    ),
  },
  {
    id: "bug_guide",
    name: "Bento do Bosque",
    gender: "m",
    personality: "caçador de insetos animado, conta vantagem de cada espécie",
    utility: "explica o campeonato de insetos da clareira",
    role: "guide",
    freq: "always",
    homeMap: "bug_forest",
    homeX: 12,
    homeY: 8,
    tavernX: 6,
    tavernY: 5,
    birthday: { season: 1, day: 2 },
    taste: "quality",
    likes: ["heracross", "pinsir"],
    dislikes: ["magikarp"],
    present: { baits: { massa_pao: 2 } },
    ...lines(
      "A floresta muda todo dia. Os insetos somam 18 pontos; leve pelo menos três a Joe Bug.",
      "Um inseto forte não vence sozinho. Escolha um trio equilibrado; o campeonato final é no dia 15.",
      "Seu trio já tem cara de finalista.",
      "Quando for a final, eu aposto em você.",
    ),
  },
  {
    id: "garden_guide",
    name: "Flora Jardineira",
    gender: "f",
    personality: "gentil e paciente, trata cada muda como visita",
    utility: "ensina o jardim, sementes e frutos",
    role: "guide",
    freq: "always",
    homeMap: "bug_forest",
    homeX: 23,
    homeY: 18,
    tavernX: 8,
    tavernY: 5,
    birthday: { season: 0, day: 4 },
    taste: "river",
    likes: ["poliwag", "wooper"],
    dislikes: ["qwilfish"],
    present: { baits: { minhoca: 4 } },
    ...lines(
      "O jardim fica ao leste. Equipe uma semente no seletor e plante com Espaço diante de um canteiro.",
      "Árvores e novos frutos levam 3 a 5 dias. As vezes um visitante de planta recarrega o jardim.",
      "Suas mudas estão vivas. Isso alegra qualquer estação.",
      "Trouxe uma semente extra. Cuide dela como se fosse sua.",
    ),
  },
  {
    id: "fishing_guide",
    name: "Nina Pescadora",
    gender: "f",
    personality: "direta, competitiva e apaixonada por iscas",
    utility: "ensina varas, iscas e a mira; oferece missões de pesca",
    role: "fisher",
    freq: "always",
    homeX: 11,
    homeY: 15,
    cycle: [
      { from: 6, to: 11, map: "village", x: 11, y: 15 },
      { from: 11, to: 18, map: "village", x: 10, y: 15 },
    ],
    tavernX: 10,
    tavernY: 5,
    birthday: { season: 2, day: 9 },
    taste: "sea",
    likes: ["anchova", "staryu", "chinchou"],
    dislikes: ["bota", "poke_lata"],
    present: { baits: { camarao_vivo: 2 } },
    ...lines(
      "Varas melhores aguentam peixes mais fortes. Mire na distância certa e fisgue na área clara. A rede funciona na margem!",
      "Estações, horários e profundidades mudam o que morde. Presentes fazem amizades.",
      "Você já lança como gente grande. Quer uma isca que eu mesma misturo?",
      "Se precisar de vara nova, fale comigo. Tenho um desafio pra isso.",
    ),
  },
  {
    id: "river_fisher",
    name: "Seu Nuno",
    gender: "m",
    personality: "pescador de rio, conta vantagem e reclama da ponte",
    utility: "troca peixes de rio por iscas e fala do píer",
    role: "fisher",
    freq: "home",
    homeX: 7,
    homeY: 15,
    cycle: [
      { from: 6, to: 18, map: "village", x: 7, y: 15 },
    ],
    birthday: { season: 3, day: 5 },
    taste: "river",
    likes: ["lambari", "truta", "magikarp", "poliwag"],
    dislikes: ["garoupa", "tentacool"],
    present: { baits: { isca_rio: 2 } },
    ...lines(
      "O rio do norte é meu escritório. Só não gosto quando as sombras dos peixes passam por cima da ponte.",
      "Na taverna eu só falo de linha e boia. O mar que fique com o Thomas.",
      "Esse rio ainda esconde um presente pra quem tem paciência.",
      "Toma esta isca de rio. Ela chama o que nada contra a corrente.",
    ),
  },
  {
    id: "card_seller",
    name: "Ivo Jornaleiro",
    gender: "m",
    personality: "comerciante formal, coleciona fofocas e cartas",
    utility: "vende decks, cartas básicas e organiza o campeonato",
    role: "merchant",
    freq: "always",
    homeMap: "game_house",
    homeX: 11,
    homeY: 2,
    tavernX: 13,
    tavernY: 5,
    birthday: { season: 2, day: 14 },
    taste: "rare",
    likes: ["dratini", "tilapia_dourada", "corsola"],
    dislikes: ["magikarp"],
    present: { cards: ["shop:0129"] },
    ...lines(
      "Vendo decks temáticos por 4000 e cartas de pokémon básico. No dia 15 tem campeonato. Nos dias 7 e 22 a casa enche.",
      "Quatro duelistas por dia; nos eventos a casa recebe lendas. Elas duelam, mas nunca entregam o lendário.",
      "Você já tem cara de colecionador. Guarde as básicas, elas abrem trocas.",
      "Se me trouxer um peixe raro, talvez eu abra o estoque de trás do balcão.",
    ),
  },
  ...CARD_NPC_THEMES.map((theme, index) => ({
    id: `card_${theme}`,
    name: CARD_NPC_NAMES[theme] || `Mestre ${theme}`,
    gender: CARD_NPC_GENDER[theme] || "m",
    personality: theme.startsWith("lendas_") ? "duelista lenda, orgulhoso do deck raro" : `duelista do deck ${CARD_THEMES[index].name}`,
    utility: "duela na casa dos jogos",
    role: theme.startsWith("lendas_") ? "legend" : "duelist",
    cardTheme: theme,
    freq: "always",
    taste: index % 2 ? "river" : "sea",
    likes: [],
    dislikes: [],
    homeMap: "game_house",
    birthday: { season: index % 4, day: 2 + (index % 12) },
    dialogNormal: `Meu ${CARD_THEMES[index].name} está pronto. Evolua na linha certa; lendários pedem sacrifício.`,
    dialogTavern: "No dia 15 o campeonato reúne os mestres. Quem vence leva cartas básicas, nunca as lendas.",
    friendLines: [
      `Seu jogo está melhor. Ainda assim, o ${CARD_THEMES[index].name} é o meu orgulho.`,
      "Depois de tantas partidas, posso te contar um segredo do meu baralho.",
    ],
  })),
];

for (const npc of INITIAL_VILLAGERS) {
  if (!npc.friendLines) npc.friendLines = [npc.dialogNormal, `${npc.dialogTavern} Obrigado pelos presentes!`];
  if (!npc.likes) npc.likes = [];
  if (!npc.dislikes) npc.dislikes = [];
}

export const FRIENDSHIP = {
  pointsPerHeart: 3,
  maxHearts: 10,
  lovedGift: 3,
  likedGift: 1,
  dailyTalk: 1,
  carpenterDiscount: 0.1,
  annaDishDiscount: 0.5,
  perkHearts: { ...Object.fromEntries(INITIAL_VILLAGERS.map((npc) => [npc.id, 3])), veteran: 5, carpenter: 5, anna: 5, old_joe: 3 },
};

export const TASTE_LABELS = {
  sea: "peixes do mar",
  river: "peixes de rio",
  quality: "peixes de 3 estrelas ou mais",
  rare: "peixes muito raros",
};

function cycleSpot(npc, hour) {
  if (!npc.cycle) return null;
  return npc.cycle.find((slot) => hour >= slot.from && hour < slot.to) || null;
}

export function getNpcLocation(npc, mins, dayNum, season = 0) {
  const h = Math.floor(mins / 60);
  const isNightTime = h >= 18 || h < 6;
  const cardSeat = npc.cardTheme ? cardPlayersForDay(dayNum, season).indexOf(npc.cardTheme) : -1;
  if (npc.cardTheme && cardSeat === -1) return { map: "away", x: -1, y: -1 };
  if (isNightTime) {
    let visitsTavern = false;
    if (npc.freq === "always") visitsTavern = true;
    else if (npc.freq === "often" && dayNum % 2 === 0) visitsTavern = true;
    else if (npc.freq === "rare" && dayNum % 4 === 0) visitsTavern = true;
    if (visitsTavern) {
      if (npc.cardTheme) return { map: "tavern", x: [3, 6, 9, 13, 8, 11][cardSeat], y: 2 };
      if (npc.tavernX !== undefined) return { map: "tavern", x: npc.tavernX, y: npc.tavernY };
      if (npc.id === "anna") return { map: "tavern", x: 4, y: 5 };
      if (npc.id === "veteran") return { map: "tavern", x: 11, y: 5 };
      if (npc.id === "carpenter") return { map: "tavern", x: 11, y: 3 };
      if (npc.id === "old_joe") return { map: "tavern", x: 4, y: 3 };
      return { map: "tavern", x: 6, y: 5 };
    }
  }
  if (npc.cardTheme) return { map: "game_house", ...CARD_SEATS[cardSeat] };
  const spot = cycleSpot(npc, h);
  if (spot) return { map: spot.map, x: spot.x, y: spot.y };
  return { map: npc.homeMap || "village", x: npc.homeX, y: npc.homeY };
}
