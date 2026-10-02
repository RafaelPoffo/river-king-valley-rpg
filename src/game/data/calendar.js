export const SEASONS = ["Primavera", "Verão", "Outono", "Inverno"];

export const WEATHER_NAMES = {
  sunny: "☀️ Sol",
  rainy: "🌧️ Chuva",
  storm: "⛈️ Tempestade",
};

export const FESTIVALS = {
  0: {
    5: "Festival das Flores",
    10: "Derby de Primavera",
    15: "Banquete das Margens",
  },
  1: {
    5: "Festival do Sol Poente",
    10: "Torneio de Verão",
    15: "Noite das Estrelas",
  },
  2: {
    5: "Festival das Folhas",
    10: "Colheita de Outono",
    15: "Baile de Outono",
  },
  3: {
    5: "Festival do Gelo Ártico",
    10: "Pesca Extrema",
    15: "Solstício de Inverno",
  },
};

export const TOURNAMENT_CLOSE_MINUTES = 17 * 60;

// metric "weight" ranks by kg of the single best fish, "value" by its final price.
export const TOURNAMENTS = {
  "Derby de Primavera": {
    biome: "river",
    metric: "weight",
    goal: "o peixe de rio mais pesado",
    prizes: [1500, 600, 250],
  },
  "Torneio de Verão": {
    biome: "sea",
    metric: "weight",
    goal: "o peixe de mar mais pesado",
    prizes: [1800, 700, 300],
  },
  "Colheita de Outono": {
    biome: null,
    metric: "value",
    goal: "o peixe mais valioso",
    prizes: [2000, 800, 300],
  },
  "Pesca Extrema": {
    biome: null,
    metric: "weight",
    goal: "o maior peixe do dia",
    prizes: [3000, 1200, 500],
  },
};

export const TOURNAMENT_RIVALS = [
  { name: "Velho Joe", skill: 0.8 },
  { name: "Capitão Thomas", skill: 0.6 },
  { name: "Mestre Gema", skill: 0.4 },
  { name: "Ana a Cozinheira", skill: 0.2 },
];
