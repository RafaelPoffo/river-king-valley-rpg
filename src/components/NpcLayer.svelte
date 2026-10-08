<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { CHARACTER_SPRITES, POKEMON_SPRITES } from "../game/overworldAtlas.js";
  import OverworldSprite from "./OverworldSprite.svelte";
  import {
    TILE_SIZE,
    FESTIVAL_STALL,
    DEEP_SEA_CAPTAIN,
    getNpcLocation,
  } from "../game/constants.js";
  import {
    currentMap,
    villagers,
    inGameMinutes,
    day,
    seasonIndex,
    currentFestival,
    gameMode,
  } from "../game/stores.js";
  import { extrasForDay, isBirthday } from "../game/npcLife.js";

  $: extras = extrasForDay($day, $seasonIndex, $gameMode);
  $: hour = Math.floor($inGameMinutes / 60);
  $: extrasVisible = hour >= 6 && hour < 18 ? extras : [];
</script>

{#each $villagers as npc}
  {@const loc = getNpcLocation(npc, $inGameMinutes, $day, $seasonIndex)}
  {#if loc.map === $currentMap}
    <div
      class="tile"
      style="left: {loc.x * TILE_SIZE}px; top: {loc.y * TILE_SIZE}px; z-index: 20;"
      title={npc.name}
    >
      <OverworldSprite sprite={CHARACTER_SPRITES[npc.id] || CHARACTER_SPRITES.veteran} direction={npc.cardTheme && $currentMap === "game_house" && loc.y === 5 ? "down" : npc.cardTheme && $currentMap === "game_house" ? "up" : "down"} label={npc.name} />
      {#if isBirthday(npc, $seasonIndex, $day)}
        <span class="absolute -top-2 left-3 text-[10px]" aria-hidden="true">🎂</span>
      {/if}
    </div>
  {/if}
{/each}

{#each extrasVisible as extra}
  {#if (extra.homeMap || "village") === $currentMap}
    <div
      class="tile"
      style="left: {extra.homeX * TILE_SIZE}px; top: {extra.homeY * TILE_SIZE}px; z-index: 20;"
      title={extra.name}
    >
      <OverworldSprite sprite={CHARACTER_SPRITES[extra.sprite] || CHARACTER_SPRITES.traveler_m} direction="down" label={extra.name} />
    </div>
    {#if extra.companion}
      <div
        class="tile"
        style="left: {extra.companion.x * TILE_SIZE}px; top: {extra.companion.y * TILE_SIZE}px; z-index: 20;"
        title={extra.companion.name}
      >
        <OverworldSprite sprite={POKEMON_SPRITES[extra.companion.dexId] || POKEMON_SPRITES["0129"]} direction="down" label={extra.companion.name} />
      </div>
    {/if}
  {/if}
{/each}

{#if $currentMap === "deep_sea"}
  <div
    class="tile"
    style="left: {DEEP_SEA_CAPTAIN.x * TILE_SIZE}px; top: {DEEP_SEA_CAPTAIN.y * TILE_SIZE}px; z-index: 20;"
    title="Capitão Thomas"
  >
    <OverworldSprite sprite={CHARACTER_SPRITES.veteran} direction="up" label="Capitão Thomas" />
  </div>
{/if}

{#if $currentFestival && $currentMap === "village"}
  <div
    class="tile"
    style="left: {FESTIVAL_STALL.x * TILE_SIZE}px; top: {FESTIVAL_STALL.y * TILE_SIZE}px; z-index: 15;"
    title={$currentFestival}
  >
    {@html draw(SPRITES.stall)}
  </div>
{/if}
