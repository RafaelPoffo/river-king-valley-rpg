import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { collectionEntries, collectionProgress, claimCollectionRewards, milestoneNeed } from "./collections.js";
import { COLLECTION_MILESTONES, FISH_DB } from "./constants.js";
import { POKEMON_DB } from "./data/pokemon.js";
import { museum, aquarium, claimedRewards, money, baitStock, ownedBaits, gameMode } from "./stores.js";

function own(store, entries) {
  store.set(Object.fromEntries(entries.map((f) => [f.id, { donated: true, name: f.name }])));
}

beforeEach(() => {
  gameMode.set("normal");
  museum.set({});
  aquarium.set({});
  claimedRewards.set([]);
  money.set(0);
  baitStock.set({});
  ownedBaits.set(["sem_isca"]);
});

describe("marcos", () => {
  it("as frações crescem e a última completa a coleção", () => {
    for (const list of Object.values(COLLECTION_MILESTONES)) {
      for (let i = 1; i < list.length; i++) expect(list[i].fraction).toBeGreaterThan(list[i - 1].fraction);
      expect(list.at(-1).fraction).toBe(1);
    }
  });

  it("toda coleção tem pelo menos um item nos dois modos", () => {
    for (const db of [FISH_DB, POKEMON_DB]) {
      for (const kind of ["museum", "aquarium"]) expect(collectionEntries(kind, db).length).toBeGreaterThan(0);
    }
  });

  it("nunca pede menos de 1 item", () => {
    expect(milestoneNeed(2, 0.1)).toBe(1);
  });
});

describe("resgate", () => {
  it("nada é pago antes de atingir o marco", () => {
    expect(claimCollectionRewards("museum")).toEqual([]);
    expect(get(money)).toBe(0);
  });

  it("paga o marco atingido uma vez só", () => {
    const relics = collectionEntries("museum", FISH_DB);
    const first = COLLECTION_MILESTONES.museum[0];
    own(museum, relics.slice(0, milestoneNeed(relics.length, first.fraction)));

    expect(claimCollectionRewards("museum")).toHaveLength(1);
    expect(get(money)).toBe(first.reward.money);
    expect(claimCollectionRewards("museum")).toEqual([]);
    expect(get(money)).toBe(first.reward.money);
  });

  it("completar tudo de uma vez paga todos os marcos e entrega as iscas", () => {
    own(aquarium, collectionEntries("aquarium", FISH_DB));
    const earned = claimCollectionRewards("aquarium");
    const expectedMoney = COLLECTION_MILESTONES.aquarium.reduce((sum, m) => sum + (m.reward.money || 0), 0);

    expect(earned).toHaveLength(COLLECTION_MILESTONES.aquarium.length);
    expect(get(money)).toBe(expectedMoney);
    expect(get(baitStock).isca_brilhante).toBe(13);
    expect(get(ownedBaits)).toContain("isca_brilhante");
    expect(collectionProgress("aquarium").milestones.every((m) => m.claimed)).toBe(true);
  });

  it("no modo Pokémon a coleção do museu pode ser completada", () => {
    gameMode.set("pokemon");
    own(museum, collectionEntries("museum", POKEMON_DB));
    expect(claimCollectionRewards("museum")).toHaveLength(COLLECTION_MILESTONES.museum.length);
  });
});
