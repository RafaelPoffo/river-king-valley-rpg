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
  <svg
    class="boat-layer"
    viewBox="0 0 32 24"
    style="left: {BOAT_BOUNDS.x1 * TILE_SIZE}px; top: {(BOAT_BOUNDS.y1 - 0.55) * TILE_SIZE}px; width: {2 * TILE_SIZE}px; height: {1.6 * TILE_SIZE}px;"
    shape-rendering="crispEdges"
    role="img"
    aria-label="Barco atracado"
  >
    <rect x="2" y="10" width="28" height="10" fill="#8c6030"/>
    <rect x="3" y="11" width="26" height="3" fill="#c49858"/>
    <rect x="4" y="14" width="24" height="2" fill="#704820"/>
    <path d="M2 10h4v10H2zM26 10h4v10h-4z" fill="#583818"/>
    <rect x="14" y="2" width="2" height="10" fill="#d8d0b0"/>
    <path d="M16 3h10v6H16z" fill="#e8e0c8"/>
    <path d="M16 3h10v1H16z" fill="#fff8e0"/>
    <rect x="6" y="8" width="4" height="3" fill="#a07838"/>
    <rect x="22" y="18" width="3" height="3" fill="#382010"/>
  </svg>
{/if}

{#if $currentMap === "deep_sea"}
  <svg
    class="boat-layer"
    viewBox="0 0 80 144"
    style="left: {view.x * TILE_SIZE}px; top: {view.y * TILE_SIZE}px; width: {view.width * TILE_SIZE}px; height: {view.height * TILE_SIZE}px;"
    shape-rendering="crispEdges"
    role="img"
    aria-label="Barco de pesca no Norte"
  >
    <rect x="18" y="24" width="44" height="100" fill="#8c6030"/>
    <rect x="20" y="26" width="40" height="96" fill="#c49858"/>
    <path d="M20 38h40M20 50h40M20 62h40M20 74h40M20 86h40M20 98h40M20 110h40" stroke="#a07838" stroke-width="2"/>
    <rect x="16" y="24" width="4" height="100" fill="#583818"/>
    <rect x="60" y="24" width="4" height="100" fill="#583818"/>
    <rect x="18" y="20" width="44" height="8" fill="#704820"/>
    <rect x="22" y="16" width="36" height="6" fill="#8c6030"/>
    <rect x="36" y="8" width="4" height="40" fill="#d8d0b0"/>
    <path d="M40 10h18v16H40z" fill="#e8e0c8"/>
    <rect x="34" y="46" width="8" height="8" fill="#382010"/>
    <rect x="28" y="112" width="24" height="8" fill="#704820"/>
  </svg>
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
