<script>
  import { draw, SPRITES } from "../game/sprites.js";
  import { FISH_DB } from "../game/constants.js";
  import { POKEMON_DB } from "../game/pokemonConstants.js";
  import { phase, museum, gameMode } from "../game/stores.js";

  $: database = $gameMode === "pokemon" ? POKEMON_DB : FISH_DB;
  $: relics = database.filter((entry) => entry.type === "treasure");
  $: found = relics.filter((entry) => $museum[entry.id]).length;
</script>

<div class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 select-none">
  <div class="bg-white border-8 border-black p-6 w-[560px] pixel-shadow space-y-4">
    <div class="flex justify-between items-center border-b-2 border-black pb-2">
      <h3 class="retro-font text-xs">MUSEU ({found}/{relics.length})</h3>
      <button
        class="bg-black text-white px-2 py-1 retro-font text-[8px] hover:bg-gray-800"
        on:click={() => phase.set("playing")}
      >
        X
      </button>
    </div>
    <p class="retro-font text-[7px] text-gray-600 leading-relaxed">
      Tesouros fisgados no mar vão direto para o acervo.
    </p>
    <div class="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
      {#each relics as relic}
        {@const owned = $museum[relic.id]}
        <div class="border-2 border-black p-2 bg-amber-50 flex flex-col items-center gap-1 min-h-[88px]">
          <div class="w-10 h-10">
            {@html owned ? draw(owned.sprite || relic.sprite, relic.name) : draw(SPRITES.void)}
          </div>
          <span class="retro-font text-[6px] text-center leading-tight">
            {owned ? relic.name : "???"}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>
