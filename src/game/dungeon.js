import { seededRandom } from "./insectHunt.js";
import { luckFightBonus } from "./bugTournament.js";

const THEMES = [
  "ground", "water", "fire", "grass", "electric", "rock",
  "ice", "ghost", "dragon", "normal",
];

const THEME_DEX = {
  ground: ["0027", "0050", "0074", "0095", "0111"],
  water: ["0054", "0060", "0072", "0118", "0129"],
  fire: ["0004", "0037", "0058", "0077", "0126"],
  grass: ["0001", "0043", "0069", "0102", "0114"],
  electric: ["0025", "0081", "0100", "0125", "0135"],
  rock: ["0074", "0095", "0140", "0141", "0142"],
  ice: ["0086", "0090", "0124", "0131", "0144"],
  ghost: ["0092", "0093", "0094", "0200", "0092"],
  dragon: ["0147", "0148", "0149", "0230", "0147"],
  normal: ["0016", "0019", "0039", "0052", "0113"],
};

export function dungeonTheme(floor) {
  return THEMES[Math.floor((Math.max(1, floor) - 1) / 10) % THEMES.length];
}

export function generateDungeonFloor(floor, key) {
  const random = seededRandom(`dungeon:${key}:${floor}`);
  const theme = dungeonTheme(floor);
  const foe = random() < 0.25;
  const loot = random() < 0.25;
  const dex = THEME_DEX[theme][Math.floor(random() * THEME_DEX[theme].length)];
  return {
    floor,
    theme,
        foe: foe ? { dexId: dex, name: `N.º ${dex}`, strength: 1 + Math.floor(floor / 12), type: theme } : null,
    loot: loot ? ["gem", "card", "relic", "item"][Math.floor(random() * 4)] : null,
  };
}

function typeMod(petType, foeType) {
  const strong = { water: "fire", fire: "grass", grass: "water", electric: "water", ground: "electric", rock: "fire", ice: "dragon", dragon: "dragon" };
  if (strong[petType] === foeType) return 2;
  if (strong[foeType] === petType) return -2;
  return 0;
}

export function resolveDungeonDuel(pet, foe, key, luck = 0) {
  const random = seededRandom(key);
  let petWins = 0;
  let foeWins = 0;
  const frames = [];
  let petX = 6;
  let foeX = 13;
  for (let turn = 1; turn <= 3; turn++) {
    const petRoll = 1 + Math.floor(random() * 20) + (pet.strength || 1) + typeMod(pet.types?.[0], foe.type) + luckFightBonus(luck) - 1;
    const foeRoll = 1 + Math.floor(random() * 20) + (foe.strength || 1);
    if (petRoll >= foeRoll) {
      petWins += 1;
      foeX = Math.min(18, foeX + 1);
    } else {
      foeWins += 1;
      petX = Math.max(1, petX - 1);
    }
    frames.push({ petX, foeX, petWins, foeWins });
  }
  const winner = petWins >= 2 ? "pet" : "foe";
  return { winner, frames, petWins, foeWins };
}

export function onixHoleOpen(dayNum) {
  return dayNum >= 11;
}

export const ONIX_ROCK = { x: 29, y: 3 };

export function buildDungeonRows(theme) {
  const width = 22;
  const height = 22;
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return "0";
      if (x === 1 || y === 1 || x === width - 2 || y === height - 2) return "#";
      if (x === 10 && y === 2) return ".";
      if (x === 10 && y === 19) return ".";
      if (theme === "water" && x >= 7 && x <= 14 && y >= 8 && y <= 13) return "~";
      if (theme === "fire" && ((x + y) % 7 === 0)) return "F";
      if (theme === "grass" && (x + y) % 5 === 0) return "F";
      return ".";
    }).join("")
  );
}

export const DUNGEON_STAIRS = { up: { x: 10, y: 2 }, down: { x: 10, y: 19 } };
