export const INITIAL_VILLAGERS = [
  {
    id: "veteran",
    name: "Capitão Thomas",
    sprite: "/assets/crystal_npc_captain.png",
    freq: "always",
    homeX: 18,
    homeY: 15,
    dialogNormal: "O mar está bravo hoje. O barco deve estar firme.",
    dialogTavern: "Uma rodada de grogue para comemorar a pescaria!",
    taste: "sea",
    friendLines: [
      "Você tem mão boa pro mar. Já pensou em ir comigo pro alto-mar?",
      "Velho amigo! Guardo as melhores histórias do oceano pra você.",
    ],
  },
  {
    id: "carpenter",
    name: "Mestre Gema",
    sprite: "/assets/crystal_npc_carpenter.png",
    freq: "often",
    homeX: 34,
    homeY: 8,
    dialogNormal: "Precisa de melhorias nas docas? Passe na minha oficina.",
    dialogTavern: "A madeira de lei é a melhor para cascos de barco.",
    taste: "river",
    friendLines: [
      "Seus peixes de rio dão um ótimo almoço na oficina!",
      "Pra você, faço preço de amigo em qualquer obra.",
    ],
  },
  {
    id: "anna",
    name: "Ana a Cozinheira",
    sprite: "/assets/crystal_npc_girl.png",
    freq: "always",
    homeX: 16,
    homeY: 12,
    dialogNormal: "Os peixes frescos vão direto para a minha sopa.",
    dialogTavern: "Hoje o ensopado de lula está uma delícia!",
    taste: "quality",
    friendLines: [
      "Seus peixes deixam minha sopa famosa na vila!",
      "Você é da família. Cozinho seus pratos pela metade do preço.",
    ],
  },
  {
    id: "old_joe",
    name: "Velho Joe",
    sprite: "/assets/crystal_npc_old.png",
    freq: "rare",
    homeX: 8,
    homeY: 12,
    dialogNormal:
      "No meu tempo, pescávamos monstros de verdade com as mãos...",
    dialogTavern: "Ah... As histórias antigas nunca morrem.",
    taste: "rare",
    friendLines: [
      "Hm... Você não é como os outros. Tenho uma história pra te contar.",
      "Só confio a lenda do Rei do Rio a você.",
    ],
  },
];

export const FRIENDSHIP = {
  pointsPerHeart: 3,
  maxHearts: 10,
  lovedGift: 3,
  likedGift: 1,
  dailyTalk: 1,
  carpenterDiscount: 0.1,
  annaDishDiscount: 0.5,
  perkHearts: { veteran: 5, carpenter: 5, anna: 5, old_joe: 3 },
};

export const TASTE_LABELS = {
  sea: "peixes do mar",
  river: "peixes de rio",
  quality: "peixes de 3 estrelas ou mais",
  rare: "peixes muito raros",
};

export function getNpcLocation(npc, mins, dayNum) {
  const h = Math.floor(mins / 60);
  const isNightTime = h >= 18 || h < 6;
  if (isNightTime) {
    let visitsTavern = false;
    if (npc.freq === "always") visitsTavern = true;
    else if (npc.freq === "often" && dayNum % 2 === 0) visitsTavern = true;
    else if (npc.freq === "rare" && dayNum % 4 === 0) visitsTavern = true;
    if (visitsTavern) {
      if (npc.id === "anna") return { map: "tavern", x: 4, y: 5 };
      if (npc.id === "veteran") return { map: "tavern", x: 11, y: 5 };
      if (npc.id === "carpenter") return { map: "tavern", x: 11, y: 3 };
      if (npc.id === "old_joe") return { map: "tavern", x: 4, y: 3 };
      return { map: "tavern", x: 6, y: 5 };
    }
  }
  return { map: "village", x: npc.homeX, y: npc.homeY };
}
