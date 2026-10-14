<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, gameMode, wildInsects, day, dungeonRun, petCompanion } from "../game/stores.js";
  import { insectSpecies } from "../game/insectHunt.js";
  import { insectSpriteFor, POKEMON_SPRITES } from "../game/overworldAtlas.js";
  import { ONIX_ROCK, onixHoleOpen, DUNGEON_STAIRS } from "../game/dungeon.js";
  import OverworldSprite from "./OverworldSprite.svelte";

  function displayName(insect, species) {
    return species?.name || "Inseto";
  }
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
    class="absolute flex items-center justify-center pointer-events-none"
    style="left: {ONIX_ROCK.x * TILE_SIZE}px; top: {ONIX_ROCK.y * TILE_SIZE}px; width: {TILE_SIZE * 2}px; height: {TILE_SIZE}px; z-index: 18;"
    title={onixHoleOpen($day) ? "Buraco da dungeon" : "Onix empurrando a rocha"}
  >
    {#if !onixHoleOpen($day)}
      <OverworldSprite sprite={POKEMON_SPRITES["0095"]} direction="left" label="Onix" moving />
    {:else}
      <span class="text-xs">🕳️</span>
    {/if}
  </div>
{/if}

{#if $currentMap === "dungeon" && $dungeonRun?.foe}
  <div class="absolute" style="left: {13 * TILE_SIZE}px; top: {10 * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 18;">
    <OverworldSprite sprite={POKEMON_SPRITES[$dungeonRun.foe.dexId] || POKEMON_SPRITES["0074"]} label={$dungeonRun.foe.name} moving />
  </div>
{/if}