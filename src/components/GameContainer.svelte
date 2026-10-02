<script>
  import { PHASES, CLOSABLE_SCREENS, CANCELABLE_FISHING } from "../game/phases.js";
  import { onMount, onDestroy } from "svelte";
  import {
    phase,
    seasonIndex,
    currentWeather,
    inGameMinutes,
    currentMap,
    eveningWarned,
    deepSeaFishingActive,
    dialogActions,
    showAquariumModal,
    showTavernQuestModal,
    showCalendarModal,
  } from "../game/stores.js";
  import { checkSaveExists } from "../game/saveSystem.js";
  import { todaysTournament } from "../game/tournament.js";
  import { setDirectionHeld, releaseMovement, isInterior } from "../game/movement.js";
  import {
    throwLine,
    startMinigame,
    attemptCatch,
    resetAction,
    cleanupFishing,
  } from "../game/fishingEngine.js";
  import {
    interact,
    returnFromDeepSea,
    forceSleep,
    showRPGMessage,
  } from "../game/gameActions.js";

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

  export let open = true;

  let seaShadows = [
    { x: 8, y: 20, vx: 0.02, vy: 0.01, active: true },
    { x: 25, y: 21, vx: -0.015, vy: 0.02, active: true },
    { x: 15, y: 22, vx: 0.02, vy: -0.01, active: true },
  ];

  let clockInterval = null;
  let ambientTimeout = null;

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);
    window.addEventListener("blur", releaseMovement);
    checkSaveExists();
    startClock();
    startAmbientLoop();
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("keyup", handleKeyup);
    window.removeEventListener("blur", releaseMovement);
    releaseMovement();
    if (clockInterval) clearInterval(clockInterval);
    if (ambientTimeout) clearTimeout(ambientTimeout);
    cleanupFishing();
  });

  function directionFromKey(key) {
    if (key === "ArrowUp" || key === "w" || key === "W") return "up";
    if (key === "ArrowDown" || key === "s" || key === "S") return "down";
    if (key === "ArrowLeft" || key === "a" || key === "A") return "left";
    if (key === "ArrowRight" || key === "d" || key === "D") return "right";
    return null;
  }

  function handleKeyup(e) {
    const dir = directionFromKey(e.key);
    if (dir) setDirectionHeld(dir, false);
  }

  function startClock() {
    clockInterval = setInterval(() => {
      const isInside = isInterior($currentMap);

      if ($phase === PHASES.PLAYING && !isInside) {
        inGameMinutes.update((m) => m + 10);
        const curHours = Math.floor($inGameMinutes / 60);

        if (curHours === 17 && !$eveningWarned) {
          eveningWarned.set(true);
          if ($deepSeaFishingActive) {
            returnFromDeepSea();
          } else {
            const today = todaysTournament();
            showRPGMessage(
              today && today.entry.best && !today.entry.submitted
                ? `O ${today.name} encerrou as capturas! Entregue seu peixe na barraca da praça.`
                : "O sol está se pondo... Os moradores começam a ir para a taverna!"
            );
          }
        }

        if ($inGameMinutes >= 22 * 60) {
          if ($deepSeaFishingActive) {
            returnFromDeepSea();
          } else {
            forceSleep();
          }
        }
      }
    }, 1500);
  }

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

  function handleKeydown(e) {
    if (!open) return;
    if (document.activeElement && document.activeElement.tagName === "INPUT") {
      return;
    }

    const k = e.key;
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "Enter",
      ].includes(k)
    ) {
      e.preventDefault();
    }

    if ($phase === PHASES.DIALOG && $dialogActions) {
      const action = $dialogActions[k.toUpperCase()] || $dialogActions[k];
      if (action) action();
      return;
    }

    if (CANCELABLE_FISHING.has($phase) && (k === " " || k === "Spacebar")) {
      resetAction("Você recolheu a linha.");
      return;
    }

    if ($phase === PHASES.PLAYING) {
      const dir = directionFromKey(k);
      if (dir) {
        setDirectionHeld(dir, true);
        return;
      }
      if (k === "Enter") {
        releaseMovement();
        phase.set(PHASES.PAUSE_MENU);
        return;
      }
      if (k === " " || k === "Spacebar") interact();
    } else if ($phase === PHASES.FISHING_AIM && (k === " " || k === "Spacebar")) {
      throwLine();
    } else if ($phase === PHASES.FISHING_BITE && (k === " " || k === "Spacebar")) {
      startMinigame();
    } else if ($phase === PHASES.FISHING_MINIGAME && (k === " " || k === "Spacebar")) {
      attemptCatch();
    } else if ($phase === PHASES.CAUGHT && (k === " " || k === "Spacebar")) {
      resetAction("Use as setas para se mover.");
    } else if (CLOSABLE_SCREENS.has($phase) && ["Escape", "x", "X"].includes(k)) {
      phase.set(PHASES.PLAYING);
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000] p-4 select-none"
    role="presentation"
  >
    <div
      class="relative w-[800px] h-[600px] bg-white rounded flex flex-col select-none border-[12px] border-[#9ce6e6] overflow-hidden shadow-2xl"
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
      />

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

        <InventoryFullModal />

        <!-- Bottom Dialogue & Top HUD -->
        <HUD />
      {/if}
    </div>
  </div>
{/if}
