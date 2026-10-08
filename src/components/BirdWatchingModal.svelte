<script>
  import { onDestroy, onMount } from "svelte";
  import { birdwatchingLuck, dailyBirds, gameMode, phase, showBirdWatching } from "../game/stores.js";
  import { PHASES } from "../game/phases.js";
  import {
    BINOCULAR_VIEW_HEIGHT,
    BINOCULAR_VIEW_WIDTH,
    PANORAMA_HEIGHT,
    PANORAMA_WIDTH,
    bindBirdWatchingView,
    binocularPanDelta,
    clampBinocularCamera,
    countableSightings,
    observeBird,
    pickSightingInView,
    sightingDisplay,
    sightingSpriteSize,
    startBirdPan,
    stopBirdPan,
  } from "../game/birdWatching.js";
  import { CHARACTER_SPRITES } from "../game/overworldAtlas.js";
  import { saveGame } from "../game/saveSystem.js";
  import OverworldSprite from "./OverworldSprite.svelte";

  let cameraX = 1875;
  let cameraY = 338;
  let observation = null;
  let message = "";
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  $: countable = countableSightings($dailyBirds);
  $: observedCount = countable.filter((bird) => bird.observed).length;

  function closeWatching() {
    showBirdWatching.set(false);
    phase.set(PHASES.PLAYING);
    cameraX = 1875;
    cameraY = 338;
    observation = null;
    message = "";
    dragging = false;
  }

  function pan(dir) {
    const [dx, dy] = binocularPanDelta(dir);
    const next = clampBinocularCamera(cameraX + dx, cameraY + dy);
    cameraX = next.x;
    cameraY = next.y;
  }

  function seeBird() {
    if (observation) {
      observation = null;
      return;
    }
    const visible = pickSightingInView($dailyBirds, cameraX, cameraY);
    if (!visible) {
      message = "Não há nenhuma ave nova dentro do campo de visão.";
      return;
    }
    const result = observeBird(visible.id);
    if (!result) {
      message = "Não há nenhuma ave nova dentro do campo de visão.";
      return;
    }
    if (result.visitor) {
      message = result.message;
      return;
    }
    observation = result;
    message = result.featherMessage || "";
    saveGame();
  }

  function onPointerDown(event) {
    if (observation) return;
    dragging = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging) return;
    const next = clampBinocularCamera(
      cameraX - (event.clientX - lastPointerX) * 1.6,
      cameraY - (event.clientY - lastPointerY) * 1.6,
    );
    cameraX = next.x;
    cameraY = next.y;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
  }

  function onPointerUp() {
    dragging = false;
  }

  function tapSighting(sighting) {
    if (observation || sighting.observed) return;
    if (!pickSightingInView([sighting], cameraX, cameraY)) return;
    const result = observeBird(sighting.id);
    if (!result) return;
    if (result.visitor) {
      message = result.message;
      return;
    }
    observation = result;
    message = result.featherMessage || "";
    saveGame();
  }

  onMount(() => {
    bindBirdWatchingView({
      pan,
      observe: seeBird,
      close: closeWatching,
    });
  });

  onDestroy(() => bindBirdWatchingView(null));
</script>

{#if $showBirdWatching}
  <div class="absolute inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden bg-black text-white" role="presentation">
    <div class="absolute left-4 top-4 z-20 flex items-center gap-3 border border-white/30 bg-black/75 px-3 py-2 font-mono text-[10px]">
      <span>OBSERVAÇÃO</span>
      <span class="text-emerald-300">SORTE {$birdwatchingLuck}/10</span>
      <span class="text-white/65">AVES {observedCount}/{countable.length}</span>
    </div>

    <div
      class="binoculars"
      class:dragging
      aria-label="Visão dos binóculos"
      role="application"
      on:pointerdown={onPointerDown}
      on:pointermove={onPointerMove}
      on:pointerup={onPointerUp}
      on:pointercancel={onPointerUp}
    >
      {#each [0, 1] as lens}
        <div class="lens">
          <div class="panorama" style={`width:${PANORAMA_WIDTH}px;height:${PANORAMA_HEIGHT}px;transform:translate(${-cameraX - lens * BINOCULAR_VIEW_WIDTH / 2}px,${-cameraY}px)`}>
            {#each $dailyBirds as sighting (sighting.id)}
              {@const species = sightingDisplay(sighting, $gameMode)}
              {@const size = sightingSpriteSize(sighting)}
              <button
                type="button"
                class:observed={sighting.observed}
                class:visitor={sighting.kind === "visitor"}
                class="bird-sprite"
                style={`left:${sighting.x}px;top:${sighting.y}px;width:${size}px;height:${size}px;font-size:${size}px;`}
                on:pointerdown|stopPropagation={() => tapSighting(sighting)}
              >
                {#if sighting.kind === "visitor" && sighting.visitorType === "npc"}
                  <OverworldSprite sprite={CHARACTER_SPRITES[sighting.spriteId]} label={species?.name || "Visitante"} />
                {:else if species?.portrait}
                  <img src={species.portrait} alt={species?.name} class="h-full w-full object-contain" style="image-rendering:pixelated" />
                {:else}
                  <span class="bird-emoji" role="img" aria-label={species?.name || "Ave distante"}>{species?.emoji}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
      <div class="bridge" aria-hidden="true"></div>
    </div>

    <div class="absolute bottom-5 left-1/2 z-20 flex w-[min(94%,560px)] -translate-x-1/2 flex-col items-center gap-2">
      <div class="w-full border border-white/25 bg-black/80 px-4 py-2 text-center font-mono text-[10px]">
        {#if message}{message}{:else}Arraste ou use as setas · A / Espaço observa · B / Esc sai{/if}
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <div class="grid grid-cols-3 grid-rows-3 gap-1">
          <button class="col-start-2 row-start-1 h-10 w-10 border border-white/50 bg-black/70" on:pointerdown={() => startBirdPan("up")} on:pointerup={() => stopBirdPan()} on:pointercancel={() => stopBirdPan()}>▲</button>
          <button class="col-start-1 row-start-2 h-10 w-10 border border-white/50 bg-black/70" on:pointerdown={() => startBirdPan("left")} on:pointerup={() => stopBirdPan()} on:pointercancel={() => stopBirdPan()}>◀</button>
          <button class="col-start-3 row-start-2 h-10 w-10 border border-white/50 bg-black/70" on:pointerdown={() => startBirdPan("right")} on:pointerup={() => stopBirdPan()} on:pointercancel={() => stopBirdPan()}>▶</button>
          <button class="col-start-2 row-start-3 h-10 w-10 border border-white/50 bg-black/70" on:pointerdown={() => startBirdPan("down")} on:pointerup={() => stopBirdPan()} on:pointercancel={() => stopBirdPan()}>▼</button>
        </div>
        <button class="h-12 border-2 border-white bg-emerald-700 px-4 font-mono text-[11px]" on:click={seeBird}>OBSERVAR</button>
        <button class="h-12 border-2 border-white bg-gray-700 px-4 font-mono text-[11px]" on:click={closeWatching}>SAIR</button>
      </div>
    </div>

    {#if observation}
      <div class="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-4" role="presentation">
        <dialog open class="m-auto w-[420px] max-w-full border-4 border-[#222] bg-[#f4f0df] p-0 text-black shadow-2xl" aria-modal="true" aria-label={`Registro de ${observation.species.name}`}>
          <header class="flex items-center justify-between border-b-4 border-black bg-[#d6e2bd] px-4 py-2">
            <h2 class="font-bold">Registro de campo</h2>
            <span class="text-amber-600">{"★".repeat(observation.species.rarity)}</span>
          </header>
          <div class="flex gap-4 p-4">
            <div class="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-black/20 bg-white p-2">
              {#if observation.species.portrait}
                <img class="max-h-full max-w-full object-contain" src={observation.species.portrait} alt={observation.species.name} />
              {:else}
                <span class="text-6xl" role="img" aria-label={observation.species.name}>{observation.species.emoji}</span>
              {/if}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-black">{observation.species.name}</h3>
              <p class="mt-1 text-xs text-gray-700">{observation.species.description}</p>
              <p class="mt-2 text-xs">Tamanho: {observation.size} cm</p>
              <p class="text-xs">Recorde: {observation.observation.recordSize} cm · Menor: {observation.observation.smallestSize} cm</p>
              <p class="text-xs">Observações: {observation.observation.count}</p>
              {#if observation.featherMessage}
                <p class="mt-2 text-xs font-bold text-amber-800">{observation.featherMessage}</p>
              {/if}
            </div>
          </div>
          <footer class="flex items-center justify-between border-t border-black/20 px-4 py-3 text-xs">
            <span>Sorte aumentada: nível {$birdwatchingLuck}</span>
            <button class="border-2 border-black bg-white px-4 py-2 font-bold" on:click={() => (observation = null)}>Continuar [SPACE]</button>
          </footer>
        </dialog>
      </div>
    {/if}
  </div>
{/if}

<style>
  .binoculars {
    position: relative;
    display: flex;
    width: 288px;
    height: 144px;
    touch-action: none;
    filter: drop-shadow(0 0 24px #000);
  }

  .binoculars.dragging .panorama {
    transition: none;
  }

  .lens {
    position: relative;
    z-index: 2;
    width: 144px;
    height: 144px;
    overflow: hidden;
    border: 3px solid #111;
    border-radius: 50%;
    background: #28362e;
    box-shadow: inset 0 0 11px 4px #050705;
  }

  .panorama {
    position: absolute;
    left: 0;
    top: 0;
    background-color: #192b22;
    background-image: url("/assets/birdWatching.jpg");
    background-repeat: repeat-x;
    background-position: center 40%;
    background-size: auto 266.667%;
    transition: transform 180ms ease-out;
  }

  .bird-sprite {
    position: absolute;
    z-index: 2;
    padding: 0;
    border: 0;
    background: transparent;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(1px 2px 1px #101711);
    cursor: pointer;
  }

  .bird-sprite.observed {
    opacity: 0.45;
  }

  .bird-sprite.visitor {
    filter: drop-shadow(1px 2px 1px #101711) saturate(0.85);
  }

  .bird-emoji {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1;
  }

  .bridge {
    position: absolute;
    z-index: 3;
    top: 56px;
    left: 137px;
    width: 14px;
    height: 31px;
    background: #080a09;
    pointer-events: none;
  }
</style>
