<script>
  import { inventoryFullPendingFish } from "../game/stores.js";
  import {
    confirmReplaceInventory,
    cancelReplaceInventory,
  } from "../game/gameActions.js";
</script>

{#if $inventoryFullPendingFish}
  <div
    class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 select-none"
  >
    <div
      class="bg-white border-8 border-black p-6 text-center max-w-sm pixel-shadow space-y-4"
    >
      <h3 class="retro-font text-xs text-red-600">MOCHILA CHEIA</h3>
      <p class="retro-font text-[9px] leading-relaxed">
        Deseja substituir o primeiro item da mochila pelo novo item ({$inventoryFullPendingFish.name})?
      </p>
      <div class="flex gap-3">
        <button
          class="flex-1 bg-red-600 text-white p-3 retro-font text-[8px] border-2 border-black hover:bg-red-800"
          on:click={confirmReplaceInventory}
        >
          SIM
        </button>
        <button
          class="flex-1 bg-gray-300 text-black p-3 retro-font text-[8px] border-2 border-black hover:bg-gray-400"
          on:click={cancelReplaceInventory}
        >
          NÃO
        </button>
      </div>
    </div>
  </div>
{/if}
