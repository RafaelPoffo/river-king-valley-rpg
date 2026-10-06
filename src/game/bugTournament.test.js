import { describe, expect, it } from "vitest";
import { competitorsForDay, prizeForCompetition, resolveBugDuel } from "./bugTournament.js";
import { insectSpriteFor, POKEMON_SPRITES } from "./overworldAtlas.js";

describe("campeonato de insetos", () => {
  it("mantém Joe Bug e três insetos em cada rival nas duas versões", () => {
    for (const mode of ["normal", "pokemon"]) {
      for (let today = 1; today <= 15; today++) {
        const competitors = competitorsForDay(2, today, mode);
        expect(competitors[0].id).toBe("joe_bug");
        expect(competitors.every((competitor) => competitor.team.length === 3 && competitor.team.every(Boolean))).toBe(true);
        expect(competitors.slice(1).every((competitor) => competitor.name && competitor.persona && competitor.dialogue)).toBe(true);
        if (today === 15) {
          expect(competitors.length).toBe(8);
        } else {
          expect(competitors.length).toBeGreaterThanOrEqual(2);
          expect(competitors.length).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it("resolve duelos 1x1 de forma repetível e sem expor os valores no resultado", () => {
    const left = { strength: 3, archetypeId: "bruiser" };
    const right = { strength: 2, archetypeId: "guardian" };
    const first = resolveBugDuel(left, right, "day-one-match-one");
    expect(first).toEqual(resolveBugDuel(left, right, "day-one-match-one"));
    expect([left, right]).toContain(first.winner);
    expect(first.frames.length).toBeGreaterThan(0);
    expect(first.frames.every((frame) => frame.leftX >= -18 && frame.rightX <= 118)).toBe(true);
    expect(first.frames.every((frame) => typeof frame.leftFlipped === "boolean" && typeof frame.rightFlipped === "boolean")).toBe(true);
  });

  it("vira apenas o derrotado no frame final do duelo", () => {
    const left = { strength: 3, archetypeId: "bruiser" };
    const right = { strength: 2, archetypeId: "guardian" };
    const duels = Array.from({ length: 20 }, (_, index) => resolveBugDuel(left, right, `final-flip-${index}`));

    for (const duel of duels) {
      expect(duel.frames.slice(0, -1).every((frame) => !frame.leftFlipped && !frame.rightFlipped)).toBe(true);
      const finalFrame = duel.frames.at(-1);
      expect(finalFrame.leftFlipped).toBe(duel.winner !== left);
      expect(finalFrame.rightFlipped).toBe(duel.winner !== right);
    }
  });

  it("usa sprites do atlas para insetos e mantém uma escolha estável no overworld", () => {
    expect(insectSpriteFor("wild:1")).toBe(insectSpriteFor("wild:1"));
    expect(insectSpriteFor("wild:1")).toBeDefined();
    expect(insectSpriteFor("pokemon:1", "0010")).toBe(POKEMON_SPRITES["0010"]);
  });

  it("aplica a sorte de observação como vantagem pequena nas batalhas", () => {
    const left = { strength: 2, archetypeId: "balanced" };
    const right = { strength: 2, archetypeId: "balanced" };
    const luckChangesDuel = Array.from({ length: 80 }, (_, index) => {
      const key = `luck-test-${index}`;
      return JSON.stringify(resolveBugDuel(left, right, key, 0).frames)
        !== JSON.stringify(resolveBugDuel(left, right, key, 5).frames);
    }).some(Boolean);
    expect(luckChangesDuel).toBe(true);
  });

  it("aplica os prêmios diários e o prêmio final da estação", () => {
    expect(prizeForCompetition(9, true)).toBe(2000);
    for (let attempt = 0; attempt < 30; attempt++) {
      const threePlayerPrize = prizeForCompetition(3, false);
      const largerPrize = prizeForCompetition(6, false);
      expect(threePlayerPrize).toBeGreaterThanOrEqual(100);
      expect(threePlayerPrize).toBeLessThanOrEqual(500);
      expect(largerPrize).toBeGreaterThanOrEqual(500);
      expect(largerPrize).toBeLessThanOrEqual(1000);
    }
  });
});