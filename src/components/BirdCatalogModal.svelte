<script>
  import { PHASES } from "../game/phases.js";
  import { birdLog, birdwatchingLuck, gameMode, phase } from "../game/stores.js";
  import { birdsForMode } from "../game/birdWatching.js";

  let selected = null;
  $: catalog = birdsForMode($gameMode);
  $: observedCount = catalog.filter((bird) => $birdLog[bird.id]).length;
  $: selectedRecord = selected ? $birdLog[selected.id] : null;

  function closeCatalog() {
    selected = null;
    phase.set(PHASES.PLAYING);
  }
</script>

<div class="relative z-50 flex h-full flex-1 flex-col overflow-hidden bg-[#f4f0df] text-[#252a21]">
  <header class="flex shrink-0 items-center justify-between border-b-4 border-black bg-[#d6e2bd] px-4 py-3">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🪶</span>
      <div>
        <h2 class="retro-font text-sm">{$gameMode === "pokemon" ? "POKÉDEX DE AVES" : "CATÁLOGO DE PÁSSAROS"}</h2>
        <p class="retro-font text-[8px] text-gray-700">{observedCount}/{catalog.length} observados · Sorte {$birdwatchingLuck}/5</p>
      </div>
    </div>
    <button class="border-2 border-black bg-white px-4 py-2 retro-font text-[9px]" on:click={closeCatalog}>FECHAR [X]</button>
  </header>

  <div class="grid min-h-0 flex-1 content-start grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3 md:grid-cols-4">
    {#each catalog as bird, index (bird.id)}
      {@const record = $birdLog[bird.id]}
      <button class={`flex min-w-0 items-center gap-2 border-2 border-black p-2 text-left hover:bg-[#e9efd8] ${record ? "bg-white" : "bg-gray-100 text-gray-500"}`} on:click={() => (selected = { ...bird, index })}>
        <div class="flex h-12 w-12 shrink-0 items-center justify-center border border-black/20 bg-white p-1">
          {#if record}
            {#if bird.portrait}<img class="max-h-full max-w-full object-contain" src={bird.portrait} alt={bird.name} />{:else}<span class="text-3xl" role="img" aria-label={bird.name}>{bird.emoji}</span>{/if}
          {:else}
            <span class="text-xl">???</span>
          {/if}
        </div>
        <div class="min-w-0 flex-1">
          <span class="block text-[9px] text-gray-500">#{String(index + 1).padStart(3, "0")}</span>
          <strong class="block truncate text-[11px]">{record ? bird.name : "???"}</strong>
          <span class="block truncate text-[9px]">{record ? `${record.count} observações · ${record.recordSize} cm` : "Ainda não observado"}</span>
        </div>
      </button>
    {/each}
  </div>

  {#if selected}
    <div class="absolute inset-0 z-10 flex items-center justify-center bg-black/55 p-5" role="presentation" on:click|self={() => (selected = null)}>
      <dialog open class="m-auto w-full max-w-[500px] overflow-hidden border-4 border-black bg-white p-0" aria-label={selectedRecord ? selected.name : "Ave ainda não observada"}>
        <header class="flex items-center justify-between border-b-4 border-black bg-[#d6e2bd] px-4 py-2">
          <h3 class="font-bold">{selectedRecord ? selected.name : "Ave desconhecida"}</h3>
          <button class="border-2 border-black bg-white px-3 py-1 text-xs" on:click={() => (selected = null)}>Voltar</button>
        </header>
        <div class="flex gap-4 p-4">
          <div class="flex h-28 w-28 shrink-0 items-center justify-center border border-black/20 bg-gray-50 p-2">
            {#if selectedRecord}
              {#if selected.portrait}<img class="max-h-full max-w-full object-contain" src={selected.portrait} alt={selected.name} />{:else}<span class="text-6xl" role="img" aria-label={selected.name}>{selected.emoji}</span>{/if}
            {:else}<span class="text-4xl text-gray-400">?</span>{/if}
          </div>
          <div class="min-w-0">
            {#if selectedRecord}
              <p class="mb-1 text-amber-600">{"★".repeat(selectedRecord.maxStars)}</p>
              <p class="text-sm">{selected.description}</p>
              <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-3 text-xs">
                <dt>Observações</dt><dd>{selectedRecord.count}</dd>
                <dt>Maior avistamento</dt><dd>{selectedRecord.recordSize} cm</dd>
                <dt>Menor avistamento</dt><dd>{selectedRecord.smallestSize} cm</dd>
              </dl>
            {:else}<p class="text-sm text-gray-600">Ainda não há registro desta ave.</p>{/if}
          </div>
        </div>
      </dialog>
    </div>
  {/if}
</div>