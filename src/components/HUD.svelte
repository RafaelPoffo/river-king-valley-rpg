<script>
  import { PHASES } from "../game/phases.js";
  import {
    inGameMinutes,
    day,
    seasonIndex,
    currentWeather,
    money,
    deepSeaFishingActive,
    currentMessage,
    phase,
    activeDish,
    baitStock,
    eqBaitId,
    currentBaitData,
  } from "../game/stores.js";
  import { todaysDish } from "../game/dishes.js";
  import { BAITS, SEASONS, WEATHER_NAMES } from "../game/constants.js";
  import { equipItem, returnFromDeepSea } from "../game/gameActions.js";
  import { draw, SPRITES } from "../game/sprites.js";

  const baitSprites = {
    sem_isca: ["...0....", "...0....", "...0....", "...0....", "...0..0.", "...0..0.", "....00..", "........"],
    minhoca: ["........", ".0440...", ".040....", ".04440..", "....040.", "..04440.", "..040...", "........"],
    massa_pao: ["........", "..0000..", ".015510.", "01555510", "01555510", ".015510.", "..0000..", "........"],
    camarao_vivo: SPRITES.shrimp,
    isca_metalica: ["...0....", "..010...", ".01210..", ".01210..", "..010...", "...0..0.", "...0..0.", "....00.."],
    sardinha_alto_mar: ["........", "...000..", "..02220.", "00220220", "03222220", "0022220.", "...000..", "........"],
    isca_brilhante: [".....5..", "....555.", "..00.5..", ".0550...", ".05250..", "..050...", "...0..0.", "....00.."],
  };

  $: dish = ($activeDish, $day, $seasonIndex, todaysDish());
  $: availableBaits = BAITS.filter(
    (bait) => bait.id === "sem_isca" || ($baitStock[bait.id] || 0) > 0,
  );
  $: previousBait = [...availableBaits].reverse().find(
    (bait) => bait.tier < $currentBaitData.tier,
  );
  $: nextBait = availableBaits.find(
    (bait) => bait.tier > $currentBaitData.tier,
  );

  function switchBait(bait) {
    if ($phase === PHASES.PLAYING && bait) equipItem(bait.id, "bait");
  }

  function formatTime(mins) {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
</script>

{#if $phase === PHASES.PLAYING}
  <div
    class="absolute top-2 left-2 z-40 flex w-[208px] items-center gap-1 rounded border-2 border-black bg-white p-1.5 text-black pixel-shadow"
    role="group"
    aria-label="Isca equipada"
  >
    <button
      type="button"
      class="h-8 w-8 shrink-0 border border-black bg-gray-100 text-sm active:bg-[#9ce6e6] disabled:cursor-not-allowed disabled:opacity-30"
      aria-label="Isca anterior"
      title="Isca anterior"
      disabled={!previousBait}
      on:click={() => switchBait(previousBait)}
    >
      ←
    </button>
    <div class="h-6 w-6 shrink-0" aria-hidden="true">
      {@html draw(baitSprites[$eqBaitId] || baitSprites.sem_isca)}
    </div>
    <div class="min-w-0 flex-1 retro-font text-[7px] leading-relaxed" aria-live="polite">
      <div>{$currentBaitData.name.replace(/ \(Nv \d+\)$/, "")}</div>
      {#if $eqBaitId !== "sem_isca"}
        <div class="text-[6px] text-gray-600">Qtd: {$baitStock[$eqBaitId] || 0}</div>
      {/if}
    </div>
    <button
      type="button"
      class="h-8 w-8 shrink-0 border border-black bg-gray-100 text-sm active:bg-[#9ce6e6] disabled:cursor-not-allowed disabled:opacity-30"
      aria-label="Próxima isca"
      title="Próxima isca"
      disabled={!nextBait}
      on:click={() => switchBait(nextBait)}
    >
      →
    </button>
  </div>
{/if}

<!-- Top Right Clock & Stats HUD -->
<div
  class="absolute top-2 right-2 bg-white border-4 border-black p-2 pixel-shadow flex flex-col gap-1 z-40 pointer-events-none text-right"
>
  <div class="retro-font text-[9px] text-black">
    🕒 {formatTime($inGameMinutes)}
  </div>
  <div class="retro-font text-[7px] text-gray-700">
    {SEASONS[$seasonIndex]} - Dia {$day}/15
  </div>
  <div class="retro-font text-[7px] text-gray-700">
    {WEATHER_NAMES[$currentWeather]}
  </div>
  {#if dish}
    <div class="retro-font text-[7px] text-orange-700">🍲 {dish.name}</div>
  {/if}
  <div class="retro-font text-[8px] text-[#4a9090] mt-1 font-bold">
    ¥ {$money}
  </div>
</div>

<!-- Deep Sea Return Button -->
{#if $deepSeaFishingActive}
  <button
    class="absolute bottom-[116px] right-4 bg-red-600 text-white border-4 border-black p-3 retro-font text-[9px] pixel-shadow pointer-events-auto active:bg-red-800 z-40"
    on:click={returnFromDeepSea}
  >
    VOLTAR AO PORTO
  </button>
{/if}

<!-- Bottom Dialogue & Message Box -->
<div
  class="h-[100px] bg-gray-200 p-2 flex items-center justify-center relative select-none"
>
  <div
    class="w-full h-full border-4 border-black bg-white px-3 py-2 flex flex-col justify-start shadow-[inset_4px_4px_0_#9ce6e6] relative overflow-y-auto"
  >
    <p class="retro-font text-[10px] text-black leading-relaxed pr-4">
      {$currentMessage}
    </p>
    {#if $phase === PHASES.DIALOG || $phase === PHASES.SAILING}
      <div
        class="absolute bottom-2 right-3 retro-font text-red-600 animate-bounce text-[10px]"
      >
        ▼
      </div>
    {/if}
  </div>
</div>
