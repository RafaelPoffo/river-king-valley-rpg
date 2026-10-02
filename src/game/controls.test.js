import { describe, it, expect } from "vitest";
import { PHASES } from "./phases.js";
import { soundForPhase, playSfx } from "./audio.js";
import { keysFromGamepad, diffKeys } from "./gamepad.js";

const pad = ({ buttons = [], axes = [0, 0] } = {}) => ({
  buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: buttons.includes(i) })),
  axes,
});

describe("sons por fase", () => {
  it("cada momento da pesca tem seu som", () => {
    expect(soundForPhase(PHASES.FISHING_AIM, PHASES.FISHING_WAIT)).toBe("cast");
    expect(soundForPhase(PHASES.FISHING_APPROACH, PHASES.FISHING_BITE)).toBe("bite");
    expect(soundForPhase(PHASES.FISHING_MINIGAME, PHASES.CAUGHT, { rarity: 1 })).toBe("catch");
    expect(soundForPhase(PHASES.FISHING_MINIGAME, PHASES.PLAYING)).toBe("fail");
    expect(soundForPhase(PHASES.FISHING_BITE, PHASES.PLAYING)).toBe("fail");
  });

  it("lenda e brilhante ganham fanfarra", () => {
    expect(soundForPhase(PHASES.FISHING_MINIGAME, PHASES.CAUGHT, { requires: "rei_do_rio" })).toBe("fanfare");
    expect(soundForPhase(PHASES.FISHING_MINIGAME, PHASES.CAUGHT, { isShiny: true })).toBe("fanfare");
  });

  it("recolher a linha sem peixe e andar não fazem barulho", () => {
    expect(soundForPhase(PHASES.FISHING_WAIT, PHASES.PLAYING)).toBeNull();
    expect(soundForPhase(PHASES.CAUGHT, PHASES.PLAYING)).toBeNull();
  });

  it("sem Web Audio (Node) tocar som não quebra", () => {
    expect(() => playSfx("catch")).not.toThrow();
  });
});

describe("gamepad", () => {
  it("botões viram as teclas do teclado", () => {
    expect([...keysFromGamepad(pad({ buttons: [0, 12] }))].sort()).toEqual([" ", "ArrowUp"]);
    expect(keysFromGamepad(pad({ buttons: [9] })).has("Enter")).toBe(true);
  });

  it("o analógico usa só o eixo dominante e ignora a zona morta", () => {
    expect([...keysFromGamepad(pad({ axes: [0.9, 0.6] }))]).toEqual(["ArrowRight"]);
    expect([...keysFromGamepad(pad({ axes: [-0.2, -0.8] }))]).toEqual(["ArrowUp"]);
    expect(keysFromGamepad(pad({ axes: [0.3, -0.3] })).size).toBe(0);
  });

  it("sem controle conectado nada é pressionado", () => {
    expect(keysFromGamepad(null).size).toBe(0);
  });

  it("detecta só o que mudou entre dois quadros", () => {
    const before = new Set(["ArrowUp", " "]);
    const after = new Set(["ArrowUp", "ArrowLeft"]);
    expect(diffKeys(before, after)).toEqual({ pressed: ["ArrowLeft"], released: [" "] });
  });
});
