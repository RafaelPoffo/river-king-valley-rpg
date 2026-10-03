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

  const ZONES = [
    { id: 1, label: "RASA", hint: "Peixes comuns", color: "bg-[#9ce6e6]", text: "text-black" },
    { id: 2, label: "MÉDIA", hint: "Mais variedade", color: "bg-[#4a9090]", text: "text-white" },
    { id: 3, label: "FUNDA", hint: "Mais chance de raros", color: "bg-[#1f4e5f]", text: "text-white" },
  ];

  $: reach = Math.min(3, $currentToolData?.maxDist || 1);
  $: zone = ZONES[Math.min(reach, Math.floor($aimPower)) - 1];
  $: marker = Math.min(100, Math.max(0, (($aimPower - 1) / 3) * 100));
</script>

<!-- Definir Força (Aim Bar) -->
{#if $phase === PHASES.FISHING_AIM}
  <div
    class="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-40 w-[340px] bg-white border-4 border-black px-3 py-2 pixel-shadow"
  >
    <div class="flex items-baseline justify-between retro-font text-[8px] mb-2">
      <span>FORÇA DO ARREMESSO</span>
      <span class="text-red-600 animate-pulse">[ESPAÇO] LANÇAR</span>
    </div>
    <div class="relative">
      <div class="flex h-7 border-2 border-black overflow-hidden">
        {#each ZONES as option}
          {@const locked = option.id > reach}
          <div
            class="flex-1 flex items-center justify-center retro-font text-[7px] border-r-2 border-black last:border-r-0 transition-opacity {locked
              ? 'locked-zone text-gray-600'
              : `${option.color} ${option.text}`} {zone.id === option.id ? 'opacity-100' : 'opacity-60'}"
          >
            {#if locked}<span class="font-sans text-sm leading-none">🔒</span>{:else}{option.label}{/if}
          </div>
        {/each}
      </div>
      <div
        class="absolute -top-2 -bottom-2 w-1.5 -ml-[3px] bg-red-600 border border-black"
        style="left: {marker}%;"
      ></div>
    </div>
    <div class="mt-2 flex justify-between retro-font text-[7px]">
      <span>ZONA {zone.id}: {zone.label}</span>
      <span class="text-gray-600">{zone.hint}</span>
    </div>
    {#if reach < 3}
      <div class="mt-1 text-center retro-font text-[6px] text-gray-500">
        Zonas trancadas pedem uma vara de maior alcance.
      </div>
    {/if}
  </div>
{/if}

<!-- Bateu Alerta -->
{#if $phase === PHASES.FISHING_BITE}
  <div
    class="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white border-4 border-black p-4 text-center pixel-shadow animate-bounce"
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
      ></div>
      <div
        class="absolute top-0 bottom-0 w-2 bg-black z-10"
        style={`left: calc(${$minigameBar}% - 4px);`}
      ></div>
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

<style>
  .locked-zone {
    background: repeating-linear-gradient(45deg, #d1d5db 0 6px, #e5e7eb 6px 12px);
  }
</style>
