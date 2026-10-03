<script>
  import { PHASES, LINE_IN_WATER, isFishingPhase } from "../game/phases.js";
  import { draw, SPRITES } from "../game/sprites.js";
  import { TILE_SIZE } from "../game/constants.js";
  import {
    player,
    phase,
    bobberPos,
    shadowActive,
    shadowPos,
    shadowReaction,
    activeFish,
    worldCreatures,
    worldCreatureEncounter,
  } from "../game/stores.js";
  import CreatureSprite from "./CreatureSprite.svelte";

  const SPRITE = {
    up: "/assets/crystal_player_up.png",
    down: "/assets/crystal_player_down.png",
    left: "/assets/crystal_player_left.png",
    right: "/assets/crystal_player_right.png",
  };
  const FISH_SPRITE = {
    up: "/assets/crystal_player_fish_up.png",
    down: "/assets/crystal_player_fish_down.png",
    left: "/assets/crystal_player_fish_left.png",
    right: "/assets/crystal_player_fish_right.png",
  };

  $: fishing = isFishingPhase($phase);
  $: src = (fishing ? FISH_SPRITE : SPRITE)[$player.dir] || SPRITE.down;
  $: showBobber = LINE_IN_WATER.has($phase);
  $: encounter = $worldCreatures.find((creature) => creature.id === $worldCreatureEncounter);
  $: encounterSize = encounter?.size || 1;
  $: encounterDirection = Math.abs($shadowPos.y - $bobberPos.y) > Math.abs($shadowPos.x - $bobberPos.x)
    ? $shadowPos.y > $bobberPos.y ? "up" : "down"
    : $shadowPos.x > $bobberPos.x ? "left" : "right";
</script>

<div
  class="tile"
  style="left: 0; top: 0; z-index: 25; transform: translate({$player.x * TILE_SIZE}px, {$player.y * TILE_SIZE}px);"
>
  <img
    {src}
    alt="Pescador"
    class="w-full h-full object-contain pointer-events-none select-none"
    style="image-rendering: pixelated;"
  />
</div>

{#if showBobber}
  <div
    class="tile"
    style="left: {$bobberPos.x * TILE_SIZE}px; top: {$bobberPos.y * TILE_SIZE}px; z-index: 15;"
  >
    <div class={`bobber ${$phase === PHASES.FISHING_BITE ? "bobber-bite" : "bobber-float"}`}></div>
  </div>
  <svg class="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style="z-index: 10;">
    <line
      x1={$player.x * TILE_SIZE + 20}
      y1={$player.y * TILE_SIZE + 20}
      x2={$bobberPos.x * TILE_SIZE + 20}
      y2={$bobberPos.y * TILE_SIZE + 20}
      stroke={$phase === PHASES.FISHING_BITE ? "#ff0000" : "#000"}
      stroke-width={$phase === PHASES.FISHING_BITE ? "3" : "2"}
    />
  </svg>
{/if}

{#if $shadowActive && $activeFish}
  <div
    class="absolute pointer-events-none {encounter ? '' : $activeFish.rarity >= 5
      ? 'shadow-large'
      : $activeFish.rarity >= 3
        ? 'shadow-medium'
        : 'shadow-small'}"
    style="left: {($shadowPos.x - (encounterSize - 1) / 2) * TILE_SIZE}px; top: {($shadowPos.y - (encounterSize - 1) / 2) * TILE_SIZE}px; width: {encounterSize * TILE_SIZE}px; height: {encounterSize * TILE_SIZE}px; z-index: 12;"
  >
    {#if encounter}
      <CreatureSprite species={$activeFish} size={encounterSize} direction={encounterDirection} moving />
    {:else}
      {@html draw(SPRITES.shadow)}
    {/if}
  </div>
  {#if $shadowReaction}
    <span
      class="absolute pointer-events-none text-[12px] font-bold leading-none"
      style="left: {($shadowPos.x + (encounter ? (encounterSize + 1) / 2 + 0.05 : $activeFish.rarity >= 5 ? 1.75 : $activeFish.rarity >= 3 ? 1.35 : 1.05)) * TILE_SIZE}px; top: {($shadowPos.y + 0.25) * TILE_SIZE}px; z-index: 20; color: {$shadowReaction === 'heart' ? '#ec4899' : '#dc2626'};"
      role="img"
      aria-label={$shadowReaction === "heart" ? "Gostou da isca" : "Rejeitou a isca"}
    >
      {$shadowReaction === "heart" ? "♥" : "X"}
    </span>
  {/if}
{/if}
