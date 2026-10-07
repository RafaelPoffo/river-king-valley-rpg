export const CARD_NPC_THEMES = ["aves", "fada", "rei", "mago", "lich", "orc", "dragao", "fera", "demonio", "pirata", "gelo", "ninja", "inseto", "espirito", "iniciais", "colonia", "dragoes", "psiquicos", "eletricos", "ramificacoes"];
const CARD_NPC_NAMES = ["Ari", "Mel", "Arthur", "Ciro", "Noa", "Bruno", "Dora", "Leo", "Dante", "Mara", "Neve", "Kai", "Bia", "Elo", "Luca", "Nina", "Ravi", "Tess", "Theo", "Yara"];
export const CARD_SEATS = [{ x: 6, y: 5 }, { x: 9, y: 5 }, { x: 6, y: 8 }, { x: 9, y: 8 }];
export function cardPlayersForDay(today, season = 0) {
  return Array.from({ length: 4 }, (_, index) => CARD_NPC_THEMES[((season * 15 + today) * 4 + index) % CARD_NPC_THEMES.length]);
}

export const INITIAL_VILLAGERS = [
  {
    id: "veteran",
    name: "Capitão Thomas",
    freq: "always",
    homeX: 18,
    homeY: 15,
    dialogNormal: "O mar está bravo hoje. O barco deve estar firme.",
    dialogTavern: "Uma rodada de grogue para comemorar a pescaria!",
    taste: "sea",
    friendLines: [
      "Você tem mão boa pro mar. Já pensou em ir comigo pro alto-mar?",
      "Velho amigo! Guardo as melhores histórias do oceano pra você.",
    ],
  },
  {
    id: "carpenter",
    name: "Mestre Gema",
    freq: "often",
    homeX: 34,
    homeY: 8,
    dialogNormal: "Precisa de melhorias nas docas? Passe na minha oficina.",
    dialogTavern: "A madeira de lei é a melhor para cascos de barco.",
    taste: "river",
    friendLines: [
      "Seus peixes de rio dão um ótimo almoço na oficina!",
      "Pra você, faço preço de amigo em qualquer obra.",
    ],
  },
  {
    id: "anna",
    name: "Ana a Cozinheira",
    freq: "always",
    homeX: 16,
    homeY: 12,
    dialogNormal: "Os peixes frescos vão direto para a minha sopa.",
    dialogTavern: "Hoje o ensopado de lula está uma delícia!",
    taste: "quality",
    friendLines: [
      "Seus peixes deixam minha sopa famosa na vila!",
      "Você é da família. Cozinho seus pratos pela metade do preço.",
    ],
  },
  {
    id: "old_joe",
    name: "Velho Joe",
    freq: "rare",
    homeX: 8,
    homeY: 12,
    dialogNormal:
      "No meu tempo, pescávamos monstros de verdade com as mãos...",
    dialogTavern: "Ah... As histórias antigas nunca morrem.",
    taste: "rare",
    friendLines: [
      "Hm... Você não é como os outros. Tenho uma história pra te contar.",
      "Só confio a lenda do Rei do Rio a você.",
    ],
  },
  { id: "bird_guide", name: "Lia das Aves", freq: "always", homeMap: "bug_forest", homeX: 4, homeY: 3, taste: "river", tavernX: 2, tavernY: 5,
    dialogNormal: "Use o banco ao norte para observar aves. Comuns dao 1 de sorte, diferentes dao 2 e raras dao 3. O limite diario e 10, mas nem todo dia tem aves suficientes!",
    dialogTavern: "Aves raras sao visitas excepcionais. Explore toda a copa; cada observacao ajuda na pesca e na disputa de insetos." },
  { id: "bug_guide", name: "Bento do Bosque", freq: "always", homeMap: "bug_forest", homeX: 12, homeY: 8, taste: "quality", tavernX: 6, tavernY: 5,
    dialogNormal: "A floresta muda todo dia. Os insetos somam 18 pontos; leve pelo menos tres a Joe Bug. A ordem do trio e o jeito de lutar de cada inseto importam!",
    dialogTavern: "Um inseto forte nao vence sozinho. Escolha um trio equilibrado; o campeonato final acontece no dia 15." },
  { id: "garden_guide", name: "Flora Jardineira", freq: "always", homeMap: "bug_forest", homeX: 23, homeY: 18, taste: "river", tavernX: 8, tavernY: 5,
    dialogNormal: "O jardim fica ao leste. Equipe uma semente no seletor lateral e plante com Espaco diante de um canteiro. Uma arvore de cada especie, no maximo cinco!",
    dialogTavern: "Arvores e novos frutos levam 3 a 5 dias. Coma o fruto com Espaco para receber o bonus do dia. As vezes um visitante de planta recarrega o jardim inteiro." },
  { id: "fishing_guide", name: "Nina Pescadora", freq: "always", homeX: 11, homeY: 15, taste: "sea", tavernX: 10, tavernY: 5,
    dialogNormal: "Varas melhores aguentam peixes mais fortes. Escolha a isca, mire na distancia certa e fisgue quando a barra passar pela area clara. A rede funciona na margem!",
    dialogTavern: "Diferentes estacoes, horarios e profundidades trazem peixes novos. Presentes fazem amizades; cozinhar e observar aves ajudam na pescaria." },
  { id: "card_seller", name: "Ivo Jornaleiro", freq: "always", homeMap: "game_house", homeX: 11, homeY: 2, taste: "rare", tavernX: 13, tavernY: 5,
    dialogNormal: "Eu sempre quis um dragao. Vendo decks por 2000 e cartas avulsas para colecionadores.", dialogTavern: "A casa dos jogos recebe quatro jogadores diferentes por dia. Cada um prefere um deck." },
  ...CARD_NPC_THEMES.map((theme, index) => ({
    id: `card_${theme}`, name: CARD_NPC_NAMES[index] || `Mestre ${theme}`,
    cardTheme: theme, freq: "always", taste: index % 2 ? "river" : "sea", homeMap: "game_house",
    dialogNormal: "Vamos duelar? Escolha um de seus decks. Cada rodada permite invocar um monstro; o chefe exige um sacrificio.",
    dialogTavern: "Troque uma carta por turno, prepare suas armadilhas e so ataque com monstros que ja estavam em campo.",
  })),
];

for (const npc of INITIAL_VILLAGERS) {
  if (!npc.friendLines) npc.friendLines = [npc.dialogNormal, `${npc.dialogTavern} Obrigado pelos presentes! Trouxe sementes para seu jardim.`];
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

export function getNpcLocation(npc, mins, dayNum, season = 0) {
  const h = Math.floor(mins / 60);
  const isNightTime = h >= 18 || h < 6;
  const cardSeat = npc.cardTheme ? cardPlayersForDay(dayNum,season).indexOf(npc.cardTheme) : -1;
  if (npc.cardTheme && cardSeat === -1) return { map: "away", x: -1, y: -1 };
  if (isNightTime) {
    let visitsTavern = false;
    if (npc.freq === "always") visitsTavern = true;
    else if (npc.freq === "often" && dayNum % 2 === 0) visitsTavern = true;
    else if (npc.freq === "rare" && dayNum % 4 === 0) visitsTavern = true;
    if (visitsTavern) {
      if (npc.cardTheme) return { map: "tavern", x: [3, 6, 9, 13][cardSeat], y: 2 };
      if (npc.tavernX !== undefined) return { map: "tavern", x: npc.tavernX, y: npc.tavernY };
      if (npc.id === "anna") return { map: "tavern", x: 4, y: 5 };
      if (npc.id === "veteran") return { map: "tavern", x: 11, y: 5 };
      if (npc.id === "carpenter") return { map: "tavern", x: 11, y: 3 };
      if (npc.id === "old_joe") return { map: "tavern", x: 4, y: 3 };
      return { map: "tavern", x: 6, y: 5 };
    }
  }
  if (npc.cardTheme) return { map: "game_house", ...CARD_SEATS[cardSeat] };
  return { map: npc.homeMap || "village", x: npc.homeX, y: npc.homeY };
}
