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
    tournament,
  } from "../game/stores.js";
  import { extrasForDay, isBirthday } from "../game/npcLife.js";
  import { todaysTournament, exhibitPortrait } from "../game/tournament.js";

  $: extras = extrasForDay($day, $seasonIndex, $gameMode);
  $: hour = Math.floor($inGameMinutes / 60);
  $: extrasVisible = hour >= 6 && hour < 18 ? extras : [];
  $: festivalTable = $currentFestival && $currentMap === "village" && ($tournament, todaysTournament()?.table);
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
  {#if festivalTable}
    {#each [{ slot: festivalTable[0], x: FESTIVAL_STALL.x - 1, y: FESTIVAL_STALL.y }, { slot: festivalTable[1], x: FESTIVAL_STALL.x + 1, y: FESTIVAL_STALL.y }, { slot: festivalTable[2], x: FESTIVAL_STALL.x, y: FESTIVAL_STALL.y - 1 }] as seat}
      <div
        class="absolute flex items-center justify-center border-2 border-black bg-[#f4f0df]"
        style="left: {seat.x * TILE_SIZE + 4}px; top: {seat.y * TILE_SIZE + 4}px; width: {TILE_SIZE - 8}px; height: {TILE_SIZE - 8}px; z-index: 16;"
        title={seat.slot ? `${seat.slot.owner}: ${seat.slot.name}` : "Slot vazio"}
      >
        {#if seat.slot}
          {@const art = exhibitPortrait(seat.slot)}
          {#if art}
            <img src={art} alt={seat.slot.name} class="h-full w-full object-contain" style="image-rendering: pixelated;" />
          {:else if seat.slot.sprite}
            {@html draw(seat.slot.sprite, seat.slot.name)}
          {:else}
            <span class="retro-font text-[6px] text-center">{seat.slot.name}</span>
          {/if}
        {:else}
          <span class="retro-font text-[6px] text-gray-500">?</span>
        {/if}
      </div>
    {/each}
  {/if}
{/if}
