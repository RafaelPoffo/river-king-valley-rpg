import { draw, SPRITES } from "./sprites.js";

export function getTileSvg(char, x, y, constructions, deepSeaFishingActive) {
  if (x >= 14 && x <= 16 && y >= 17 && y <= 18) {
    if (constructions?.docks?.status === "built") return draw(SPRITES.pier);
    if (constructions?.docks?.status === "building")
      return draw(SPRITES.wood_pile);
  }
  if (
    x >= 15 &&
    x <= 16 &&
    y >= 17 &&
    y <= 18 &&
    constructions?.boat?.status === "built" &&
    !deepSeaFishingActive
  ) {
    return draw(x === 15 ? SPRITES.boat_front : SPRITES.boat_back);
  }
  if (
    constructions?.aquarium_building?.status === "built" &&
    x === 8 &&
    y === 7
  ) {
    return draw(SPRITES.house_top);
  }

  switch (char) {
    case "T":
      return `<img src="/assets/Arvore.png" onerror="this.onerror=null; this.outerHTML='${draw(SPRITES.tree).replace(/'/g, "\\'")}'" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="Árvore" />`;
    case "G":
      return `<img src="/assets/Gramado.png" onerror="this.onerror=null; this.outerHTML='${draw(SPRITES.grass).replace(/'/g, "\\'")}'" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="Grama" />`;
    case "F":
      return `<img src="/assets/Flor1.png" onerror="this.onerror=null; this.outerHTML='${draw(SPRITES.flower).replace(/'/g, "\\'")}'" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="Flor" />`;
    case "~":
      return `<img src="/assets/Agua.png" onerror="this.onerror=null; this.outerHTML='${draw(SPRITES.water).replace(/'/g, "\\'")}'" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="Água" />`;
    case "S":
      return draw(SPRITES.shallow);
    case "X":
      return `<img src="/assets/Agua.png" onerror="this.onerror=null; this.outerHTML='${draw(SPRITES.deep_water).replace(/'/g, "\\'")}'" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="Água Profunda" />`;
    case "O":
      return `<img src="/assets/Agua.png" onerror="this.onerror=null; this.outerHTML='${draw(SPRITES.water).replace(/'/g, "\\'")}'" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="Água" />`;
    case "H":
      return draw(SPRITES.house_top);
    case "P":
      return draw(SPRITES.house_bot);
    case "0":
    case "B":
      return draw(SPRITES.void);
    case ".":
      return draw(SPRITES.floor);
    case "K":
      return draw(SPRITES.carpenter);
    case "D":
    case "R":
    case "I":
      return draw(SPRITES.door);
    case "C":
      return draw(SPRITES.counter);
    case "M":
      return draw(SPRITES.counter);
    case "#":
      return draw(SPRITES.wall_int);
    case "=":
      return draw(SPRITES.floor_wood);
    case "_":
      return draw(SPRITES.bed);
    case "+":
      return draw(SPRITES.table);
    case "h":
      return draw(SPRITES.chair);
    case "Q":
    case "A":
      return draw(SPRITES.quest_board);
    case "U":
      return draw(SPRITES.wood_pile);
    default:
      return "";
  }
}
