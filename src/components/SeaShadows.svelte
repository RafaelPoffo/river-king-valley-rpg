<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap } from "../game/stores.js";

  export let seaShadows = [];
</script>

{#if $currentMap === "village"}
  {#each seaShadows as shadow}
    {#if shadow.active}
      <div
        class="tile pointer-events-none"
        style="left: {shadow.x * TILE_SIZE}px; top: {shadow.y * TILE_SIZE}px; z-index: 15;"
      >
        {@html draw(SPRITES.shadow)}
      </div>
    {/if}
  {/each}
{/if}
