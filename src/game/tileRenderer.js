import { draw, SPRITES } from "./sprites.js";
import {
  AQUARIUM_FOOTPRINT,
  BOAT_BOUNDS,
  DOCK_BOUNDS,
  inBounds,
} from "./constants.js";

function imgTile(src, alt = "Tile") {
  return `<img src="${src}" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="${alt}" onerror="this.onerror=null; this.outerHTML='<div class=\\'w-full h-full bg-[#578839]\\'></div>'" />`;
}

export function getTileSvg(char, x, y, constructions, deepSeaFishingActive) {
  const dockBuilt =
    constructions?.docks?.status === "built" ||
    constructions?.pier?.status === "built";
  const dockBuilding =
    constructions?.docks?.status === "building" ||
    constructions?.pier?.status === "building";

  if (inBounds(x, y, DOCK_BOUNDS)) {
    if (
      dockBuilt &&
      constructions?.boat?.status === "built" &&
      !deepSeaFishingActive &&
      inBounds(x, y, BOAT_BOUNDS)
    ) {
      return imgTile(
        x === BOAT_BOUNDS.x1
          ? "/assets/crystal_boat_front.png"
          : "/assets/crystal_boat_back.png",
        "Barco"
      );
    }
    if (dockBuilt) return imgTile("/assets/crystal_pier.png", "Doca");
    if (dockBuilding) return imgTile("/assets/crystal_sign.png", "Obras");
  }

  if (
    constructions?.aquarium_building?.status === "built" &&
    inBounds(x, y, AQUARIUM_FOOTPRINT)
  ) {
    return imgTile(
      y === AQUARIUM_FOOTPRINT.y1
        ? "/assets/crystal_roof_mid.png"
        : "/assets/crystal_door.png",
      "Aquário"
    );
  }

  switch (char) {
    case "T":
      return imgTile("/assets/Arvore.png", "Árvore Johto");
    case "G":
      return imgTile("/assets/Gramado.png", "Grama Johto");
    case "F":
      return imgTile("/assets/Flor1.png", "Flores Johto");
    case "~":
      return imgTile("/assets/Agua.png", "Água Johto");
    case "S":
      return imgTile("/assets/crystal_shallow.png", "Água Rasa / Margem");
    case "X":
      return imgTile("/assets/crystal_deep_water.png", "Água Profunda");
    case "O":
      return imgTile("/assets/Agua.png", "Água Johto");
    case "H":
      return imgTile("/assets/crystal_roof_mid.png", "Telhado Johto");
    case "W":
      return imgTile("/assets/crystal_wall_left.png", "Parede");
    case "P":
    case "E":
    case "B":
    case "K":
    case "D":
    case "R":
      return imgTile("/assets/crystal_door.png", "Porta");
    case "Z":
      return imgTile("/assets/crystal_sign.png", "Terreno do aquário");
    case "0":
      return draw(SPRITES.void);
    case ".":
      return imgTile("/assets/crystal_path_pure.png", "Caminho Johto");
    case "C":
      return imgTile("/assets/crystal_counter.png", "Balcão");
    case "M":
      return imgTile("/assets/crystal_counter.png", "Balcão");
    case "#":
      return imgTile("/assets/crystal_wall_int.png", "Parede Interna");
    case "=":
      return imgTile("/assets/crystal_floor_wood.png", "Piso Madeira");
    case "_":
      return imgTile("/assets/crystal_bed.png", "Cama do Jogador");
    case "+":
      return imgTile("/assets/crystal_table.png", "Mesa");
    case "h":
      return imgTile("/assets/crystal_chair.png", "Cadeira");
    case "Q":
    case "A":
      return imgTile("/assets/crystal_sign.png", "Placa de Avisos");
    case "U":
      return imgTile("/assets/crystal_sign.png", "Madeiras");
    default:
      return "";
  }
}
