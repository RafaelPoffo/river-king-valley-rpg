import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PHASES, CLOSABLE_SCREENS, LINE_IN_WATER, isFishingPhase } from "./phases.js";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(js|svelte)$/.test(entry.name) && !entry.name.endsWith(".test.js") ? [path] : [];
  });
}

describe("fases", () => {
  it("todo PHASES.X usado no código existe", () => {
    const unknown = [];
    for (const file of sourceFiles(srcDir)) {
      for (const [, name] of readFileSync(file, "utf8").matchAll(/PHASES\.([A-Z_]+)/g)) {
        if (!(name in PHASES)) unknown.push(`${name} em ${file}`);
      }
    }
    expect(unknown).toEqual([]);
  });

  it("os valores são únicos", () => {
    const values = Object.values(PHASES);
    expect(new Set(values).size).toBe(values.length);
  });

  it("telas que fecham e fases com linha na água não se misturam", () => {
    for (const value of CLOSABLE_SCREENS) expect(LINE_IN_WATER.has(value)).toBe(false);
    for (const value of LINE_IN_WATER) expect(isFishingPhase(value)).toBe(true);
    expect(isFishingPhase(PHASES.PLAYING)).toBe(false);
  });
});
