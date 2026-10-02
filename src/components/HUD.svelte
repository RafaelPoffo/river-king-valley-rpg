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
  } from "../game/stores.js";
  import { SEASONS, WEATHER_NAMES } from "../game/constants.js";
  import { returnFromDeepSea } from "../game/gameActions.js";

  function formatTime(mins) {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
</script>

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
  <div class="retro-font text-[8px] text-[#4a9090] mt-1 font-bold">
    ¥ {$money}
  </div>
</div>

<!-- Deep Sea Return Button -->
{#if $deepSeaFishingActive}
  <button
    class="absolute bottom-4 right-4 bg-red-600 text-white border-4 border-black p-3 retro-font text-[9px] pixel-shadow pointer-events-auto active:bg-red-800 z-40"
    on:click={returnFromDeepSea}
  >
    VOLTAR AO PORTO
  </button>
{/if}

<!-- Bottom Dialogue & Message Box -->
<div
  class="h-[150px] bg-gray-200 p-3 flex items-center justify-center relative select-none"
>
  <div
    class="w-full h-full border-4 border-black bg-white p-4 flex flex-col justify-start shadow-[inset_4px_4px_0_#9ce6e6] relative"
  >
    <p class="retro-font text-[10px] text-black leading-loose">
      {$currentMessage}
    </p>
    {#if $phase === PHASES.DIALOG || $phase === PHASES.SAILING}
      <div
        class="absolute bottom-6 right-6 retro-font text-red-600 animate-bounce text-[10px]"
      >
        ▼
      </div>
    {/if}
  </div>
</div>
