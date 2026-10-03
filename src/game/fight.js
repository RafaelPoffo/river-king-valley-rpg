import { SPRITES } from "./sprites.js";

// Rod strength runs from 2 (Vime) to 12 (Mítica); fish strength lands on the
// same scale: rarity sets the base and a heavy specimen adds up to +3.
const RARITY_STRENGTH = 1.6;
const WEIGHT_STRENGTH = 3;

// Logistic curve over (fish - rod): even fights stay around 5%, a fish 4
// points stronger breaks the line about a third of the time, 8+ points
// stronger almost always does.
const MIN_BREAK = 0.02;
const MAX_BREAK = 0.9;
const BREAK_MIDPOINT = 5;
const BREAK_SPREAD = 1.5;

export function canBreakLine(fish) {
  return !!fish && fish.type !== "treasure" && fish.sprite !== SPRITES.trash;
}

export function weightFactor(fish, weight) {
  const minW = fish.minW || 0;
  const maxW = fish.maxW || minW;
  if (maxW <= minW) return 0;
  return Math.max(0, Math.min(1, (weight - minW) / (maxW - minW)));
}

export function fishStrength(fish, weight = fish.minW || 0) {
  return (fish.rarity || 1) * RARITY_STRENGTH + weightFactor(fish, weight) * WEIGHT_STRENGTH;
}

export function strengthRange(fish) {
  return [fishStrength(fish, fish.minW), fishStrength(fish, fish.maxW)];
}

export function lineBreakChance(rod, fish, weight) {
  if (!canBreakLine(fish)) return 0;
  const gap = fishStrength(fish, weight) - (rod?.strength || 1);
  const curve = 1 / (1 + Math.exp(-(gap - BREAK_MIDPOINT) / BREAK_SPREAD));
  return MIN_BREAK + (MAX_BREAK - MIN_BREAK) * curve;
}

export function strengthLabel(value) {
  return value.toFixed(1).replace(".", ",");
}
