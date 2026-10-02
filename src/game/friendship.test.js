import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  heartsOf,
  hasPerk,
  giftValue,
  pickGift,
  talkTo,
  giveGift,
  friendPrice,
  dishPrice,
  friendLine,
  villagerById,
  captainTip,
} from "./friendship.js";
import { FRIENDSHIP, INITIAL_VILLAGERS } from "./constants.js";
import { SPRITES } from "./sprites.js";
import { friendship, inventory, seasonIndex, day, gameMode } from "./stores.js";

const riverFish = { type: "fish", biome: "river", stars: 1, rarity: 1, name: "Lambari" };
const seaFish = { type: "fish", biome: "sea", stars: 1, rarity: 2, name: "Sardinha" };
const trash = { type: "fish", sprite: SPRITES.trash, name: "Bota" };

function setHearts(npcId, hearts) {
  friendship.update((all) => ({
    ...all,
    [npcId]: { points: hearts * FRIENDSHIP.pointsPerHeart, talkDay: 0, giftDay: 0 },
  }));
}

beforeEach(() => {
  gameMode.set("normal");
  friendship.set({});
  inventory.set([]);
  seasonIndex.set(0);
  day.set(1);
});

describe("moradores", () => {
  it("todo morador tem gosto, falas de amizade e meta de vantagem", () => {
    for (const npc of INITIAL_VILLAGERS) {
      expect(npc.taste).toBeTruthy();
      expect(npc.friendLines).toHaveLength(2);
      expect(FRIENDSHIP.perkHearts[npc.id]).toBeGreaterThan(0);
    }
  });
});

describe("presentes", () => {
  const thomas = () => villagerById("veteran");

  it("peixe do gosto vale mais, lixo não vale nada", () => {
    expect(giftValue(thomas(), seaFish)).toBe(FRIENDSHIP.lovedGift);
    expect(giftValue(thomas(), riverFish)).toBe(FRIENDSHIP.likedGift);
    expect(giftValue(thomas(), trash)).toBe(0);
  });

  it("escolhe o peixe que o morador mais gosta", () => {
    inventory.set([trash, riverFish, seaFish]);
    expect(pickGift(thomas())).toBe(2);
    inventory.set([trash]);
    expect(pickGift(thomas())).toBe(-1);
  });

  it("um presente por dia, e o peixe sai da mochila", () => {
    inventory.set([seaFish, seaFish]);
    const result = giveGift(thomas(), 0);
    expect(result.loved).toBe(true);
    expect(get(inventory)).toHaveLength(1);
    expect(get(friendship).veteran.points).toBe(FRIENDSHIP.lovedGift);

    expect(giveGift(thomas(), 0)).toBeNull();
    expect(get(inventory)).toHaveLength(1);

    day.set(2);
    expect(giveGift(thomas(), 0)).not.toBeNull();
  });

  it("avisa quando a vantagem é liberada", () => {
    const need = FRIENDSHIP.perkHearts.veteran * FRIENDSHIP.pointsPerHeart;
    friendship.set({ veteran: { points: need - 1, talkDay: 0, giftDay: 0 } });
    inventory.set([seaFish]);
    expect(giveGift(thomas(), 0).unlockedPerk).toBe(true);
    expect(hasPerk("veteran")).toBe(true);
  });
});

describe("conversa", () => {
  it("conversar dá ponto uma vez por dia", () => {
    expect(talkTo("anna")).toBe(true);
    expect(talkTo("anna")).toBe(false);
    expect(get(friendship).anna.points).toBe(FRIENDSHIP.dailyTalk);
    day.set(2);
    expect(talkTo("anna")).toBe(true);
  });

  it("corações nunca passam do máximo", () => {
    friendship.set({ anna: { points: 999, talkDay: 0, giftDay: 0 } });
    talkTo("anna");
    expect(heartsOf("anna")).toBe(FRIENDSHIP.maxHearts);
  });

  it("a fala muda conforme a amizade", () => {
    const npc = villagerById("anna");
    expect(friendLine(npc)).toBe(npc.dialogNormal);
    setHearts("anna", 3);
    expect(friendLine(npc)).toBe(npc.friendLines[0]);
    setHearts("anna", 6);
    expect(friendLine(npc)).toBe(npc.friendLines[1]);
  });
});

describe("vantagens", () => {
  it("desconto do carpinteiro e da Ana só com amizade", () => {
    expect(friendPrice(1000)).toBe(1000);
    expect(dishPrice(300)).toBe(300);
    setHearts("carpenter", FRIENDSHIP.perkHearts.carpenter);
    setHearts("anna", FRIENDSHIP.perkHearts.anna);
    expect(friendPrice(1000)).toBe(900);
    expect(dishPrice(300)).toBe(150);
  });

  it("o capitão sempre tem uma dica de peixe raro do mar", () => {
    for (let s = 0; s < 4; s++) {
      seasonIndex.set(s);
      for (let d = 1; d <= 5; d++) {
        day.set(d);
        expect(captainTip()).toMatch(/^Dica: o .+ aparece no (alto-)?mar/);
      }
    }
  });
});
