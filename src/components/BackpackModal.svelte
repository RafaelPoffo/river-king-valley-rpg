<script>
  import { PHASES } from "../game/phases.js";
  import { draw } from "../game/sprites.js";
  import { TOOLS, BAITS } from "../game/constants.js";
  import {
    phase,
    inventory,
    maxInventorySize,
    selectedBackpackIndex,
    ownedRods,
    eqRodId,
    ownedBaits,
    baitStock,
    eqBaitId,
    insectInventory,
  } from "../game/stores.js";
  import {
    removeFishFromInventory,
    selectBackpackItem,
    equipItem,
    releaseInsect,
  } from "../game/gameActions.js";
</script>

<!-- Limita a altura máxima do container principal e impede o estouro externo -->
<div
  class="flex-1 bg-white text-black flex flex-col relative border-b-8 border-black z-50 select-none max-h-[120vh] h-full overflow-hidden"
>
  <!-- Cabeçalho fixo com shrink-0 -->
  <div
    class="flex justify-between items-center bg-[#9ce6e6] border-b-4 border-black p-4 shrink-0"
  >
    <h2 class="retro-font text-sm">
      INVENTÁRIO (MOCHILA {$inventory.length}/{$maxInventorySize}) E
      EQUIPAMENTOS
    </h2>
    <button
      class="bg-black text-white px-4 py-2 retro-font text-[9px] active:bg-gray-800"
      on:click={() => phase.set(PHASES.PLAYING)}
    >
      FECHAR [X]
    </button>
  </div>

  <!-- min-h-0 permite que a área interna encolha e ative o scroll do overflow-y-auto -->
  <div class="flex-1 p-6 overflow-y-auto min-h-0 space-y-6">
    <div>
      <div class="mb-2 flex items-center justify-between">
        <h3 class="retro-font text-[10px] text-emerald-700">INSETOS DA FLORESTA ({$insectInventory.length})</h3>
      </div>
      {#if $insectInventory.length}
        <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {#each $insectInventory as insect, index (insect.caughtId)}
            <div class="relative flex min-h-[82px] flex-col items-center justify-center border-2 border-[#50724d] bg-emerald-50 p-2">
              <button class="absolute right-1 top-1 h-5 w-5 border border-red-800 bg-red-700 text-xs text-white" title="Soltar inseto" aria-label={`Soltar ${insect.name}`} on:click={() => releaseInsect(index)}>×</button>
              {#if insect.portrait}
                <img class="h-8 w-8 object-contain [image-rendering:pixelated]" src={insect.portrait} alt={insect.name} />
              {:else}
                <span class="text-2xl">{insect.emoji}</span>
              {/if}
              <span class="mt-1 w-full truncate text-center text-[8px]">{insect.name}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="border border-dashed border-emerald-700/50 p-3 text-center text-xs text-gray-500">Nenhum inseto capturado.</p>
      {/if}
    </div>

    <!-- Backpack Section -->
    <div>
      <h3 class="retro-font text-[10px] text-red-600 mb-2">
        MOCHILA DO PESCADOR (MÁX {$maxInventorySize} ITENS)
      </h3>
      <div class="grid grid-cols-5 gap-2">
        {#each Array($maxInventorySize) as _, i}
          {@const fish = $inventory[i]}
          <div
            class={`border-2 border-black p-2 flex flex-col items-center justify-between min-h-[90px] relative ${
              $selectedBackpackIndex === i
                ? "bg-amber-200"
                : fish
                  ? "bg-[#9ce6e6]/30"
                  : "bg-gray-100"
            }`}
          >
            {#if fish}
              <button
                class="absolute top-1 right-1 bg-red-600 text-white text-[7px] px-1 rounded hover:bg-red-800"
                on:click|stopPropagation={() => removeFishFromInventory(i)}
                title="Descartar item"
              >
                🗑️️
              </button>
              <button
                type="button"
                class="w-full flex flex-col items-center cursor-pointer mt-2 bg-transparent border-0 p-0"
                on:click={() => selectBackpackItem(i)}
              >
                <div class="w-8 h-8 pointer-events-none flex items-center justify-center">
                  {@html draw(fish.sprite, fish.name)}
                </div>
                <div class="retro-font text-[7px] text-center truncate w-full mt-1">
                  {fish.name}
                </div>
                {#if fish.weight}
                  <div class="retro-font text-[6px] text-gray-500">
                    {fish.weight}kg
                  </div>
                {:else if fish.priceFinal}
                  <div class="retro-font text-[6px] text-gray-500">
                    venda {fish.priceFinal}¥
                  </div>
                {/if}
              </button>
            {:else}
              <span class="retro-font text-[7px] text-gray-400 mt-6">
                Vazio
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Varas Section -->
    <div>
      <h3 class="retro-font text-[10px] text-[#4a9090] mb-2">
        VARAS DE PESCA
      </h3>
      <div class="grid grid-cols-3 gap-3">
        {#each TOOLS.rod as r}
          {@const owned = $ownedRods.includes(r.id)}
          <div
            class={`border-2 border-black p-3 flex flex-col items-center justify-between ${
              $eqRodId === r.id ? "bg-[#9ce6e6]" : "bg-white"
            }`}
          >
            <div class="w-8 h-8 mb-1">{@html draw(r.sprite)}</div>
            <div class="retro-font text-[8px] text-center mb-2">
              {r.name}
            </div>
            {#if owned}
              <button
                class={`w-full py-1 text-[7px] retro-font border border-black ${
                  $eqRodId === r.id
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
                on:click={() => equipItem(r.id, "rod")}
              >
                {$eqRodId === r.id ? "EQUIPADO" : "EQUIPAR"}
              </button>
            {:else}
              <span class="text-[7px] text-gray-400 retro-font">
                BLOQUEADO
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Iscas Section -->
    <div>
      <h3 class="retro-font text-[10px] text-[#4a9090] mb-2">ISCAS</h3>
      <div class="grid grid-cols-2 gap-3">
        {#each BAITS as b}
          {@const owned = $ownedBaits.includes(b.id)}
          {@const count = $baitStock[b.id] || 0}
          <div
            class={`border-2 border-black p-3 flex flex-col justify-between ${
              $eqBaitId === b.id ? "bg-[#9ce6e6]" : "bg-white"
            }`}
          >
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="retro-font text-[9px] font-bold">{b.name}</span>
                <span
                  class="retro-font text-[8px] bg-black text-white px-1"
                >
                  Qtd: {b.id === "sem_isca" ? "∞" : count}
                </span>
              </div>
              <div class="retro-font text-[7px] text-gray-600 mb-1">
                {b.desc}
              </div>
            </div>
            {#if owned || b.id === "sem_isca"}
              <button
                class={`w-full py-1 text-[7px] retro-font border border-black ${
                  $eqBaitId === b.id
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
                on:click={() => equipItem(b.id, "bait")}
              >
                {$eqBaitId === b.id ? "USANDO" : "EQUIPAR"}
              </button>
            {:else}
              <span class="text-[7px] text-gray-400 retro-font text-center">
                INDISPONÍVEL
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>