<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, forestFeathers } from "../game/stores.js";
  import { draw } from "../game/sprites.js";
</script>

{#if $currentMap === "bug_forest"}
  {#each $forestFeathers as feather (feather.id)}
    <div
      class="absolute flex items-center justify-center pointer-events-none"
      style="left: {feather.x * TILE_SIZE}px; top: {feather.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 17;"
      title={feather.item?.name || "Pena"}
    >
      <div class="h-7 w-7 drop-shadow-md">
        {@html draw(feather.item?.sprite, feather.item?.name || "Pena")}
      </div>
    </div>
  {/each}
{/if}
