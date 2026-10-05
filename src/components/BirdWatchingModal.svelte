<script>
  import { onDestroy, onMount } from "svelte";
  import { birdwatchingLuck, dailyBirds, gameMode, phase, showBirdWatching } from "../game/stores.js";
  import { PHASES } from "../game/phases.js";
  import { birdSpecies, observeBird } from "../game/birdWatching.js";
  import { saveGame } from "../game/saveSystem.js";
  import CreatureSprite from "./CreatureSprite.svelte";

  const PANORAMA_WIDTH = 4000;
  const PANORAMA_HEIGHT = 800;
  const VIEW_WIDTH = 200;
  const VIEW_HEIGHT = 100;

  let cameraX = 1900;
  let cameraY = 350;
  let observation = null;
  let message = "";

  function closeWatching() {
    showBirdWatching.set(false);
    phase.set(PHASES.PLAYING);
    cameraX = 1900;
    cameraY = 350;
    observation = null;
  }

  function seeBird() {
    const visible = $dailyBirds
      .filter((bird) => !bird.observed && bird.x >= cameraX && bird.x < cameraX + VIEW_WIDTH && bird.y >= cameraY && bird.y < cameraY + VIEW_HEIGHT)
      .sort((first, second) => Math.hypot(first.x - cameraX, first.y - cameraY) - Math.hypot(second.x - cameraX, second.y - cameraY));
    if (!visible.length) {
      message = "Não há nenhuma ave nova dentro do campo de visão.";
      return;
    }
    observation = observeBird(visible[0].id);
    message = "";
    if (observation) saveGame();
  }

  function handleKeydown(event) {
    if (!$showBirdWatching || event.repeat) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeWatching();
      return;
    }
    if (observation && (event.key === " " || event.key === "Spacebar")) {
      event.preventDefault();
      observation = null;
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      cameraX = Math.max(0, Math.min(PANORAMA_WIDTH - VIEW_WIDTH, cameraX + (event.key === "ArrowLeft" ? -48 : 48)));
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      cameraY = Math.max(0, Math.min(PANORAMA_HEIGHT - VIEW_HEIGHT, cameraY + (event.key === "ArrowUp" ? -32 : 32)));
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      seeBird();
    }
  }

  onMount(() => window.addEventListener("keydown", handleKeydown));
  onDestroy(() => window.removeEventListener("keydown", handleKeydown));
</script>

{#if $showBirdWatching}
  <div class="absolute inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden bg-black text-white" role="presentation">
    <div class="absolute left-4 top-4 z-20 flex items-center gap-3 border border-white/30 bg-black/75 px-3 py-2 font-mono text-[10px]">
      <span>OBSERVAÇÃO</span>
      <span class="text-emerald-300">SORTE {$birdwatchingLuck}/5</span>
      <span class="text-white/65">AVES {$dailyBirds.filter((bird) => bird.observed).length}/{$dailyBirds.length}</span>
    </div>

    <div class="binoculars" aria-label="Visão dos binóculos">
      {#each [0, 1] as lens}
        <div class="lens">
          <div class="panorama" style={`width:${PANORAMA_WIDTH}px;height:${PANORAMA_HEIGHT}px;transform:translate(${-cameraX}px,${-cameraY}px)`}>
            {#each $dailyBirds as sighting (sighting.id)}
              {@const species = birdSpecies(sighting, $gameMode)}
              <div
                class:observed={sighting.observed}
                class="bird-sprite"
                style={`left:${sighting.x}px;top:${sighting.y}px;width:${Math.max(26, Math.round(sighting.size * 0.8))}px;height:${Math.max(26, Math.round(sighting.size * 0.8))}px;`}
              >
                {#if $gameMode === "pokemon"}
                  <CreatureSprite {species} moving />
                {:else}
                  <span class="bird-emoji" role="img" aria-label={species?.name || "Ave distante"}>{species?.emoji}</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
      <div class="bridge" aria-hidden="true"></div>
    </div>

    <div class="absolute bottom-5 left-1/2 z-20 w-[min(90%,520px)] -translate-x-1/2 border border-white/25 bg-black/80 px-4 py-3 text-center font-mono text-[10px]">
      {#if message}{message}{:else}Setas para explorar · Espaço para observar · Esc para sair{/if}
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
    width: 200px;
    height: 100px;
    filter: drop-shadow(0 0 24px #000);
  }

  .lens {
    position: relative;
    z-index: 2;
    width: 100px;
    height: 100px;
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
    background-position: center center;
    background-size: auto 200%;
    transition: transform 140ms ease-out;
  }

  .bird-sprite {
    position: absolute;
    z-index: 2;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(1px 2px 1px #101711);
  }

  .bird-sprite.observed {
    opacity: 0.45;
  }

  .bird-emoji {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 26px;
    line-height: 1;
  }

  .bridge {
    position: absolute;
    z-index: 3;
    top: 39px;
    left: 94px;
    width: 12px;
    height: 22px;
    background: #080a09;
    pointer-events: none;
  }
</style>