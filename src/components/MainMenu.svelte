<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { playerName, hasSaveGame } from "../game/stores.js";
  import { loadGame, deleteSave, newGame } from "../game/saveSystem.js";
</script>

<div
  class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#4a9090] relative z-50 select-none"
>
  <div class="w-24 h-24 mb-4">
    {@html draw(SPRITES.player)}
  </div>
  <h1 class="retro-font text-3xl text-white mb-6 leading-tight">
    RIVER KING<br />VALLEY RPG
  </h1>
  <div
    class="bg-white p-6 rounded border-4 border-black pixel-shadow w-full max-w-sm space-y-3"
  >
    {#if $hasSaveGame}
      <button
        class="w-full bg-[#9ce6e6] text-black retro-font text-[9px] p-3 border-2 border-black active:bg-[#4a9090]"
        on:click={loadGame}
      >
        CONTINUAR JOGO
      </button>
    {/if}
    <div class="pt-2 border-t border-black space-y-2">
      <input
        type="text"
        class="w-full bg-white border-2 border-black p-2 retro-font text-[9px] text-black outline-none"
        placeholder="NOME DO JOGADOR"
        bind:value={$playerName}
        maxlength="10"
      />
      <button
        class="w-full bg-white text-black retro-font text-[9px] p-3 border-2 border-black active:bg-gray-100"
        on:click={newGame}
      >
        NOVO JOGO
      </button>
      {#if $hasSaveGame}
        <button
          class="w-full bg-red-100 text-red-700 retro-font text-[8px] p-2 border-2 border-black"
          on:click={deleteSave}
        >
          APAGAR JOGO SALVO
        </button>
      {/if}
    </div>
  </div>
</div>
