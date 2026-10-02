<script>
  import { PHASES } from "../game/phases.js";
  import { onMount, onDestroy } from "svelte";
  import {
    phase,
    seasonIndex,
    currentWeather,
    currentMap,
    showAquariumModal,
    showTavernQuestModal,
    showCalendarModal,
    showKitchenModal,
  } from "../game/stores.js";
  import { checkSaveExists } from "../game/saveSystem.js";
  import { cleanupFishing } from "../game/fishingEngine.js";
  import { attachKeyboard } from "../game/input.js";
  import { startClock } from "../game/clock.js";
  import { startAudio } from "../game/audio.js";
  import { attachGamepad } from "../game/gamepad.js";

  import MainMenu from "./MainMenu.svelte";
  import GameCanvas from "./GameCanvas.svelte";
  import FishingOverlay from "./FishingOverlay.svelte";
  import HUD from "./HUD.svelte";
  import BackpackModal from "./BackpackModal.svelte";
  import ShopModal from "./ShopModal.svelte";
  import CarpenterModal from "./CarpenterModal.svelte";
  import CatalogModal from "./CatalogModal.svelte";
  import PauseMenuModal from "./PauseMenuModal.svelte";
  import AquariumModal from "./AquariumModal.svelte";
  import TavernQuestModal from "./TavernQuestModal.svelte";
  import CalendarModal from "./CalendarModal.svelte";
  import InventoryFullModal from "./InventoryFullModal.svelte";
  import MuseumModal from "./MuseumModal.svelte";
  import KitchenModal from "./KitchenModal.svelte";
  import TouchControls from "./TouchControls.svelte";

  export let open = true;

  let seaShadows = [
    { x: 8, y: 20, vx: 0.02, vy: 0.01, active: true },
    { x: 25, y: 21, vx: -0.015, vy: 0.02, active: true },
    { x: 15, y: 22, vx: 0.02, vy: -0.01, active: true },
  ];

  let ambientTimeout = null;
  let stopClock = null;
  let detachKeyboard = null;
  let stopAudio = null;
  let detachGamepad = null;
  let scale = 1;
  const isTouch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

  function fitToScreen() {
    scale = Math.min(1, window.innerWidth / 824, window.innerHeight / 624);
  }

  onMount(() => {
    detachKeyboard = attachKeyboard(() => open);
    stopClock = startClock();
    stopAudio = startAudio();
    detachGamepad = attachGamepad(() => open);
    fitToScreen();
    window.addEventListener("resize", fitToScreen);
    checkSaveExists();
    startAmbientLoop();
  });

  onDestroy(() => {
    detachKeyboard?.();
    stopClock?.();
    stopAudio?.();
    detachGamepad?.();
    window.removeEventListener("resize", fitToScreen);
    if (ambientTimeout) clearTimeout(ambientTimeout);
    cleanupFishing();
  });

  function startAmbientLoop() {
    const triggerAmbient = () => {
      if ($currentMap === "village") {
        seaShadows.forEach((s) => {
          if (!s.fleeing && s.active) {
            s.x += s.vx * 2;
            s.y += s.vy * 2;
            if (s.x < 2 || s.x > 36) s.vx *= -1;
            if (s.y < 18 || s.y > 23) s.vy *= -1;
          }
        });
        seaShadows = [...seaShadows];
      }
      const nextTime = Math.random() * 3000 + 3000;
      ambientTimeout = setTimeout(triggerAmbient, nextTime);
    };
    ambientTimeout = setTimeout(triggerAmbient, 4000);
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000] p-4 select-none"
    role="presentation"
  >
    <div
      class="relative w-[800px] h-[600px] bg-white rounded flex flex-col select-none border-[12px] border-[#9ce6e6] overflow-hidden shadow-2xl"
      style="transform: scale({scale}); transform-origin: center;"
    >
      <!-- Atmospheric & Weather Filter Overlay -->
      <div
        class="absolute inset-0 pointer-events-none z-40
          {$seasonIndex === 0
            ? 'bg-emerald-200/15'
            : $seasonIndex === 1
              ? 'bg-amber-200/20'
              : $seasonIndex === 2
                ? 'bg-orange-200/20'
                : 'bg-cyan-200/25'}
          {$currentWeather === 'rainy'
            ? 'bg-blue-500/20'
            : $currentWeather === 'storm'
              ? 'bg-indigo-950/40'
              : ''}"
      ></div>

      <!-- Content Views -->
      {#if $phase === PHASES.MENU}
        <MainMenu />
      {:else if $phase === PHASES.CARPENTER}
        <CarpenterModal />
      {:else if $phase === PHASES.FISH_LOG}
        <CatalogModal />
      {:else if $phase === PHASES.EQUIPMENT}
        <BackpackModal />
      {:else if $phase === PHASES.SHOP}
        <ShopModal />
      {:else if $phase === PHASES.MUSEUM}
        <MuseumModal />
      {:else}
        <!-- Active Playing Canvas -->
        <GameCanvas {seaShadows} />

        <!-- Fishing Mechanics UI Layer -->
        <FishingOverlay />

        {#if isTouch}
          <TouchControls />
        {/if}

        <!-- Modal Windows -->
        {#if $phase === PHASES.PAUSE_MENU}
          <PauseMenuModal />
        {/if}

        {#if $showAquariumModal}
          <AquariumModal />
        {/if}

        {#if $showTavernQuestModal}
          <TavernQuestModal />
        {/if}

        {#if $showCalendarModal}
          <CalendarModal />
        {/if}

        {#if $showKitchenModal}
          <KitchenModal />
        {/if}

        <InventoryFullModal />

        <!-- Bottom Dialogue & Top HUD -->
        <HUD />
      {/if}
    </div>
  </div>
{/if}
