<script>
  import { PHASES } from "../game/phases.js";
  import { draw, SPRITES } from "../game/sprites.js";
  import {
    phase,
    aimPower,
    currentToolData,
    minigameBar,
    catchTargetCenter,
    catchTargetWidth,
    activeFish,
  } from "../game/stores.js";
</script>

<!-- Definir Força (Aim Bar) -->
{#if $phase === PHASES.FISHING_AIM}
  <div
    class="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-white border-4 border-black p-4 text-center pixel-shadow"
  >
    <h3 class="retro-font text-[9px] mb-2 text-red-600 animate-pulse">
      DEFINIR FORÇA (ZONA {Math.floor($aimPower)}): [SPACE]
    </h3>
    <div
      class="w-64 h-6 border-2 border-black bg-gray-200 relative overflow-hidden"
    >
      <div
        class="absolute top-0 bottom-0 bg-[#4a9090]"
        style={`width: ${Math.min(100, ($aimPower / (($currentToolData?.maxDist || 1) + 0.99)) * 100)}%;`}
      />
    </div>
  </div>
{/if}

<!-- Bateu Alerta -->
{#if $phase === PHASES.FISHING_BITE}
  <div
    class="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white border-4 border-black p-4 text-center pixel-shadow animate-bounce"
  >
    <h3 class="retro-font text-[11px]">
      BATEU! APERTE [SPACE] RÁPIDO!
    </h3>
  </div>
{/if}

<!-- Minigame Tug-of-war -->
{#if $phase === PHASES.FISHING_MINIGAME}
  <div
    class="absolute inset-0 bg-white/80 z-40 flex flex-col items-center justify-center pb-10"
  >
    <h3 class="retro-font text-red-600 text-lg mb-6 animate-ping">
      LUCTA! [SPACE]
    </h3>
    <div class="w-80 h-8 border-4 border-black bg-white relative">
      <div
        class="absolute top-0 bottom-0 bg-[#9ce6e6] border-x-2 border-black"
        style={`left: ${
          $catchTargetCenter - $catchTargetWidth / 2
        }%; width: ${$catchTargetWidth}%;`}
      />
      <div
        class="absolute top-0 bottom-0 w-2 bg-black z-10"
        style={`left: calc(${$minigameBar}% - 4px);`}
      />
    </div>
  </div>
{/if}

<!-- Capturado / Artefato Descoberto -->
{#if $phase === PHASES.CAUGHT && $activeFish}
  <div
    class="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center"
  >
    <div
      class="bg-white border-8 border-black p-6 text-center w-80 flex flex-col items-center pixel-shadow"
    >
      <div class="text-black retro-font text-[9px] mb-3">
        {$activeFish.type === "treasure"
          ? "ARTEFATO DESCOBERTO!"
          : $activeFish.stage
            ? "POKÉMON CAPTURADO!"
            : "CAPTURADO!"}
      </div>
      <div
        class="w-24 h-24 border-4 border-black mb-3 flex items-center justify-center bg-[#9ce6e6] p-2 {$activeFish.isShiny
          ? 'shiny-effect'
          : ''}"
      >
        {@html draw($activeFish.sprite, $activeFish.name)}
      </div>
      <h4 class="retro-font text-black text-[11px] mb-1">
        {$activeFish.isShiny ? "✨ " : ""}{$activeFish.name}
      </h4>
      {#if $activeFish.types}
        <div class="flex gap-1 mb-2">
          {#each $activeFish.types as t}
            <span class="retro-font text-[7px] px-1.5 py-0.5 bg-blue-600 text-white rounded">
              {t}
            </span>
          {/each}
          {#if $activeFish.stage}
            <span class="retro-font text-[7px] px-1.5 py-0.5 bg-gray-700 text-white rounded">
              Nível {$activeFish.stage}
            </span>
          {/if}
        </div>
      {/if}
      <div class="retro-font text-[8px] text-gray-600 mb-4">
        {$activeFish.type === "treasure"
          ? $activeFish.desc
          : `Peso: ${$activeFish.weight} kg`}
      </div>
      <div class="retro-font text-[7px] text-gray-400 animate-pulse">
        [ESPAÇO] PARA CONTINUAR
      </div>
    </div>
  </div>
{/if}
