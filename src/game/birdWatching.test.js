import { beforeEach, describe, expect, it } from "vitest";
import { get } from "svelte/store";
import {
  birdLog,
  birdPopulationDay,
  birdwatchingLuck,
  dailyBirds,
  day,
  forestFeathers,
  gameMode,
  inventory,
  player,
  currentMap,
  phase,
  seasonIndex,
} from "./stores.js";
import {
  BINOCULAR_VIEW_HEIGHT,
  BINOCULAR_VIEW_WIDTH,
  GROUND_PERCH_MIN_Y,
  MIN_SPRITE_SIZE,
  birdLuckPoints,
  birdRarityMultiplier,
  birdsForMode,
  countableSightings,
  ensureDailyBirds,
  flyingVisitorCatalog,
  generateDailyBirds,
  observeBird,
  pickSightingInView,
  sightingInView,
  sightingSpriteSize,
  speciesDropsFeathers,
} from "./birdWatching.js";
import { POKEMON_SPRITES } from "./overworldAtlas.js";
import { interact } from "./gameActions.js";
import { PHASES } from "./phases.js";

describe("observação de pássaros", () => {
  beforeEach(() => {
    gameMode.set("normal");
    day.set(1);
    seasonIndex.set(0);
    birdLog.set({});
    birdwatchingLuck.set(0);
    dailyBirds.set([]);
    birdPopulationDay.set(null);
    forestFeathers.set([]);
    inventory.set([]);
  });

  it("gera de uma a oito aves reprodutíveis em posições pelo panorama", () => {
    for (const mode of ["normal", "pokemon"]) {
      for (let today = 1; today <= 15; today++) {
        const key = `1:${today}`;
        const flock = generateDailyBirds(key, mode);
        const birds = countableSightings(flock);
        expect(birds.length).toBeGreaterThanOrEqual(1);
        expect(birds.length).toBeLessThanOrEqual(8);
        expect(flock).toEqual(generateDailyBirds(key, mode));
        expect(flock.every((bird) => bird.x >= 100 && bird.x < 3900 && bird.y >= 80 && bird.y < 760)).toBe(true);
        expect(new Set(flock.map((bird) => bird.speciesId)).size).toBe(flock.length);
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

  it("no modo pokemon inclui voadores extras como Charizard e Dragonite", () => {
    const flyers = flyingVisitorCatalog();
    expect(flyers.some((bird) => bird.dexId === "0006" && bird.name === "Charizard")).toBe(true);
    expect(flyers.some((bird) => bird.dexId === "0149" && bird.name === "Dragonite")).toBe(true);
    expect(flyers.every((bird) => !birdsForMode("pokemon").some((item) => item.dexId === bird.dexId))).toBe(true);

    let sawFlyer = false;
    let sawNpc = false;
    let sawNamedFlyer = false;
    for (let today = 1; today <= 240; today++) {
      const visitors = generateDailyBirds(`fly:${today}`, "pokemon").filter((bird) => bird.kind === "visitor");
      if (visitors.some((bird) => bird.visitorType === "npc")) sawNpc = true;
      if (visitors.some((bird) => bird.visitorType === "pokemon")) sawFlyer = true;
      if (visitors.some((bird) => bird.dexId === "0006" || bird.dexId === "0149")) sawNamedFlyer = true;
    }
    expect(sawNpc).toBe(true);
    expect(sawFlyer).toBe(true);
    expect(sawNamedFlyer).toBe(true);
  });

  it("Doduo, Farfetch'd e Dodrio aparecem sempre na parte de baixo do panorama", () => {
    const grounded = new Set(["bird_0083", "bird_0084", "bird_0085"]);
    let seen = 0;
    for (let today = 1; today <= 120; today++) {
      for (const sighting of generateDailyBirds(`ground:${today}`, "pokemon")) {
        if (!grounded.has(sighting.speciesId)) continue;
        expect(sighting.y).toBeGreaterThanOrEqual(GROUND_PERCH_MIN_Y);
        seen += 1;
      }
    }
    expect(seen).toBeGreaterThan(0);
  });

  it("aumenta a visão dos binóculos e o tamanho mínimo renderizado", () => {
    expect(BINOCULAR_VIEW_WIDTH).toBe(288);
    expect(BINOCULAR_VIEW_HEIGHT).toBe(144);
    expect(MIN_SPRITE_SIZE).toBeGreaterThan(26);
    expect(sightingSpriteSize({ size: 12 })).toBe(MIN_SPRITE_SIZE);
    expect(sightingSpriteSize({ size: 80 })).toBeGreaterThanOrEqual(MIN_SPRITE_SIZE);
  });

  it("observa a ave cujo sprite cruza as lentes, não só o ponto de origem", () => {
    const cameraX = 1000;
    const cameraY = 200;
    const overlapping = { id: "edge", x: 970, y: 230, size: 48, observed: false };
    const centered = { id: "center", x: 1120, y: 250, size: 48, observed: false };
    const far = { id: "far", x: 40, y: 40, size: 80, observed: false };
    expect(sightingInView(overlapping, cameraX, cameraY)).toBe(true);
    expect(sightingInView(far, cameraX, cameraY)).toBe(false);
    expect(pickSightingInView([overlapping, far], cameraX, cameraY)?.id).toBe("edge");
    expect(pickSightingInView([overlapping, centered], cameraX, cameraY)?.id).toBe("center");
  });

  it("raras sao menos frequentes e observar todas nao garante dez pontos", () => {
    const catalog = birdsForMode("pokemon");
    let common = 0;
    let rare = 0;
    let lowLuckDays = 0;
    for (let today = 1; today <= 300; today++) {
      const species = countableSightings(generateDailyBirds(`test:${today}`, "pokemon"))
        .map((bird) => catalog.find((item) => item.id === bird.speciesId));
      common += species.filter((bird) => bird.rarity === 1).length;
      rare += species.filter((bird) => bird.rarity >= 4).length;
      if (species.reduce((sum, bird) => sum + birdLuckPoints(bird.rarity), 0) < 10) lowLuckDays++;
    }
    expect(common).toBeGreaterThan(rare * 4);
    expect(lowLuckDays).toBeGreaterThan(0);
  });

  it("usa emojis para aves do modo original sem imagens remotas", () => {
    expect(birdsForMode("normal").every((bird) => bird.emoji && !bird.sprite && !bird.portrait)).toBe(true);
  });

  it("registra tamanho, recorde e concede bônus uma vez por ave observada", () => {
    gameMode.set("normal");
    dailyBirds.set([{ id: "today:0", speciesId: "pomba", x: 30, y: 40, size: 18, observed: false }]);
    const result = observeBird("today:0", "normal", () => 1);
    expect(result.species.name).toBe("Pomba");
    expect(result.observation.recordSize).toBe(18);
    expect(result.observation.smallestSize).toBe(18);
    expect(get(birdwatchingLuck)).toBe(1);
    expect(get(birdLog).pomba.count).toBe(1);
    expect(get(dailyBirds)[0].observed).toBe(true);
    expect(observeBird("today:0")).toBeNull();
  });

  it("visitantes não aumentam a sorte nem entram no catálogo", () => {
    dailyBirds.set([{
      id: "visit:0",
      speciesId: "flyer_0006",
      kind: "visitor",
      visitorType: "pokemon",
      name: "Charizard",
      dexId: "0006",
      observed: false,
    }]);
    const result = observeBird("visit:0");
    expect(result.visitor).toBe(true);
    expect(get(birdwatchingLuck)).toBe(0);
    expect(get(birdLog)).toEqual({});
    expect(get(dailyBirds)[0].observed).toBe(true);
  });

  it("concede dois pontos por ave diferente e três por rara, até dez", () => {
    gameMode.set("pokemon");
    dailyBirds.set([
      { id: "rare:0", speciesId: "bird_0018", x: 10, y: 20, size: 72, observed: false },
      { id: "legend:0", speciesId: "bird_0144", x: 30, y: 20, size: 92, observed: false },
    ]);
    expect(observeBird("rare:0", "pokemon", () => 1).luck).toBe(2);
    expect(observeBird("legend:0", "pokemon", () => 1).luck).toBe(5);
    birdwatchingLuck.set(9);
    dailyBirds.set([{ id: "cap", speciesId: "bird_0144", size: 80, observed: false }]);
    expect(observeBird("cap", "pokemon", () => 1).luck).toBe(10);
  });

  it("só pássaros literais deixam pena e ela pode ir para a mochila", () => {
    expect(speciesDropsFeathers(birdsForMode("pokemon").find((bird) => bird.id === "bird_0016"))).toBe(true);
    expect(speciesDropsFeathers({ id: "flyer_0006", name: "Charizard" })).toBe(false);
    gameMode.set("normal");
    dailyBirds.set([{ id: "drop:0", speciesId: "pomba", x: 30, y: 40, size: 18, observed: false }]);
    const result = observeBird("drop:0", "normal", () => 0);
    expect(result.feather).toBeTruthy();
    expect(result.featherMessage).toContain("Pomba");
    expect(get(forestFeathers)).toHaveLength(1);

    const feather = get(forestFeathers)[0];
    currentMap.set("bug_forest");
    phase.set(PHASES.PLAYING);
    player.set({ x: feather.x, y: feather.y + 1, dir: "up" });
    interact();
    expect(get(forestFeathers)).toHaveLength(0);
    expect(get(inventory)[0].name).toBe("Pena de Pomba");
    expect(get(inventory)[0].priceFinal).toBeGreaterThan(0);
  });

  it("melhora proporcionalmente a chance de peixes raros sem afetar os comuns", () => {
    expect(birdRarityMultiplier(5, 1)).toBe(1);
    expect(birdRarityMultiplier(1, 5)).toBeGreaterThan(birdRarityMultiplier(0, 5));
    expect(birdRarityMultiplier(5, 6)).toBeGreaterThan(birdRarityMultiplier(5, 2));
    expect(birdRarityMultiplier(20, 6)).toBe(birdRarityMultiplier(10, 6));
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
