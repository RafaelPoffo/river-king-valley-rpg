export const LEGEND_UNLOCK = "rei_do_rio";
export const LEGEND_IDS = { normal: "rei_do_rio", pokemon: "suicune" };

// Each stage is checked when the player talks to Joe; "goal" is read by joeQuest.js.
export const JOE_QUEST_STAGES = [
  {
    title: "O olho do pescador",
    task: "Me mostre um peixe de rio com 3 estrelas ou mais na sua mochila.",
    hint: "Pesque no rio até aparecerem três estrelas. Depois volte a falar comigo.",
    goal: { kind: "inventory_river_stars", stars: 3 },
    reward: { money: 500 },
  },
  {
    title: "Memórias do fundo",
    task: "Encontre 3 tesouros para o museu.",
    hint: "Lance em água média ou funda, no mar ou no rio. Tesouros vão para o museu.",
    goal: { kind: "museum", count: 3 },
    reward: { money: 1500, baits: { isca_metalica: 5 } },
  },
  {
    title: "Conhecer as águas",
    task: "Registre 20 espécies diferentes no catálogo.",
    hint: "Varie rio, mar, estação e horário. O catálogo no menu mostra o que falta.",
    goal: { kind: "catalog", count: 20 },
    reward: { money: 3000, baits: { isca_brilhante: 3 } },
  },
  {
    title: "A lenda",
    task: "Pesque a lenda no rio, na água funda, à noite.",
    hint: "Só depois das outras etapas. Rio, zona funda, noite. A lenda não mexe de dia.",
    goal: { kind: "legend" },
    reward: { money: 10000, baits: { isca_brilhante: 10 } },
  },
];

export const QUEST_DEFS = [
  {
    id: "nina_apprentice",
    giver: "fishing_guide",
    title: "A aprendiz da margem",
    summary: "Nina ensina o ofício em troca de peixes e, no fim, de uma vara melhor.",
    autoStart: true,
    stages: [
      {
        title: "Três do rio",
        task: "Pesque 3 peixes no rio e fale com a Nina.",
        hint: "Fique na margem norte ou no rio da vila. Qualquer peixe de rio conta.",
        goal: { kind: "catch_count", biome: "river", count: 3 },
        reward: { money: 200, baits: { massa_pao: 5 } },
      },
      {
        title: "Mão firme",
        task: "Pesque um peixe de 3 estrelas e mostre para a Nina.",
        hint: "Use isca melhor e mire na área clara. Estrelas sobem com raridade e estágio.",
        goal: { kind: "inventory_stars", stars: 3 },
        reward: { money: 400, baits: { camarao_vivo: 3 } },
      },
      {
        title: "A vara da aprendiz",
        task: "Entregue 5 peixes de rio à Nina.",
        hint: "Encha a mochila no rio e volte a falar com ela. Ela troca os peixes por uma Vara de Fibra.",
        goal: { kind: "hand_over", biome: "river", count: 5 },
        reward: { money: 0, rod: "vara_fibra", baits: { isca_rio: 3 } },
      },
    ],
  },
  {
    id: "nuno_bait",
    giver: "river_fisher",
    title: "A isca do rio",
    summary: "Seu Nuno troca segredos de linha por peixes do rio.",
    autoStart: true,
    stages: [
      {
        title: "Vizinho da ponte",
        task: "Pesque 4 peixes de rio e fale com o Nuno.",
        hint: "Ele pesca perto da ponte. Qualquer espécie de rio serve.",
        goal: { kind: "catch_count", biome: "river", count: 4 },
        reward: { money: 180, baits: { isca_rio: 4 } },
      },
    ],
  },
  {
    id: "thomas_north",
    giver: "veteran",
    title: "Correntes de inverno",
    summary: "O capitão só fala do Norte quando o barco está pronto.",
    autoStart: true,
    stages: [
      {
        title: "O píer primeiro",
        task: "Encomende o Píer na oficina do Gino.",
        hint: "Fale com o Mestre Gino e compre o Píer. Ele fica pronto depois de duas noites.",
        goal: { kind: "construction", id: "pier" },
        reward: { money: 100, baits: { isca_cais: 2 } },
      },
      {
        title: "Peixe do cais",
        task: "Pesque do píer um peixe que só mora ali.",
        hint: "Fique em cima do píer pronto e lance ao mar. Só o cais chama o Peixe-Estaca ou o Qwilfish.",
        goal: { kind: "catch_flag", flag: "pier" },
        reward: { money: 500, baits: { isca_cais: 3 } },
      },
      {
        title: "Para o Norte",
        task: "Construa o barco e viaje ao alto-mar do Norte.",
        hint: "Píer, depois Docas, depois Barco. Fale com o Thomas até as 16h.",
        goal: { kind: "flag", id: "sailed_north" },
        reward: { money: 800, baits: { isca_gelo: 3, sardinha_alto_mar: 2 } },
      },
    ],
  },
  {
    id: "ivo_collector",
    giver: "card_seller",
    title: "O colecionador distante",
    summary: "Ivo recompensa quem junta cartas básicas e visita a loja nos dias de festa.",
    autoStart: true,
    stages: [
      {
        title: "Primeiro baralho",
        task: "Compre ou troque um deck com o Ivo.",
        hint: "Decks custam 4000. A primeira troca aceita Tilápia Dourada ou Dratini.",
        goal: { kind: "decks", count: 1 },
        reward: { money: 300, cards: ["shop:0060"] },
      },
      {
        title: "Oito básicos",
        task: "Tenha 8 cartas de pokémon básico na coleção.",
        hint: "Compre avulsas por 500, troque com visitantes da loja ou vença o quadro da taverna.",
        goal: { kind: "basic_cards", count: 8 },
        reward: { money: 600, cards: ["shop:0120"] },
      },
      {
        title: "Noite das lendas",
        task: "Fale com um duelista lenda em um dia de evento (7, 15 ou 22).",
        hint: "Nesses dias a casa enche. As lendas duelam, mas nunca entregam o pokémon lendário.",
        goal: { kind: "flag", id: "met_legend" },
        reward: { money: 1000, baits: { isca_brilhante: 1 } },
      },
    ],
  },
  {
    id: "lia_birds",
    giver: "bird_guide",
    title: "Olhos na copa",
    summary: "Leo troca sorte de observação por iscas.",
    autoStart: true,
    stages: [
      {
        title: "Cinco aves",
        task: "Observe 5 aves no banco da floresta.",
        hint: "Fale com o banco ao norte da floresta. Setas movem os binóculos, Espaço observa.",
        goal: { kind: "birds", count: 5 },
        reward: { money: 250, baits: { minhoca: 6 } },
      },
    ],
  },
  {
    id: "flora_garden",
    giver: "garden_guide",
    title: "Três mudas",
    summary: "Flora quer ver o jardim crescer.",
    autoStart: true,
    stages: [
      {
        title: "Plante três",
        task: "Tenha 3 árvores plantadas no jardim.",
        hint: "Equipe uma semente e plante nos canteiros a leste da floresta.",
        goal: { kind: "garden", count: 3 },
        reward: { money: 200, baits: { massa_pao: 3 } },
      },
    ],
  },
  {
    id: "bento_bugs",
    giver: "bug_guide",
    title: "O trio da clareira",
    summary: "Bento só se calma quando você monta um time.",
    autoStart: true,
    stages: [
      {
        title: "Três insetos",
        task: "Tenha 3 insetos na mochila de insetos.",
        hint: "Ande pela floresta e pegue insetos com Espaço. Depois fale com o Bento.",
        goal: { kind: "insects", count: 3 },
        reward: { money: 220 },
      },
    ],
  },
  {
    id: "card_water_chain",
    giver: "card_agua",
    title: "A carta das marés",
    summary: "Marina só entrega um básico de água a quem pesca o que ela ama.",
    stages: [
      {
        title: "Peixe da vitrine",
        task: "Entregue a Marina um Corsola ou uma Garoupa.",
        hint: "Corsola e Qwilfish gostam do píer. Garoupa mora no mar.",
        goal: { kind: "hand_over_ids", ids: ["corsola", "garoupa"] },
        reward: { money: 400, cards: ["shop:0072"] },
      },
    ],
  },
  {
    id: "boss_ice",
    giver: "card_lendas_gelo",
    title: "A carta do gelo",
    summary: "Uma jornada longa até a carta chefe de gelo. Neve nunca entrega o lendário em duelo.",
    stages: [
      {
        title: "Inverno no Norte",
        task: "Pesque 3 espécies de água ou gelo no alto-mar, de preferência no inverno.",
        hint: "Construa o barco. Água e gelo quase não mordem fora do inverno, exceto no Norte.",
        goal: { kind: "catch_cold", count: 3 },
        reward: { money: 1200, baits: { isca_gelo: 5 } },
      },
      {
        title: "O tesouro gelado",
        task: "Leve 5 tesouros ao museu.",
        hint: "Mar e alto-mar, zonas 2 e 3. O museu fica na cabana do Joe.",
        goal: { kind: "museum", count: 5 },
        reward: { money: 2000 },
      },
      {
        title: "A lenda no papel",
        task: "Vença Neve em um dia de evento e volte a falar com ela.",
        hint: "Dias 7, 15 ou 22. Ela duela, mas a carta chefe só vem desta missão.",
        goal: { kind: "flag", id: "beat_ice_legend" },
        reward: { money: 4000, bossDeck: "lendas_gelo" },
      },
    ],
  },
  {
    id: "boss_fire",
    giver: "card_lendas_fogo",
    title: "A carta das brasas",
    summary: "Magma exige um deck próprio e uma vitória em evento.",
    stages: [
      {
        title: "Fogo na coleção",
        task: "Tenha o deck de Fogo ou 12 cartas básicas.",
        hint: "Compre o deck de Fogo com o Ivo ou junte básicos avulsos e trocas da loja.",
        goal: { kind: "deck_or_basics", theme: "fogo", basics: 12 },
        reward: { money: 1500 },
      },
      {
        title: "Vencer o magma",
        task: "Derrote Magma das Lendas em um dia de evento.",
        hint: "Ele nunca entrega Moltres no duelo. A carta chefe é o prêmio desta quest.",
        goal: { kind: "flag", id: "beat_fire_legend" },
        reward: { money: 4000, bossDeck: "lendas_fogo" },
      },
    ],
  },
  {
    id: "boss_thunder",
    giver: "card_lendas_raio",
    title: "A carta do raio",
    summary: "Uma prova longa de pesca e duelo.",
    stages: [
      {
        title: "Catálogo amplo",
        task: "Registre 30 espécies no catálogo.",
        hint: "Use o píer, o rio, o mar e o Norte. Inverno ajuda água e gelo.",
        goal: { kind: "catalog", count: 30 },
        reward: { money: 1800, baits: { isca_marinha: 4 } },
      },
      {
        title: "O trovão da casa",
        task: "Derrote Raio Lendario em um dia de evento.",
        hint: "Dias 7, 15 ou 22. Sem isso a carta chefe não sai do estoque.",
        goal: { kind: "flag", id: "beat_thunder_legend" },
        reward: { money: 4000, bossDeck: "lendas_raio" },
      },
    ],
  },
  {
    id: "boss_mystic",
    giver: "card_lendas_mistico",
    title: "A carta mística",
    summary: "A quest mais longa: lenda do rio, coleção e a lenda da casa.",
    stages: [
      {
        title: "A lenda viva",
        task: "Pesque a lenda do Velho Joe.",
        hint: "Termine A Lenda do Rei do Rio. Só então Elo te escuta de verdade.",
        goal: { kind: "legend" },
        reward: { money: 2500 },
      },
      {
        title: "Coleção completa de básicos",
        task: "Tenha 20 cartas de pokémon básico.",
        hint: "Loja, visitantes, quadro da taverna e prêmios de quest.",
        goal: { kind: "basic_cards", count: 20 },
        reward: { money: 3000 },
      },
      {
        title: "O céu no papel",
        task: "Derrote Elo Celeste em um dia de evento.",
        hint: "A carta mística não sai de duelo comum. Só desta última etapa.",
        goal: { kind: "flag", id: "beat_mystic_legend" },
        reward: { money: 8000, bossDeck: "lendas_mistico" },
      },
    ],
  },
];
