<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, wildInsects } from "../game/stores.js";
  import { insectSpecies } from "../game/insectHunt.js";
</script>

{#if $currentMap === "bug_forest"}
  {#each $wildInsects as insect (insect.id)}
    {@const species = insectSpecies(insect)}
    <div
      class="absolute flex items-center justify-center pointer-events-none"
      style="left: {insect.x * TILE_SIZE}px; top: {insect.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 18;"
      title={species?.name || "Inseto"}
    >
      {#if species?.pixelSprite}
        <img class="h-9 w-9 object-contain [image-rendering:pixelated]" src={species.pixelSprite} alt={species.name} />
      {:else}
        <span class="text-2xl drop-shadow">{species?.emoji || "🐛"}</span>
      {/if}
    </div>
  {/each}
{/if}