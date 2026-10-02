import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import { phase, inGameMinutes, currentMap, eveningWarned, deepSeaFishingActive } from "./stores.js";
import { isInterior } from "./movement.js";
import { returnFromDeepSea, forceSleep, showRPGMessage } from "./gameActions.js";
import { todaysTournament } from "./tournament.js";

export const REAL_MS_PER_TICK = 1500;
export const MINUTES_PER_TICK = 10;
export const SUNSET_HOUR = 17;
export const BEDTIME_MINUTES = 22 * 60;

function sunsetMessage() {
  const today = todaysTournament();
  if (today && today.entry.best && !today.entry.submitted) {
    return `O ${today.name} encerrou as capturas! Entregue seu peixe na barraca da praça.`;
  }
  return "O sol está se pondo... Os moradores começam a ir para a taverna!";
}

export function tickClock() {
  if (get(phase) !== PHASES.PLAYING || isInterior(get(currentMap))) return;

  inGameMinutes.update((m) => m + MINUTES_PER_TICK);
  const minutes = get(inGameMinutes);
  const atSea = get(deepSeaFishingActive);

  if (Math.floor(minutes / 60) === SUNSET_HOUR && !get(eveningWarned)) {
    eveningWarned.set(true);
    if (atSea) returnFromDeepSea();
    else showRPGMessage(sunsetMessage());
  }

  if (minutes >= BEDTIME_MINUTES) {
    if (atSea) returnFromDeepSea();
    else forceSleep();
  }
}

export function startClock() {
  const id = setInterval(tickClock, REAL_MS_PER_TICK);
  return () => clearInterval(id);
}
