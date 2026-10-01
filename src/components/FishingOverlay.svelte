<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import {
    phase,
    aimPower,
    minigameBar,
    catchTargetCenter,
    catchTargetWidth,
    activeFish,
  } from "../game/stores.js";
</script>

<!-- Definir Força (Aim Bar) -->
{#if $phase === "fishing_aim"}
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
        style={`width: ${($aimPower / 3.0) * 100}%;`}
      />
    </div>
  </div>
{/if}

<!-- Bateu Alerta -->
{#if $phase === "fishing_bite"}
  <div
    class="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white border-4 border-black p-4 text-center pixel-shadow animate-bounce"
  >
    <h3 class="retro-font text-[11px]">
      BATEU! APERTE [SPACE] RÁPIDO!
    </h3>
  </div>
{/if}

<!-- Minigame Tug-of-war -->
{#if $phase === "fishing_minigame"}
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
{#if $phase === "caught" && $activeFish}
  <div
    class="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center"
  >
    <div
      class="bg-white border-8 border-black p-6 text-center w-72 flex flex-col items-center pixel-shadow"
    >
      <div class="text-black retro-font text-[9px] mb-4">
        {$activeFish.type === "treasure"
          ? "ARTEFATO DESCOBERTO!"
          : "CAPTURADO!"}
      </div>
      <div
        class="w-24 h-24 border-4 border-black mb-4 flex items-center justify-center bg-[#9ce6e6] {$activeFish.isShiny
          ? 'shiny-effect'
          : ''}"
      >
        {@html draw($activeFish.sprite)}
      </div>
      <h4 class="retro-font text-black text-[10px] mb-1">
        {$activeFish.isShiny ? "✨ " : ""}{$activeFish.name}
      </h4>
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
