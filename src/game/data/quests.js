export const LEGEND_UNLOCK = "rei_do_rio";
export const LEGEND_IDS = { normal: "rei_do_rio", pokemon: "suicune" };

// Each stage is checked when the player talks to Joe; "goal" is read by joeQuest.js.
export const JOE_QUEST_STAGES = [
  {
    title: "O olho do pescador",
    task: "Me mostre um peixe de rio com 3 estrelas ou mais na sua mochila.",
    goal: { kind: "inventory_river_stars", stars: 3 },
    reward: { money: 500 },
  },
  {
    title: "Memórias do fundo",
    task: "Encontre 3 tesouros para o museu.",
    goal: { kind: "museum", count: 3 },
    reward: { money: 1500, baits: { isca_metalica: 5 } },
  },
  {
    title: "Conhecer as águas",
    task: "Registre 20 espécies diferentes no catálogo.",
    goal: { kind: "catalog", count: 20 },
    reward: { money: 3000, baits: { isca_brilhante: 3 } },
  },
  {
    title: "A lenda",
    task: "Pesque a lenda no rio, na água funda, à noite.",
    goal: { kind: "legend" },
    reward: { money: 10000, baits: { isca_brilhante: 10 } },
  },
];
