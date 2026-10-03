<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, day, seasonIndex, gameMode } from "../game/stores.js";
  import { ambientShadows } from "../game/ambientShadows.js";

  $: shadows = ambientShadows(`${$gameMode}:${$seasonIndex}:${$day}`);
</script>

{#if $currentMap === "village"}
  {#each shadows as shadow (shadow.id)}
    {@const px = shadow.size * TILE_SIZE}
    {@const offset = (TILE_SIZE - px) / 2}
    <div
      class="ambient-shadow"
      aria-hidden="true"
      style="width: {px}px; height: {px / 2}px; --x1: {shadow.x1 * TILE_SIZE + offset}px; --x2: {shadow.x2 * TILE_SIZE + offset}px; --y: {shadow.y * TILE_SIZE + TILE_SIZE / 2 - px / 4}px; animation-duration: {shadow.duration}s; animation-delay: {shadow.delay}s;"
    >
      <svg viewBox="0 0 20 10" width="100%" height="100%">
        <ellipse cx="8" cy="5" rx="8" ry="4" />
        <path d="M14 5 L20 0 L20 10 Z" />
      </svg>
    </div>
  {/each}
{/if}

<style>
  .ambient-shadow {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 11;
    pointer-events: none;
    fill: #0b2433;
    opacity: 0.5;
    animation-name: swim;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes swim {
    0% {
      transform: translate(var(--x1), var(--y)) scaleX(-1);
    }
    48% {
      transform: translate(var(--x2), var(--y)) scaleX(-1);
    }
    50% {
      transform: translate(var(--x2), var(--y)) scaleX(1);
    }
    98% {
      transform: translate(var(--x1), var(--y)) scaleX(1);
    }
    100% {
      transform: translate(var(--x1), var(--y)) scaleX(-1);
    }
  }
</style>
