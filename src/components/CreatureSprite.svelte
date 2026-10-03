<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { WORLD_SPRITES } from "../game/data/worldCreatures.js";
  import { draw } from "../game/sprites.js";

  export let species;
  export let size = 1;
  export let direction = "down";
  export let moving = false;

  const directions = { down: 0, left: 2, up: 4, right: 6 };
  $: sheet = WORLD_SPRITES[species?.dexId];
  $: scale = sheet ? Math.min(size * TILE_SIZE / sheet.width, size * TILE_SIZE / sheet.height) : 1;
</script>

<div class="relative w-full h-full pointer-events-none" role="img" aria-label={species?.name || "Criatura"}>
  {#if sheet}
    <div
      class="absolute left-1/2 top-1/2 creature-sprite"
      class:moving
      style="width: {sheet.width}px; height: {sheet.height}px; margin-left: {-sheet.width / 2}px; margin-top: {-sheet.height / 2}px; transform: scale({scale}); background-image: url('/assets/world/{species.dexId}-walk.png'); background-position: 0px {-directions[direction] * sheet.height}px; --sheet-end: {-sheet.width * sheet.frames}px; --frames: {sheet.frames}; --duration: {sheet.frames * 0.16}s;"
    ></div>
  {:else if species?.sprite}
    {@html draw(species.sprite, species.name)}
  {/if}
</div>

<style>
  .creature-sprite {
    image-rendering: pixelated;
    background-repeat: no-repeat;
  }

  .moving {
    animation: creature-walk var(--duration) steps(var(--frames)) infinite;
  }

  @keyframes creature-walk {
    from { background-position-x: 0; }
    to { background-position-x: var(--sheet-end); }
  }
</style>