<script>
  import { TILE_SIZE, BOAT_BOUNDS, DEEP_SEA_DECK } from "../game/constants.js";
  import { currentMap, constructions } from "../game/stores.js";

  const deck = DEEP_SEA_DECK;
  const left = deck.x1;
  const right = deck.x2 + 1;
  const view = { x: left - 0.5, y: deck.y1 - 2, width: right - left + 1, height: deck.y2 - deck.y1 + 4 };

  $: moored = $currentMap === "village" && $constructions.boat?.status === "built";
</script>

{#if moored}
  <img
    class="boat-layer"
    src="/assets/crystal_boat_pixel.png"
    alt="Barco atracado"
    style="left: {BOAT_BOUNDS.x1 * TILE_SIZE}px; top: {(BOAT_BOUNDS.y1 - 0.6) * TILE_SIZE}px;"
    width={2 * TILE_SIZE}
    height={1.6 * TILE_SIZE}
  />
{/if}

{#if $currentMap === "deep_sea"}
  <img
    class="boat-layer"
    src="/assets/crystal_ship_pixel.png"
    alt="Barco de pesca no alto-mar"
    style="left: {view.x * TILE_SIZE}px; top: {view.y * TILE_SIZE}px;"
    width={view.width * TILE_SIZE}
    height={view.height * TILE_SIZE}
  />
{/if}

<style>
  .boat-layer {
    position: absolute;
    z-index: 13;
    pointer-events: none;
    overflow: visible;
    image-rendering: pixelated;
  }
</style>
