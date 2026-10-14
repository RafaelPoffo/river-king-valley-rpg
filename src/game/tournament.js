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

export function exhibitPortrait(entry) {
  if (!entry) return null;
  if (entry.portrait) return entry.portrait;
  if (entry.dexId) return `/assets/portraits/${String(entry.dexId).padStart(4, "0")}.png`;
  if (typeof entry.sprite === "string") return entry.sprite;
  return null;
}

export function toExhibit(owner, fish, score) {
  return {
    owner,
    id: fish.id,
    name: fish.name,
    score,
    dexId: fish.dexId || null,
    portrait: fish.portrait || (fish.dexId ? `/assets/portraits/${String(fish.dexId).padStart(4, "0")}.png` : null),
    sprite: fish.sprite || null,
    isShiny: !!fish.isShiny,
    fish: fish.fish || fish,
  };
}

function exhibitForRival(rule, database, key, rival, index) {
  const candidates = database.filter((fish) => qualifies(rule, fish) && !fish.weather && !fish.requires);
  const random = seeded(key * 31 + index * 7919);
  if (candidates.length === 0) {
    return { owner: rival.name, id: null, name: "Peixe", score: rival.score, portrait: null, sprite: null };
  }
  let chosen = candidates[0];
  let bestDiff = Infinity;
  for (const fish of candidates) {
    const typical = rule.metric === "value" ? fish.price * typicalStars(fish) : (fish.minW + fish.maxW) / 2;
    const diff = Math.abs(typical - rival.score) + random() * 0.01;
    if (diff < bestDiff) {
      bestDiff = diff;
      chosen = fish;
    }
  }
  return toExhibit(rival.name, chosen, rival.score);
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
  return place === 1 ? rule.prizes[0] || 0 : 0;
}

function emptyEntry(key) {
  return { key, best: null, table: null, submitted: false, judged: false, place: null, prize: 0, winner: null };
}

function tableOf(rule, database, key, entry, rivals) {
  const saved = Array.isArray(entry.table) ? entry.table : [];
  const npc = [0, 1].map((index) =>
    saved[index]?.id ? saved[index] : exhibitForRival(rule, database, key, rivals[index], index)
  );
  return [npc[0], npc[1], saved[2] || null];
}

export function todaysTournament() {
  const name = get(currentFestival);
  const rule = tournamentFor(name);
  if (!rule) return null;
  const key = dayKey(get(seasonIndex), get(day));
  const saved = get(tournament);
  const entry = saved && saved.key === key ? saved : emptyEntry(key);
  const rivals = rivalScores(rule, getActiveDatabase(), key).slice(0, 2);
  const table = tableOf(rule, getActiveDatabase(), key, entry, rivals);
  return { name, rule, key, entry: { ...entry, table }, rivals, table };
}

export function recordTournamentCatch(fish) {
  const today = todaysTournament();
  if (!today || today.entry.submitted || today.entry.judged) return false;
  if (get(inGameMinutes) >= TOURNAMENT_CLOSE_MINUTES) return false;
  if (!qualifies(today.rule, fish)) return false;

  const score = scoreOf(today.rule, fish);
  const best = today.entry.best;
  if (best && best.score >= score) return false;

  tournament.set({
    ...today.entry,
    best: { id: fish.id, name: fish.name, score, isShiny: !!fish.isShiny, fish },
  });
  return true;
}

export function placeFestivalFish(fish) {
  const today = todaysTournament();
  if (!today || today.entry.judged) return false;
  if (!qualifies(today.rule, fish)) return false;
  const score = scoreOf(today.rule, fish);
  const exhibit = toExhibit("Você", fish, score);
  tournament.set({
    ...today.entry,
    best: { id: fish.id, name: fish.name, score, isShiny: !!fish.isShiny, fish },
    table: [today.table[0], today.table[1], exhibit],
    submitted: true,
  });
  return true;
}

export function judgeFestival() {
  const today = todaysTournament();
  if (!today) return null;
  if (today.entry.judged) {
    return { place: today.entry.place, prize: today.entry.prize, seed: null, winner: today.entry.winner };
  }

  const table = today.table;
  const playerFish = table[2];
  const playerScore = playerFish?.score || 0;
  const place = playerFish ? placeFor(playerScore, table.slice(0, 2)) : 3;
  const ranked = [...table.filter(Boolean)].sort((a, b) => b.score - a.score);
  const winner = ranked[0] || null;
  const playerWon = !!(playerFish && place === 1);
  const prize = playerWon ? prizeFor(today.rule, 1) : 0;
  if (prize > 0) money.update((m) => m + prize);
  const seed = playerWon ? grantSeed() : null;
  tournament.set({
    ...today.entry,
    table,
    submitted: !!playerFish,
    judged: true,
    place,
    prize,
    winner: winner?.owner || null,
  });
  return { place, prize, seed, winner: winner?.owner || null };
}

export function submitTournament() {
  const today = todaysTournament();
  if (!today || today.entry.judged) return null;
  if (!today.table[2] && today.entry.best) {
    const fish = today.entry.best.fish || {
      id: today.entry.best.id,
      name: today.entry.best.name,
      type: "fish",
      biome: today.rule.biome || "river",
      sprite: [],
      weight: today.entry.best.score,
      priceFinal: today.entry.best.score,
      isShiny: today.entry.best.isShiny,
    };
    placeFestivalFish(fish);
  }
  if (!todaysTournament()?.table[2]) return null;
  return judgeFestival();
}
