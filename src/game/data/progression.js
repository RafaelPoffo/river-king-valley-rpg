export const INITIAL_UPGRADES = {
  backpack: {
    name: "Mochila Expandida (15 slots)",
    cost: 2500,
    bought: false,
  },
  widerBar: {
    name: "Braço Forte (Barra de Luta +15%)",
    cost: 3500,
    bought: false,
  },
  shinyLuck: {
    name: "Sorte do Marinheiro (Sorte Shiny)",
    cost: 6000,
    bought: false,
  },
};

// fraction is the share of the collection needed, so goals scale with each game mode's catalog.
export const COLLECTION_MILESTONES = {
  museum: [
    { fraction: 0.25, title: "Curador Iniciante", reward: { money: 1000 } },
    { fraction: 0.5, title: "Historiador", reward: { money: 3000, baits: { isca_metalica: 10 } } },
    { fraction: 1, title: "Guardião das Relíquias", reward: { money: 10000, baits: { isca_brilhante: 5 } } },
  ],
  aquarium: [
    { fraction: 0.1, title: "Amigo do Aquário", reward: { money: 800 } },
    { fraction: 0.3, title: "Aquarista", reward: { money: 3000, baits: { camarao_vivo: 10 } } },
    { fraction: 0.6, title: "Biólogo Marinho", reward: { money: 8000, baits: { isca_brilhante: 3 } } },
    { fraction: 1, title: "Mestre das Águas", reward: { money: 30000, baits: { isca_brilhante: 10 } } },
  ],
};

// Ana cooks one dish per day; its effect lasts until the player sleeps.
export const DISHES = [
  {
    id: "sopa_rio",
    name: "Sopa do Rio",
    price: 150,
    ingredients: { count: 2, biome: "river" },
    ingredientsLabel: "2 peixes de rio",
    effect: { catchBar: 1.15 },
    effectLabel: "área verde da luta +15%",
  },
  {
    id: "ensopado_mar",
    name: "Ensopado do Mar",
    price: 300,
    ingredients: { count: 2, biome: "sea" },
    ingredientsLabel: "2 peixes do mar",
    effect: { biteBonus: 0.4 },
    effectLabel: "+0,4 s para fisgar",
  },
  {
    id: "moqueca_real",
    name: "Moqueca Real",
    price: 800,
    ingredients: { count: 1, minStars: 3 },
    ingredientsLabel: "1 peixe de 3 estrelas ou mais",
    effect: { rarityBonus: 30 },
    effectLabel: "+30 de raridade",
  },
  {
    id: "caldo_sorte",
    name: "Caldo da Sorte",
    price: 1500,
    ingredients: { count: 1, minRarity: 4 },
    ingredientsLabel: "1 peixe muito raro",
    effect: { shinyMult: 1.5 },
    effectLabel: "chance de brilhante ×1,5",
  },
];

export const INITIAL_CONSTRUCTIONS = {
  pier: { name: "Píer de Pesca", cost: 1500, status: "none", orderDay: 0 },
  docks: { name: "Docas do Porto", cost: 3500, status: "none", orderDay: 0 },
  boat: {
    name: "Barco de Pesca",
    cost: 9000,
    status: "none",
    orderDay: 0,
    required: "docks",
  },
  aquarium_building: {
    name: "Aquário Municipal",
    cost: 5000,
    status: "none",
    orderDay: 0,
  },
};
