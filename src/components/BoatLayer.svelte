<script>
  import { TILE_SIZE, BOAT_BOUNDS, DEEP_SEA_DECK, DEEP_SEA_MAST } from "../game/constants.js";
  import { currentMap, constructions } from "../game/stores.js";

  const HULL = "#7a4a24";
  const OUTLINE = "#2b1708";
  const SAIL = "#f5f1e6";
  const DECK = "#c08a52";
  const PLANK_LINE = "#8a5a2e";

  const deck = DEEP_SEA_DECK;
  const left = deck.x1;
  const right = deck.x2 + 1;
  const middle = (left + right) / 2;
  const planks = Array.from({ length: (right - left) * 2 - 1 }, (_, index) => left + (index + 1) / 2);
  const view = { x: left - 0.5, y: deck.y1 - 2, width: right - left + 1, height: deck.y2 - deck.y1 + 4 };

  $: moored = $currentMap === "village" && $constructions.boat?.status === "built";
</script>

{#if moored}
  <svg
    class="boat-layer"
    style="left: {BOAT_BOUNDS.x1 * TILE_SIZE}px; top: {(BOAT_BOUNDS.y1 - 0.6) * TILE_SIZE}px;"
    width={2 * TILE_SIZE}
    height={1.6 * TILE_SIZE}
    viewBox="0 0 2 1.6"
    aria-label="Barco atracado"
    role="img"
  >
    <path d="M0.05 0.85 H1.55 L1.95 1.05 L1.55 1.5 H0.3 Z" fill={HULL} stroke={OUTLINE} stroke-width="0.06" />
    <path d="M0.15 0.95 H1.5" stroke="#b07a45" stroke-width="0.08" />
    <path d="M0.9 0.85 V0.08" stroke={OUTLINE} stroke-width="0.07" />
    <path d="M0.95 0.12 L1.55 0.75 H0.95 Z" fill={SAIL} stroke={OUTLINE} stroke-width="0.04" />
  </svg>
{/if}

{#if $currentMap === "deep_sea"}
  <svg
    class="boat-layer"
    style="left: {view.x * TILE_SIZE}px; top: {view.y * TILE_SIZE}px;"
    width={view.width * TILE_SIZE}
    height={view.height * TILE_SIZE}
    viewBox="{view.x} {view.y} {view.width} {view.height}"
    aria-hidden="true"
  >
    <path
      d="M{left} {deck.y1} L{middle} {deck.y1 - 1.6} L{right} {deck.y1} Z"
      fill={HULL}
      stroke={OUTLINE}
      stroke-width="0.08"
    />
    <path
      d="M{left} {deck.y2 + 1} H{right} L{right - 0.4} {deck.y2 + 1.6} H{left + 0.4} Z"
      fill={HULL}
      stroke={OUTLINE}
      stroke-width="0.08"
    />
    <rect x={left} y={deck.y1} width={right - left} height={deck.y2 - deck.y1 + 1} fill={DECK} />
    {#each planks as x}
      <path d="M{x} {deck.y1} V{deck.y2 + 1}" stroke={PLANK_LINE} stroke-width="0.04" />
    {/each}
    <path d="M{left} {deck.y1} H{right} M{left} {deck.y2 + 1} H{right}" stroke={OUTLINE} stroke-width="0.06" />
    <rect x={left - 0.18} y={deck.y1} width="0.18" height={deck.y2 - deck.y1 + 1} fill={HULL} stroke={OUTLINE} stroke-width="0.04" />
    <rect x={right} y={deck.y1} width="0.18" height={deck.y2 - deck.y1 + 1} fill={HULL} stroke={OUTLINE} stroke-width="0.04" />
    <path d="M{DEEP_SEA_MAST.x + 0.5} {DEEP_SEA_MAST.y + 0.9} V{DEEP_SEA_MAST.y - 1.4}" stroke={OUTLINE} stroke-width="0.14" />
    <path
      d="M{DEEP_SEA_MAST.x + 0.6} {DEEP_SEA_MAST.y - 1.3} L{DEEP_SEA_MAST.x + 1.6} {DEEP_SEA_MAST.y + 0.3} H{DEEP_SEA_MAST.x + 0.6} Z"
      fill={SAIL}
      stroke={OUTLINE}
      stroke-width="0.05"
      opacity="0.92"
    />
  </svg>
{/if}

<style>
  .boat-layer {
    position: absolute;
    z-index: 13;
    pointer-events: none;
    overflow: visible;
  }
</style>
