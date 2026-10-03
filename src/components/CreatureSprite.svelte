<script>
  import { WORLD_SPRITES } from "../game/data/worldCreatures.js";
  import { draw } from "../game/sprites.js";
  import OverworldSprite from "./OverworldSprite.svelte";

  export let species;
  export let direction = "down";
  export let moving = false;

  $: sheet = species?.dexId ? WORLD_SPRITES[species.dexId] || WORLD_SPRITES["0129"] : null;
</script>

<div class="relative w-full h-full pointer-events-none" role="img" aria-label={species?.name || "Criatura"}>
  {#if sheet}
    <OverworldSprite sprite={sheet} {direction} {moving} label={species.name} />
  {:else if species?.sprite}
    {@html draw(species.sprite, species.name)}
  {/if}
</div>
