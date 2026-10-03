import { draw, SPRITES } from "./sprites.js";
import {
  AQUARIUM_FOOTPRINT,
  PIER_BOUNDS,
  DOCK_BOUNDS,
  inBounds,
} from "./constants.js";

function imgTile(src, alt = "Tile") {
  return `<img src="${src}" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="${alt}" onerror="this.onerror=null; this.outerHTML='<div class=\\'w-full h-full bg-[#578839]\\'></div>'" />`;
}

function walkwayStatus(constructions, x, y) {
  const pier = constructions?.pier?.status;
  const docks = constructions?.docks?.status;
  if (inBounds(x, y, PIER_BOUNDS) && pier === "built") return "built";
  if (inBounds(x, y, DOCK_BOUNDS) && docks === "built") return "built";
  if (inBounds(x, y, PIER_BOUNDS) && pier === "building") return "building";
  if (inBounds(x, y, DOCK_BOUNDS) && docks === "building") return "building";
  return null;
}

export function getTileSvg(char, x, y, constructions, mapName = "village") {
  const walkway = mapName === "village" && char === "X" ? walkwayStatus(constructions, x, y) : null;
  if (walkway === "built") return imgTile("/assets/crystal_pier.png", "Cais");
  if (walkway === "building") return imgTile("/assets/crystal_sign.png", "Obras");

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
    case "b":
    case "m":
    case "c":
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
      return imgTile("/assets/crystal_real_path.png", "Caminho Johto");
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
