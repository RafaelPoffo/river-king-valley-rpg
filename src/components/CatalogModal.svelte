<script>
  import { PHASES } from "../game/phases.js";
  import { draw, SPRITES } from "../game/sprites.js";
  import { phase, fishLog, gameMode, currentDatabase } from "../game/stores.js";
  import { BAITS, SEASONS } from "../game/constants.js";
  import { canBreakLine, strengthLabel, strengthRange } from "../game/fight.js";
  import { isNetCreature } from "../game/fishingEngine.js";

  const BIOMES = { river: "Rio", sea: "Mar", deep_sea: "Alto-mar", all: "Rio e mar" };
  const ZONES = { 1: "Rasa", 2: "Média", 3: "Funda" };
  const TIMES = { day: "☀️ Só de dia", night: "🌙 Só à noite", all: "Dia e noite" };

  let selected = null;

  $: isPokeMode = $gameMode === "pokemon";
  $: filteredFish = $currentDatabase.filter((f) => {
    if (isPokeMode) return f.stage !== undefined && !f.id.startsWith("poke_");
    return f.rarity > 0;
  });
  $: caughtCount = filteredFish.filter((f) => $fishLog[f.id]).length;
  $: selectedLog = selected && $fishLog[selected.id];

  function dexNumber(fish, idx) {
    return `#${String(fish.dexNum || idx + 1).padStart(3, "0")}`;
  }

  function habitat(fish) {
    const zones = (fish.dist || []).map((zone) => ZONES[zone]).join(", ");
    return `${BIOMES[fish.biome] || fish.biome}${zones ? ` · ${zones}` : ""}`;
  }

  function seasons(fish) {
    if (isPokeMode || !fish.seasons || fish.seasons.length === 4) return "Todas";
    return fish.seasons.map((season) => SEASONS[season]).join(", ");
  }

  function favoriteBaits(fish) {
    return Object.entries(fish.baitPreferences || {})
      .map(([id, chance]) => ({
        name: BAITS.find((bait) => bait.id === id)?.name.replace(/ \(Nv \d+\)$/, "") || id,
        chance,
      }))
      .sort((a, b) => b.chance - a.chance);
  }

  function strength(fish) {
    const [min, max] = strengthRange(fish);
    return `${strengthLabel(min)} a ${strengthLabel(max)}`;
  }

  function closeCatalog() {
    selected = null;
    phase.set(PHASES.PLAYING);
  }
</script>

<div class="flex-1 bg-white text-black flex flex-col relative z-50 select-none h-full overflow-hidden">
  <div
    class="flex justify-between items-center {isPokeMode ? 'bg-red-500 text-white' : 'bg-[#9ce6e6] text-black'} border-b-4 border-black px-4 py-3 shrink-0"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg">{isPokeMode ? "🔴" : "🐟"}</span>
      <h2 class="retro-font text-sm">
        {isPokeMode ? "POKÉDEX REGIONAL DE ÁGUA" : "CATÁLOGO DE PEIXES"} ({caughtCount}/{filteredFish.length})
      </h2>
    </div>
    <button class="bg-black text-white px-4 py-2 retro-font text-[9px] hover:bg-gray-800" on:click={closeCatalog}>
      FECHAR [X]
    </button>
  </div>

  <div class="flex-1 p-3 grid grid-cols-4 gap-2 overflow-y-auto min-h-0 bg-white content-start">
    {#each filteredFish as fish, idx}
      {@const caught = $fishLog[fish.id]}
      <button
        type="button"
        class="text-left border-2 border-black p-2 flex items-center gap-2 font-sans hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 {caught
          ? isPokeMode ? 'bg-red-50' : 'bg-[#9ce6e6]/20'
          : 'bg-gray-100 text-gray-500'}"
        on:click={() => (selected = { ...fish, idx })}
      >
        <div
          class="w-11 h-11 shrink-0 p-0.5 border border-black/20 bg-white rounded {caught?.maxStars === 6 ? 'shiny-effect' : ''}"
        >
          {@html caught ? draw(fish.sprite, fish.name) : draw(SPRITES.void)}
        </div>
        <div class="min-w-0 flex-1 leading-tight">
          <div class="text-[10px] text-gray-500">{dexNumber(fish, idx)}</div>
          <div class="text-[12px] font-bold truncate">{caught ? fish.name : "???"}</div>
          <div class="text-[10px] text-gray-600 truncate">
            {caught ? `${caught.count}× · ${caught.recordWeight}kg` : habitat(fish)}
          </div>
        </div>
        {#if caught?.shinyCount > 0}
          <span class="self-start text-[10px]" title="Brilhantes">✨{caught.shinyCount}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if selected}
    <div class="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-6" role="presentation" on:click|self={() => (selected = null)}>
      <div
        class="w-full max-w-[560px] max-h-full overflow-y-auto border-4 border-black bg-white font-sans text-[13px] leading-snug pixel-shadow"
        role="dialog"
        aria-label={selectedLog ? selected.name : "Espécie não descoberta"}
      >
        <div class="flex items-center justify-between border-b-4 border-black px-4 py-2 {isPokeMode ? 'bg-red-500 text-white' : 'bg-[#9ce6e6]'}">
          <div class="text-base font-bold">
            {dexNumber(selected, selected.idx)} · {selectedLog ? selected.name : "???"}
          </div>
          <button class="bg-black text-white px-3 py-1 text-xs font-bold hover:bg-gray-800" on:click={() => (selected = null)}>
            VOLTAR
          </button>
        </div>

        <div class="flex gap-4 p-4">
          <div class="w-28 h-28 shrink-0 p-2 border-2 border-black/20 bg-white rounded {selectedLog?.maxStars === 6 ? 'shiny-effect' : ''}">
            {@html selectedLog ? draw(selected.sprite, selected.name) : draw(SPRITES.void)}
          </div>
          <div class="min-w-0 flex-1 space-y-2">
            {#if selectedLog}
              {#if selected.types}
                <div class="flex flex-wrap gap-1">
                  {#each selected.types as type}
                    <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold">{type}</span>
                  {/each}
                  {#if selected.stage}
                    <span class="px-2 py-0.5 rounded border border-blue-400 bg-blue-100 text-blue-800 text-xs">Estágio {selected.stage}</span>
                  {/if}
                </div>
              {/if}
              <p class="text-gray-700">{selected.desc}</p>
            {:else}
              <p class="text-gray-600">Você ainda não pegou esta espécie. Pistas de onde procurar:</p>
            {/if}
            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <dt class="font-bold">Habitat</dt><dd>{habitat(selected)}</dd>
              <dt class="font-bold">Horário</dt><dd>{TIMES[selected.times || "all"]}</dd>
              {#if !isPokeMode}<dt class="font-bold">Estações</dt><dd>{seasons(selected)}</dd>{/if}
              {#if selected.weather === "storm"}<dt class="font-bold">Clima</dt><dd>⛈️ Só na tempestade</dd>{/if}
              {#if isNetCreature(selected)}<dt class="font-bold">Captura</dt><dd>🕸️ Com rede, na margem</dd>{/if}
            </dl>
          </div>
        </div>

        {#if selectedLog}
          <div class="grid grid-cols-2 gap-4 border-t-2 border-black/20 px-4 py-3">
            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <dt class="font-bold">Capturados</dt><dd>{selectedLog.count}</dd>
              <dt class="font-bold">Recorde</dt><dd class="text-[#2f7a7a] font-bold">{selectedLog.recordWeight}kg</dd>
              <dt class="font-bold">Peso</dt><dd>{selected.minW}kg a {selected.maxW}kg</dd>
              {#if selected.weight}<dt class="font-bold">Peso Pokédex</dt><dd>{selected.weight}kg</dd>{/if}
              <dt class="font-bold">Melhor nota</dt><dd>{"★".repeat(selectedLog.maxStars || 0) || "—"}</dd>
              <dt class="font-bold">Brilhantes</dt><dd>{selectedLog.shinyCount || 0}</dd>
              <dt class="font-bold">Preço base</dt><dd>${selected.price}</dd>
              {#if canBreakLine(selected)}<dt class="font-bold">Força</dt><dd>{strength(selected)}</dd>{/if}
            </dl>
            {#if !isNetCreature(selected)}
              <div>
                <div class="font-bold mb-1">Iscas preferidas</div>
                <ul class="space-y-0.5">
                  {#each favoriteBaits(selected) as bait}
                    <li class="flex justify-between gap-2">
                      <span>{bait.name}</span>
                      <span class="font-bold {bait.chance >= 0.8 ? 'text-green-700' : 'text-gray-600'}">
                        {Math.round(bait.chance * 100)}%
                      </span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
