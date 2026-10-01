<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { playerName, hasSaveGame, gameMode, savedGameMode } from "../game/stores.js";
  import { loadGame, deleteSave, newGame } from "../game/saveSystem.js";

  let selectedMode = "normal"; // 'normal' | 'pokemon'

  function handleStartNewGame() {
    newGame(selectedMode);
  }
</script>

<div
  class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#4a9090] relative z-50 select-none overflow-y-auto"
>
  <div class="w-20 h-20 mb-2 flex items-center justify-center">
    <img
      src="/assets/crystal_player_down.png"
      alt="Gold"
      class="w-full h-full object-contain pointer-events-none select-none"
      style="image-rendering: pixelated;"
    />
  </div>
  <h1 class="retro-font text-2xl text-white mb-4 leading-tight drop-shadow">
    RIVER KING<br />{selectedMode === "pokemon" ? "POKÉMON EDITION" : "VALLEY RPG"}
  </h1>

  <div
    class="bg-white p-5 rounded border-4 border-black pixel-shadow w-full max-w-sm space-y-3"
  >
    {#if $hasSaveGame}
      <button
        class="w-full bg-[#9ce6e6] hover:bg-[#7bcaca] text-black retro-font text-[9px] p-3 border-2 border-black flex flex-col items-center justify-center gap-1 active:scale-[0.98]"
        on:click={loadGame}
      >
        <span>CONTINUAR JOGO SALVO</span>
        <span class="text-[7px] text-gray-700">
          (Modo: {$savedGameMode === "pokemon" ? "🔴 POKÉMON" : "🐟 NORMAL"})
        </span>
      </button>
    {/if}

    <div class="pt-2 border-t border-black space-y-3">
      <!-- Seletor de Modo de Jogo -->
      <div>
        <div class="block retro-font text-[8px] text-gray-700 mb-1 text-left font-bold">
          ESCOLHA O MODO DE JOGO:
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class={`retro-font text-[8px] p-2 border-2 border-black flex flex-col items-center justify-center gap-1 transition-colors ${
              selectedMode === "normal"
                ? "bg-[#9ce6e6] text-black font-bold shadow-[2px_2px_0px_#000]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            on:click={() => (selectedMode = "normal")}
          >
            <span class="text-base">🐟</span>
            <span>NORMAL</span>
            <span class="text-[6px] text-gray-500">Peixes e lendas</span>
          </button>

          <button
            type="button"
            class={`retro-font text-[8px] p-2 border-2 border-black flex flex-col items-center justify-center gap-1 transition-colors ${
              selectedMode === "pokemon"
                ? "bg-red-500 text-white font-bold shadow-[2px_2px_0px_#000]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            on:click={() => (selectedMode = "pokemon")}
          >
            <span class="text-base">🔴</span>
            <span>POKÉMON</span>
            <span class="text-[6px] {selectedMode === 'pokemon' ? 'text-red-100' : 'text-gray-500'}">Gen 1 e 2 Água</span>
          </button>
        </div>
      </div>

      <input
        type="text"
        class="w-full bg-white border-2 border-black p-2 retro-font text-[9px] text-black outline-none"
        placeholder="NOME DO JOGADOR"
        bind:value={$playerName}
        maxlength="10"
      />

      <button
        class="w-full {selectedMode === 'pokemon' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-black text-white hover:bg-gray-800'} retro-font text-[9px] p-3 border-2 border-black active:scale-[0.98]"
        on:click={handleStartNewGame}
      >
        INICIAR NOVO JOGO ({selectedMode.toUpperCase()})
      </button>

      {#if $hasSaveGame}
        <button
          class="w-full bg-red-100 text-red-700 retro-font text-[8px] p-1.5 border border-red-400 hover:bg-red-200"
          on:click={deleteSave}
        >
          APAGAR JOGO SALVO
        </button>
      {/if}
    </div>
  </div>
</div>
