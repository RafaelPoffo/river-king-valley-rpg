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
