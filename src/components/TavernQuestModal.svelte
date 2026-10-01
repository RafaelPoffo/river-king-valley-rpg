<script>
  import { showTavernQuestModal, dailyQuest } from "../game/stores.js";
</script>

<div
  class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 select-none"
>
  <div
    class="bg-white border-8 border-black p-6 w-96 pixel-shadow space-y-4"
  >
    <div
      class="flex justify-between items-center border-b-2 border-black pb-2"
    >
      <h3 class="retro-font text-xs">📜 QUADRO DE ENCOMENDAS</h3>
      <button
        class="bg-black text-white px-2 py-1 retro-font text-[8px] hover:bg-gray-800"
        on:click={() => showTavernQuestModal.set(false)}
      >
        X
      </button>
    </div>
    {#if $dailyQuest}
      <div class="border-2 border-black p-4 bg-amber-50 space-y-2">
        <div class="retro-font text-[9px] font-bold">
          Pedido do Dia:
        </div>
        <div class="retro-font text-[8px]">
          Preciso de <b>{$dailyQuest.targetCount}x {$dailyQuest.fishName}</b>.
        </div>
        <div class="retro-font text-[8px]">
          Progresso: {$dailyQuest.current}/{$dailyQuest.targetCount}
        </div>
        <div class="retro-font text-[8px] text-amber-700">
          Recompensa: ¥{$dailyQuest.reward}
        </div>
        <div
          class="retro-font text-[8px] font-bold {$dailyQuest.completed
            ? 'text-emerald-600'
            : 'text-red-600'}"
        >
          {$dailyQuest.completed
            ? "CONCLUÍDO ✅"
            : "EM ANDAMENTO..."}
        </div>
      </div>
    {/if}
  </div>
</div>
