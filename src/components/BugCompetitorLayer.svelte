<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, day, gameMode, seasonIndex } from "../game/stores.js";
  import { BUG_COMPETITOR_SEATS, competitorsForDay } from "../game/bugTournament.js";
</script>

{#if $currentMap === "bug_forest"}
  {#each competitorsForDay($seasonIndex, $day, $gameMode) as competitor, index (competitor.id)}
    {@const seat = BUG_COMPETITOR_SEATS[index]}
    <div
      class="absolute pointer-events-none flex flex-col items-center justify-center"
      style="left: {seat.x * TILE_SIZE}px; top: {seat.y * TILE_SIZE}px; width: {TILE_SIZE}px; height: {TILE_SIZE}px; z-index: 22;"
      title={`${competitor.name} - ${competitor.persona}`}
    >
      <span class="flex h-8 w-8 items-center justify-center border border-[#624329] bg-[#f2e5cb] text-xl shadow">{competitor.avatar}</span>
    </div>
  {/each}
{/if}