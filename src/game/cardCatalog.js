import pokemonNames from "./data/pokemonNames.json";

const TYPE_LABELS = {
  agua: "água",
  fogo: "fogo",
  planta: "planta",
  eletrico: "elétrico",
  psiquico: "psíquico",
  lutador: "lutador",
  inseto: "inseto",
  fantasma: "fantasma",
  dragao: "dragão",
  voador: "voador",
  pedra: "pedra",
  normal: "normal",
  gelo: "gelo",
  veneno: "veneno",
  terra: "terra",
  fada: "fada",
  aco: "aço",
  sombrio: "sombrio",
};

const EFFECT_TEXT = {
  field: "Campo: +1 ATK e +1 DEF aos monstros deste tipo.",
  equip_atk: "Equipa um monstro deste tipo com +1 ATK. Só um equipamento por monstro.",
  equip_def: "Equipa um monstro deste tipo com +1 DEF. Só um equipamento por monstro.",
  heal: "Recupera 1 HP.",
  burn: "Causa 1 de dano ao HP do rival.",
  flip_pos: "Troca a postura de um monstro entre ATK e DEF.",
  weaken: "Um monstro perde 1 ATK e 1 DEF.",
  boost_atk: "Um monstro ganha +2 ATK até o fim da sua rodada.",
  strip_equip: "Remove o equipamento de um monstro.",
  strip_field: "Remove a carta de campo do rival.",
  strip_trap: "Remove uma armadilha do campo inimigo.",
  remove_traps: "Remove todas as armadilhas do rival.",
  destroy_11: "Destroi um monstro 1/1 do rival.",
  doom: "O monstro inimigo e destruido apos 2 rodadas.",
  destroy_monster: "Destroi um monstro do rival.",
  all_defense: "Vira todos os monstros do rival para defesa.",
  guard: "Um monstro ganha +2 DEF ate o fim da rodada do oponente.",
  destroy_all_11: "Destroi todos os monstros 1/1 do rival.",
  destroy_def: "Destroi todos os monstros em defesa, dos dois lados.",
  destroy_5atk: "Destroi um monstro com 5 de ataque ou mais.",
  destroy_equipped: "Destroi um monstro que tenha equipamento.",
  silence: "O monstro do rival nao pode atacar por 2 rodadas.",
};

const rawSpecies = [
  [1, "Broto", ["planta", "veneno"], 1, 1, 2],
  [2, "Flor Guerreira", ["planta", "veneno"], 1, 3, 3],
  [3, "Flor Ancestral", ["planta", "veneno"], 4, 4],
  [4, "Filhote de Fogo", ["fogo"], 1, 1, 5],
  [5, "Lanca-chamas", ["fogo"], 3, 1, 6],
  [6, "Dragao de Fogo", ["fogo", "voador"], 5, 3],
  [7, "Pequena Tartaruga", ["água"], 1, 1, 8],
  [8, "Tartaruga de Combate", ["água"], 2, 3, 9],
  [9, "Tartaruga Marinha", ["água"], 4, 5],
  [10, "Lagarta", ["inseto"], 1, 1, 11],
  [11, "Casulo", ["inseto"], 1, 3, 12],
  [12, "Asa Colorida", ["inseto", "voador"], 3, 4],
  [13, "Lagarta Venenosa", ["inseto", "veneno"], 2, 0, 14],
  [14, "Casulo Venenoso", ["inseto", "veneno"], 2, 2, 15],
  [15, "Vespa Assassina", ["inseto", "veneno"], 4, 2],
  [16, "Pombo", ["normal", "voador"], 1, 1, 17],
  [17, "Pombo Maior", ["normal", "voador"], 2, 2, 18],
  [18, "Aguia Real", ["normal", "voador"], 4, 3],
  [19, "Rato", ["normal"], 1, 1, 20],
  [20, "Rato Feroz", ["normal"], 3, 2],
  [21, "Pardal", ["normal", "voador"], 1, 1, 22],
  [22, "Aguia Veloz", ["normal", "voador"], 4, 1],
  [23, "Cobra", ["veneno"], 2, 0, 24],
  [24, "Serpente", ["veneno"], 3, 2],
  [25, "Rato Eletrico", ["elétrico"], 1, 1, 26],
  [26, "Rato Trovão", ["elétrico"], 3, 3],
  [27, "Tatu da Areia", ["terra"], 1, 2, 28],
  [28, "Tatu de Garras", ["terra"], 3, 3],
  [29, "Agulha Rosa", ["veneno"], 1, 1, 30],
  [30, "Espinho Rosa", ["veneno"], 2, 2, 31],
  [31, "Rainha dos Espinhos", ["veneno", "terra"], 3, 4],
  [32, "Agulha Azul", ["veneno"], 1, 1, 33],
  [33, "Espinho Azul", ["veneno"], 3, 1, 34],
  [34, "Rei dos Espinhos", ["veneno", "terra"], 4, 3],
  [35, "Fada das Flores", ["fada"], 1, 2, 36],
  [36, "Rainha Fada", ["fada"], 3, 3],
  [37, "Raposa de Fogo", ["fogo"], 1, 1, 38],
  [38, "Raposa das Nove Caudas", ["fogo"], 4, 2],
  [39, "Balão Cantor", ["normal", "fada"], 1, 2, 40],
  [40, "Balão Enorme", ["normal", "fada"], 2, 4],
  [41, "Morcego", ["veneno", "voador"], 1, 1, 42],
  [42, "Morcego Maior", ["veneno", "voador"], 3, 2, 169],
  [43, "Erva Noturna", ["planta", "veneno"], 1, 1, 44],
  [44, "Flor Doente", ["planta", "veneno"], 2, 2, [45, 182]],
  [45, "Flor Gigante", ["planta", "veneno"], 4, 3],
  [46, "Fungo Parasita", ["inseto", "planta"], 1, 1, 47],
  [47, "Fungo Guerreiro", ["inseto", "planta"], 3, 3],
  [48, "Inseto Peludo", ["inseto", "veneno"], 1, 1, 49],
  [49, "Mariposa Venenosa", ["inseto", "veneno"], 3, 2],
  [50, "Toupeira", ["terra"], 1, 1, 51],
  [51, "Trio da Terra", ["terra"], 3, 3],
  [52, "Gato de Rua", ["normal"], 1, 1, 53],
  [53, "Gato Nobre", ["normal"], 3, 2],
  [54, "Pato Confuso", ["água"], 2, 0, 55],
  [55, "Pato Psiquico", ["água"], 3, 2],
  [56, "Macaco Raivoso", ["lutador"], 2, 0, 57],
  [57, "Macaco Furioso", ["lutador"], 4, 1],
  [58, "Filhote Leal", ["fogo"], 1, 1, 59],
  [59, "Cão Lendario", ["fogo"], 3, 3],
  [60, "Girino", ["água"], 1, 1, 61],
  [61, "Sapo Nadador", ["água"], 3, 2, [62, 186]],
  [62, "Sapo Lutador", ["água", "lutador"], 4, 3],
  [63, "Acolito", ["psíquico"], 1, 1, 64],
  [64, "Feiticeiro", ["psíquico"], 3, 1, 65],
  [65, "Arquimago", ["psíquico"], 5, 3],
  [66, "Aprendiz de Luta", ["lutador"], 2, 1, 67],
  [67, "Lutador", ["lutador"], 3, 2, 68],
  [68, "Campeao", ["lutador"], 4, 4],
  [69, "Carnivora", ["planta", "veneno"], 1, 1, 70],
  [70, "Carnivora Maior", ["planta", "veneno"], 2, 3, 71],
  [71, "Carnivora Real", ["planta", "veneno"], 4, 2],
  [72, "Agua-viva", ["água", "veneno"], 1, 1, 73],
  [73, "Agua-viva Gigante", ["água", "veneno"], 3, 4],
  [77, "Ponei de Fogo", ["fogo"], 2, 1, 78],
  [78, "Cavalo de Fogo", ["fogo"], 4, 2],
  [79, "Vagaroso", ["água", "psíquico"], 1, 2, [80, 199]],
  [80, "Guardião Vagaroso", ["água", "psíquico"], 3, 3],
  [81, "Ima", ["elétrico", "aço"], 1, 1, 82],
  [82, "Ima Triplo", ["elétrico", "aço"], 3, 2],
  [83, "Pato Espadachim", ["normal", "voador"], 2, 2],
  [84, "Avestruz Dupla", ["normal", "voador"], 1, 1, 85],
  [85, "Avestruz Tripla", ["normal", "voador"], 3, 1],
  [86, "Foca", ["água"], 1, 1, 87],
  [87, "Foca Real", ["água", "gelo"], 3, 2],
  [88, "Lodo", ["veneno"], 1, 1, 89],
  [89, "Lodo Vivo", ["veneno"], 3, 2],
  [90, "Concha", ["água"], 0, 1, 91],
  [91, "Concha de Espinhos", ["água", "gelo"], 3, 3],
  [92, "Fumaca", ["fantasma", "veneno"], 1, 1, 93],
  [93, "Espectro", ["fantasma", "veneno"], 3, 1, 94],
  [94, "Rei Fantasma", ["fantasma", "veneno"], 4, 2],
  [95, "Serpente de Pedra", ["pedra", "terra"], 2, 3, 208],
  [96, "Hipnotizador", ["psíquico"], 1, 1, 97],
  [97, "Mestre do Sono", ["psíquico"], 3, 2],
  [98, "Caranguejo", ["água"], 2, 0, 99],
  [99, "Caranguejo Gigante", ["água"], 4, 3],
  [100, "Esfera Eletrica", ["elétrico"], 2, 0, 101],
  [101, "Esfera Explosiva", ["elétrico"], 4, 2],
  [104, "Filhote do Osso", ["terra"], 2, 2, 105],
  [105, "Guardiao do Osso", ["terra"], 3, 3],
  [106, "Chutador", ["lutador"], 2, 2],
  [107, "Soco Rapido", ["lutador"], 2, 2],
  [108, "Lingua Gigante", ["normal"], 2, 2],
  [109, "Gas Venenoso", ["veneno"], 1, 2, 110],
  [110, "Nuvem Dupla", ["veneno"], 3, 3],
  [111, "Rinoceronte", ["terra", "pedra"], 2, 1, 112],
  [112, "Rinoceronte Blindado", ["terra", "pedra"], 3, 4],
  [113, "Ovo da Sorte", ["normal"], 1, 3],
  [114, "Trepadeira", ["planta"], 2, 2],
  [115, "Mãe Guerreira", ["normal"], 3, 2],
  [116, "Cavalo Marinho", ["água"], 1, 1, 117],
  [117, "Dragao Marinho", ["água"], 2, 2, 230],
  [118, "Peixe Dourado", ["água"], 2, 0, 119],
  [119, "Peixe Rei", ["água"], 3, 1],
  [120, "Estrela do Mar", ["água"], 2, 1, 121],
  [121, "Estrela Psiquica", ["água", "psíquico"], 3, 2],
  [122, "Mimo", ["psíquico", "fada"], 2, 3],
  [123, "Foice Verde", ["inseto", "voador"], 3, 1, 212],
  [124, "Dama do Gelo", ["gelo", "psíquico"], 2, 2],
  [125, "Eletrico Veloz", ["elétrico"], 3, 2],
  [126, "Sopro de Fogo", ["fogo"], 3, 2],
  [127, "Besouro de Chifre", ["inseto"], 3, 2],
  [128, "Touro Selvagem", ["normal"], 3, 3],
  [129, "Peixe Saltitante", ["água"], 0, 1, 130],
  [130, "Serpente das Aguas", ["água", "voador"], 4, 3],
  [131, "Canto do Mar", ["água", "gelo"], 2, 3],
  [132, "Massa Amorfa", ["normal"], 2, 2],
  [133, "Raposa Adaptavel", ["normal"], 1, 1, [134, 135, 136, 196, 197]],
  [134, "Raposa das Aguas", ["água"], 2, 3],
  [135, "Raposa Eletrica", ["elétrico"], 3, 2],
  [136, "Raposa Flamejante", ["fogo"], 3, 2],
  [137, "Poligono", ["normal"], 2, 2, 233],
  [138, "Fossil Espiral", ["pedra", "água"], 1, 2, 139],
  [139, "Fossil Espiral Maior", ["pedra", "água"], 2, 3],
  [142, "Fossil Alado", ["pedra", "voador"], 3, 1],
  [143, "Gigante Sonolento", ["normal"], 2, 3],
  [144, "Ave do Gelo", ["gelo", "voador"], 5, 3, null, true],
  [145, "Ave do Trovao", ["elétrico", "voador"], 5, 3, null, true],
  [146, "Ave de Fogo", ["fogo", "voador"], 5, 3, null, true],
  [147, "Serpente Jovem", ["dragão"], 1, 2, 148],
  [148, "Serpente Draconica", ["dragão"], 3, 2, 149],
  [149, "Dragao Ancestral", ["dragão", "voador"], 4, 4],
  [151, "Mito Minimo", ["psíquico"], 4, 4, null, true],
  [152, "Folha Nova", ["planta"], 1, 1, 153],
  [153, "Folha Alta", ["planta"], 2, 2, 154],
  [154, "Flor Real", ["planta"], 4, 4],
  [155, "Faisca", ["fogo"], 2, 0, 156],
  [156, "Chama Media", ["fogo"], 3, 2, 157],
  [157, "Vulcao Vivo", ["fogo"], 5, 3],
  [158, "Jacare Jovem", ["água"], 1, 1, 159],
  [159, "Jacare Bravo", ["água"], 3, 2, 160],
  [160, "Jacare Rei", ["água"], 5, 3],
  [161, "Sentinela", ["normal"], 1, 1, 162],
  [162, "Sentinela Longa", ["normal"], 3, 2],
  [163, "Coruja Noturna", ["normal", "voador"], 1, 1, 164],
  [164, "Coruja Sabia", ["normal", "voador"], 3, 3],
  [165, "Joaninha", ["inseto", "voador"], 1, 1, 166],
  [166, "Joaninha Maior", ["inseto", "voador"], 3, 1],
  [167, "Aranha", ["inseto", "veneno"], 1, 1, 168],
  [168, "Aranha Gigante", ["inseto", "veneno"], 3, 1],
  [169, "Morcego Real", ["veneno", "voador"], 4, 3],
  [170, "Peixe-lanterna", ["água", "elétrico"], 1, 1, 171],
  [171, "Peixe-luz", ["água", "elétrico"], 3, 2],
  [175, "Ovo da Sorte", ["fada"], 0, 1, 176],
  [176, "Anjo Feliz", ["fada", "voador"], 3, 3],
  [177, "Passaro Misto", ["psíquico", "voador"], 1, 1, 178],
  [178, "Passaro Oraculo", ["psíquico", "voador"], 3, 4],
  [179, "Ovelha Eletrica", ["elétrico"], 1, 1, 180],
  [180, "Ovelha Luminosa", ["elétrico"], 2, 2, 181],
  [181, "Carneiro Trovão", ["elétrico"], 3, 3],
  [182, "Flor do Sol", ["planta"], 3, 4],
  [183, "Rato Azul", ["água", "fada"], 2, 2],
  [185, "Arvore Falsa", ["pedra"], 2, 3],
  [186, "Sapo Rei", ["água"], 3, 4],
  [187, "Semente ao Vento", ["planta", "voador"], 1, 1, 188],
  [188, "Folha ao Vento", ["planta", "voador"], 2, 2, 189],
  [189, "Nuvem Floral", ["planta", "voador"], 4, 3],
  [190, "Macaco de Cauda", ["normal"], 3, 2],
  [191, "Semente Seca", ["planta"], 1, 1, 192],
  [192, "Girassol", ["planta"], 3, 2],
  [193, "Libelula", ["inseto", "voador"], 2, 2],
  [194, "Salamandra", ["água", "terra"], 1, 1, 195],
  [195, "Salamandra Maior", ["água", "terra"], 3, 2],
  [196, "Raposa do Sol", ["psíquico"], 3, 2],
  [197, "Raposa da Lua", ["sombrio"], 2, 3],
  [198, "Corvo da Noite", ["sombrio", "voador"], 2, 2],
  [199, "Rei Vagaroso", ["água", "psíquico"], 3, 3],
  [200, "Choro Noturno", ["fantasma"], 2, 1],
  [201, "Simbolo Vivo", ["psíquico"], 2, 2],
  [202, "Saco Paciente", ["psíquico"], 1, 3],
  [203, "Pescoco Longo", ["normal", "psíquico"], 3, 1],
  [204, "Pinha", ["inseto"], 0, 1, 205],
  [205, "Pinha de Aco", ["inseto", "aço"], 1, 3],
  [206, "Serpente Cega", ["normal"], 2, 1],
  [207, "Escorpiao Alado", ["terra", "voador"], 2, 2],
  [208, "Serpente de Aco", ["aço", "terra"], 3, 4],
  [209, "Cao Fada", ["fada"], 2, 0, 210],
  [210, "Cao Fada Maior", ["fada"], 3, 1],
  [211, "Peixe-balão", ["água", "veneno"], 3, 1],
  [212, "Foice de Aco", ["inseto", "aço"], 3, 3],
  [213, "Casco de Seiva", ["inseto", "pedra"], 1, 3],
  [214, "Besouro Heroi", ["inseto", "lutador"], 3, 3],
  [215, "Gato das Sombras", ["sombrio", "gelo"], 2, 1],
  [216, "Filhote de Urso", ["normal"], 1, 1, 217],
  [217, "Urso Pardo", ["normal"], 4, 3],
  [218, "Lava Viva", ["fogo"], 1, 1, 219],
  [219, "Caracol de Magma", ["fogo", "pedra"], 2, 3],
  [220, "Porco da Neve", ["gelo", "terra"], 1, 1, 221],
  [221, "Porco Gigante", ["gelo", "terra"], 3, 2],
  [222, "Coral", ["água", "pedra"], 1, 2],
  [223, "Peixe-jato", ["água"], 2, 1, 224],
  [224, "Polvo-canhão", ["água"], 3, 2],
  [225, "Pinguim Mensageiro", ["gelo", "voador"], 2, 2],
  [226, "Arraia", ["água", "voador"], 2, 3],
  [227, "Ave de Aco", ["aço", "voador"], 3, 3],
  [230, "Rei dos Mares", ["água", "dragão"], 4, 3],
  [231, "Elefante Jovem", ["terra"], 1, 1, 232],
  [232, "Elefante Blindado", ["terra"], 3, 3],
  [233, "Poligono Aprimorado", ["normal"], 3, 3],
  [234, "Cervo de Chifres", ["normal"], 3, 2],
  [235, "Pintor", ["normal"], 2, 3],
  [237, "Girador", ["lutador"], 2, 2],
  [241, "Vaca Leiteira", ["normal"], 3, 3],
  [243, "Fera do Trovao", ["elétrico"], 4, 4, null, true],
  [244, "Fera das Chamas", ["fogo"], 4, 4, null, true],
  [245, "Fera das Aguas", ["água"], 4, 4, null, true],
  [246, "Larva de Pedra", ["pedra", "terra"], 1, 1, 247],
  [247, "Casulo de Pedra", ["pedra", "terra"], 1, 3, 248],
  [248, "Tirano Rochoso", ["pedra", "sombrio"], 4, 4],
  [249, "Guardiao dos Mares", ["psíquico", "voador"], 4, 5, null, true],
  [250, "Ave Arco-iris", ["fogo", "voador"], 4, 5, null, true],
  [251, "Guardiao do Tempo", ["psíquico", "planta"], 4, 4, null, true],
];

const evolvesTo = {};
const evolvesFrom = {};
for (const row of rawSpecies) {
  const [num, , , , , next] = row;
  const dex = String(num).padStart(4, "0");
  if (next == null || next === true) continue;
  const children = (Array.isArray(next) ? next : [next]).map((id) => String(id).padStart(4, "0"));
  evolvesTo[dex] = children;
  for (const child of children) evolvesFrom[child] = dex;
}

function stageOf(dexId) {
  let stage = 1;
  let parent = evolvesFrom[dexId];
  while (parent) {
    stage += 1;
    parent = evolvesFrom[parent];
  }
  return stage;
}

export const SPECIES = Object.fromEntries(rawSpecies.map(([num, normalName, types, atk, def, next, boss]) => {
  const dexId = String(num).padStart(4, "0");
  const stage = stageOf(dexId);
  const isBoss = boss === true;
  const children = evolvesTo[dexId] || [];
  const parent = evolvesFrom[dexId] || null;
  const kind = isBoss ? "lendário" : !parent && !children.length ? "básico" : `fase ${stage}`;
  return [dexId, {
    dexId,
    name: pokemonNames[dexId] || normalName,
    normalName,
    types,
    atk,
    def,
    stage,
    kind,
    isBoss,
    evolvesFrom: parent,
    evolvesTo: children,
  }];
}));

export function pokemonEvolutionInfo(card) {
  const species = SPECIES[card?.dexId] || SPECIES[card];
  if (!species) return { stage: 1, kind: "básico", previous: null, next: [] };
  return {
    stage: species.stage,
    kind: species.kind,
    previous: species.evolvesFrom ? pokemonNames[species.evolvesFrom] : null,
    next: species.evolvesTo.map((id) => ({ dexId: id, name: pokemonNames[id] })),
  };
}

export function pokemonCardStats(card) {
  const species = SPECIES[card?.dexId] || SPECIES[card];
  return species ? { atk: species.atk, def: species.def } : { atk: card?.atk || 0, def: card?.def || 0 };
}

export function isBasicMonster(card) {
  return card?.type === "monster" && card.kind === "básico";
}

export function canNormalSummon(card) {
  return card?.type === "monster" && (card.kind === "básico" || card.kind === "fase 1");
}

const themes = [
  {
    id: "agua", name: "Deck de Blastoise", type: "água", color: "#6cb6d8", fieldName: "Maré Alta",
    monsters: [["0007", 4], ["0098", 2], ["0118", 2], ["0008", 2], ["0131", 1], ["0119", 1], ["0099", 1], ["0009", 1]],
    magics: ["field", "equip_atk", "heal", "flip_pos", "strip_field"],
    traps: ["destroy_monster", "all_defense", "guard", "silence", "weaken"],
    magicNames: ["Maré Alta", "Concha Afiada", "Fonte Serena", "Correnteza", "Vazante"],
    trapNames: ["Gaiola de Coral", "Maré de Escudos", "Couraça", "Ancora", "Espuma Fria"],
  },
  {
    id: "fogo", name: "Deck de Charizard", type: "fogo", color: "#e98969", fieldName: "Caldeira Ardente",
    monsters: [["0004", 4], ["0058", 2], ["0037", 2], ["0005", 2], ["0038", 1], ["0059", 1], ["0126", 1], ["0006", 1]],
    magics: ["field", "equip_atk", "burn", "boost_atk", "strip_equip"],
    traps: ["destroy_monster", "destroy_equipped", "guard", "destroy_5atk", "weaken"],
    magicNames: ["Caldeira Ardente", "Brasa Viva", "Faisca", "Rajada de Fogo", "Fusao"],
    trapNames: ["Cinzas", "Armadilha Incandescente", "Muralha de Magma", "Colapso", "Fumaca"],
  },
  {
    id: "planta", name: "Deck de Venusaur", type: "planta", color: "#92c9a0", fieldName: "Bosque Primordial",
    monsters: [["0001", 4], ["0043", 2], ["0069", 2], ["0002", 2], ["0045", 1], ["0071", 1], ["0114", 1], ["0003", 1]],
    magics: ["field", "equip_def", "heal", "weaken", "strip_trap"],
    traps: ["destroy_all_11", "all_defense", "guard", "destroy_def", "silence"],
    magicNames: ["Bosque Primordial", "Casca Dura", "Seiva", "Esporos", "Poda"],
    trapNames: ["Raizes", "Cipós", "Couraça Verde", "Tempestade de Folhas", "Sono Floral"],
  },
  {
    id: "eletrico", name: "Deck de Ampharos", type: "elétrico", color: "#e6cf68", fieldName: "Usina Antiga",
    monsters: [["0179", 4], ["0025", 2], ["0081", 2], ["0180", 2], ["0026", 1], ["0082", 1], ["0125", 1], ["0181", 1]],
    magics: ["field", "equip_atk", "burn", "destroy_11", "remove_traps"],
    traps: ["destroy_monster", "destroy_all_11", "destroy_5atk", "silence", "weaken"],
    magicNames: ["Usina Antiga", "Bobina", "Choque", "Curto 1/1", "Apagao"],
    trapNames: ["Rede Eletrica", "Sobrecarga", "Raio", "Paralisia", "Estatica"],
  },
  {
    id: "psiquico", name: "Deck de Alakazam", type: "psíquico", color: "#b6a1d8", fieldName: "Observatorio",
    monsters: [["0063", 4], ["0096", 2], ["0079", 2], ["0064", 2], ["0097", 1], ["0080", 1], ["0122", 1], ["0065", 1]],
    magics: ["field", "equip_def", "flip_pos", "doom", "strip_field"],
    traps: ["all_defense", "silence", "guard", "destroy_def", "weaken"],
    magicNames: ["Observatorio", "Barreira Mental", "Confusao", "Premonicao", "Amnesia"],
    trapNames: ["Ilusao", "Transe", "Escudo Psiquico", "Colapso Mental", "Dreno"],
  },
  {
    id: "lutador", name: "Deck de Machamp", type: "lutador", color: "#df9c91", fieldName: "Arena de Sangue",
    monsters: [["0066", 4], ["0056", 2], ["0106", 2], ["0067", 2], ["0057", 1], ["0107", 1], ["0237", 1], ["0068", 1]],
    magics: ["field", "equip_atk", "boost_atk", "flip_pos", "strip_equip"],
    traps: ["destroy_monster", "destroy_5atk", "destroy_equipped", "guard", "all_defense"],
    magicNames: ["Arena de Sangue", "Luvas de Ferro", "Segundo Folego", "Troca de Guarda", "Desarme"],
    trapNames: ["Gancho", "Nocaute", "Contra-golpe", "Guarda Alta", "Queda"],
  },
  {
    id: "inseto", name: "Deck de Beedrill", type: "inseto", color: "#c6d48d", fieldName: "Colmeia Densa",
    monsters: [["0013", 4], ["0046", 2], ["0165", 2], ["0014", 2], ["0047", 1], ["0166", 1], ["0127", 1], ["0015", 1]],
    magics: ["field", "equip_atk", "destroy_11", "burn", "heal"],
    traps: ["destroy_all_11", "destroy_def", "silence", "weaken", "destroy_monster"],
    magicNames: ["Colmeia Densa", "Ferrao", "Picada 1/1", "Veneno", "Mel"],
    trapNames: ["Enxame", "Teia", "Paralisia", "Acido", "Emboscada"],
  },
  {
    id: "fantasma", name: "Deck de Gengar", type: "fantasma", color: "#adb9d7", fieldName: "Cemiterio Etereo",
    monsters: [["0092", 4], ["0200", 2], ["0201", 2], ["0093", 2], ["0202", 1], ["0096", 1], ["0104", 1], ["0094", 1]],
    magics: ["field", "equip_atk", "doom", "strip_trap", "weaken"],
    traps: ["destroy_monster", "silence", "destroy_equipped", "all_defense", "destroy_def"],
    magicNames: ["Cemiterio Etereo", "Toque Frio", "Maldicao", "Exorcismo", "Sussurro"],
    trapNames: ["Assombro", "Prisao Eterea", "Roubo de Alma", "Medo", "Colapso"],
  },
];

// Fix Gengar deck monster counts: 4 gastly, 2 misdreavus, 2 unown, 2 haunter, 1 gengar, 1 wobbuffet, 1 cubone? Need 14.
// I'll replace the broken last entries in the array below when I fix fantasma.

const moreThemes = [
  {
    id: "dragao", name: "Deck de Dragonite", type: "dragão", color: "#eba472", fieldName: "Ninho Ancestral",
    monsters: [["0147", 4], ["0116", 2], ["0129", 2], ["0148", 2], ["0117", 1], ["0130", 1], ["0230", 1], ["0149", 1]],
    magics: ["field", "equip_def", "boost_atk", "heal", "strip_field"],
    traps: ["destroy_5atk", "guard", "destroy_monster", "silence", "weaken"],
    magicNames: ["Ninho Ancestral", "Escamas", "Voo Draconico", "Sopro Vital", "Vendaval"],
    trapNames: ["Muralha de Escamas", "Couraça", "Bafo", "Medo Ancestral", "Pressao"],
  },
  {
    id: "voador", name: "Deck de Pidgeot", type: "voador", color: "#83c9e8", fieldName: "Ceu Aberto",
    monsters: [["0016", 4], ["0021", 2], ["0163", 2], ["0017", 2], ["0022", 1], ["0164", 1], ["0083", 1], ["0018", 1]],
    magics: ["field", "equip_atk", "flip_pos", "strip_trap", "burn"],
    traps: ["all_defense", "destroy_def", "silence", "guard", "destroy_monster"],
    magicNames: ["Ceu Aberto", "Plumas de Aco", "Rajada", "Vento Cortante", "Pico"],
    trapNames: ["Turbilhao", "Queda Livre", "Calmaria", "Asas", "Garras"],
  },
  {
    id: "pedra", name: "Deck de Tyranitar", type: "pedra", color: "#c4b08a", fieldName: "Serra Rochosa",
    monsters: [["0246", 4], ["0111", 2], ["0095", 2], ["0247", 2], ["0112", 1], ["0208", 1], ["0185", 1], ["0248", 1]],
    magics: ["field", "equip_def", "weaken", "strip_equip", "heal"],
    traps: ["guard", "destroy_5atk", "destroy_def", "destroy_equipped", "all_defense"],
    magicNames: ["Serra Rochosa", "Couraça Mineral", "Erosao", "Desarme", "Fonte"],
    trapNames: ["Avalanche", "Desabamento", "Rachadura", "Armadilha de Pedra", "Muralha"],
  },
  {
    id: "normal", name: "Deck de Kangaskhan", type: "normal", color: "#e3d17e", fieldName: "Planicie Aberta",
    monsters: [["0161", 4], ["0019", 2], ["0052", 2], ["0162", 2], ["0020", 1], ["0053", 1], ["0143", 1], ["0115", 1]],
    magics: ["field", "equip_atk", "heal", "flip_pos", "strip_field"],
    traps: ["destroy_monster", "guard", "all_defense", "weaken", "silence"],
    magicNames: ["Planicie Aberta", "Garras", "Racao", "Troca", "Poeira"],
    trapNames: ["Cerca", "Guarda", "Deitar", "Cansaco", "Trava"],
  },
  {
    id: "lendas_gelo", name: "Deck de Articuno", type: "gelo", color: "#9ecfdc", fieldName: "Tundra Gelida",
    monsters: [["0086", 4], ["0220", 2], ["0225", 2], ["0087", 2], ["0221", 1], ["0124", 1], ["0222", 1], ["0144", 1]],
    magics: ["field", "equip_def", "doom", "weaken", "strip_field"],
    traps: ["silence", "all_defense", "guard", "destroy_monster", "destroy_def"],
    magicNames: ["Tundra Gelida", "Cristal", "Congelamento", "Geada", "Degelo"],
    trapNames: ["Nevasca", "Gelo Fino", "Muralha de Gelo", "Estalactite", "Rachadura"],
  },
  {
    id: "lendas_fogo", name: "Deck de Moltres", type: "fogo", color: "#d88754", fieldName: "Ceu em Chamas",
    monsters: [["0155", 4], ["0218", 2], ["0077", 2], ["0156", 2], ["0219", 1], ["0078", 1], ["0126", 1], ["0146", 1]],
    magics: ["field", "equip_atk", "burn", "boost_atk", "remove_traps"],
    traps: ["destroy_equipped", "destroy_5atk", "destroy_monster", "weaken", "guard"],
    magicNames: ["Ceu em Chamas", "Pena de Fogo", "Labareda", "Explosao", "Fumaca"],
    trapNames: ["Brasa Oculta", "Colapso", "Chama", "Cinzas", "Couraça"],
  },
  {
    id: "lendas_raio", name: "Deck de Zapdos", type: "elétrico", color: "#eac665", fieldName: "Tempestade",
    monsters: [["0170", 4], ["0100", 2], ["0081", 2], ["0171", 2], ["0101", 1], ["0082", 1], ["0125", 1], ["0145", 1]],
    magics: ["field", "equip_atk", "burn", "destroy_11", "strip_trap"],
    traps: ["destroy_all_11", "silence", "destroy_5atk", "destroy_monster", "weaken"],
    magicNames: ["Tempestade", "Raio", "Trovão", "Centelha", "Descarga"],
    trapNames: ["Relampago", "Paralisia", "Choque", "Jaula", "Estatica"],
  },
  {
    id: "lendas_mistico", name: "Deck de Lugia", type: "psíquico", color: "#aa95cf", fieldName: "Reino Celeste",
    monsters: [["0177", 4], ["0175", 2], ["0133", 2], ["0178", 2], ["0176", 1], ["0196", 1], ["0251", 1], ["0249", 1]],
    magics: ["field", "equip_def", "heal", "doom", "strip_field"],
    traps: ["guard", "silence", "all_defense", "destroy_def", "destroy_monster"],
    magicNames: ["Reino Celeste", "Aura", "Bencao", "Destino", "Vento Sagrado"],
    trapNames: ["Selo", "Calmaria", "Asas", "Juizo", "Prisao"],
  },
];

function monsterCopies(theme) {
  return theme.monsters.filter(([, count]) => count > 0);
}

export const CARD_THEMES = [...themes, ...moreThemes];

function monsterCard(theme, dexId) {
  const species = SPECIES[dexId];
  return {
    id: `${theme.id}:${dexId}`,
    themeId: theme.id,
    type: "monster",
    name: species.normalName,
    dexId,
    types: species.types,
    subtype: theme.type,
    atk: species.atk,
    def: species.def,
    stage: species.stage,
    kind: species.kind,
    isBoss: species.isBoss,
    evolvesFrom: species.evolvesFrom,
    evolvesTo: species.evolvesTo,
    rarity: species.isBoss ? "rare" : "common",
    desc: species.isBoss
      ? "Lendario. Exige o sacrificio de um monstro para invocar."
      : species.kind === "básico" || species.kind === "fase 1"
        ? `Monstro ${species.kind}. Uma invocacao por turno.`
        : `So entra em campo evoluindo de ${pokemonNames[species.evolvesFrom]}.`,
  };
}

const builtCatalog = CARD_THEMES.flatMap((theme) => {
  const monsters = monsterCopies(theme).map(([dexId]) => monsterCard(theme, dexId));
  const spells = theme.magics.map((effect, index) => ({
    id: effect === "field" ? `${theme.id}:field` : `${theme.id}:s${index}`,
    themeId: theme.id,
    type: effect === "field" ? "field" : "spell",
    name: theme.magicNames[index],
    subtype: theme.type,
    effect,
    copies: 1,
    desc: EFFECT_TEXT[effect],
  }));
  const traps = theme.traps.map((effect, index) => ({
    id: `${theme.id}:t${index}`,
    themeId: theme.id,
    type: "trap",
    name: theme.trapNames[index],
    subtype: theme.type,
    effect,
    copies: 1,
    desc: EFFECT_TEXT[effect],
  }));
  return [...monsters, ...spells, ...traps];
});

export const RARE_CARDS = [
  ["sea_guardian", "Guardiao das Mares", "0249", "água", "sea", 0.008, 14000],
  ["sea_song", "Cancao do Oceano", "0131", "água", "sea", 0.045, 6000],
  ["forest_guardian", "Guardiao do Bosque", "0251", "planta", "bugs", 0.1, 12000],
  ["steel_champion", "Campeao de Aco", "0212", "inseto", "bugs", 0.4, 8000],
  ["ancient_dragon", "Dragao das Lendas", "0149", "dragão", "quest", 0.7, 10000],
  ["sky_legend", "Lenda dos Ceus", "0250", "voador", "quest", 0.15, 14000],
].map(([id, name, dexId, subtype, source, chance, price]) => {
  const species = SPECIES[dexId];
  return {
    id: `rare:${id}`, name, dexId, subtype, source, chance, price,
    type: "monster", types: species.types, atk: species.atk, def: species.def,
    stage: species.stage, kind: species.kind, isBoss: species.isBoss,
    evolvesFrom: species.evolvesFrom, evolvesTo: species.evolvesTo,
    rarity: "rare", desc: species.isBoss ? "Carta rara. Exige um sacrificio para invocar." : "Carta rara.",
  };
});

export const ALL_CARDS = [...builtCatalog, ...RARE_CARDS];
export const DECK_SIZE = 24;
export const TRAP_SLOTS = 2;
export const DECK_PRICE = 4000;
export const BASIC_CARD_PRICE = 500;
export const TYPE_LABELS_MAP = TYPE_LABELS;

export const cardById = (id) => ALL_CARDS.find((card) => card.id === id);
export const themeById = (id) => CARD_THEMES.find((theme) => theme.id === id);

export function themeDeck(id) {
  const theme = themeById(id);
  if (!theme) return [];
  const monsters = monsterCopies(theme).flatMap(([dexId, count]) => Array(count).fill(`${theme.id}:${dexId}`));
  const spells = theme.magics.map((effect, index) => effect === "field" ? `${theme.id}:field` : `${theme.id}:s${index}`);
  const traps = theme.traps.map((_, index) => `${theme.id}:t${index}`);
  return [...monsters, ...spells, ...traps];
}

export const BASIC_SHOP_CARDS = Object.values(SPECIES)
  .filter((species) => species.kind === "básico")
  .map((species) => ({
    id: `shop:${species.dexId}`,
    themeId: "shop",
    type: "monster",
    name: species.normalName,
    dexId: species.dexId,
    types: species.types,
    subtype: species.types[0],
    atk: species.atk,
    def: species.def,
    stage: 1,
    kind: "básico",
    isBoss: false,
    evolvesFrom: null,
    evolvesTo: [],
    rarity: "common",
    price: BASIC_CARD_PRICE,
    desc: "Pokemon basico. Pode trocar esta carta em qualquer deck.",
  }));

ALL_CARDS.push(...BASIC_SHOP_CARDS);

export function cardName(card, mode) {
  if (mode === "pokemon" && card.type === "monster") {
    return `${pokemonNames[card.dexId] || card.name}${card.isBoss ? " Chefe" : ""}`;
  }
  return card.name;
}

export const cardPortrait = (card) => card?.type === "monster" && pokemonNames[card.dexId] ? `/assets/portraits/${card.dexId}.png` : null;

export function kindLabel(card) {
  return card?.kind || "básico";
}

export function matchesBonusType(card, bonusType) {
  return !!card?.types?.includes(bonusType);
}

export function lockedDeckIds(cards) {
  return cards.filter((id) => !isBasicMonster(cardById(id)));
}
