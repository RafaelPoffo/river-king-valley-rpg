import { writable, get } from "svelte/store";
import { PHASES } from "./phases.js";
import { phase, money, currentMap, activeFish, isNight } from "./stores.js";

// Audio preferences belong to the browser, not to a save slot.
const SETTINGS_KEY = "rkv_audio";
const MENU_PHASES = new Set([
  PHASES.PAUSE_MENU,
  PHASES.EQUIPMENT,
  PHASES.FISH_LOG,
  PHASES.SHOP,
  PHASES.CARPENTER,
  PHASES.MUSEUM,
]);

function loadSettings() {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem(SETTINGS_KEY);
    if (raw) return { sfx: true, music: true, ...JSON.parse(raw) };
  } catch {
    /* corrupted settings fall back to defaults */
  }
  return { sfx: true, music: true };
}

export const audioSettings = writable(loadSettings());

export function toggleAudio(kind) {
  audioSettings.update((s) => ({ ...s, [kind]: !s[kind] }));
  const settings = get(audioSettings);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* private mode: keep the setting for this session only */
  }
  applyVolumes();
  return settings[kind];
}

export function soundForPhase(prev, next, fish) {
  if (next === PHASES.FISHING_WAIT && prev === PHASES.FISHING_AIM) return "cast";
  if (next === PHASES.FISHING_BITE) return "bite";
  if (next === PHASES.CAUGHT) return fish?.requires || fish?.isShiny ? "fanfare" : "catch";
  if (next === PHASES.PLAYING && (prev === PHASES.FISHING_BITE || prev === PHASES.FISHING_MINIGAME)) {
    return "fail";
  }
  if (next === PHASES.DIALOG || MENU_PHASES.has(next)) return "blip";
  return null;
}

let ctx = null;
let sfxGain = null;
let musicGain = null;

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain.connect(master);
    musicGain.connect(master);
    applyVolumes();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function applyVolumes() {
  if (!ctx) return;
  const { sfx, music } = get(audioSettings);
  sfxGain.gain.setTargetAtTime(sfx ? 1 : 0, ctx.currentTime, 0.05);
  musicGain.gain.setTargetAtTime(music ? 0.5 : 0, ctx.currentTime, 0.2);
}

function tone(freq, start, dur, { type = "square", gain = 0.08, slideTo, dest = sfxGain } = {}) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(env).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function splash(start, dur, gain) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const env = ctx.createGain();
  src.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 900;
  env.gain.value = gain;
  src.connect(filter).connect(env).connect(sfxGain);
  src.start(start);
}

const arpeggio = (notes, step, dur, opts) => (t) =>
  notes.forEach((f, i) => tone(f, t + i * step, dur, opts));

const SFX = {
  cast: (t) => {
    tone(900, t, 0.25, { type: "sine", slideTo: 220, gain: 0.07 });
    splash(t + 0.22, 0.3, 0.25);
  },
  bite: arpeggio([880, 1320], 0.1, 0.09),
  catch: arpeggio([523, 659, 784, 1047], 0.09, 0.15, { gain: 0.06 }),
  fanfare: arpeggio([523, 659, 784, 1047, 784, 1047], 0.12, 0.24, { gain: 0.07 }),
  fail: (t) => tone(330, t, 0.4, { type: "sawtooth", slideTo: 110, gain: 0.05 }),
  coin: arpeggio([988, 1319], 0.07, 0.15, { gain: 0.05 }),
  door: arpeggio([196, 147], 0.1, 0.14, { type: "triangle", gain: 0.12 }),
  blip: (t) => tone(660, t, 0.05, { gain: 0.03 }),
};

export function playSfx(name) {
  if (!get(audioSettings).sfx || !SFX[name]) return;
  if (!ensureContext()) return;
  SFX[name](ctx.currentTime + 0.01);
}

// Semitones from the song root; null is a rest. Each entry is one eighth note.
const SONGS = {
  day: {
    bpm: 104,
    root: 60,
    melody: [0, 4, 7, 9, 7, 4, 2, null, 0, 2, 4, 7, 4, 2, 0, null,
             9, 7, 4, 7, 9, 12, 9, null, 7, 4, 2, 4, 2, 0, null, null],
    bass: [0, null, null, null, 7, null, null, null, 5, null, null, null, 7, null, null, null],
  },
  night: {
    bpm: 72,
    root: 57,
    melody: [0, null, 3, 5, 7, null, 5, 3, 0, null, null, null, 10, 7, 5, null,
             3, null, 5, 7, 3, null, 0, null, -2, null, 0, null, null, null, null, null],
    bass: [0, null, null, null, null, null, null, null, -4, null, null, null, -5, null, null, null],
  },
};

const midiToFreq = (n) => 440 * Math.pow(2, (n - 69) / 12);

let musicTimer = null;
let step = 0;
let nextNoteTime = 0;

function scheduleMusic() {
  if (!ctx || !get(audioSettings).music) return;
  const song = SONGS[get(isNight) ? "night" : "day"];
  const eighth = 60 / song.bpm / 2;
  if (nextNoteTime < ctx.currentTime) nextNoteTime = ctx.currentTime + 0.05;
  while (nextNoteTime < ctx.currentTime + 0.2) {
    const note = song.melody[step % song.melody.length];
    if (note !== null) {
      tone(midiToFreq(song.root + 12 + note), nextNoteTime, eighth * 0.9, {
        type: "triangle",
        gain: 0.05,
        dest: musicGain,
      });
    }
    if (step % 2 === 0) {
      const bass = song.bass[(step / 2) % song.bass.length];
      if (bass !== null) {
        tone(midiToFreq(song.root - 12 + bass), nextNoteTime, eighth * 3.5, {
          type: "sine",
          gain: 0.06,
          dest: musicGain,
        });
      }
    }
    step += 1;
    nextNoteTime += eighth;
  }
}

export function startAudio() {
  if (typeof window === "undefined") return () => {};

  const unlock = () => {
    if (!ensureContext()) return;
    if (!musicTimer) musicTimer = setInterval(scheduleMusic, 50);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  let prevPhase = get(phase);
  const unsubPhase = phase.subscribe((next) => {
    const prev = prevPhase;
    prevPhase = next;
    if (prev === next) return;
    if (next === PHASES.CAUGHT) {
      queueMicrotask(() => playSfx(soundForPhase(prev, next, get(activeFish))));
      return;
    }
    const name = soundForPhase(prev, next);
    if (name) playSfx(name);
  });

  let prevMoney = get(money);
  const unsubMoney = money.subscribe((value) => {
    if (value > prevMoney && get(phase) !== PHASES.MENU) playSfx("coin");
    prevMoney = value;
  });

  let prevMap = get(currentMap);
  const unsubMap = currentMap.subscribe((map) => {
    if (map !== prevMap && get(phase) !== PHASES.MENU) playSfx("door");
    prevMap = map;
  });

  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    unsubPhase();
    unsubMoney();
    unsubMap();
    clearInterval(musicTimer);
    musicTimer = null;
  };
}
