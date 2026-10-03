import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import {
  PERSISTED_FIELDS,
  SAVE_VERSION,
  serializeState,
  applyState,
  resetState,
  migrateSave,
} from "./saveSystem.js";
import { money, playerName, lastWormHarvestDay, gameMode, constructions, upgrades, worldCreatures, worldPopulationDay } from "./stores.js";
import { INITIAL_CONSTRUCTIONS, INITIAL_UPGRADES } from "./constants.js";
import { ensureWorldPopulation, removeWorldCreature } from "./worldCreatures.js";

describe("registro do save", () => {
  it("não tem chaves repetidas", () => {
    const keys = PERSISTED_FIELDS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("salvar e carregar devolve o mesmo estado", () => {
    resetState("normal");
    money.set(1234);
    playerName.set("Denis");
    lastWormHarvestDay.set(7);
    const saved = JSON.parse(JSON.stringify(serializeState()));

    resetState("pokemon");
    playerName.set("Outro");
    applyState(migrateSave(saved));

    expect(get(money)).toBe(1234);
    expect(get(playerName)).toBe("Denis");
    expect(get(lastWormHarvestDay)).toBe(7);
    expect(get(gameMode)).toBe("normal");
  });

  it("jogo novo zera o progresso mas mantém o nome digitado", () => {
    playerName.set("Denis");
    money.set(9999);
    lastWormHarvestDay.set(12);
    resetState("pokemon");

    expect(get(playerName)).toBe("Denis");
    expect(get(money)).toBe(500);
    expect(get(lastWormHarvestDay)).toBe(0);
    expect(get(gameMode)).toBe("pokemon");
  });

  it("preserva a população diária e não ressuscita criaturas removidas ao carregar", () => {
    resetState("pokemon");
    ensureWorldPopulation();
    const removedId = get(worldCreatures)[0].id;
    removeWorldCreature(removedId);
    const remaining = get(worldCreatures);
    const populationDay = get(worldPopulationDay);
    const saved = JSON.parse(JSON.stringify(serializeState()));
    resetState("normal");
    applyState(migrateSave(saved));
    expect(get(worldCreatures)).toEqual(remaining);
    expect(get(worldPopulationDay)).toBe(populationDay);
    expect(ensureWorldPopulation()).toBe(false);
    expect(get(worldCreatures).some((creature) => creature.id === removedId)).toBe(false);
  });

  it("campo ausente no save volta ao valor inicial", () => {
    resetState("normal");
    money.set(42);
    applyState(migrateSave({ gameMode: "normal" }));
    expect(get(money)).toBe(500);
    expect(get(worldCreatures)).toEqual([]);
    expect(get(worldPopulationDay)).toBeNull();
  });
});

describe("migração", () => {
  it("save antigo sem versão chega na versão atual", () => {
    const migrated = migrateSave({ money: 10 });
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.money).toBe(10);
  });

  it("construções e upgrades novos aparecem em saves antigos", () => {
    const [firstConstruction] = Object.keys(INITIAL_CONSTRUCTIONS);
    const [firstUpgrade] = Object.keys(INITIAL_UPGRADES);
    const migrated = migrateSave({ constructions: {}, upgrades: {} });
    applyState(migrated);

    expect(get(constructions)[firstConstruction]).toEqual(INITIAL_CONSTRUCTIONS[firstConstruction]);
    expect(get(upgrades)[firstUpgrade]).toEqual(INITIAL_UPGRADES[firstUpgrade]);
  });

  it("não perde o progresso que o save antigo já tinha", () => {
    const [firstConstruction] = Object.keys(INITIAL_CONSTRUCTIONS);
    const old = { constructions: { [firstConstruction]: { ...INITIAL_CONSTRUCTIONS[firstConstruction], status: "built" } } };
    expect(migrateSave(old).constructions[firstConstruction].status).toBe("built");
  });

  it("save já atualizado não é alterado de novo", () => {
    const current = { version: SAVE_VERSION, money: 77, constructions: {} };
    expect(migrateSave(current).constructions).toEqual({});
  });
});
