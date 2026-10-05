import { beforeEach, describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { birdLog, birdPopulationDay, birdwatchingLuck, dailyBirds, day, gameMode, seasonIndex } from "./stores.js";
import { birdRarityMultiplier, birdsForMode, ensureDailyBirds, generateDailyBirds, observeBird } from "./birdWatching.js";
import { POKEMON_SPRITES } from "./overworldAtlas.js";

describe("observação de pássaros", () => {
  beforeEach(() => {
    gameMode.set("normal");
    day.set(1);
    seasonIndex.set(0);
    birdLog.set({});
    birdwatchingLuck.set(0);
    dailyBirds.set([]);
    birdPopulationDay.set(null);
  });

  it("gera de uma a oito aves reprodutíveis em posições pelo panorama", () => {
    for (const mode of ["normal", "pokemon"]) {
      for (let today = 1; today <= 15; today++) {
        const key = `1:${today}`;
        const birds = generateDailyBirds(key, mode);
        expect(birds.length).toBeGreaterThanOrEqual(1);
        expect(birds.length).toBeLessThanOrEqual(8);
        expect(birds).toEqual(generateDailyBirds(key, mode));
        expect(birds.every((bird) => bird.x >= 100 && bird.x < 3900 && bird.y >= 80 && bird.y < 760)).toBe(true);
        expect(new Set(birds.map((bird) => bird.speciesId)).size).toBe(1);
      }
    }
  });

  it("inclui aves Pokémon voadoras de Kanto e Johto com portraits", () => {
    const birds = birdsForMode("pokemon");
    expect(birds.some((bird) => bird.name === "Pidgey")).toBe(true);
    expect(birds.some((bird) => bird.name === "Hoothoot")).toBe(true);
    expect(birds.every((bird) => bird.portrait && bird.dexId)).toBe(true);
    expect(birds.every((bird) => POKEMON_SPRITES[bird.dexId] && !bird.sprite)).toBe(true);
  });

  it("usa emojis para aves do modo original sem imagens remotas", () => {
    expect(birdsForMode("normal").every((bird) => bird.emoji && !bird.sprite && !bird.portrait)).toBe(true);
  });

  it("registra tamanho, recorde e concede bônus uma vez por ave observada", () => {
    gameMode.set("normal");
    dailyBirds.set([{ id: "today:0", speciesId: "pomba", x: 30, y: 40, size: 18, observed: false }]);
    const result = observeBird("today:0");
    expect(result.species.name).toBe("Pomba");
    expect(result.observation.recordSize).toBe(18);
    expect(result.observation.smallestSize).toBe(18);
    expect(get(birdwatchingLuck)).toBe(1);
    expect(get(birdLog).pomba.count).toBe(1);
    expect(get(dailyBirds)[0].observed).toBe(true);
    expect(observeBird("today:0")).toBeNull();
  });

  it("soma estrelas ao nível de sorte e limita o bônus a cinco", () => {
    gameMode.set("pokemon");
    dailyBirds.set([
      { id: "rare:0", speciesId: "bird_0018", x: 10, y: 20, size: 72, observed: false },
      { id: "legend:0", speciesId: "bird_0144", x: 30, y: 20, size: 92, observed: false },
    ]);
    expect(observeBird("rare:0").luck).toBe(3);
    expect(observeBird("legend:0").luck).toBe(5);
  });

  it("melhora proporcionalmente a chance de peixes raros sem afetar os comuns", () => {
    expect(birdRarityMultiplier(5, 1)).toBe(1);
    expect(birdRarityMultiplier(1, 5)).toBeGreaterThan(birdRarityMultiplier(0, 5));
    expect(birdRarityMultiplier(5, 6)).toBeGreaterThan(birdRarityMultiplier(5, 2));
    expect(birdRarityMultiplier(9, 6)).toBe(birdRarityMultiplier(5, 6));
  });

  it("atualiza a população apenas uma vez por dia e modo", () => {
    expect(ensureDailyBirds()).toBe(true);
    const firstPopulation = get(dailyBirds);
    const firstKey = get(birdPopulationDay);
    expect(ensureDailyBirds()).toBe(false);
    day.set(2);
    expect(ensureDailyBirds()).toBe(true);
    expect(get(birdPopulationDay)).not.toBe(firstKey);
    expect(get(dailyBirds)).not.toEqual(firstPopulation);
  });
});