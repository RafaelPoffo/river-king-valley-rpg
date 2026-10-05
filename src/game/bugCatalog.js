const ARCHETYPES = {
  bruiser: { name: "Impacto", icon: "💥" },
  guardian: { name: "Casca", icon: "🛡️" },
  agile: { name: "Ágil", icon: "⚡" },
  tactician: { name: "Tático", icon: "🎯" },
  balanced: { name: "Versátil", icon: "🔄" },
  lucky: { name: "Sorte", icon: "🍀" },
  momentum: { name: "Embalo", icon: "🏃" },
  trickster: { name: "Trapaça", icon: "🃏" },
  anchor: { name: "Âncora", icon: "🪨" },
  underdog: { name: "Azarão", icon: "🌱" },
};

export const BUG_ARCHETYPE_LINES = {
  bruiser: "ganha força nas investidas",
  guardian: "aguenta melhor os empurrões",
  agile: "se recupera de uma jogada ruim",
  tactician: "cresce durante a disputa",
  balanced: "mantém um ritmo consistente",
  lucky: "às vezes surpreende com sorte",
  momentum: "fica mais forte ao ganhar embalo",
  trickster: "aproveita as brechas do rival",
  anchor: "é difícil de tirar do lugar",
  underdog: "luta melhor contra rivais fortes",
};

const STRENGTH_POINTS = [0, 2, 4, 5, 7, 9];
const pointsFor = (strength, index) => Math.max(2, STRENGTH_POINTS[strength] - (index % 7 === 0 ? 1 : 0));

const commonRows = [
  [1, "🐜", "Formiga Operária", 1], [2, "🐜", "Formiga Soldado", 3, "bruiser"],
  [3, "🐜", "Saúva Aríete", 2], [4, "🐜", "Formiga-de-Fogo", 4],
  [5, "🪲", "Besouro Hércules", 5, "bruiser"], [6, "🪲", "Besouro Rinoceronte", 5],
  [7, "🪲", "Rola-Bosta Blindado", 3], [8, "🪲", "Escaravelho Solar", 4],
  [9, "🐞", "Joaninha Rubra", 1, "lucky"], [10, "🪲", "Besouro Bombardeiro", 3],
  [11, "🪲", "Besouro-Tigre", 3], [12, "🪲", "Maria Fedida", 4],
  [13, "🪲", "Vagalume Fantasma", 2, "trickster"], [14, "🦗", "Gafanhoto Canhão", 3],
  [15, "🦗", "Grilo de Ferro", 2], [16, "🦗", "Esperança Esmeralda", 2],
  [17, "🦗", "Paquinha Escavadora", 3], [18, "🐛", "Bicho-Pau Ninja", 2, "anchor"],
  [19, "🐛", "Bicho-Folha Furtivo", 1], [20, "🦗", "Louva-a-Deus Samurai", 5, "tactician"],
  [21, "🪳", "Barata Cascuda", 3], [22, "🪳", "Cupim Mandíbula", 2],
  [23, "🐛", "Tesourinha Pinça", 2], [24, "🐛", "Traça Prateada", 1],
  [25, "🐝", "Abelha Operária", 2], [26, "🐝", "Mamangava Tanque", 4],
  [27, "🐝", "Vespa Caçadora", 5], [28, "🐝", "Marimbondo Trovão", 3],
  [29, "🦋", "Borboleta Monarca", 1, "underdog"], [30, "🦋", "Mariposa Atlas", 3],
  [31, "🐛", "Lagarta Mandarová", 3], [32, "🐛", "Lagarta-Cachorrinho", 2],
  [33, "🪰", "Mosca Samurai", 2], [34, "🪰", "Mutuca Brutamontes", 3],
  [35, "🦟", "Pernilongo Veloz", 1, "agile"], [36, "🦟", "Libélula Lâmina", 3],
  [37, "🦟", "Pernilongo do Jaraguá", 2], [38, "🪰", "Cigarra Sônica", 3],
  [39, "🐛", "Cigarrinha Saltadora", 2], [40, "🐛", "Pulgão Gladiador", 1],
  [41, "🕷️", "Aranha-Lobo", 3], [42, "🕷️", "Caranguejeira Titã", 5, "guardian"],
  [43, "🕷️", "Aranha-Saltadora", 2], [44, "🦂", "Escorpião Imperial", 5],
  [45, "🐛", "Centopeia Relâmpago", 4], [46, "🐛", "Piolho-de-Cobra", 3],
  [47, "🕷️", "Carrapato Muralha", 2], [48, "🕷️", "Ácaro Berserker", 1, "momentum"],
  [49, "🦐", "Tatuzinho-de-Jardim", 3], [50, "🕷️", "Opilião Pernalta", 2, "balanced"],
  [51, "🪲", "Gorgulho Lanceiro", 2, "momentum"], [52, "🐜", "Formiga Mandíbula", 3, "bruiser"],
  [53, "🦗", "Grilo Oráculo", 2, "lucky"], [54, "🐛", "Lagarta Couraçada", 3, "anchor"],
  [55, "🕷️", "Aranha Trapaceira", 3, "trickster"], [56, "🪲", "Besouro Âncora", 4, "guardian"],
  [57, "🐞", "Joaninha Cometa", 2, "agile"], [58, "🦗", "Gafanhoto Crescente", 3, "momentum"],
  [59, "🪳", "Barata Sobrevivente", 2, "underdog"], [60, "🦂", "Pseudoescorpião Pinça", 3, "tactician"],
  [61, "🐛", "Centopeia de Pedra", 4, "anchor"], [62, "🕷️", "Aranha da Sorte", 2, "lucky"],
  [63, "🪲", "Besouro Malabarista", 3, "balanced"], [64, "🐝", "Vespa Emboscadora", 4, "trickster"],
  [65, "🐛", "Milípede Azarão", 3, "underdog"],
];

export const COMMON_BUGS = commonRows.map(([id, emoji, name, strength, archetypeId]) => ({
  id: `bug_${id}`,
  name,
  emoji,
  strength,
  points: pointsFor(strength, id),
  archetypeId: archetypeId || Object.keys(ARCHETYPES)[(id + strength) % 10],
  portrait: null,
}));

const pokemonRows = [
  ["0010", "Caterpie", 1], ["0011", "Metapod", 2], ["0012", "Butterfree", 3],
  ["0013", "Weedle", 1], ["0014", "Kakuna", 2], ["0015", "Beedrill", 3],
  ["0046", "Paras", 2], ["0047", "Parasect", 4], ["0048", "Venonat", 2],
  ["0049", "Venomoth", 3], ["0123", "Scyther", 5], ["0127", "Pinsir", 5],
  ["0165", "Ledyba", 1], ["0166", "Ledian", 3], ["0167", "Spinarak", 2],
  ["0168", "Ariados", 4], ["0193", "Yanma", 3], ["0204", "Pineco", 2],
  ["0205", "Forretress", 4], ["0212", "Scizor", 5], ["0213", "Shuckle", 4],
  ["0214", "Heracross", 5],
];

const pmdPortrait = (dexId) => `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${dexId}/Normal.png`;
const pixelSprite = (dexId) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${Number(dexId)}.gif`;
const commonProfileIndexes = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
  55, 41, 42, 43,
];

export const POKEMON_BUGS = pokemonRows.map(([dexId, name], index) => {
  const commonProfile = COMMON_BUGS[commonProfileIndexes[index]];
  return {
    id: `pokemon_bug_${dexId}`,
    dexId,
    name,
    emoji: "🐛",
    strength: commonProfile.strength,
    points: commonProfile.points,
    archetypeId: commonProfile.archetypeId,
    portrait: pmdPortrait(dexId),
    pixelSprite: pixelSprite(dexId),
  };
});

export const BUG_ARCHETYPES = ARCHETYPES;
export const bugsForMode = (mode) => mode === "pokemon" ? POKEMON_BUGS : COMMON_BUGS;