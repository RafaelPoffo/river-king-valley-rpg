import { SPRITES } from "../sprites.js";

export const TOOLS = {
  rod: [
    {
      id: "vara_vime",
      name: "Vara de Vime (Nv 1)",
      type: "rod",
      sprite: SPRITES.rod,
      power: 1.2,
      maxDist: 1,
      desc: "Básica e limitada.",
      price: 50,
    },
    {
      id: "vara_fibra",
      name: "Vara de Fibra (Nv 2)",
      type: "rod",
      sprite: SPRITES.rod,
      power: 1.0,
      maxDist: 2,
      desc: "Alcança o canal.",
      price: 250,
    },
    {
      id: "vara_amadora",
      name: "Vara Amadora (Nv 3)",
      type: "rod",
      sprite: SPRITES.rod,
      power: 0.8,
      maxDist: 3,
      desc: "Equilibrada.",
      price: 800,
    },
    {
      id: "vara_profissional",
      name: "Vara Profissional (Nv 4)",
      type: "rod",
      sprite: SPRITES.rod,
      power: 0.6,
      maxDist: 3,
      desc: "Alta precisão.",
      price: 2500,
    },
    {
      id: "vara_pesada",
      name: "Vara Marítima (Nv 5)",
      type: "rod",
      sprite: SPRITES.rod,
      power: 0.5,
      maxDist: 3,
      desc: "Resistente.",
      price: 8000,
    },
    {
      id: "vara_mitica",
      name: "Vara Mítica (Nv 6)",
      type: "rod",
      sprite: SPRITES.rod,
      power: 0.4,
      maxDist: 3,
      desc: "Alcance supremo.",
      price: 25000,
    },
  ],
  net: [
    {
      id: "rede_1",
      name: "Rede Nv 1",
      type: "net",
      sprite: SPRITES.net,
      power: 1.2,
      maxDist: 1,
      desc: "Siris e crustáceos rasos.",
      price: 100,
    },
    {
      id: "rede_2",
      name: "Rede Nv 2",
      type: "net",
      sprite: SPRITES.net,
      power: 1.0,
      maxDist: 1,
      desc: "Rede reforçada.",
      price: 400,
    },
    {
      id: "rede_3",
      name: "Rede Nv 3",
      type: "net",
      sprite: SPRITES.net,
      power: 0.8,
      maxDist: 1,
      desc: "Rede profissional.",
      price: 1500,
    },
  ],
};

export const BAITS = [
  {
    id: "sem_isca",
    name: "Sem Isca",
    tier: 0,
    bonus: 0,
    price: 0,
    desc: "Não atrai espécies vivas; ainda pode fisgar lixo e tesouros.",
  },
  {
    id: "minhoca",
    name: "Minhoca Simples (Nv 1)",
    tier: 1,
    bonus: 15,
    price: 2,
    desc: "Favorita dos comuns; 80% de mordida quando favorita.",
  },
  {
    id: "massa_pao",
    name: "Massa de Pão (Nv 2)",
    tier: 2,
    bonus: 25,
    price: 5,
    desc: "Agrada comuns e intermediários; 50% de mordida.",
  },
  {
    id: "camarao_vivo",
    name: "Camarão Vivo (Nv 3)",
    tier: 3,
    bonus: 45,
    price: 15,
    desc: "Favorita dos intermediários; 80% de mordida.",
  },
  {
    id: "isca_metalica",
    name: "Isca Metálica (Nv 4)",
    tier: 4,
    bonus: 70,
    price: 50,
    desc: "Agrada intermediários e raros; 50% de mordida.",
  },
  {
    id: "sardinha_alto_mar",
    name: "Sardinha Mar (Nv 5)",
    tier: 5,
    bonus: 100,
    price: 120,
    desc: "Agrada raros; 50% de mordida.",
  },
  {
    id: "isca_brilhante",
    name: "Isca Lendária (Nv 6)",
    tier: 6,
    bonus: 150,
    price: 500,
    desc: "Favorita dos raros; 80% de mordida.",
  },
];

export function withBaitPreferences(species) {
  const rare = species.rarity >= 5 || species.stage === 3;
  const intermediate = species.rarity >= 3 || species.stage === 2;
  const firstTier = rare ? 4 : intermediate ? 2 : 1;
  const favoriteTier = rare ? 6 : intermediate ? 3 : 1;
  const baitPreferences = Object.fromEntries(
    BAITS.filter((bait) => bait.tier >= firstTier && bait.tier < firstTier + 3)
      .map((bait) => [bait.id, bait.tier === favoriteTier ? 0.8 : 0.5]),
  );
  return { ...species, baitPreferences };
}
