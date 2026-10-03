<script>
  import { PHASES } from "../game/phases.js";
  import { TILE_SIZE, MAPS_DATA } from "../game/constants.js";
  import {
    currentMap,
    cameraX,
    cameraY,
    isNight,
    phase,
    isFading,
  } from "../game/stores.js";
  import MapLayer from "./MapLayer.svelte";
  import AmbientShadows from "./AmbientShadows.svelte";
  import BoatLayer from "./BoatLayer.svelte";
  import WorldCreatureLayer from "./WorldCreatureLayer.svelte";
  import NpcLayer from "./NpcLayer.svelte";
  import PlayerLayer from "./PlayerLayer.svelte";

  $: map = MAPS_DATA[$currentMap];
  $: mapWidth = (map?.[0]?.length || 1) * TILE_SIZE;
  $: mapHeight = (map?.length || 1) * TILE_SIZE;
</script>

<div class="h-[476px] relative bg-[#4a9090] overflow-hidden border-b-8 border-black select-none">
  <div
    class="absolute will-change-transform"
    style="transform: translate({-$cameraX}px, {-$cameraY}px); width: {mapWidth}px; height: {mapHeight}px;"
  >
    <MapLayer />
    <AmbientShadows />
    <BoatLayer />
    <WorldCreatureLayer />
    <NpcLayer />
    <PlayerLayer />
  </div>

  {#if $isNight && $currentMap === "village"}
    <div class="absolute inset-0 pointer-events-none bg-blue-950/50 mix-blend-multiply z-30"></div>
  {/if}

  {#if $phase === PHASES.DIALOG}
    <div class="absolute inset-0 bg-black/10 z-40"></div>
  {/if}

  {#if $isFading}
    <div class="absolute inset-0 bg-black z-[100] fade-overlay"></div>
  {/if}
</div>
