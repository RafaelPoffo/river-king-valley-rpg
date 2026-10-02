<script>
  import { TILE_SIZE, MAPS_DATA, BUILDING_SIGNS } from "../game/constants.js";
  import {
    currentMap,
    constructions,
    deepSeaFishingActive,
  } from "../game/stores.js";
  import { getTileSvg } from "../game/tileRenderer.js";

  $: rows = MAPS_DATA[$currentMap] || [];
  $: tiles = rows.flatMap((row, y) =>
    [...row].map((char, x) => ({
      key: `${$currentMap}-${x}-${y}`,
      x,
      y,
      html: getTileSvg(char, x, y, $constructions, $deepSeaFishingActive),
    }))
  );
  $: signs =
    $currentMap === "village"
      ? BUILDING_SIGNS.map((s) => ({
          ...s,
          text:
            !s.requires || $constructions[s.requires]?.status === "built" ? s.label : s.fallback,
        }))
      : [];
</script>

{#each tiles as tile (tile.key)}
  <div class="tile" style="left: {tile.x * TILE_SIZE}px; top: {tile.y * TILE_SIZE}px;">
    {@html tile.html}
  </div>
{/each}

{#each signs as sign (sign.label)}
  <div
    class="building-sign retro-font"
    style="left: {(sign.x + 0.5) * TILE_SIZE}px; top: {sign.y * TILE_SIZE - 10}px;"
  >
    {sign.text}
  </div>
{/each}

<style>
  .building-sign {
    position: absolute;
    transform: translateX(-50%);
    z-index: 5;
    white-space: nowrap;
    pointer-events: none;
    padding: 3px 6px;
    font-size: 7px;
    color: #fff8e1;
    background: #7a4a24;
    border: 2px solid #3b2210;
    box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.35);
  }
</style>
