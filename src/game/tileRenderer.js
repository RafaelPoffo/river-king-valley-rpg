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
      if (mapName === "bug_forest") return imgTile("/assets/crystal_grass.png", "Solo do bosque");
      return imgTile("/assets/Arvore.png", "Árvore Johto");
    case "G":
      if (mapName === "bug_forest") return imgTile("/assets/crystal_grass.png", "Grama do bosque");
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
      if (mapName === "bug_forest") return '<svg viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges" aria-hidden="true"><rect width="16" height="16" fill="#d4cf9b"/><path d="M2 3h2v1H2z M11 2h1v1h-1z M7 8h2v1H7z M3 13h1v1H3z M12 12h2v1h-2z" fill="#aaa775"/><path d="M4 5h2v1H4z M10 10h2v1h-2z" fill="#e6dfb4"/></svg>';
      return imgTile("/assets/crystal_real_path.png", "Caminho Johto");
    case "C":
      return imgTile("/assets/crystal_counter.png", "Balcão");
    case "M":
      return imgTile("/assets/crystal_counter.png", "Balcão");
    case "#":
      return imgTile("/assets/crystal_wall_int.png", "Parede Interna");
    case "=":
      return imgTile("/assets/crystal_floor_wood.png", "Piso Madeira");
    case "J":
      return imgTile("/assets/crystal_floor_wood.png", "Ponte de madeira");
    case "_":
      return imgTile("/assets/crystal_bed.png", "Cama do Jogador");
    case "+":
      return imgTile("/assets/crystal_table.png", "Mesa");
    case "h":
      return imgTile("/assets/crystal_chair.png", "Cadeira");
    case "N":
      return imgTile("/assets/crystal_chair.png", "Banco de observação de pássaros");
    case "Q":
    case "A":
      return imgTile("/assets/crystal_sign.png", "Placa de Avisos");
    case "U":
      return imgTile("/assets/crystal_sign.png", "Madeiras");
    default:
      return "";
  }
}
