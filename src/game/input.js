import { get } from "svelte/store";
import { PHASES, CLOSABLE_SCREENS, CANCELABLE_FISHING } from "./phases.js";
import { phase, dialogActions, showTavernQuestModal } from "./stores.js";
import { setDirectionHeld, releaseMovement } from "./movement.js";
import { throwLine, startMinigame, attemptCatch, resetAction } from "./fishingEngine.js";
import { interact, showRPGMessage } from "./gameActions.js";
import { toggleAudio } from "./audio.js";
import { closeBirdWatchingView, observeVisibleBird, startBirdPan, stopBirdPan } from "./birdWatching.js";

const BLOCKED_DEFAULTS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"]);
const CONFIRM_KEYS = new Set([" ", "Spacebar"]);
const CLOSE_KEYS = new Set(["Escape", "x", "X"]);

export function directionFromKey(key) {
  if (key === "ArrowUp" || key === "w" || key === "W") return "up";
  if (key === "ArrowDown" || key === "s" || key === "S") return "down";
  if (key === "ArrowLeft" || key === "a" || key === "A") return "left";
  if (key === "ArrowRight" || key === "d" || key === "D") return "right";
  return null;
}

export function pressKey(key) {
  const current = get(phase);
  const actions = get(dialogActions);

  if (current === PHASES.DIALOG && actions) {
    const action = actions[key.toUpperCase()] || actions[key];
    if (action) action();
    return;
  }

  const confirm = CONFIRM_KEYS.has(key);

  if (CANCELABLE_FISHING.has(current) && confirm) {
    resetAction("Você recolheu a linha.");
    return;
  }

  if (get(showTavernQuestModal) && CLOSE_KEYS.has(key)) {
    showTavernQuestModal.set(false);
    return;
  }

  if (current === PHASES.PLAYING) {
    const dir = directionFromKey(key);
    if (dir) {
      setDirectionHeld(dir, true);
      return;
    }
    if (key === "Enter") {
      releaseMovement();
      phase.set(PHASES.PAUSE_MENU);
      return;
    }
    if (key === "m" || key === "M") {
      showRPGMessage(toggleAudio("music") ? "Música ligada." : "Música desligada.");
      return;
    }
    if (confirm) interact();
  } else if (current === PHASES.BIRD_WATCHING) {
    if (CLOSE_KEYS.has(key)) {
      closeBirdWatchingView();
      return;
    }
    const dir = directionFromKey(key);
    if (dir) {
      startBirdPan(dir);
      return;
    }
    if (confirm) observeVisibleBird();
  } else if (current === PHASES.FISHING_AIM && confirm) {
    throwLine();
  } else if (current === PHASES.FISHING_BITE && confirm) {
    startMinigame();
  } else if (current === PHASES.FISHING_MINIGAME && confirm) {
    attemptCatch();
  } else if (current === PHASES.CAUGHT && confirm) {
    resetAction("Use as setas para se mover.");
  } else if (CLOSABLE_SCREENS.has(current) && CLOSE_KEYS.has(key)) {
    phase.set(PHASES.PLAYING);
  }
}

export function releaseKey(key) {
  const dir = directionFromKey(key);
  if (dir) {
    setDirectionHeld(dir, false);
    stopBirdPan();
  }
}

export function attachKeyboard(isEnabled = () => true) {
  const onKeydown = (e) => {
    if (!isEnabled()) return;
    if (document.activeElement?.tagName === "INPUT") return;
    if (BLOCKED_DEFAULTS.has(e.key)) e.preventDefault();
    if (e.repeat && directionFromKey(e.key)) return;
    pressKey(e.key);
  };
  const onKeyup = (e) => releaseKey(e.key);

  const onBlur = () => {
    releaseMovement();
    stopBirdPan();
  };
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("keyup", onKeyup);
  window.addEventListener("blur", onBlur);
  return () => {
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("keyup", onKeyup);
    window.removeEventListener("blur", onBlur);
    releaseMovement();
    stopBirdPan();
  };
}
