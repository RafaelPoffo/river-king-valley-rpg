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
    return crystalDockTile(x, y, bounds);
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
      if (mapName === "game_house") return crystalCardFloor(x, y);
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
      return crystalBirdBench();
    case "Q":
    case "A":
      return imgTile("/assets/crystal_sign.png", "Placa de Avisos");
    case "U":
      return imgTile("/assets/crystal_sign.png", "Madeiras");
    default:
      return "";
  }
}

function crystalDockTile(x, y, bounds) {
  const west = x === bounds.x1;
  const east = x === bounds.x2;
  const south = y === bounds.y2;
  const north = y === bounds.y1;
  return `<svg viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges" role="img" aria-label="Píer de madeira">
    <rect width="16" height="16" fill="#5a84b4"/>
    <rect x="1" y="0" width="14" height="16" fill="#c4a05a"/>
    <path d="M1 4h14M1 8h14M1 12h14" stroke="#a07830" stroke-width="1"/>
    <path d="M1 0h14M1 15h14" stroke="#704818" stroke-width="1"/>
    <path d="M4 1h1v14H4zM11 1h1v14h-1z" fill="#d8b870"/>
    ${west ? '<rect x="0" y="0" width="2" height="16" fill="#583818"/><rect x="0" y="3" width="2" height="2" fill="#382010"/><rect x="0" y="11" width="2" height="2" fill="#382010"/>' : ""}
    ${east ? '<rect x="14" y="0" width="2" height="16" fill="#583818"/><rect x="14" y="3" width="2" height="2" fill="#382010"/><rect x="14" y="11" width="2" height="2" fill="#382010"/>' : ""}
    ${south ? '<rect x="0" y="14" width="16" height="2" fill="#583818"/><rect x="3" y="14" width="2" height="2" fill="#382010"/><rect x="11" y="14" width="2" height="2" fill="#382010"/>' : ""}
    ${north ? '<rect x="1" y="0" width="14" height="1" fill="#e0c888"/>' : ""}
  </svg>`;
}

function crystalCardFloor(x, y) {
  const dark = (x + y) % 2 === 0;
  return `<svg viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges" aria-label="Piso da loja de cartas">
    <rect width="16" height="16" fill="${dark ? "#d0b46a" : "#ecd89a"}"/>
    <path d="M0 0h16v1H0z" fill="${dark ? "#b89850" : "#d8c078"}"/>
    <path d="M15 0h1v16h-1z" fill="${dark ? "#b08840" : "#c8b068"}"/>
    <path d="M2 2h1v1H2zM12 11h1v1h-1z" fill="${dark ? "#e8d090" : "#c4a85a"}"/>
  </svg>`;
}

function crystalBirdBench() {
  return `<svg viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges" role="img" aria-label="Banco de observação">
    <rect width="16" height="16" fill="#78a048"/>
    <path d="M2 14h12v1H2z" fill="#587030"/>
    <rect x="3" y="6" width="2" height="8" fill="#704820"/>
    <rect x="11" y="6" width="2" height="8" fill="#704820"/>
    <rect x="2" y="5" width="12" height="3" fill="#c49858"/>
    <rect x="2" y="8" width="12" height="2" fill="#a07838"/>
    <path d="M2 5h12v1H2z" fill="#e0b870"/>
    <rect x="3" y="11" width="10" height="2" fill="#8c6030"/>
  </svg>`;
}
