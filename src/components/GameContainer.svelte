<script>
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
  import { movePlayer } from "../game/movement.js";
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
    checkSaveExists();
    startClock();
    startAmbientLoop();
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
    if (clockInterval) clearInterval(clockInterval);
    if (ambientTimeout) clearTimeout(ambientTimeout);
    cleanupFishing();
  });

  function startClock() {
    clockInterval = setInterval(() => {
      const isInside = [
        "player_house",
        "shop_gear",
        "shop_bait",
        "carpenter_shop",
        "hut_old",
        "tavern",
      ].includes($currentMap);

      if ($phase === "playing" && !isInside) {
        inGameMinutes.update((m) => m + 10);
        const curHours = Math.floor($inGameMinutes / 60);

        if (curHours === 17 && !$eveningWarned) {
          eveningWarned.set(true);
          if ($deepSeaFishingActive) {
            returnFromDeepSea();
          } else {
            showRPGMessage(
              "O sol está se pondo... Os moradores começam a ir para a taverna!"
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

    if ($phase === "dialog" && $dialogActions) {
      const action = $dialogActions[k.toUpperCase()] || $dialogActions[k];
      if (action) action();
      return;
    }

    if (
      ["fishing_wait", "fishing_approach"].includes($phase) &&
      (k === " " || k === "Spacebar")
    ) {
      resetAction("Você recolheu a linha.");
      return;
    }

    if ($phase === "playing") {
      if (k === "Enter") {
        phase.set("pause_menu");
        return;
      }
      if (k === "ArrowUp" || k === "w") movePlayer(0, -1, "up");
      if (k === "ArrowDown" || k === "s") movePlayer(0, 1, "down");
      if (k === "ArrowLeft" || k === "a") movePlayer(-1, 0, "left");
      if (k === "ArrowRight" || k === "d") movePlayer(1, 0, "right");
      if (k === " " || k === "Spacebar") interact();
    } else if ($phase === "fishing_aim" && (k === " " || k === "Spacebar")) {
      throwLine();
    } else if ($phase === "fishing_bite" && (k === " " || k === "Spacebar")) {
      startMinigame();
    } else if ($phase === "fishing_minigame" && (k === " " || k === "Spacebar")) {
      attemptCatch();
    } else if ($phase === "caught" && (k === " " || k === "Spacebar")) {
      resetAction("Use as setas para se mover.");
    } else if (
      ["shop", "fish_log", "equipment", "carpenter", "pause_menu"].includes(
        $phase
      ) &&
      ["Escape", "x", "X"].includes(k)
    ) {
      phase.set("playing");
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
      {#if $phase === "menu"}
        <MainMenu />
      {:else if $phase === "carpenter"}
        <CarpenterModal />
      {:else if $phase === "fish_log"}
        <CatalogModal />
      {:else if $phase === "equipment"}
        <BackpackModal />
      {:else if $phase === "shop"}
        <ShopModal />
      {:else}
        <!-- Active Playing Canvas -->
        <GameCanvas {seaShadows} />

        <!-- Fishing Mechanics UI Layer -->
        <FishingOverlay />

        <!-- Modal Windows -->
        {#if $phase === "pause_menu"}
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
