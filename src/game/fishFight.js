import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import { phase, activeFish, currentToolData, fishFight } from "./stores.js";

const MOODS = ["dash", "resist", "exhaust"];

export function fatigueFor(fish) {
  const rarity = Math.max(1, fish?.rarity || 1);
  const stage = fish?.stage || 1;
  return Math.min(10, 3 + rarity + (stage > 1 ? 1 : 0));
}

export function createFishFight(fish) {
  const fatigue = fatigueFor(fish);
  return {
    mood: "resist",
    moodTime: 0,
    moodHold: 1.2,
    tension: 18,
    distance: 72,
    holding: false,
    taps: 0,
    snap: false,
    caught: false,
    fatigue,
    stamina: fatigue,
    hint: "Ele resiste. Dê toques ritmados.",
  };
}

function nextMood(fight, random) {
  const roll = random();
  if (fight.stamina <= 2) return roll < 0.55 ? "exhaust" : "resist";
  if (fight.mood === "dash") return roll < 0.35 ? "dash" : roll < 0.75 ? "resist" : "exhaust";
  if (fight.mood === "exhaust") return roll < 0.55 ? "resist" : "dash";
  return roll < 0.4 ? "dash" : roll < 0.75 ? "resist" : "exhaust";
}

function moodHint(mood) {
  if (mood === "dash") return "Arranque! Solte o botão agora.";
  if (mood === "exhaust") return "Cansou. Segure para puxar.";
  return "Resiste. Toques ritmados, sem segurar.";
}

function moodDuration(mood, fatigue, random) {
  if (mood === "dash") return 0.7 + random() * 0.7 + fatigue * 0.04;
  if (mood === "exhaust") return 1.1 + random() * 1.4 + (10 - fatigue) * 0.08;
  return 0.9 + random() * 0.8;
}

export function startReel() {
  const fight = get(fishFight);
  if (!fight || fight.snap || fight.caught) return;
  fishFight.set({ ...fight, holding: true, taps: fight.taps + 1 });
}

export function stopReel() {
  const fight = get(fishFight);
  if (!fight) return;
  fishFight.set({ ...fight, holding: false });
}

export function tickFishFight(delta, random = Math.random) {
  const fight = get(fishFight);
  if (!fight || get(phase) !== PHASES.FISHING_MINIGAME || fight.snap || fight.caught) return fight;
  const rod = get(currentToolData);
  const pull = 10 + (rod?.strength || 2);
  let { mood, moodTime, moodHold, tension, distance, holding, stamina, fatigue, taps } = fight;
  moodTime += delta;

  if (mood === "dash") {
    if (holding) tension += delta * (55 + fatigue * 4);
    else tension = Math.max(0, tension - delta * 18);
    distance = Math.min(100, distance + delta * (8 + fatigue));
    stamina = Math.max(0, stamina - delta * 1.4);
  } else if (mood === "resist") {
    if (holding && taps % 2 === 0) tension += delta * 22;
    else if (holding) {
      tension = Math.max(8, tension - delta * 6);
      distance = Math.max(0, distance - delta * (pull * 0.18));
    } else tension = Math.max(6, tension - delta * 4);
    stamina = Math.max(0, stamina - delta * 0.6);
  } else {
    if (holding) {
      distance = Math.max(0, distance - delta * (pull * 0.55));
      tension = Math.min(96, tension + delta * 8);
      stamina = Math.min(fatigue, stamina + delta * 0.2);
    } else {
      tension = Math.max(0, tension - delta * 10);
      stamina = Math.min(fatigue, stamina + delta * 1.1);
    }
  }

  if (moodTime >= moodHold) {
    mood = nextMood({ ...fight, mood, stamina }, random);
    moodTime = 0;
    moodHold = moodDuration(mood, fatigue, random);
    if (mood === "dash") stamina = Math.min(fatigue, stamina + 1);
  }

  const snap = tension >= 100;
  const caught = !snap && distance <= 0;
  const next = {
    ...fight,
    mood,
    moodTime,
    moodHold,
    tension: Math.max(0, Math.min(110, tension)),
    distance: Math.max(0, Math.min(100, distance)),
    stamina,
    holding,
    snap,
    caught,
    hint: snap ? "A linha arrebentou!" : caught ? "Você puxou o bastante!" : moodHint(mood),
  };
  fishFight.set(next);
  return next;
}
