import { describe, expect, it } from "vitest";
import { competitorsForDay, prizeForCompetition, resolveBugDuel } from "./bugTournament.js";

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
    expect(first.frames.every((frame) => frame.leftX >= 2 && frame.rightX <= 98)).toBe(true);
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