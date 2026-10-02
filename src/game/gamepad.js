import { pressKey, releaseKey } from "./input.js";

const STICK_DEADZONE = 0.5;

// Standard Gamepad mapping: 0=A, 1=B, 2=X, 3=Y, 9=Start, 12-15=D-pad.
// X and Y answer the lettered dialog options (gift and Joe's legend).
const BUTTON_KEYS = {
  0: " ",
  1: "x",
  2: "g",
  3: "j",
  9: "Enter",
  12: "ArrowUp",
  13: "ArrowDown",
  14: "ArrowLeft",
  15: "ArrowRight",
};

export function keysFromGamepad(pad) {
  const held = new Set();
  if (!pad) return held;
  for (const [index, key] of Object.entries(BUTTON_KEYS)) {
    if (pad.buttons[index]?.pressed) held.add(key);
  }
  const [x = 0, y = 0] = pad.axes;
  if (Math.abs(x) >= Math.abs(y)) {
    if (x <= -STICK_DEADZONE) held.add("ArrowLeft");
    if (x >= STICK_DEADZONE) held.add("ArrowRight");
  } else {
    if (y <= -STICK_DEADZONE) held.add("ArrowUp");
    if (y >= STICK_DEADZONE) held.add("ArrowDown");
  }
  return held;
}

export function diffKeys(before, after) {
  return {
    pressed: [...after].filter((k) => !before.has(k)),
    released: [...before].filter((k) => !after.has(k)),
  };
}

export function attachGamepad(isEnabled = () => true) {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return () => {};
  let held = new Set();
  let frame = null;

  const poll = () => {
    const pad = [...navigator.getGamepads()].find(Boolean);
    const next = isEnabled() ? keysFromGamepad(pad) : new Set();
    const { pressed, released } = diffKeys(held, next);
    released.forEach(releaseKey);
    pressed.forEach(pressKey);
    held = next;
    frame = requestAnimationFrame(poll);
  };

  const start = () => {
    if (!frame) frame = requestAnimationFrame(poll);
  };
  window.addEventListener("gamepadconnected", start);
  if ([...navigator.getGamepads()].some(Boolean)) start();

  return () => {
    window.removeEventListener("gamepadconnected", start);
    if (frame) cancelAnimationFrame(frame);
    held.forEach(releaseKey);
  };
}
