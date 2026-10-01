import { draw, SPRITES } from "./sprites.js";

function imgTile(src, alt = "Tile") {
  return `<img src="${src}" style="width: 100%; height: 100%; image-rendering: pixelated; object-fit: cover; display: block;" alt="${alt}" onerror="this.onerror=null; this.outerHTML='<div class=\\'w-full h-full bg-[#578839]\\'></div>'" />`;
}

export function getTileSvg(char, x, y, constructions, deepSeaFishingActive) {
  if (x >= 14 && x <= 16 && y >= 17 && y <= 18) {
    if (constructions?.docks?.status === "built") return imgTile("/assets/crystal_pier.png", "Doca");
    if (constructions?.docks?.status === "building")
      return imgTile("/assets/crystal_sign.png", "Obras");
  }
  if (
    x >= 15 &&
    x <= 16 &&
    y >= 17 &&
    y <= 18 &&
    constructions?.boat?.status === "built" &&
    !deepSeaFishingActive
  ) {
    return imgTile(x === 15 ? "/assets/crystal_boat_front.png" : "/assets/crystal_boat_back.png", "S.S. Aqua");
  }
  if (
    constructions?.aquarium_building?.status === "built" &&
    x === 8 &&
    y === 7
  ) {
    return imgTile("/assets/crystal_roof_mid.png", "Centro Pokémon");
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
    case "P":
      return imgTile("/assets/crystal_wall_left.png", "Casa Johto");
    case "0":
    case "B":
      return draw(SPRITES.void);
    case ".":
      return imgTile("/assets/crystal_path_pure.png", "Caminho Johto");
    case "K":
      return imgTile("/assets/crystal_npc_carpenter.png", "Mestre Gema");
    case "D":
    case "R":
    case "I":
      return imgTile("/assets/crystal_door.png", "Porta");
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
