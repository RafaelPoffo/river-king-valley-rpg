<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { CHARACTER_SPRITES } from "../game/overworldAtlas.js";
  import OverworldSprite from "./OverworldSprite.svelte";
  import {
    TILE_SIZE,
    FESTIVAL_STALL,
    DEEP_SEA_CAPTAIN,
    getNpcLocation,
  } from "../game/constants.js";
  import {
    currentMap,
    villagers,
    inGameMinutes,
    day,
    currentFestival,
  } from "../game/stores.js";
</script>

{#each $villagers as npc}
  {@const loc = getNpcLocation(npc, $inGameMinutes, $day)}
  {#if loc.map === $currentMap}
    <div
      class="tile"
      style="left: {loc.x * TILE_SIZE}px; top: {loc.y * TILE_SIZE}px; z-index: 20;"
      title={npc.name}
    >
      <OverworldSprite sprite={CHARACTER_SPRITES[npc.id] || CHARACTER_SPRITES.veteran} label={npc.name} />
    </div>
  {/if}
{/each}

{#if $currentMap === "deep_sea"}
  <div
    class="tile"
    style="left: {DEEP_SEA_CAPTAIN.x * TILE_SIZE}px; top: {DEEP_SEA_CAPTAIN.y * TILE_SIZE}px; z-index: 20;"
    title="Capitão Thomas"
  >
    <OverworldSprite sprite={CHARACTER_SPRITES.veteran} direction="up" label="Capitão Thomas" />
  </div>
{/if}

{#if $currentFestival && $currentMap === "village"}
  <div
    class="tile"
    style="left: {FESTIVAL_STALL.x * TILE_SIZE}px; top: {FESTIVAL_STALL.y * TILE_SIZE}px; z-index: 15;"
    title={$currentFestival}
  >
    {@html draw(SPRITES.stall)}
  </div>
{/if}
