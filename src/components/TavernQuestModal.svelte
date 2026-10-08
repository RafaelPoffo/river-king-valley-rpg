<script>
  import { showTavernQuestModal, dailyQuest } from "../game/stores.js";
  import { questJournal } from "../game/quests.js";
  import { INITIAL_VILLAGERS } from "../game/constants.js";

  $: entries = questJournal();
  $: active = entries.filter((entry) => entry.status !== "feita");
  $: done = entries.filter((entry) => entry.status === "feita");

  function giverName(id) {
    return INITIAL_VILLAGERS.find((npc) => npc.id === id)?.name || id;
  }
</script>

<div
  class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 select-none"
>
  <div
    class="bg-white border-8 border-black p-5 w-[520px] max-h-[520px] pixel-shadow flex flex-col"
  >
    <div
      class="flex justify-between items-center border-b-2 border-black pb-2 mb-3"
    >
      <h3 class="retro-font text-xs">DIÁRIO DE MISSÕES</h3>
      <button
        class="bg-black text-white px-2 py-1 retro-font text-[8px] hover:bg-gray-800"
        on:click={() => showTavernQuestModal.set(false)}
      >
        X
      </button>
    </div>
    <div class="space-y-3 overflow-y-auto pr-1">
      {#if $dailyQuest}
        <div class="border-2 border-black p-3 bg-amber-50 space-y-1">
          <div class="retro-font text-[9px] font-bold">Pedido do quadro</div>
          <div class="retro-font text-[8px]">
            Preciso de <b>{$dailyQuest.targetCount}x {$dailyQuest.fishName}</b>.
          </div>
          <div class="retro-font text-[8px]">
            Progresso: {$dailyQuest.current}/{$dailyQuest.targetCount} · ¥{$dailyQuest.reward}
          </div>
        </div>
      {/if}
      {#each active as quest (quest.id)}
        <div class="border-2 border-black p-3 {quest.status === 'pronta' ? 'bg-emerald-50' : 'bg-[#f4f0df]'} space-y-1">
          <div class="retro-font text-[9px] font-bold">{quest.title}</div>
          <div class="retro-font text-[7px] text-gray-600">{giverName(quest.giver)} · {quest.stage}</div>
          <div class="retro-font text-[8px]">{quest.task}</div>
          <div class="retro-font text-[8px] text-[#3b5a2a]">{quest.hint}</div>
          <div class="retro-font text-[8px]">
            Falta: {quest.progress.current}/{quest.progress.needed}
            {#if quest.reward} · {quest.reward}{/if}
          </div>
        </div>
      {/each}
      {#if done.length}
        <div class="retro-font text-[8px] text-gray-500">Concluídas</div>
        {#each done as quest (quest.id)}
          <div class="border border-black/40 p-2 bg-gray-50 retro-font text-[8px] text-gray-600">
            {quest.title} — feita.
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
