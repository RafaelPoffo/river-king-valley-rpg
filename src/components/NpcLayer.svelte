<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import {
    TILE_SIZE,
    FESTIVAL_STALL,
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
      {@html draw(npc.sprite)}
    </div>
  {/if}
{/each}

{#if $currentFestival && $currentMap === "village"}
  <div
    class="tile"
    style="left: {FESTIVAL_STALL.x * TILE_SIZE}px; top: {FESTIVAL_STALL.y * TILE_SIZE}px; z-index: 15;"
    title={$currentFestival}
  >
    {@html draw(SPRITES.stall)}
  </div>
{/if}
