<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, day, gameMode, seasonIndex } from "../game/stores.js";
  import { BUG_COMPETITOR_SEATS, competitorsForDay } from "../game/bugTournament.js";
  import { CHARACTER_SPRITES } from "../game/overworldAtlas.js";
  import OverworldSprite from "./OverworldSprite.svelte";
</script>

{#if $currentMap === "bug_forest"}
  {#each competitorsForDay($seasonIndex, $day, $gameMode) as competitor, index (competitor.id)}
    {@const seat = BUG_COMPETITOR_SEATS[index]}
    <div
      class="absolute pointer-events-none flex flex-col items-center justify-center"
      style="left: {seat.x * TILE_SIZE}px; top: {seat.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 22;"
      title={`${competitor.name} - ${competitor.persona}`}
    >
      <OverworldSprite sprite={CHARACTER_SPRITES[competitor.id] || CHARACTER_SPRITES.veteran} label={competitor.name} />
    </div>
  {/each}
{/if}