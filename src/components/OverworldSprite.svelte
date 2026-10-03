<script>
  import { onMount } from "svelte";
  import { atlasFrame, loadOverworldAtlas } from "../game/overworldAtlas.js";

  export let sprite;
  export let direction = "down";
  export let moving = false;
  export let label = "Personagem";

  let source = "";
  let step = 0;
  $: frame = atlasFrame(sprite, direction, moving, step);

  onMount(() => {
    let mounted = true;
    loadOverworldAtlas().then((url) => {
      if (mounted) source = url;
    }).catch((error) => console.error("Falha ao carregar sprites do overworld", error));
    const timer = setInterval(() => {
      step = moving ? (step + 1) % 4 : 0;
    }, 160);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  });
</script>

<svg class="overworld-sprite" viewBox="0 0 {frame.width} {frame.height}" role="img" aria-label={label} data-atlas-x={frame.x} data-atlas-y={frame.y}>
  {#if source}
    <image href={source} x={-frame.x} y={-frame.y} width="170" height="1668" />
  {/if}
</svg>

<style>
  .overworld-sprite {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    image-rendering: pixelated;
    pointer-events: none;
  }
</style>