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
  if (walkway === "built") {
    const bounds = constructions?.docks?.status === "built" ? DOCK_BOUNDS : PIER_BOUNDS;
    const edges = (x === bounds.x1 ? 1 : 0) | (x === bounds.x2 ? 2 : 0) | (y === bounds.y2 ? 4 : 0);
    return imgTile(`/assets/dock_${edges}.png`, "Cais de madeira");
  }
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
      if (mapName === "village" && x >= 20 && x <= 24 && y === 10) return imgTile("/assets/crystal_route_roof.png", "Casa dos jogos");
      return imgTile("/assets/crystal_roof_mid.png", "Telhado Johto");
    case "W":
      return imgTile("/assets/crystal_wall_left.png", "Parede");
    case "P":
    case "E":
    case "B":
    case "K":
    case "D":
    case "R":
    case "V":
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
      if (mapName === "game_house") return imgTile("/assets/crystal_route_floor.png", "Piso Crystal");
      return imgTile("/assets/crystal_floor_wood.png", "Piso Madeira");
    case "J":
      return imgTile("/assets/dock_3.png", "Ponte de madeira");
    case "_":
      return imgTile("/assets/crystal_bed.png", "Cama do Jogador");
    case "+":
      if (mapName === "game_house") return imgTile(`/assets/game_table_${y === 6 ? "n" : "s"}${x === 7 ? "w" : "e"}.png`, "Mesa de cartas");
      return imgTile("/assets/crystal_table.png", "Mesa");
    case "h":
      if (mapName === "game_house") return imgTile("/assets/game_chair.png", "Cadeira");
      return imgTile("/assets/crystal_chair.png", "Cadeira");
    case "N":
      return '<svg viewBox="0 0 40 40" width="100%" height="100%" shape-rendering="crispEdges" role="img" aria-label="Banco de observação de pássaros"><ellipse cx="20" cy="33" rx="15" ry="3" fill="#847c59"/><path d="M8 8h4v12H8zm20 0h4v12h-4z" fill="#59391f"/><path d="M7 7h26v4H7zM7 13h26v4H7z" fill="#a86e38"/><path d="M9 8h22v1H9zm0 6h22v1H9z" fill="#d39a58"/><path d="M6 19h28v5H6z" fill="#704522"/><path d="M8 20h24v2H8z" fill="#c48749"/><path d="M9 24h3v9H9zm19 0h3v9h-3z" fill="#59391f"/><path d="M8 32h5v2H8zm18 0h5v2h-5z" fill="#392719"/></svg>';
    case "Q":
    case "A":
      return imgTile("/assets/crystal_sign.png", "Placa de Avisos");
    case "U":
      return imgTile("/assets/crystal_sign.png", "Madeiras");
    default:
      return "";
  }
}
