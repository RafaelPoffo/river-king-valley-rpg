import { MAPS_DATA, FOREST_ACCESS_BOUNDS } from "./constants.js";
import { dailyRandom } from "./worldCreatures.js";

// Village sea lanes start at row 20 so shadows never swim under the docks or the moored boat.
// River lanes stay east of the forest bridge so silhouettes never cross the J tiles.
const LANES = {
  village: {
    river: { rows: [1, 2, 3, 4], count: 3, xMin: 9, xMax: 38 },
    sea: { rows: [20, 21, 22, 23], count: 4 },
  },
  deep_sea: {
    north: { rows: [1, 2], count: 3 },
    south: { rows: [13, 14, 15], count: 3 },
  },
};
const MIN_SWIM = 4;

function isWaterTile(mapName, x, y) {
  return ["~", "X"].includes(MAPS_DATA[mapName]?.[y]?.[Math.floor(x)]);
}

function fitsWater(mapName, y, x1, x2, size) {
  for (let x = x1; x <= x2 + size; x += 0.5) {
    if (!isWaterTile(mapName, x, y)) return false;
  }
  return true;
}

// Decorative fish silhouettes; they never interact with fishing.
export function ambientShadows(key, mapName = "village") {
  const lanes = LANES[mapName];
  if (!lanes) return [];
  const random = dailyRandom(`shadows:${mapName}:${key}`);
  const width = MAPS_DATA[mapName][0].length;
  const access = FOREST_ACCESS_BOUNDS[mapName];
  const shadows = [];
  for (const [biome, lane] of Object.entries(lanes)) {
    for (let index = 0; index < lane.count; index++) {
      let placed = null;
      for (let attempt = 0; attempt < 40 && !placed; attempt++) {
        const y = lane.rows[Math.floor(random() * lane.rows.length)];
        const swim = MIN_SWIM + Math.floor(random() * 8);
        const minX = lane.xMin ?? 1;
        const maxX = lane.xMax ?? width - 2;
        const span = maxX - minX - swim;
        if (span < 1) continue;
        const x1 = minX + Math.floor(random() * span);
        const x2 = x1 + swim;
        const size = 0.7 + random() * 0.4;
        if (access && y >= access.y1 && y <= access.y2) {
          const overlapsBridge = x1 <= access.x2 && x2 + size >= access.x1;
          if (overlapsBridge) continue;
        }
        if (!fitsWater(mapName, y, x1, x2, size)) continue;
        placed = {
          id: `${biome}:${index}`,
          biome,
          y,
          x1,
          x2,
          size,
          duration: 10 + random() * 12,
          delay: -random() * 20,
        };
      }
      if (placed) shadows.push(placed);
    }
  }
  return shadows;
}
