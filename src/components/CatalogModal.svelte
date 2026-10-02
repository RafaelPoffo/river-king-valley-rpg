<script>
  import { PHASES } from "../game/phases.js";
  import { draw, SPRITES } from "../game/sprites.js";
  import { phase, fishLog, gameMode, currentDatabase } from "../game/stores.js";

  $: isPokeMode = $gameMode === "pokemon";
  $: filteredFish = $currentDatabase.filter((f) => {
    if (isPokeMode) {
      // Filtrar apenas pokémon reais (excluir lixo do catálogo principal da pokedex)
      return f.stage !== undefined && !f.id.startsWith("poke_");
    }
    return f.rarity > 0;
  });
  $: caughtCount = filteredFish.filter((f) => $fishLog[f.id]).length;
</script>

<div class="flex-1 bg-white text-black flex flex-col relative z-50 select-none">
  <div
    class="flex justify-between items-center {isPokeMode ? 'bg-red-500 text-white' : 'bg-[#9ce6e6] text-black'} border-b-4 border-black p-4"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg">{isPokeMode ? '🔴' : '🐟'}</span>
      <h2 class="retro-font text-sm">
        {isPokeMode ? 'POKÉDEX REGIONAL DE ÁGUA' : 'CATÁLOGO DE PEIXES'} ({caughtCount}/{filteredFish.length})
      </h2>
    </div>
    <button
      class="bg-black text-white px-4 py-2 retro-font text-[9px] hover:bg-gray-800"
      on:click={() => phase.set(PHASES.PLAYING)}
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
          caught ? (isPokeMode ? "bg-red-50" : "bg-[#9ce6e6]/20") : "bg-gray-200 opacity-50"
        }`}
      >
        <div class="flex justify-between items-center mb-1">
          <span class="retro-font text-[7px] text-gray-600">
            {fish.dexNum ? `#${String(fish.dexNum).padStart(3, '0')}` : `#${String(idx + 1).padStart(3, "0")}`}
          </span>
          <div class="flex items-center gap-1">
            {#if isPokeMode && fish.stage}
              <span class="retro-font text-[6px] px-1 bg-blue-100 border border-blue-400 text-blue-800 rounded">
                Nv.{fish.stage}
              </span>
            {/if}
            {#if caught && caught.shinyCount > 0}
              <span
                class="retro-font text-[7px] bg-amber-300 px-1 border border-black"
              >
                ✨{caught.shinyCount}
              </span>
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2 my-1">
          <div
            class="w-12 h-12 shrink-0 flex items-center justify-center p-0.5 border border-black/20 bg-white rounded {caught && caught.maxStars === 6
              ? 'shiny-effect'
              : ''}"
          >
            {@html caught ? draw(fish.sprite, fish.name) : draw(SPRITES.void)}
          </div>
          <div class="overflow-hidden">
            <div class="retro-font text-[8px] font-bold truncate">
              {caught ? fish.name : "???"}
            </div>
            {#if isPokeMode && caught && fish.types}
              <div class="flex gap-1 my-0.5">
                {#each fish.types as t}
                  <span class="retro-font text-[6px] px-1 bg-blue-600 text-white rounded">
                    {t}
                  </span>
                {/each}
              </div>
            {/if}
            <div class="retro-font text-[6px] text-gray-500 line-clamp-2">
              {caught ? fish.desc : (isPokeMode ? "Área: " + (fish.dist.includes(1) ? "Rasa" : fish.dist.includes(2) ? "Média" : "Funda") : fish.biome + (fish.weather === "storm" ? " ⛈️" : ""))}
            </div>
          </div>
        </div>
        {#if caught}
          <div
            class="border-t border-black pt-1 mt-1 space-y-0.5 text-[7px] retro-font"
          >
            <div class="flex justify-between">
              <span>Peso Pokedex:</span> <span>{fish.weight}kg</span>
            </div>
            <div class="flex justify-between text-[#4a9090] font-bold">
              <span>Récord:</span> <span>{caught.recordWeight}kg</span>
            </div>
          </div>
        {:else}
          <div
            class="text-[7px] text-gray-400 retro-font text-center mt-2"
          >
            {isPokeMode ? "Não avistado" : "Não descoberto"}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
