<script>
  import { TILE_SIZE, MAPS_DATA } from "../game/constants.js";
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
</script>

{#each tiles as tile (tile.key)}
  <div class="tile" style="left: {tile.x * TILE_SIZE}px; top: {tile.y * TILE_SIZE}px;">
    {@html tile.html}
  </div>
{/each}
