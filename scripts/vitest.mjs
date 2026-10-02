// Vitest loads itself twice ("failed to find the runner") when Windows hands
// it a lowercase drive letter, which is what VS Code/Cursor terminals do.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const bin = join(cwd, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(process.execPath, [bin, ...process.argv.slice(2)], { cwd, stdio: "inherit" });

process.exit(result.status ?? 1);
