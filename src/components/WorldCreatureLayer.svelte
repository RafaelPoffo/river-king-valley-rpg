<script>
  import { TILE_SIZE } from "../game/constants.js";
  import { currentMap, worldCreatures } from "../game/stores.js";
  import { worldSpecies, creaturePosition } from "../game/worldCreatures.js";
  import CreatureSprite from "./CreatureSprite.svelte";
</script>

{#if $currentMap === "village"}
  {#each $worldCreatures as creature (creature.id)}
    {#if creature.state === "wild"}
      {@const position = creaturePosition(creature)}
      <div
        class="absolute pointer-events-none world-creature"
        data-creature-id={creature.id}
        style="width: {creature.size * TILE_SIZE}px; height: {creature.size * TILE_SIZE}px; transform: translate({position.x * TILE_SIZE}px, {position.y * TILE_SIZE}px); z-index: {creature.aquatic ? 12 : 20};"
      >
        <CreatureSprite species={worldSpecies(creature)} direction={creature.direction} moving={!!creature.target} />
      </div>
    {/if}
  {/each}
{/if}

<style>
  .world-creature {
    left: 0;
    top: 0;
    transition: transform 100ms linear;
  }
</style>