<script>
  import { onMount } from "svelte";
  import { TILE_SIZE, MAPS_DATA, BUILDING_SIGNS } from "../game/constants.js";
  import {
    currentMap,
    constructions,
    deepSeaFishingActive,
    seasonIndex,
  } from "../game/stores.js";
  import { getTileSvg } from "../game/tileRenderer.js";
  import { forestTrees, loadForestAtlas, TREE_ATLAS_SIZE } from "../game/forestAtlas.js";

  let treeSource = "";
  onMount(() => {
    let mounted = true;
    loadForestAtlas().then((url) => {
      if (mounted) treeSource = url;
    }).catch((error) => console.error("Falha ao carregar árvores da floresta", error));
    return () => { mounted = false; };
  });

  $: rows = MAPS_DATA[$currentMap] || [];
  $: trees = $currentMap === "bug_forest" ? forestTrees($seasonIndex) : [];
  $: tiles = rows.flatMap((row, y) =>
    [...row].map((char, x) => ({
      key: `${$currentMap}-${x}-${y}`,
      x,
      y,
      html: getTileSvg(char, x, y, $constructions, $currentMap),
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

{#each trees as tree (tree.key)}
  <svg
    class="forest-tree"
    viewBox="0 0 {tree.frame.width} {tree.frame.height}"
    style="left: {tree.left}px; top: {tree.top}px; width: {tree.width}px; height: {tree.height}px;"
    aria-hidden="true"
    data-tree-frame={tree.key}
  >
    {#if treeSource}
      <image href={treeSource} x={-tree.frame.x} y={-tree.frame.y} width={TREE_ATLAS_SIZE} height={TREE_ATLAS_SIZE} />
    {/if}
  </svg>
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
  .forest-tree {
    position: absolute;
    z-index: 16;
    overflow: hidden;
    image-rendering: pixelated;
    pointer-events: none;
    filter: drop-shadow(2px 3px 0 rgba(20, 47, 32, 0.22));
  }

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
