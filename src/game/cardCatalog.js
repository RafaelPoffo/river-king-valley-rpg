import pokemonNames from "./data/pokemonNames.json";

const themes = [
  ["aves", "Reino dos Ceus", "voador", "Ceu Aberto", "#83c9e8", "Fenix Dourada|Coruja Sabia|Aguia Real|Gaivota Veloz|Papagaio Exotico|Flamingo|Cisne Real|Morcego das Torres|Pombo|Pardal|Andorinha|Pintinho|Pinguim", [146,164,18,22,83,85,17,41,16,21,163,175,225], "burn|equip_atk|heal", "Vento Cortante|Plumas de Aco|Bencao dos Ceus", "Cisalhante Aereo"],
  ["fada", "Reino das Fadas", "fada", "Bosque Mistico", "#efb6d3", "Rainha Fada|Fada Guerreira|Ent Jovem|Ninfa da Primavera|Pixie Estelar|Duende do Cogumelo|Vagalume Magico|Mariposa Lunar|Borboleta|Broto Vivo|Fada das Flores|Cogumelo|Sprite", [36,39,185,35,173,46,165,49,12,1,174,47,183], "draw_extra|equip_def|heal", "Polen Magico|Tiara Elfica|Orvalho da Vida", "Ilusao do Bosque"],
  ["rei", "Exercito Real", "humano", "Castelo Real", "#eac665", "Rei Arthur|Cavaleiro Real|Guarda Real|Arqueiro Elite|Lanceiro|Batedor|Curandeiro|Mercenario|Escudeiro|Milicia|Recruta|Vigia|Mensageiro", [199,34,31,106,107,77,113,68,66,32,29,56,161], "draw_extra|equip_def|heal", "Edito Real|Armadura de Ouro|Banquete do Rei", "Emboscada da Guarda"],
  ["mago", "Circulo Arcano", "mago", "Torre de Cristal", "#b6a1d8", "Arquimago|Ilusionista|Feiticeiro|Acolito|Vidente|Alquimista|Invocador|Astrologo|Aprendiz|Estudioso|Oraculo Jovem|Fagulha|Coruja Mistica", [65,64,97,63,96,122,201,178,63,96,177,25,163], "burn|equip_atk|heal", "Clarao Arcano|Cajado Runico|Pocao de Mana", "Barreira Runica"],
  ["lich", "Horda Morta-viva", "morto-vivo", "Cemiterio Sombrio", "#a9ada7", "Lich Rei|Cavaleiro Esqueleto|Vampiro Nobre|Carnical|Fantasma|Espectro|Mumia|Sombra|Zumbi|Caveira|Osso Seco|Aranha da Tumba|Verme", [94,105,169,93,92,200,104,198,93,104,105,167,13], "burn|equip_def|revive_one", "Toque Necrotico|Manto Sombrio|Ressurreicao Sombria", "Maldicao da Tumba"],
  ["orc", "Cla Sangrento", "orc", "Arena de Sangue", "#df9c91", "Chefe Orc|Troll das Cavernas|Ogro Brutal|Brutamontes|Lancador|Guerreiro Orc|Xama|Warg de Batalha|Goblin Novato|Batedor|Goblin Raivoso|Prisioneiro|Besta Selvagem", [68,67,75,66,57,56,96,228,74,209,56,66,220], "equip_atk|heal|draw_extra", "Furia Barbaro|Pocao de Berserker|Grito de Guerra", "Surpresa Bruta"],
  ["dragao", "Ninho de Fogo", "dragao", "Caldeira Ardente", "#eba472", "Dragao Anciao|Draco Imperial|Wyvern de Magma|Filhote Crescido|Dragao Cuspidor|Serpente de Fogo|Salamandra|Elemental de Magma|Lagarto|Filhote Rastejante|Iguana|Fagulha|Cobrinha", [149,148,6,147,5,218,4,219,4,147,158,155,23], "burn|equip_def|heal", "Bafo de Fogo|Escamas de Obsidiana|Chama Vital", "Retaliacao Ignea"],
  ["fera", "Bando Selvagem", "fera", "Selva Primordial", "#92c9a0", "Leao Dourado|Lobo Atroz|Urso Pardo|Leopardo|Tigre de Bengala|Gorila|Javali Selvagem|Crocodilo|Filhote de Lobo|Coelho Rapido|Raposa Jovem|Texugo|Morcego", [59,229,217,53,243,57,221,160,228,19,37,161,41], "equip_atk|heal|draw_extra", "Instinto Predatorio|Ervas da Selva|Faro Agucado", "Emboscada na Mata"],
  ["demonio", "Abismo Sombrio", "demonio", "Abismo Profundo", "#bfa2c8", "Lorde Demonio|Demonio Alado|Sucubo|Cao Infernal|Diabrete Maior|Tentaculo Abissal|Executor|Possuido|Olho Maligno|Diabrete|Verme Infernal|Chama Menor|Sombra", [248,142,124,229,215,73,127,93,201,198,13,218,92], "burn|equip_atk|heal", "Pacto Sombrio|Chifres Abissais|Drenar Alma", "Fogo do Inferno"],
  ["pirata", "Covil dos Piratas", "pirata", "Mar Aberto", "#e3d17e", "Capitao Fantasma|Marujo Veterano|Tubarao dos Mares|Canhoneiro|Bucaneiro|Polvo Gigante|Navegador|Corsario|Marinheiro|Marujo Bebado|Macaco de Navio|Caranguejo|Albatroz", [230,83,130,9,99,224,171,117,116,79,56,98,21], "draw_extra|equip_atk|heal", "Tesouro Enterrado|Sabre Afiado|Rum dos Marujos", "Bombardeio Surpresa"],
  ["gelo", "Reino Congelado", "gelo", "Tundra Gelida", "#9ecfdc", "Rainha do Inverno|Cavaleiro Gelido|Yeti Gigante|Lobo de Gelo|Urso Polar|Mago do Gelo|Avalanche|Baleia Branca|Espirito de Gelo|Pinguim Glacial|Duende do Gelo|Raposa do Artico|Foca", [144,221,217,245,217,124,220,131,225,225,238,37,86], "control|equip_def|heal", "Nevasca Gelida|Cristal de Gelo|Sopro do Inverno", "Espinhos de Gelo"],
  ["ninja", "Cla das Sombras", "ninja", "Dojo Oculto", "#aeb9bd", "Mestre Sombrio|Assassino Silencioso|Vingador Oculto|Guerreiro Oculto|Ninja Shuriken|Guarda-costas|Mestre de Armadilhas|Espectro da Noite|Iniciante|Espiao|Gato Preto|Corvo|Kunai", [212,123,215,167,168,236,205,200,204,48,52,198,140], "control|equip_atk|heal", "Arte Oculta|Katana Sombria|Meditacao", "Shuriken Oculta"],
  ["inseto", "Colmeia de Insetos", "inseto", "Floresta Densa", "#c6d48d", "Rainha Vespa|Aranha Gigante|Besouro Hercules|Louva-a-Deus|Vespa Assassina|Formiga Soldado|Aranha Saltadora|Centopeia|Formiga Solitaria|Abelha Operaria|Mosquito|Lagarta|Gafanhoto", [15,168,214,123,15,127,167,49,165,13,193,10,48], "burn|equip_def|draw_extra", "Enxame Voraz|Quitina Reforcada|Metamorfose", "Teia Pegajosa"],
  ["espirito", "Reino Espiritual", "espirito", "Cemiterio Etereo", "#adb9d7", "Rei Fantasma|Xama Espiritual|Cavaleiro Sem Cabeca|Banshee Uivante|Guardiao Espectral|Espirito da Floresta|Feiticeiro Espectral|Vingador Etereo|Alma Perdida|Facho Errante|Sombra Errante|Eco do Passado|Corvo Espectral", [94,200,93,200,92,251,178,93,92,218,92,201,198], "revive_one|equip_def|heal", "Eco do Alem|Aura Eterea|Bencao Eterea", "Assombracao"],
  ["iniciais", "Trio Elemental", "elemental", "Caminho dos Iniciais", "#e98969", "Dragao de Fogo|Lanca-chamas|Flor Ancestral|Flor Guerreira|Tartaruga Marinha|Tartaruga de Combate|Asa Colorida|Casulo|Filhote de Fogo|Broto|Pequena Tartaruga|Lagarta|Ave Jovem", [6,5,3,2,9,8,12,11,4,1,7,10,16], "burn|equip_atk|heal", "Erupcao|Semente Vital|Mare Protetora", "Escudo Elemental"],
  ["colonia", "Metamorfose Selvagem", "inseto", "Bosque da Metamorfose", "#b4c96f", "Abelha Furiosa|Casulo Venenoso|Casulo Venenoso|Asa Colorida|Asa Colorida|Casulo Venenoso|Casulo Venenoso|Metapod|Vespa Pequena|Caterpie|Weedle|Lagarta Venenosa|Parasita", [15,14,14,12,12,14,14,11,13,10,13,10,46], "burn|equip_def|draw_extra", "Enxame|Quitina|Ciclo Vital", "Teia de Captura"],
  ["dragoes", "Linhas Draconicas", "dragao", "Ninho Ancestral", "#d88754", "Dragao Ancestral|Dragao Jovem|Dragao Jovem|Tirano Rochoso|Guardiao Rochoso|Serpente Dourada|Serpente Dourada|Cavalo Marinho|Dratini|Larvitar|Magikarp|Horsea|Dratini", [149,148,148,248,247,130,130,117,147,246,129,116,147], "burn|equip_atk|heal", "Bafo Ancestral|Escamas Reforcadas|Voo Draconico", "Muralha de Escamas"],
  ["psiquicos", "Circulo da Evolucao", "mago", "Observatorio Psiquico", "#aa95cf", "Sombra Imortal|Fantasma Errante|Fantasma Errante|Mente Superior|Mente Superior|Oraculo|Oraculo|Acolito Psiquico|Gastly|Abra|Drowzee|Natu|Xatu", [94,93,93,65,65,97,97,64,92,63,96,177,178], "control|equip_atk|heal", "Onda Psiquica|Foco Mental|Memoria Viva", "Mente Selada"],
  ["eletricos", "Circuito Eletrico", "elemental", "Usina Antiga", "#e6cf68", "Colosso Eletrico|Ovelha Luminosa|Ovelha Luminosa|Iman Evoluido|Iman Evoluido|Esfera Eletrica|Esfera Eletrica|Eletrico Veloz|Mareep|Magnemite|Voltorb|Pichu|Pikachu", [181,180,180,82,82,101,101,26,179,81,100,172,25], "burn|equip_atk|draw_extra", "Pulso Eletrico|Bobina de Cobre|Carga Vital", "Curto-circuito"],
  ["ramificacoes", "Evolucoes Elementais", "agua", "Jardim das Pedras", "#7bc4cf", "Raposa das Aguas|Redemoinho|Redemoinho|Raposa Eletrica|Raposa Eletrica|Raposa Flamejante|Raposa Flamejante|Lutador Aquatico|Eevee|Poliwag|Magikarp|Eevee|Eevee", [134,61,61,135,135,136,136,62,133,60,129,133,133], "control|equip_def|heal", "Pedra Lunar|Correnteza|Forma Perfeita", "Vetor de Evolucao"],
];

const evolutionParents = {
  "0002":"0001", "0003":"0002", "0005":"0004", "0006":"0005", "0008":"0007", "0009":"0008",
  "0011":"0010", "0012":"0011", "0014":"0013", "0015":"0014", "0017":"0016", "0018":"0017",
  "0020":"0019", "0025":"0172", "0026":"0025", "0030":"0029", "0031":"0030", "0033":"0032",
  "0034":"0033", "0035":"0173", "0036":"0035", "0038":"0037", "0039":"0174", "0040":"0039", "0042":"0041", "0044":"0043",
  "0045":"0044", "0047":"0046", "0049":"0048", "0051":"0050", "0053":"0052", "0055":"0054",
  "0057":"0056", "0059":"0058", "0061":"0060", "0062":"0061", "0064":"0063", "0065":"0064",
  "0067":"0066", "0068":"0067", "0070":"0069", "0071":"0070", "0073":"0072", "0075":"0074",
  "0076":"0075", "0078":"0077", "0080":"0079", "0082":"0081", "0085":"0084", "0089":"0088",
  "0091":"0090", "0093":"0092", "0094":"0093", "0097":"0096", "0099":"0098", "0101":"0100",
  "0103":"0102", "0105":"0104", "0110":"0109", "0112":"0111", "0117":"0116", "0119":"0118",
  "0121":"0120", "0130":"0129", "0134":"0133", "0135":"0133", "0136":"0133", "0148":"0147",
  "0149":"0148", "0153":"0152", "0154":"0153", "0156":"0155", "0157":"0156", "0159":"0158",
  "0160":"0159", "0162":"0161", "0164":"0163", "0166":"0165", "0168":"0167", "0171":"0170",
  "0176":"0175", "0178":"0177", "0180":"0179", "0181":"0180", "0182":"0044", "0186":"0061",
  "0188":"0187", "0189":"0188", "0196":"0133", "0197":"0133", "0199":"0079", "0205":"0204",
  "0208":"0095", "0210":"0209", "0212":"0123", "0217":"0216", "0219":"0218", "0221":"0220",
  "0224":"0223", "0229":"0228", "0230":"0117", "0232":"0231", "0233":"0137", "0237":"0236",
  "0242":"0113", "0247":"0246", "0248":"0247", "0124":"0238", "0125":"0239", "0126":"0240",
  "0106":"0236", "0107":"0236", "0169":"0042",
};

export function pokemonEvolutionInfo(card) {
  const dexId = card?.dexId;
  let stage = 1;
  let parent = evolutionParents[dexId] || null;
  let ancestor = parent;
  while (ancestor) {
    stage++;
    ancestor = evolutionParents[ancestor] || null;
  }
  const next = Object.entries(evolutionParents)
    .filter(([, parentId]) => parentId === dexId)
    .map(([childId]) => ({ dexId:childId, name:pokemonNames[childId] }));
  return { stage, previous:parent ? pokemonNames[parent] : null, next };
}

export function pokemonCardStats(card) {
  const stage = pokemonEvolutionInfo(card).stage;
  const bases = [[1,1],[2,0],[1,2]];
  const base = bases[(Number(card?.dexId) || 0) % bases.length];
  const bonus = (stage - 1) * 2;
  return { atk:base[0] + bonus, def:base[1] + bonus };
}

const defensiveElite = new Set(["fada", "rei", "orc", "fera", "demonio", "gelo", "inseto", "espirito"]);
const defensiveMediums = {
  aves: [5,6,7], fada: [4,5,7], rei: [5,6], mago: [5,6], lich: [4,6], orc: [6], dragao: [6], fera: [7], demonio: [5,7], pirata: [5,6], gelo: [6], ninja: [5,6], inseto: [6,7], espirito: [4],
};
const subtypeOverrides = {
  aves: {12:"agua"}, mago:{12:"voador"}, lich:{11:"inseto",12:"inseto"}, orc:{7:"fera",12:"fera"}, dragao:{6:"reptil",7:"elemental",8:"reptil",10:"reptil",11:"elemental",12:"reptil"}, fera:{7:"reptil"}, demonio:{3:"fera",7:"morto-vivo",10:"inseto",11:"elemental",12:"morto-vivo"}, pirata:{2:"agua",5:"agua",10:"fera",11:"agua",12:"voador"}, gelo:{2:"fera",3:"fera",4:"fera",5:"mago",7:"agua",9:"agua",10:"fada",11:"fera",12:"fera"}, ninja:{5:"humano",7:"morto-vivo",10:"fera",11:"voador"},
};
const descriptions = { burn:"Causa 2 de dano direto.", heal:"Recupera 2 HP, ate 15.", draw_extra:"Compra uma carta extra, ate tres na mao.", equip_atk:"Equipa um aliado do subtipo com +2 ATK.", equip_def:"Equipa um aliado do subtipo com +3 DEF.", revive_one:"Renasce um monstro do cemiterio.", control:"Altera a postura do inimigo mais forte.", trap:"Nega o ataque e destroi o atacante." };

export const DECK_SIZE = 32;
export const CARD_THEMES = themes.map(([id, name, subtype, fieldName, color, names, dexes, effects, spellNames, trapName]) => ({ id, name, subtype, fieldName, color, names: names.split("|"), dexes, effects: effects.split("|"), spellNames: spellNames.split("|"), trapName }));
export const CARD_CATALOG = CARD_THEMES.flatMap((theme) => {
  const monsters = theme.names.map((name, index) => {
    const stats = index === 0 ? [6,5] : index <= 2 ? index === 2 && defensiveElite.has(theme.id) ? [3,4] : [4,3] : index <= 7 ? defensiveMediums[theme.id]?.includes(index) ? [2,3] : [3,2] : index === 12 ? [1,2] : [1,1];
    if (index === 7 && ["aves","fada"].includes(theme.id)) stats.splice(0,2,2,2);
    const dexId = String(theme.dexes[index]).padStart(4,"0");
    return { id:`${theme.id}:m${index}`, themeId:theme.id, type:"monster", name, dexId, evolvesFrom:evolutionParents[dexId] || null, atk:stats[0], def:stats[1], subtype:subtypeOverrides[theme.id]?.[index] || theme.subtype, isBoss:index === 0, copies:index === 0 || index >= 8 ? 1 : 2, rarity:index === 0 ? "elite" : "common", desc:index === 0 ? "Exige um monstro aliado como sacrificio." : "Uma invocacao por turno. Nao ataca no turno em que chega." };
  });
  return [...monsters,
    { id:`${theme.id}:field`, themeId:theme.id, type:"field", name:theme.fieldName, subtype:theme.subtype, effect:"field", copies:2, dexId:String(theme.dexes[0]).padStart(4,"0"), desc:`Campo: +1 ATK e DEF para ${theme.subtype}.` },
    ...theme.effects.map((effect,index) => ({ id:`${theme.id}:s${index}`, themeId:theme.id, type:"spell", name:theme.spellNames[index], subtype:theme.subtype, effect, copies:2, dexId:String(theme.dexes[index + 1]).padStart(4,"0"), desc:descriptions[effect] })),
    { id:`${theme.id}:trap`, themeId:theme.id, type:"trap", name:theme.trapName, effect:"trap", copies:4, dexId:String(theme.dexes[2]).padStart(4,"0"), desc:descriptions.trap },
  ];
});
export const RARE_CARDS = [
  ["sea_guardian", "Guardiao das Mares", "0249", "agua", "sea", 0.008, 14000],
  ["sea_song", "Cancao do Oceano", "0131", "agua", "sea", 0.045, 6000],
  ["forest_guardian", "Guardiao do Bosque", "0251", "fada", "bugs", 0.1, 12000],
  ["steel_champion", "Campeao de Aco", "0212", "inseto", "bugs", 0.4, 8000],
  ["ancient_dragon", "Dragao das Lendas", "0149", "dragao", "quest", 0.7, 10000],
  ["sky_legend", "Lenda dos Ceus", "0250", "voador", "quest", 0.15, 14000],
].map(([id,name,dexId,subtype,source,chance,price]) => ({ id:`rare:${id}`, name, dexId, subtype, source, chance, price, type:"monster", atk:6, def:5, isBoss:true, rarity:"rare", desc:"Carta rara. Exige um sacrificio para invocar." }));
export const ALL_CARDS = [...CARD_CATALOG, ...RARE_CARDS].map((card) => ({
  ...card,
  evolvesFrom:card.type === "monster" ? evolutionParents[card.dexId] || null : null,
}));
export const cardById = (id) => ALL_CARDS.find((card) => card.id === id);
export const themeById = (id) => CARD_THEMES.find((theme) => theme.id === id);
export const themeDeck = (id) => CARD_CATALOG.filter((card) => card.themeId === id).flatMap((card) => Array(card.copies).fill(card.id));
export const cardName = (card, mode) => mode === "pokemon" && card.type === "monster" ? `${pokemonNames[card.dexId] || card.name}${card.isBoss ? " Chefe" : ""}` : card.name;
export const cardPortrait = (card) => card?.type === "monster" && pokemonNames[card.dexId] ? `/assets/portraits/${card.dexId}.png` : null;