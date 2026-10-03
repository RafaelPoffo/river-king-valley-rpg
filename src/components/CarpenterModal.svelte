<script>
  import { PHASES } from "../game/phases.js";
  import { phase, constructions, upgrades, friendship } from "../game/stores.js";
  import { orderConstruction, buyUpgrade } from "../game/gameActions.js";
  import { friendPrice, hasPerk } from "../game/friendship.js";

  $: price = ($friendship, friendPrice);
  $: discount = ($friendship, hasPerk("carpenter"));
</script>

<!-- Limita a altura do container principal em 110vh -->
<div
  class="flex-1 bg-white text-black flex flex-col relative border-b-8 border-black z-50 select-none max-h-[110vh] h-full overflow-hidden"
>
  <!-- Cabeçalho fixo com shrink-0 -->
  <div
    class="flex justify-between items-center bg-[#9ce6e6] border-b-4 border-black p-4 shrink-0"
  >
    <h2 class="retro-font text-sm">
      OFICINA DO MARCENEIRO & MELHORIAS
      {#if discount}<span class="text-[8px] text-red-600"> ❤️ -10% DE AMIGO</span>{/if}
    </h2>
    <button
      class="bg-black text-white px-4 py-2 retro-font text-[9px] hover:bg-gray-800"
      on:click={() => phase.set(PHASES.PLAYING)}
    >
      FECHAR [X]
    </button>
  </div>

  <!-- min-h-0 libera a rolagem no overflow-y-auto e remove o scrollbar-hide -->
  <div class="flex-1 p-6 overflow-y-auto min-h-0 space-y-4 bg-white">
    <h3 class="retro-font text-[10px] text-black">
      CONSTRUÇÕES DA VILA
    </h3>
    {#each Object.keys($constructions) as key}
      {@const c = $constructions[key]}
      <div
        class="border-2 border-black p-4 flex justify-between items-center bg-[#9ce6e6]/30"
      >
        <div>
          <div class="retro-font text-[10px] font-bold mb-1">
            {c.name} ({price(c.cost)}¥)
          </div>
          <div class="retro-font text-[8px]">
            Status: {c.status === "none"
              ? "Disponível"
              : c.status === "ordered"
                ? "Encomendado"
                : c.status === "building"
                  ? "Em Construção"
                  : "Pronto!"}
          </div>
        </div>
        {#if c.status === "none"}
          <button
            class="bg-black text-white retro-font text-[9px] px-4 py-2 hover:bg-gray-800"
            on:click={() => orderConstruction(key)}
          >
            ENCOMENDAR
          </button>
        {:else}
          <span
            class="retro-font text-[8px] px-3 py-1 bg-gray-200 border border-black"
          >
            INDISPONÍVEL
          </span>
        {/if}
      </div>
    {/each}

    <h3 class="retro-font text-[10px] text-black mt-6">
      APRIMORAMENTOS PESSOAIS
    </h3>
    {#each Object.keys($upgrades) as key}
      {@const up = $upgrades[key]}
      <div
        class="border-2 border-black p-4 flex justify-between items-center bg-amber-100"
      >
        <div>
          <div class="retro-font text-[10px] font-bold mb-1">
            {up.name} ({price(up.cost)}¥)
          </div>
          <div class="retro-font text-[8px]">
            Status: {up.bought ? "Adquirido ✅" : "Disponível"}
          </div>
        </div>
        {#if !up.bought}
          <button
            class="bg-black text-white retro-font text-[9px] px-4 py-2 hover:bg-gray-800"
            on:click={() => buyUpgrade(key)}
          >
            COMPRAR
          </button>
        {:else}
          <span
            class="retro-font text-[8px] px-3 py-1 bg-gray-200 border border-black"
          >
            ADQUIRIDO
          </span>
        {/if}
      </div>
    {/each}
  </div>
</div>