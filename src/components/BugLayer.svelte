<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, gameMode, wildInsects } from "../game/stores.js";
  import { insectSpecies } from "../game/insectHunt.js";
  import { insectSpriteFor } from "../game/overworldAtlas.js";
  import OverworldSprite from "./OverworldSprite.svelte";

  const disguiseNames = ["Pidgey", "Sentret", "Hoothoot", "Rattata", "Ledyba", "Spearow"];
  function displayName(insect, species) {
    if ($gameMode !== "pokemon") return species?.name || "Inseto";
    const index = [...insect.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return disguiseNames[index % disguiseNames.length];
  }
</script>

{#if $currentMap === "bug_forest"}
  {#each $wildInsects as insect (insect.id)}
    {@const species = insectSpecies(insect)}
    <div
      class="absolute flex items-center justify-center pointer-events-none"
      style="left: {insect.x * TILE_SIZE}px; top: {insect.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 18;"
      title={displayName(insect, species)}
    >
      <OverworldSprite sprite={insectSpriteFor(insect.id, $gameMode === "pokemon" ? species?.dexId : null)} label={displayName(insect, species)} moving />
    </div>
  {/each}
{/if}