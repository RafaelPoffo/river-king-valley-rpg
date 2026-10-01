<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { FISH_DB } from "../game/constants.js";
  import { phase, fishLog } from "../game/stores.js";

  $: filteredFish = FISH_DB.filter((f) => f.rarity > 0);
  $: caughtCount = Object.keys($fishLog).length;
</script>

<div class="flex-1 bg-white text-black flex flex-col relative z-50 select-none">
  <div
    class="flex justify-between items-center bg-[#9ce6e6] border-b-4 border-black p-4"
  >
    <h2 class="retro-font text-sm">
      CATÁLOGO DE PEIXES & PÓKEDEX ({caughtCount}/{filteredFish.length})
    </h2>
    <button
      class="bg-black text-white px-4 py-2 retro-font text-[9px] hover:bg-gray-800"
      on:click={() => phase.set("playing")}
    >
      FECHAR [X]
    </button>
  </div>
  <div
    class="flex-1 p-4 grid grid-cols-3 gap-3 overflow-y-auto scrollbar-hide bg-white"
  >
    {#each filteredFish as fish, idx}
      {@const caught = $fishLog[fish.id]}
      <div
        class={`border-2 border-black p-2 flex flex-col justify-between ${
          caught ? "bg-[#9ce6e6]/20" : "bg-gray-200 opacity-50"
        }`}
      >
        <div class="flex justify-between items-center mb-1">
          <span class="retro-font text-[7px] text-gray-600">
            #{String(idx + 1).padStart(3, "0")}
          </span>
          {#if caught && caught.shinyCount > 0}
            <span
              class="retro-font text-[7px] bg-amber-300 px-1 border border-black"
            >
              ✨{caught.shinyCount}
            </span>
          {/if}
        </div>
        <div class="flex items-center gap-2 my-1">
          <div
            class="w-10 h-10 shrink-0 {caught && caught.maxStars === 6
              ? 'shiny-effect'
              : ''}"
          >
            {@html caught ? draw(fish.sprite) : draw(SPRITES.void)}
          </div>
          <div class="overflow-hidden">
            <div class="retro-font text-[8px] font-bold truncate">
              {caught ? fish.name : "???"}
            </div>
            <div class="retro-font text-[6px] text-gray-500">
              {fish.biome} | {fish.desc}
            </div>
          </div>
        </div>
        {#if caught}
          <div
            class="border-t border-black pt-1 mt-1 space-y-0.5 text-[7px] retro-font"
          >
            <div class="flex justify-between">
              <span>Último:</span> <span>{caught.lastWeight}kg</span>
            </div>
            <div class="flex justify-between text-[#4a9090] font-bold">
              <span>Récord:</span> <span>{caught.recordWeight}kg</span>
            </div>
          </div>
        {:else}
          <div
            class="text-[7px] text-gray-400 retro-font text-center mt-2"
          >
            Não descoberto
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
