import { get } from "svelte/store";
import { birdLog, birdPopulationDay, birdwatchingLuck, dailyBirds, day, gameMode, seasonIndex } from "./stores.js";

const localBird = (id, name, rarity, emoji, description) => ({
  id,
  name,
  rarity,
  description,
  emoji,
  portrait: null,
  sizeRange: [12, 38],
});

export const COMMON_BIRDS = [
  localBird("pomba", "Pomba", 1, "🕊️", "Uma visitante comum que pousa tranquilamente entre as folhas."),
  localBird("pardal", "Pardal", 1, "🐦", "Pequeno e inquieto, costuma aparecer em bandos."),
  localBird("sabia", "Sabiá-laranjeira", 2, "🐦", "Seu canto melodioso ecoa por toda a floresta."),
  localBird("bem_te_vi", "Bem-te-vi", 2, "🐦", "Curioso e atento, observa o bosque de um galho alto."),
  localBird("coruja", "Coruja-do-mato", 3, "🦉", "Uma presença silenciosa, mais fácil de notar ao entardecer."),
  localBird("tucano", "Tucano-de-bico-verde", 3, "🐦", "Seu bico colorido se destaca entre a copa das árvores."),
  localBird("arara", "Arara-vermelha", 4, "🦜", "Uma ave vistosa que cruza a clareira em raras ocasiões."),
  localBird("aguia", "Águia-real", 5, "🦅", "Uma visitante excepcional que plana muito acima do bosque."),
];

const pokemonRows = [
  ["0016", "Pidgey", 1, "Um Pokémon pássaro dócil que costuma voar em pequenos bandos."],
  ["0017", "Pidgeotto", 2, "Vigia seu território do alto das árvores."],
  ["0018", "Pidgeot", 3, "Suas asas largas cortam o céu da floresta."],
  ["0021", "Spearow", 2, "Pequeno, veloz e sempre atento ao que acontece no chão."],
  ["0022", "Fearow", 3, "Sobrevoa o bosque em círculos largos."],
  ["0083", "Farfetch'd", 3, "Carrega seu talo e prefere clareiras tranquilas."],
  ["0084", "Doduo", 2, "Corre entre as árvores antes de alçar voo."],
  ["0085", "Dodrio", 4, "Três cabeças observam a floresta em direções diferentes."],
  ["0144", "Articuno", 5, "Uma aparição lendária, fria e quase impossível de encontrar."],
  ["0145", "Zapdos", 5, "Uma silhueta elétrica cruza as nuvens em dias raros."],
  ["0146", "Moltres", 5, "Uma ave flamejante que surge como um clarão distante."],
  ["0163", "Hoothoot", 1, "Costuma pousar imóvel em um galho, observando tudo."],
  ["0164", "Noctowl", 2, "Seus olhos atentos enxergam mesmo na penumbra."],
  ["0198", "Murkrow", 3, "Um visitante noturno que se esconde entre as copas."],
  ["0225", "Delibird", 4, "Uma ave incomum que raramente aparece longe das montanhas."],
  ["0227", "Skarmory", 4, "Suas asas metálicas refletem a luz entre os galhos."],
  ["0249", "Lugia", 5, "Uma presença lendária que quase nunca se mostra."],
];

const pmdPortrait = (dexId) => `/assets/portraits/${dexId}.png`;

export const POKEMON_BIRDS = pokemonRows.map(([dexId, name, rarity, description]) => ({
  id: `bird_${dexId}`,
  dexId,
  name,
  rarity,
  description,
  portrait: pmdPortrait(dexId),
  sizeRange: [20, 110],
}));

export const birdsForMode = (mode) => mode === "pokemon" ? POKEMON_BIRDS : COMMON_BIRDS;

function hashRandom(seed) {
  let value = 2166136261;
  for (const character of seed) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

const RARITY_WEIGHTS = [0, 46, 20, 6, 1, 0.15];

export const birdLuckPoints = (rarity) => rarity <= 1 ? 1 : rarity <= 3 ? 2 : 3;

export function birdRarityMultiplier(luck, rarity) {
  const boundedLuck = Math.max(0, Math.min(10, luck));
  const boundedRarity = Math.max(1, Math.min(6, rarity));
  return 1 + boundedLuck * 0.08 * ((boundedRarity - 1) / 5);
}

function chooseSpecies(catalog, random) {
  const weights = catalog.map((bird) => RARITY_WEIGHTS[bird.rarity]);
  let roll = random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let index = 0; index < catalog.length; index++) {
    roll -= weights[index];
    if (roll < 0) return catalog[index];
  }
  return catalog[0];
}

export function generateDailyBirds(key, mode = "normal") {
  const random = hashRandom(`${mode}:${key}`);
  const catalog = birdsForMode(mode);
  const countWeights = [1, 3, 5, 5, 4, 3, 2, 1];
  let roll = random() * countWeights.reduce((sum, weight) => sum + weight, 0);
  let count = 1;
  for (let index = 0; index < countWeights.length; index++) {
    roll -= countWeights[index];
    if (roll < 0) {
      count = index + 1;
      break;
    }
  }
  const available = [...catalog];
  return Array.from({ length: count }, (_, index) => {
    const species = chooseSpecies(available, random);
    available.splice(available.indexOf(species), 1);
    const size = species.sizeRange[0] + Math.floor(random() * (species.sizeRange[1] - species.sizeRange[0] + 1));
    return {
      id: `${key}:${index}`,
      speciesId: species.id,
      x: 100 + Math.floor(random() * 3800),
      y: random() < 0.65 ? 80 + Math.floor(random() * 420) : 500 + Math.floor(random() * 260),
      size,
      observed: false,
    };
  });
}

export function ensureDailyBirds() {
  const key = `${get(gameMode)}:${get(seasonIndex)}:${get(day)}`;
  if (get(birdPopulationDay) === key) return false;
  dailyBirds.set(generateDailyBirds(`${get(seasonIndex)}:${get(day)}`, get(gameMode)));
  birdPopulationDay.set(key);
  return true;
}

export function birdSpecies(sighting, mode = get(gameMode)) {
  return birdsForMode(mode).find((bird) => bird.id === sighting?.speciesId) || null;
}

export function observeBird(id, mode = get(gameMode)) {
  const sighting = get(dailyBirds).find((bird) => bird.id === id);
  const species = birdSpecies(sighting, mode);
  if (!sighting || !species || sighting.observed) return null;
  const key = `${get(seasonIndex)}:${get(day)}`;
  const previous = get(birdLog)[species.id];
  const observation = {
    count: (previous?.count || 0) + 1,
    recordSize: Math.max(previous?.recordSize || 0, sighting.size),
    smallestSize: Math.min(previous?.smallestSize || sighting.size, sighting.size),
    maxStars: Math.max(previous?.maxStars || 0, species.rarity),
    lastSeen: key,
  };
  birdLog.update((entries) => ({ ...entries, [species.id]: observation }));
  dailyBirds.update((birds) => birds.map((bird) => bird.id === id ? { ...bird, observed: true } : bird));
  birdwatchingLuck.update((level) => Math.min(10, level + birdLuckPoints(species.rarity)));
  return { species, observation, size: sighting.size, luck: get(birdwatchingLuck) };
}