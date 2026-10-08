import { get } from "svelte/store";
import { MAPS_DATA, isForestAccess, INITIAL_VILLAGERS } from "./constants.js";
import { SPECIES } from "./cardCatalog.js";
import { SPRITES } from "./sprites.js";
import {
  birdLog,
  birdPopulationDay,
  birdwatchingLuck,
  dailyBirds,
  day,
  forestFeathers,
  gameMode,
  seasonIndex,
  wildInsects,
} from "./stores.js";

const localBird = (id, name, rarity, emoji, description) => ({
  id,
  name,
  rarity,
  description,
  emoji,
  portrait: null,
  sizeRange: [22, 48],
});

export const PANORAMA_WIDTH = 4000;
export const PANORAMA_HEIGHT = 800;
export const BINOCULAR_VIEW_WIDTH = Math.round(250 * 1.15);
export const BINOCULAR_VIEW_HEIGHT = Math.round(125 * 1.15);
export const MIN_SPRITE_SIZE = 48;
export const GROUND_PERCH_MIN_Y = 620;

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

export const GROUNDED_BIRD_DEX = new Set(["0083", "0084", "0085"]);

export const POKEMON_BIRDS = pokemonRows.map(([dexId, name, rarity, description]) => ({
  id: `bird_${dexId}`,
  dexId,
  name,
  rarity,
  description,
  portrait: pmdPortrait(dexId),
  sizeRange: [40, 120],
  grounded: GROUNDED_BIRD_DEX.has(dexId),
}));

export const birdsForMode = (mode) => mode === "pokemon" ? POKEMON_BIRDS : COMMON_BIRDS;

const LITERAL_BIRD_IDS = new Set([
  ...COMMON_BIRDS.map((bird) => bird.id),
  ...POKEMON_BIRDS.map((bird) => bird.id),
]);

export const VISITOR_NPCS = [
  { id: "npc_veteran", name: "Capitão Thomas", spriteId: "veteran" },
  { id: "npc_bird", name: "Leo das Aves", spriteId: "bird_guide" },
  { id: "npc_anna", name: "Ana a Cozinheira", spriteId: "anna" },
  { id: "npc_traveler_m", name: "Viajante", spriteId: "traveler_m" },
  { id: "npc_traveler_f", name: "Viajante", spriteId: "traveler_f" },
  { id: "npc_fishing", name: "Guia de pesca", spriteId: "fishing_guide" },
  { id: "npc_joe", name: "Velho Joe", spriteId: "old_joe" },
  { id: "npc_nuno", name: "Seu Nuno", spriteId: "river_fisher" },
];

const FEATHER_PRICES = [0, 80, 140, 220, 360, 520];
const PAN_DELTA = { left: [-60, 0], right: [60, 0], up: [0, -40], down: [0, 40] };

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

export function isCountableBird(sighting) {
  return Boolean(sighting) && sighting.kind !== "visitor";
}

export function countableSightings(sightings = []) {
  return sightings.filter(isCountableBird);
}

export function speciesDropsFeathers(species) {
  return Boolean(species && LITERAL_BIRD_IDS.has(species.id));
}

export function isGroundedSpecies(species) {
  return Boolean(species?.grounded || GROUNDED_BIRD_DEX.has(species?.dexId));
}

export function flyingVisitorCatalog() {
  const birdDex = new Set(POKEMON_BIRDS.map((bird) => bird.dexId));
  return Object.values(SPECIES)
    .filter((species) => species.types.includes("voador") && !birdDex.has(species.dexId))
    .map((species) => ({
      id: `flyer_${species.dexId}`,
      dexId: species.dexId,
      name: species.name,
      rarity: 1,
      description: "Um Pokémon voador que só atravessa o campo de visão.",
      portrait: pmdPortrait(species.dexId),
      sizeRange: [48, 140],
      grounded: GROUNDED_BIRD_DEX.has(species.dexId),
    }));
}

function chooseSpecies(catalog, random) {
  const weights = catalog.map((bird) => RARITY_WEIGHTS[bird.rarity] ?? 8);
  let roll = random() * weights.reduce((sum, weight) => sum + weight, 0);
  for (let index = 0; index < catalog.length; index++) {
    roll -= weights[index];
    if (roll < 0) return catalog[index];
  }
  return catalog[0];
}

export function sightingSpriteSize(sighting) {
  return Math.max(MIN_SPRITE_SIZE, Math.round((sighting?.size || MIN_SPRITE_SIZE) * 1.05));
}

export function sightingBounds(sighting) {
  const size = sightingSpriteSize(sighting);
  return { x: sighting.x, y: sighting.y, w: size, h: size };
}

function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  return Math.hypot(cx - nearestX, cy - nearestY) <= radius;
}

export function sightingInView(sighting, cameraX, cameraY) {
  const bounds = sightingBounds(sighting);
  const radius = BINOCULAR_VIEW_HEIGHT / 2;
  const left = { cx: cameraX + radius, cy: cameraY + radius };
  const right = { cx: cameraX + BINOCULAR_VIEW_WIDTH - radius, cy: cameraY + radius };
  return circleHitsRect(left.cx, left.cy, radius, bounds) || circleHitsRect(right.cx, right.cy, radius, bounds);
}

export function pickSightingInView(sightings, cameraX, cameraY, { includeObserved = false } = {}) {
  const centerX = cameraX + BINOCULAR_VIEW_WIDTH / 2;
  const centerY = cameraY + BINOCULAR_VIEW_HEIGHT / 2;
  return (sightings || [])
    .filter((sighting) => (includeObserved || !sighting.observed) && sightingInView(sighting, cameraX, cameraY))
    .sort((first, second) => {
      const firstSize = sightingSpriteSize(first);
      const secondSize = sightingSpriteSize(second);
      return Math.hypot(first.x + firstSize / 2 - centerX, first.y + firstSize / 2 - centerY)
        - Math.hypot(second.x + secondSize / 2 - centerX, second.y + secondSize / 2 - centerY);
    })[0] || null;
}

export function clampBinocularCamera(x, y) {
  return {
    x: Math.max(0, Math.min(PANORAMA_WIDTH - BINOCULAR_VIEW_WIDTH, x)),
    y: Math.max(0, Math.min(PANORAMA_HEIGHT - BINOCULAR_VIEW_HEIGHT, y)),
  };
}

function perchY(species, random, visitorType) {
  if (visitorType === "npc" || isGroundedSpecies(species)) {
    return GROUND_PERCH_MIN_Y + Math.floor(random() * 120);
  }
  return random() < 0.7 ? 80 + Math.floor(random() * 400) : 420 + Math.floor(random() * 160);
}

function makeSighting(species, key, index, random, kind = "bird", extra = {}) {
  const size = species.sizeRange[0] + Math.floor(random() * (species.sizeRange[1] - species.sizeRange[0] + 1));
  return {
    id: `${key}:${kind}:${index}`,
    speciesId: species.id,
    x: 100 + Math.floor(random() * 3800),
    y: perchY(species, random, extra.visitorType),
    size,
    observed: false,
    kind,
    ...extra,
  };
}

function extraVisitors(key, mode, random, startIndex) {
  const extras = [];
  let index = startIndex;
  const unusedNpcs = [...VISITOR_NPCS];
  const npcCount = random() < 0.42 ? 1 : random() < 0.1 ? 2 : 0;
  for (let count = 0; count < npcCount && unusedNpcs.length; count++) {
    const npc = unusedNpcs.splice(Math.floor(random() * unusedNpcs.length), 1)[0];
    extras.push(makeSighting(
      { id: npc.id, sizeRange: [52, 72] },
      key,
      index++,
      random,
      "visitor",
      { visitorType: "npc", name: npc.name, spriteId: npc.spriteId, emoji: "👤" },
    ));
  }
  const flyers = flyingVisitorCatalog();
  const flyerCount = mode === "pokemon" && flyers.length && random() < 0.62
    ? (random() < 0.28 ? 2 : 1)
    : 0;
  const unused = [...flyers];
  for (let count = 0; count < flyerCount && unused.length; count++) {
    const species = unused.splice(Math.floor(random() * unused.length), 1)[0];
    extras.push(makeSighting(species, key, index++, random, "visitor", {
      visitorType: "pokemon",
      name: species.name,
      dexId: species.dexId,
      portrait: species.portrait,
    }));
  }
  return extras;
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
  const birds = Array.from({ length: count }, (_, index) => {
    const species = chooseSpecies(available, random);
    available.splice(available.indexOf(species), 1);
    return makeSighting(species, key, index, random, "bird");
  });
  return [...birds, ...extraVisitors(key, mode, random, birds.length)];
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

export function sightingDisplay(sighting, mode = get(gameMode)) {
  if (sighting?.kind === "visitor") {
    return {
      name: sighting.name,
      portrait: sighting.portrait || null,
      emoji: sighting.emoji || "👤",
      spriteId: sighting.spriteId || null,
      visitorType: sighting.visitorType,
      description: sighting.visitorType === "npc"
        ? "Alguém da vila atravessou o campo de visão."
        : "Um Pokémon que não conta como observação de ave.",
    };
  }
  return birdSpecies(sighting, mode);
}

function featherTiles(random) {
  const rows = MAPS_DATA.bug_forest;
  const tiles = [];
  for (let y = 2; y <= 22; y++) {
    for (let x = 2; x <= 17; x++) {
      if (["G", "F", "."].includes(rows[y]?.[x]) && !isForestAccess("bug_forest", x, y)
        && !INITIAL_VILLAGERS.some((npc) => npc.homeMap === "bug_forest" && npc.homeX === x && npc.homeY === y)) {
        tiles.push({ x, y });
      }
    }
  }
  return tiles.sort(() => random() - 0.5);
}

export function makeFeatherItem(species, mode = get(gameMode)) {
  const price = FEATHER_PRICES[species.rarity] || 80;
  return {
    id: `pena_${species.id}`,
    name: `Pena de ${species.name}`,
    type: "loot",
    price,
    priceFinal: price,
    stars: species.rarity,
    sprite: SPRITES.feather,
    weight: 0,
    sourceMode: mode,
  };
}

export function spawnForestFeather(species, mode = get(gameMode), random = Math.random) {
  const occupied = new Set([
    ...get(wildInsects).map((insect) => `${insect.x},${insect.y}`),
    ...get(forestFeathers).map((feather) => `${feather.x},${feather.y}`),
  ]);
  const tiles = featherTiles(random).filter((tile) => !occupied.has(`${tile.x},${tile.y}`));
  const nearBench = tiles.filter((tile) => tile.y <= 8 && tile.x >= 6 && tile.x <= 14);
  const tile = nearBench[0] || tiles[0];
  if (!tile) return null;
  const drop = {
    id: `feather:${get(seasonIndex)}:${get(day)}:${species.id}:${get(forestFeathers).length}`,
    x: tile.x,
    y: tile.y,
    item: makeFeatherItem(species, mode),
  };
  forestFeathers.update((list) => [...list, drop]);
  return drop;
}

export function featherDropMessage(species, mode = get(gameMode)) {
  const label = mode === "pokemon" ? `O pokémon ${species.name}` : `O pássaro ${species.name}`;
  return `${label} deixou cair uma de suas penas.`;
}

export function observeBird(id, mode = get(gameMode), random = Math.random) {
  const sighting = get(dailyBirds).find((bird) => bird.id === id);
  if (!sighting || sighting.observed) return null;
  if (sighting.kind === "visitor") {
    dailyBirds.update((birds) => birds.map((bird) => bird.id === id ? { ...bird, observed: true } : bird));
    return {
      visitor: true,
      name: sighting.name,
      visitorType: sighting.visitorType,
      message: sighting.visitorType === "npc"
        ? `${sighting.name} apareceu no campo de visão, mas não é uma ave.`
        : `${sighting.name} cruzou os céus, mas não conta como observação de ave.`,
    };
  }
  const species = birdSpecies(sighting, mode);
  if (!species) return null;
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
  let feather = null;
  if (speciesDropsFeathers(species) && random() < 0.1) {
    feather = spawnForestFeather(species, mode, random);
  }
  return {
    species,
    observation,
    size: sighting.size,
    luck: get(birdwatchingLuck),
    feather,
    featherMessage: feather ? featherDropMessage(species, mode) : null,
  };
}

let viewApi = null;
let panTimer = null;
let heldDir = null;

export function bindBirdWatchingView(api) {
  viewApi = api;
  if (!api) stopBirdPan();
}

export function panBirdWatching(dir) {
  viewApi?.pan(dir);
}

export function startBirdPan(dir) {
  if (heldDir === dir) return;
  stopBirdPan();
  heldDir = dir;
  panBirdWatching(dir);
  panTimer = setInterval(() => panBirdWatching(dir), 70);
}

export function stopBirdPan() {
  heldDir = null;
  if (panTimer) {
    clearInterval(panTimer);
    panTimer = null;
  }
}

export function observeVisibleBird() {
  viewApi?.observe();
}

export function closeBirdWatchingView() {
  stopBirdPan();
  viewApi?.close();
}

export function binocularPanDelta(dir) {
  return PAN_DELTA[dir] || [0, 0];
}
