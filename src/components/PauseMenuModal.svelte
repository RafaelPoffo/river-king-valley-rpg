<script>
  import { PHASES } from "../game/phases.js";
  import { phase, currentToolType, gameMode } from "../game/stores.js";
  import { toggleTool } from "../game/gameActions.js";
</script>

<div
  class="absolute inset-0 bg-black/50 z-50 flex items-center justify-center select-none"
>
  <div
    class="bg-white border-8 border-black p-6 pixel-shadow w-72 flex flex-col gap-3"
  >
    <h2
      class="retro-font text-[12px] text-center border-b-4 border-black pb-3 mb-2"
    >
      MENU DO JOGO
    </h2>
    <button
      class="text-left retro-font text-[9px] hover:bg-[#9ce6e6] p-2 border-2 border-transparent focus:border-black"
      on:click={() => phase.set(PHASES.EQUIPMENT)}
    >
      🎒 MOCHILA & EQUIP.
    </button>
    <button
      class="text-left retro-font text-[9px] hover:bg-[#9ce6e6] p-2 border-2 border-transparent focus:border-black"
      on:click={() => phase.set(PHASES.FISH_LOG)}
    >
      {$gameMode === "pokemon" ? "🔴 POKÉDEX" : "📖 CATÁLOGO DE PEIXES"}
    </button>
    <button
      class="text-left retro-font text-[9px] hover:bg-[#9ce6e6] p-2 border-2 border-transparent focus:border-black"
      on:click={() => phase.set(PHASES.MUSEUM)}
    >
      MUSEU
    </button>
    <button
      class="text-left retro-font text-[9px] hover:bg-[#9ce6e6] p-2 border-2 border-transparent focus:border-black bg-gray-100 mt-2"
      on:click={toggleTool}
    >
      🔄 USANDO: {$currentToolType === "rod" ? "VARA" : "REDE"}
    </button>
    <button
      class="text-center retro-font text-[9px] hover:bg-gray-200 p-2 text-red-600 mt-4 border-2 border-black"
      on:click={() => phase.set(PHASES.PLAYING)}
    >
      FECHAR [X]
    </button>
  </div>
</div>
