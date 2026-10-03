import { MAPS_DATA } from "./constants.js";
import { dailyRandom } from "./worldCreatures.js";

// Village sea lanes start at row 20 so shadows never swim under the docks or the moored boat.
const LANES = {
  village: {
    river: { rows: [1, 2, 3, 4], count: 3 },
    sea: { rows: [20, 21, 22, 23], count: 4 },
  },
  deep_sea: {
    north: { rows: [1, 2], count: 3 },
    south: { rows: [13, 14, 15], count: 3 },
  },
};
const MIN_SWIM = 4;

// Decorative fish silhouettes; they never interact with fishing.
export function ambientShadows(key, mapName = "village") {
  const lanes = LANES[mapName];
  if (!lanes) return [];
  const random = dailyRandom(`shadows:${mapName}:${key}`);
  const width = MAPS_DATA[mapName][0].length;
  const shadows = [];
  for (const [biome, lane] of Object.entries(lanes)) {
    for (let index = 0; index < lane.count; index++) {
      const y = lane.rows[Math.floor(random() * lane.rows.length)];
      const swim = MIN_SWIM + Math.floor(random() * 8);
      const x1 = 1 + Math.floor(random() * (width - 3 - swim));
      shadows.push({
        id: `${biome}:${index}`,
        biome,
        y,
        x1,
        x2: x1 + swim,
        size: 0.7 + random() * 0.4,
        duration: 10 + random() * 12,
        delay: -random() * 20,
      });
    }
  }
  return shadows;
}
