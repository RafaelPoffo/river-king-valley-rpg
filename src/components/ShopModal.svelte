<script>
  import { PHASES } from "../game/phases.js";
  import { draw } from "../game/sprites.js";
  import { TOOLS, BAITS } from "../game/constants.js";
  import {
    phase,
    shopTab,
    money,
    ownedRods,
    ownedNets,
    baitStock,
    gameMode,
    inventory,
    maxInventorySize,
  } from "../game/stores.js";
  import { buyItem, sellFish, sellAll } from "../game/gameActions.js";
  import { gardenBonus } from "../game/garden.js";
</script>

<!-- Limita a altura do container principal e previne transbordo de tela -->
<div
  class="flex-1 bg-white text-black flex flex-col relative border-b-8 border-black z-50 select-none max-h-[110vh] h-full overflow-hidden"
>
  <button
    class="absolute top-4 right-4 bg-black text-white w-10 h-10 retro-font text-xs z-50 hover:bg-gray-800"
    on:click={() => phase.set(PHASES.PLAYING)}
  >
    X
  </button>
  
  <!-- Abas superiores com shrink-0 para não encolherem -->
  <div class="flex border-b-4 border-black bg-[#9ce6e6] shrink-0">
    <button
      class={`flex-1 py-4 retro-font text-[9px] ${
        $shopTab === "buy_rod" ? "bg-black text-white" : "text-black"
      }`}
      on:click={() => shopTab.set("buy_rod")}
    >
      VARAS & REDES
    </button>
    <button
      class={`flex-1 py-4 retro-font text-[9px] ${
        $shopTab === "buy_bait" ? "bg-black text-white" : "text-black"
      }`}
      on:click={() => shopTab.set("buy_bait")}
    >
      ISCAS
    </button>
    <button
      class={`flex-1 py-4 retro-font text-[9px] ${
        $shopTab === "sell" ? "bg-black text-white" : "text-black"
      }`}
      on:click={() => shopTab.set("sell")}
    >
      VENDER (¥{$money})
    </button>
  </div>

  <!-- min-h-0 habilita a rolagem interna do conteúdo das abas -->
  <div class="flex-1 overflow-y-auto p-4 min-h-0 bg-white">
    {#if $shopTab === "buy_rod"}
      <div class="space-y-4">
        {#each TOOLS.rod.concat(TOOLS.net) as item}
          {@const owned =
            item.type === "rod"
              ? $ownedRods.includes(item.id)
              : $ownedNets.includes(item.id)}
          <div
            class="border-2 border-black p-3 flex justify-between items-center bg-[#9ce6e6]"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10">{@html draw(item.sprite)}</div>
              <div class="retro-font text-[10px] leading-relaxed">
                <div>{item.name}</div>
                <div class="text-[8px] text-gray-600">
                  {item.type === "rod" ? `Força ${item.strength} · aguenta peixes mais fortes` : "Pega crustáceos e criaturas da margem"}
                </div>
              </div>
            </div>
            <button
              class="bg-black text-white retro-font text-[9px] px-4 py-2 disabled:bg-gray-400"
              on:click={() => buyItem(item, item.type)}
              disabled={owned || item.price > $money}
            >
              {owned ? "ADQUIRIDO" : `${item.price}¥`}
            </button>
          </div>
        {/each}
      </div>
    {:else if $shopTab === "buy_bait"}
      <div class="space-y-4">
        {#each BAITS.filter((b) => b.id !== "sem_isca") as bait}
          <div
            class="border-2 border-black p-3 flex justify-between items-center bg-[#9ce6e6]"
          >
            <div class="retro-font text-[10px]">
              {bait.id === "megabit" && $gameMode !== "pokemon" ? "Isca de Tilápia Dourada" : bait.name}
              (Estoque: {$baitStock[bait.id] || 0}) -
              {bait.id === "megabit" && $gameMode !== "pokemon" ? "Sempre pega Tilápia Dourada no rio com vara." : bait.desc}
            </div>
            <button
              class="bg-black text-white retro-font text-[9px] px-4 py-2 disabled:bg-gray-400"
              on:click={() => buyItem(bait, "bait")}
              disabled={bait.price > $money}
            >
              {bait.price}¥
            </button>
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="flex justify-between items-center mb-4 border-b-2 border-black pb-2"
      >
        <h3 class="retro-font text-xs">
          MOCHILA PARA VENDA ({$inventory.length}/{$maxInventorySize})
        </h3>
        {#if $inventory.length > 0}
          <button
            class="bg-black text-white retro-font text-[8px] px-3 py-2 hover:bg-gray-800"
            on:click={sellAll}
          >
            VENDER TUDO
          </button>
        {/if}
      </div>
      <div class="grid grid-cols-2 gap-4">
        {#each $inventory as fish, i}
          <div
            class="border-2 border-black p-2 flex justify-between items-center bg-[#9ce6e6]"
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 flex items-center justify-center {fish.isShiny ? 'shiny-effect' : ''}">
                {@html draw(fish.sprite, fish.name)}
              </div>
              <div class="retro-font text-[8px]">
                {fish.name} ({fish.weight}kg)
              </div>
            </div>
            <button
              class="bg-white text-black border-2 border-black retro-font text-[8px] px-2 py-1 active:bg-gray-200"
              on:click={() => sellFish(i)}
            >
              +{Math.round(fish.priceFinal * (1 + gardenBonus("sale")))}¥
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>