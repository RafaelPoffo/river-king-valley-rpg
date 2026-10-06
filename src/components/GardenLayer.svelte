<script>
  import { currentMap, garden, gardenDay, gardenVisitor } from "../game/stores.js";
  import { GARDEN_PLOTS, fruitFor } from "../game/garden.js";
  import { TILE_SIZE } from "../game/constants.js";
  import { POKEMON_SPRITES } from "../game/overworldAtlas.js";
  import OverworldSprite from "./OverworldSprite.svelte";
</script>

{#if $currentMap === "bug_forest"}
  <div class="absolute bg-white/90 border-2 border-black px-2 text-xs font-bold" style={`left:${24 * TILE_SIZE}px;top:${17 * TILE_SIZE}px;z-index:15`}>JARDIM</div>
  {#each GARDEN_PLOTS as plot}
    {@const tree = $garden.find((item) => item.x === plot.x && item.y === plot.y)}
    <div class="absolute flex items-center justify-center pointer-events-none" style={`left:${plot.x * TILE_SIZE}px;top:${plot.y * TILE_SIZE}px;width:${TILE_SIZE}px;height:${TILE_SIZE}px;z-index:19`} title={tree ? fruitFor(tree.fruitId)?.name : "Canteiro vazio"}>
      {#if tree && tree.grownAt <= $gardenDay}
        <img src={tree.readyAt <= $gardenDay ? "/assets/garden_tree.png" : "/assets/garden_empty.png"} alt={fruitFor(tree.fruitId)?.name} class="h-full w-full" style="image-rendering:pixelated" />
      {:else}
        <img src="/assets/garden_seed.png" alt={tree ? "Muda crescendo" : "Canteiro"} class="h-6 w-6" style={`image-rendering:pixelated;opacity:${tree ? 1 : 0.5}`} />
      {/if}
    </div>
  {/each}
  {#if $gardenVisitor}
    <div class="absolute pointer-events-none" style={`left:${$gardenVisitor.x * TILE_SIZE}px;top:${$gardenVisitor.y * TILE_SIZE}px;width:${TILE_SIZE}px;height:${TILE_SIZE}px;z-index:20`}>
      <OverworldSprite sprite={POKEMON_SPRITES[$gardenVisitor.dexId]} moving label="Visitante do jardim" />
    </div>
  {/if}
{/if}