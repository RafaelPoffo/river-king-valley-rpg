<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, wildInsects, day, dungeonRun, petCompanion, terrarium } from "../game/stores.js";
  import { insectSpecies } from "../game/insectHunt.js";
  import { insectSpriteFor, worldSizeFor } from "../game/overworldAtlas.js";
  import { ONIX_ROCK, onixHoleOpen } from "../game/dungeon.js";
  import { HOUSE_TERRARIUM } from "../game/pet.js";
  import CreatureSprite from "./CreatureSprite.svelte";
  import OverworldSprite from "./OverworldSprite.svelte";

  const ONIX = { name: "Onix", dexId: "0095" };

  function displayName(insect, species) {
    return species?.name || "Inseto";
  }

  $: housePet = $currentMap === "player_house" && $terrarium.size && $petCompanion && !$terrarium.inBall
    ? $petCompanion
    : null;
  $: dungeonFoe = $currentMap === "dungeon" ? $dungeonRun?.foe : null;
  $: dungeonSize = dungeonFoe ? worldSizeFor(dungeonFoe.dexId) : 1;
</script>

{#if $currentMap === "bug_forest"}
  {#each $wildInsects as insect (insect.id)}
    {@const species = insectSpecies(insect)}
    <div
      class="absolute flex items-center justify-center pointer-events-none"
      style="left: {insect.x * TILE_SIZE}px; top: {insect.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 18;"
      title={displayName(insect, species)}
    >
      <OverworldSprite sprite={insectSpriteFor(insect.id, species?.dexId)} label={displayName(insect, species)} moving />
    </div>
  {/each}
  <div
    class="absolute pointer-events-none"
    style="left: {ONIX_ROCK.x * TILE_SIZE}px; top: {ONIX_ROCK.y * TILE_SIZE}px; width: {TILE_SIZE * 2}px; height: {TILE_SIZE * 2}px; z-index: 18;"
    title={onixHoleOpen($day) ? "Buraco da dungeon" : "Onix empurrando a rocha"}
  >
    {#if !onixHoleOpen($day)}
      <CreatureSprite species={ONIX} direction="left" moving />
    {:else}
      <span class="text-xs">🕳️</span>
    {/if}
  </div>
{/if}

{#if dungeonFoe}
  <div
    class="absolute pointer-events-none"
    style="left: {13 * TILE_SIZE}px; top: {10 * TILE_SIZE}px; width: {dungeonSize * TILE_SIZE}px; height: {dungeonSize * TILE_SIZE}px; z-index: 18;"
  >
    <CreatureSprite species={dungeonFoe} direction="left" moving />
  </div>
{/if}

{#if $currentMap === "player_house" && $terrarium.size}
  <div
    class="absolute pointer-events-none terrarium-box"
    style="left: {HOUSE_TERRARIUM.x * TILE_SIZE}px; top: {HOUSE_TERRARIUM.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 16;"
    title="Terrário"
  ></div>
  {#if housePet}
    <div
      class="absolute pointer-events-none"
      style="left: {(HOUSE_TERRARIUM.x + 1) * TILE_SIZE}px; top: {HOUSE_TERRARIUM.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 18;"
      title={housePet.name}
    >
      <CreatureSprite species={housePet} moving />
    </div>
  {/if}
{/if}

<style>
  .terrarium-box {
    box-shadow: inset 0 0 0 3px #4a9090, inset 0 0 8px #9ce6e6;
    background: rgba(156, 230, 230, 0.28);
  }
</style>
