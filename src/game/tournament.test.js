import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  tournamentFor,
  qualifies,
  scoreOf,
  rivalScores,
  placeFor,
  prizeFor,
  todaysTournament,
  recordTournamentCatch,
  submitTournament,
  dayKey,
} from "./tournament.js";
import { TOURNAMENTS, FESTIVALS, FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { SPRITES } from "./sprites.js";
import { tournament, seasonIndex, day, inGameMinutes, money, gameMode } from "./stores.js";

const SPRING_DERBY = { season: 0, day: 10 };
const riverFish = (weight, extra = {}) => ({
  id: "carpa",
  name: "Carpa",
  type: "fish",
  biome: "river",
  sprite: [],
  weight,
  priceFinal: 50,
  ...extra,
});

function goToDay({ season, day: dayNum }, minutes = 9 * 60) {
  seasonIndex.set(season);
  day.set(dayNum);
  inGameMinutes.set(minutes);
}

beforeEach(() => {
  gameMode.set("normal");
  tournament.set(null);
  money.set(500);
  goToDay(SPRING_DERBY);
});

describe("regras", () => {
  it("todo torneio é um festival do calendário", () => {
    const festivalNames = Object.values(FESTIVALS).flatMap((days) => Object.values(days));
    for (const name of Object.keys(TOURNAMENTS)) expect(festivalNames).toContain(name);
  });

  it("prêmios descem do 1º ao 3º e o 4º lugar não ganha", () => {
    for (const rule of Object.values(TOURNAMENTS)) {
      expect(rule.prizes[0]).toBeGreaterThan(rule.prizes[1]);
      expect(rule.prizes[1]).toBeGreaterThan(rule.prizes[2]);
      expect(prizeFor(rule, 4)).toBe(0);
    }
  });

  it("lixo, tesouro e peixe de outro bioma não contam", () => {
    const derby = tournamentFor("Derby de Primavera");
    expect(qualifies(derby, riverFish(2))).toBe(true);
    expect(qualifies(derby, riverFish(2, { sprite: SPRITES.trash }))).toBe(false);
    expect(qualifies(derby, riverFish(2, { type: "treasure" }))).toBe(false);
    expect(qualifies(derby, riverFish(2, { biome: "sea" }))).toBe(false);
  });

  it("o torneio de mar aceita peixe do alto-mar", () => {
    expect(qualifies(tournamentFor("Torneio de Verão"), riverFish(2, { biome: "deep_sea" }))).toBe(true);
  });

  it("a pontuação usa peso ou valor conforme o torneio", () => {
    expect(scoreOf(tournamentFor("Derby de Primavera"), riverFish(3.5))).toBe(3.5);
    expect(scoreOf(tournamentFor("Colheita de Outono"), riverFish(3.5))).toBe(50);
  });

  it("empate com rival conta como derrota", () => {
    const rivals = [{ score: 5 }, { score: 3 }, { score: 1 }];
    expect(placeFor(5, rivals)).toBe(2);
    expect(placeFor(6, rivals)).toBe(1);
    expect(placeFor(0.5, rivals)).toBe(4);
  });
});

describe("rivais", () => {
  it("a pontuação é a mesma toda vez no mesmo dia", () => {
    const rule = tournamentFor("Derby de Primavera");
    expect(rivalScores(rule, FISH_DB, 10)).toEqual(rivalScores(rule, FISH_DB, 10));
  });

  for (const [mode, database] of [["normal", FISH_DB], ["pokemon", POKEMON_DB]]) {
    for (const [name, rule] of Object.entries(TOURNAMENTS)) {
      it(`${name} (${mode}) pode ser vencido com o melhor peixe possível`, () => {
        const eligible = database.filter((fish) => qualifies(rule, fish));
        expect(eligible.length).toBeGreaterThan(0);
        const bestPossible = Math.max(
          ...eligible.map((fish) => (rule.metric === "value" ? fish.price * 6 * 3 : fish.maxW))
        );
        for (let season = 0; season < 4; season++) {
          const top = Math.max(...rivalScores(rule, database, dayKey(season, 10)).map((r) => r.score));
          expect(top).toBeGreaterThan(0);
          expect(bestPossible).toBeGreaterThan(top);
        }
      });
    }
  }
});

describe("dia de torneio", () => {
  it("só existe em dia de torneio", () => {
    expect(todaysTournament()?.name).toBe("Derby de Primavera");
    goToDay({ season: 0, day: 5 });
    expect(todaysTournament()).toBeNull();
  });

  it("guarda só o peixe que supera o melhor anterior", () => {
    expect(recordTournamentCatch(riverFish(2))).toBe(true);
    expect(recordTournamentCatch(riverFish(1))).toBe(false);
    expect(recordTournamentCatch(riverFish(4))).toBe(true);
    expect(get(tournament).best.score).toBe(4);
  });

  it("depois das 17h não aceita mais captura", () => {
    inGameMinutes.set(17 * 60);
    expect(recordTournamentCatch(riverFish(9))).toBe(false);
  });

  it("um dia novo começa sem o peixe do torneio anterior", () => {
    recordTournamentCatch(riverFish(4));
    goToDay({ season: 1, day: 10 });
    expect(todaysTournament().entry.best).toBeNull();
  });

  it("entregar paga a colocação uma vez só", () => {
    recordTournamentCatch(riverFish(999));
    const result = submitTournament();
    expect(result.place).toBe(1);
    expect(get(money)).toBe(500 + TOURNAMENTS["Derby de Primavera"].prizes[0]);
    expect(submitTournament()).toBeNull();
    expect(get(money)).toBe(500 + TOURNAMENTS["Derby de Primavera"].prizes[0]);
    expect(recordTournamentCatch(riverFish(1000))).toBe(false);
  });

  it("sem peixe não dá para entregar", () => {
    expect(submitTournament()).toBeNull();
  });
});
