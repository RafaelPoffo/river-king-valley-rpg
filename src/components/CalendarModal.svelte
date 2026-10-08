<script>
  import { SEASONS, FESTIVALS, TOURNAMENTS, INITIAL_VILLAGERS, CARD_EVENT_DAYS } from "../game/constants.js";
  import { showCalendarModal } from "../game/stores.js";

  const birthdays = INITIAL_VILLAGERS.filter((npc) => npc.birthday && !npc.cardTheme);
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
      <h3 class="retro-font text-xs">CALENDÁRIO DE FESTIVAIS</h3>
      <button
        class="bg-black text-white px-2 py-1 retro-font text-[8px] hover:bg-gray-800"
        on:click={() => showCalendarModal.set(false)}
      >
        X
      </button>
    </div>
    <div class="space-y-3 max-h-64 overflow-y-auto">
      {#each SEASONS as sName, sIdx}
        <div class="border-2 border-black p-3 bg-[#9ce6e6]/20">
          <div
            class="retro-font text-[10px] font-bold text-[#4a9090] mb-1"
          >
            {sName}
          </div>
          <ul class="space-y-1 text-[8px] retro-font">
            {#each Object.entries(FESTIVALS[sIdx]) as [dNum, fName]}
              <li class="flex justify-between">
                <span>Dia {dNum}:</span>
                <span class="font-bold text-black">
                  {TOURNAMENTS[fName] ? "🏆 " : ""}{fName}
                </span>
              </li>
            {/each}
            {#each CARD_EVENT_DAYS as eventDay}
              <li class="flex justify-between text-purple-800">
                <span>Dia {eventDay}:</span>
                <span>Casa dos Jogos — {eventDay === 15 ? "campeonato" : "noite das lendas"}</span>
              </li>
            {/each}
            {#each birthdays.filter((npc) => npc.birthday.season === sIdx) as npc}
              <li class="flex justify-between text-rose-700">
                <span>Dia {npc.birthday.day}:</span>
                <span>Aniversário de {npc.name}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>
</div>
