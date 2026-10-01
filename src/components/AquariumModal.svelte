<script>
  import { draw } from "../game/sprites.js";
  import { showAquariumModal, aquarium, inventory } from "../game/stores.js";
  import { donateFishToAquarium } from "../game/gameActions.js";
</script>

<div
  class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 select-none"
>
  <div
    class="bg-white border-8 border-black p-6 w-[500px] pixel-shadow space-y-4"
  >
    <div
      class="flex justify-between items-center border-b-2 border-black pb-2"
    >
      <h3 class="retro-font text-xs">
        🏛️ AQUÁRIO MUNICIPAL (DOAÇÕES)
      </h3>
      <button
        class="bg-black text-white px-2 py-1 retro-font text-[8px] hover:bg-gray-800"
        on:click={() => showAquariumModal.set(false)}
      >
        X
      </button>
    </div>
    <div
      class="max-h-48 overflow-y-auto space-y-2 border-2 border-black p-2"
    >
      {#if Object.keys($aquarium).length === 0}
        <div
          class="retro-font text-[8px] text-center text-gray-500 py-4"
        >
          Nenhum peixe doado ainda.
        </div>
      {/if}
      {#each Object.values($aquarium) as item}
        <div
          class="flex items-center justify-between border border-black p-2 bg-blue-50 retro-font text-[8px]"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 flex items-center justify-center">{@html draw(item.sprite, item.name)}</div>
            <span>{item.name} ({item.weight}kg)</span>
          </div>
          <span>⭐ {item.stars}</span>
        </div>
      {/each}
    </div>
    <div class="border-t-2 border-black pt-2">
      <h4 class="retro-font text-[9px] mb-2">
        DOAR DA MOCHILA:
      </h4>
      <div class="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto">
        {#each $inventory as fish, idx}
          <button
            class="border-2 border-black p-1 flex flex-col items-center bg-[#9ce6e6] hover:bg-emerald-200"
            on:click={() => donateFishToAquarium(idx)}
          >
            <div class="w-6 h-6 flex items-center justify-center">{@html draw(fish.sprite, fish.name)}</div>
            <span class="retro-font text-[6px] truncate w-full">
              {fish.name}
            </span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
