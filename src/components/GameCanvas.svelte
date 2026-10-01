<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import {
    TILE_SIZE,
    MAPS_DATA,
    getNpcLocation,
  } from "../game/constants.js";
  import {
    currentMap,
    cameraX,
    cameraY,
    player,
    villagers,
    inGameMinutes,
    day,
    currentFestival,
    phase,
    bobberPos,
    shadowActive,
    shadowPos,
    activeFish,
    isNight,
    deepSeaFishingActive,
    constructions,
    isFading,
  } from "../game/stores.js";
  import { getTileSvg } from "../game/tileRenderer.js";

  export let seaShadows = [];
</script>

<div
  class="h-[450px] relative bg-[#4a9090] overflow-hidden border-b-8 border-black select-none"
>
  <!-- World Map Container shifted by Camera -->
  <div
    class="absolute will-change-transform"
    style="transform: translate({-$cameraX}px, {-$cameraY}px); width: {MAPS_DATA[
      $currentMap
    ][0].length * TILE_SIZE}px; height: {MAPS_DATA[$currentMap].length *
      TILE_SIZE}px;"
  >
    <!-- Map Tiles -->
    {#each MAPS_DATA[$currentMap] as row, y}
      {#each row as char, x}
        <div
          class="tile"
          style="left: {x * TILE_SIZE}px; top: {y * TILE_SIZE}px;"
        >
          {@html getTileSvg(char, x, y, $constructions, $deepSeaFishingActive)}
        </div>
      {/each}
    {/each}

    <!-- Sombras de Peixes no Mar -->
    {#each seaShadows as shadow}
      {#if $currentMap === "village" && shadow.active}
        <div
          class="tile z-15 transition-all duration-300 pointer-events-none"
          style="left: {shadow.x * TILE_SIZE}px; top: {shadow.y *
            TILE_SIZE}px;"
        >
          {@html draw(SPRITES.shadow)}
        </div>
      {/if}
    {/each}

    <!-- NPCs -->
    {#each $villagers as npc}
      {@const loc = getNpcLocation(npc, $inGameMinutes, $day)}
      {#if loc.map === $currentMap}
        <div
          class="tile z-20"
          style="left: {loc.x * TILE_SIZE}px; top: {loc.y * TILE_SIZE}px;"
          title={npc.name}
        >
          {@html draw(npc.sprite)}
        </div>
      {/if}
    {/each}

    <!-- Festival Stall -->
    {#if $currentFestival && $currentMap === "village"}
      <div
        class="tile z-15"
        style="left: {10 * TILE_SIZE}px; top: {3 * TILE_SIZE}px;"
      >
        {@html draw(SPRITES.stall)}
      </div>
    {/if}

    <!-- Player -->
    <div
      class={`tile z-25 ${
        $player.dir === "left"
          ? "dir-left"
          : $player.dir === "right"
            ? "dir-right"
            : ""
      }`}
      style="left: {$player.x * TILE_SIZE}px; top: {$player.y * TILE_SIZE}px;"
    >
      {@html draw(SPRITES.player)}
      <!-- Vara curta e linha saindo da ponta -->
      {#if $phase.startsWith("fishing_")}
        <div
          class={`absolute w-4 h-1 bg-black z-30 ${
            $player.dir === "up"
              ? "-top-2 left-4"
              : $player.dir === "down"
                ? "top-5 left-4"
                : $player.dir === "left"
                  ? "-left-2 top-4"
                  : "left-6 top-4"
          }`}
        />
      {/if}
    </div>

    <!-- Bobber & Fishing Line -->
    {#if $phase === "fishing_wait" || $phase === "fishing_approach" || $phase === "fishing_bite" || $phase === "fishing_minigame"}
      <div
        class="tile z-15"
        style="left: {$bobberPos.x * TILE_SIZE}px; top: {$bobberPos.y *
          TILE_SIZE}px;"
      >
        <div
          class={`bobber ${$phase === "fishing_bite" ? "bobber-bite" : "bobber-float"}`}
        />
      </div>
      <svg
        class="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        <line
          x1={$player.x * TILE_SIZE + 20}
          y1={$player.y * TILE_SIZE + 20}
          x2={$bobberPos.x * TILE_SIZE + 20}
          y2={$bobberPos.y * TILE_SIZE + 20}
          stroke={$phase === "fishing_bite" ? "#ff0000" : "#000"}
          stroke-width={$phase === "fishing_bite" ? "3" : "2"}
        />
      </svg>
    {/if}

    <!-- Approaching Fish Shadow -->
    {#if $shadowActive && $activeFish}
      <div
        class="tile z-10 {$activeFish.rarity >= 5
          ? 'shadow-large'
          : $activeFish.rarity >= 3
            ? 'shadow-medium'
            : 'shadow-small'}"
        style="left: {$shadowPos.x * TILE_SIZE}px; top: {$shadowPos.y *
          TILE_SIZE}px;"
      >
        {@html draw(SPRITES.shadow)}
      </div>
    {/if}
  </div>

  <!-- Night lighting effect -->
  {#if $isNight && $currentMap === "village"}
    <div
      class="absolute inset-0 pointer-events-none bg-blue-950/50 mix-blend-multiply z-30"
    />
  {/if}

  <!-- Dialog dimming -->
  {#if $phase === "dialog"}
    <div class="absolute inset-0 bg-black/10 z-40" />
  {/if}

  <!-- Sleep / New day fade transition -->
  {#if $isFading}
    <div class="absolute inset-0 bg-black z-[100] fade-overlay" />
  {/if}
</div>
