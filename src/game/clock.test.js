import { describe, it, expect, beforeEach, vi } from "vitest";
import { get } from "svelte/store";
import { tickClock, MINUTES_PER_TICK, BEDTIME_MINUTES } from "./clock.js";
import { PHASES } from "./phases.js";
import { phase, inGameMinutes, currentMap, eveningWarned, deepSeaFishingActive, currentMessage, seasonIndex, day } from "./stores.js";

beforeEach(() => {
  vi.useFakeTimers();
  phase.set(PHASES.PLAYING);
  currentMap.set("village");
  inGameMinutes.set(9 * 60);
  eveningWarned.set(false);
  deepSeaFishingActive.set(false);
  seasonIndex.set(0);
  day.set(1);
});

describe("relógio", () => {
  it("avança jogando na rua", () => {
    tickClock();
    expect(get(inGameMinutes)).toBe(9 * 60 + MINUTES_PER_TICK);
  });

  it("para dentro de casa e em menus", () => {
    currentMap.set("tavern");
    tickClock();
    currentMap.set("village");
    phase.set(PHASES.PAUSE_MENU);
    tickClock();
    expect(get(inGameMinutes)).toBe(9 * 60);
  });

  it("avisa o pôr do sol uma vez só", () => {
    inGameMinutes.set(17 * 60 - MINUTES_PER_TICK);
    tickClock();
    expect(get(eveningWarned)).toBe(true);
    expect(get(currentMessage)).toContain("sol está se pondo");
    currentMessage.set("outra");
    tickClock();
    expect(get(currentMessage)).toBe("outra");
  });

  it("às 22h o jogador desmaia", () => {
    eveningWarned.set(true);
    inGameMinutes.set(BEDTIME_MINUTES - MINUTES_PER_TICK);
    tickClock();
    expect(get(phase)).toBe(PHASES.DIALOG);
    expect(get(currentMessage)).toContain("desmaia");
  });
});
