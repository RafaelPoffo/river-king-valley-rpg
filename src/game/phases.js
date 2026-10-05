export const PHASES = Object.freeze({
  MENU: "menu",
  FADE: "fade",
  PLAYING: "playing",
  DIALOG: "dialog",
  BUG_TOURNAMENT: "bug_tournament",
  BIRD_WATCHING: "bird_watching",
  BIRD_LOG: "bird_log",
  SAILING: "sailing",
  PAUSE_MENU: "pause_menu",
  SHOP: "shop",
  CARPENTER: "carpenter",
  FISH_LOG: "fish_log",
  EQUIPMENT: "equipment",
  MUSEUM: "museum",
  FISHING_AIM: "fishing_aim",
  FISHING_WAIT: "fishing_wait",
  FISHING_APPROACH: "fishing_approach",
  FISHING_BITE: "fishing_bite",
  FISHING_MINIGAME: "fishing_minigame",
  CAUGHT: "caught",
});

export const CLOSABLE_SCREENS = new Set([
  PHASES.SHOP,
  PHASES.FISH_LOG,
  PHASES.EQUIPMENT,
  PHASES.CARPENTER,
  PHASES.PAUSE_MENU,
  PHASES.MUSEUM,
  PHASES.BIRD_LOG,
]);

export const LINE_IN_WATER = new Set([
  PHASES.FISHING_WAIT,
  PHASES.FISHING_APPROACH,
  PHASES.FISHING_BITE,
  PHASES.FISHING_MINIGAME,
]);

export const CANCELABLE_FISHING = new Set([PHASES.FISHING_WAIT, PHASES.FISHING_APPROACH]);

export function isFishingPhase(value) {
  return value === PHASES.FISHING_AIM || LINE_IN_WATER.has(value);
}
