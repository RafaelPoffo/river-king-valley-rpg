import { get } from "svelte/store";
import { TOURNAMENTS, TOURNAMENT_RIVALS, TOURNAMENT_CLOSE_MINUTES } from "./constants.js";
import { SPRITES } from "./sprites.js";
import { grantSeed } from "./garden.js";
import {
  tournament,
  currentFestival,
  seasonIndex,
  day,
  inGameMinutes,
  money,
  getActiveDatabase,
} from "./stores.js";

export function dayKey(season, dayNum) {
  return season * 100 + dayNum;
}

export function tournamentFor(festivalName) {
  return TOURNAMENTS[festivalName] || null;
}

export function qualifies(rule, fish) {
  if (!fish || fish.type !== "fish" || fish.sprite === SPRITES.trash) return false;
  if (!rule.biome) return true;
  if (fish.biome === rule.biome) return true;
  return rule.biome === "sea" && fish.biome === "deep_sea";
}

export function scoreOf(rule, fish) {
  return rule.metric === "value" ? fish.priceFinal || 0 : fish.weight || 0;
}

export function formatScore(rule, score) {
  return rule.metric === "value" ? `¥${Math.round(score)}` : `${score.toFixed(2)}kg`;
}

function seeded(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function typicalStars(fish) {
  if (fish.stage === 3 || fish.rarity >= 5) return 5;
  if (fish.stage === 2 || fish.rarity >= 3) return 3;
  return 1;
}

export function rivalScores(rule, database, key) {
  const references = database
    .filter((fish) => qualifies(rule, fish) && !fish.weather && !fish.requires)
    .map((fish) =>
      rule.metric === "value" ? fish.price * typicalStars(fish) : (fish.minW + fish.maxW) / 2
    )
    .sort((a, b) => a - b);
  if (references.length === 0) return TOURNAMENT_RIVALS.map((r) => ({ name: r.name, score: 0 }));

  return TOURNAMENT_RIVALS.map((rival, index) => {
    const random = seeded(key * 31 + index * 7919);
    const reference = references[Math.round(rival.skill * (references.length - 1))];
    const raw = reference * (0.55 + 0.45 * random());
    const score = rule.metric === "value" ? Math.round(raw) : Number(raw.toFixed(2));
    return { name: rival.name, score };
  });
}

export function placeFor(playerScore, rivals) {
  return 1 + rivals.filter((rival) => rival.score >= playerScore).length;
}

export function prizeFor(rule, place) {
  return rule.prizes[place - 1] || 0;
}

function emptyEntry(key) {
  return { key, best: null, submitted: false, place: null, prize: 0 };
}

export function todaysTournament() {
  const name = get(currentFestival);
  const rule = tournamentFor(name);
  if (!rule) return null;
  const key = dayKey(get(seasonIndex), get(day));
  const saved = get(tournament);
  const entry = saved && saved.key === key ? saved : emptyEntry(key);
  const rivals = rivalScores(rule, getActiveDatabase(), key);
  return { name, rule, key, entry, rivals };
}

export function recordTournamentCatch(fish) {
  const today = todaysTournament();
  if (!today || today.entry.submitted) return false;
  if (get(inGameMinutes) >= TOURNAMENT_CLOSE_MINUTES) return false;
  if (!qualifies(today.rule, fish)) return false;

  const score = scoreOf(today.rule, fish);
  const best = today.entry.best;
  if (best && best.score >= score) return false;

  tournament.set({
    ...today.entry,
    best: { id: fish.id, name: fish.name, score, isShiny: !!fish.isShiny },
  });
  return true;
}

export function submitTournament() {
  const today = todaysTournament();
  if (!today || today.entry.submitted || !today.entry.best) return null;

  const place = placeFor(today.entry.best.score, today.rivals);
  const prize = prizeFor(today.rule, place);
  if (prize > 0) money.update((m) => m + prize);
  const seed = place <= 3 ? grantSeed() : null;
  tournament.set({ ...today.entry, submitted: true, place, prize });
  return { place, prize, seed };
}
