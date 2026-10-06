import { BUG_ARCHETYPES, bugsForMode } from "./bugCatalog.js";
import { seededRandom } from "./insectHunt.js";

const RIVALS = [
  ["Marta Casca", "Dama da Folhagem", "A casca dura não é tudo. Veja como meu time se move."],
  ["Nico Vagalume", "O Farol da Noite", "Quando as luzes se apagam, meu time enxerga melhor."],
  ["Bia Mandíbula", "Capitã do Formigueiro", "Um bom plano começa por escolher a linha de frente."],
  ["Téo Asas", "Príncipe do Vento", "O segredo é esperar o instante certo para avançar."],
  ["Cris Crisálida", "A Guardiã do Casulo", "Não subestime quem ainda está se transformando."],
  ["Luca Ferrão", "O Duque do Jardim", "Meu ferrão é rápido, mas meu time sabe jogar junto."],
  ["Duda Élitro", "A Máscara Verde", "Cada espécie guarda um truque sob as asas."],
  ["Rui Saltador", "Mestre do Salto", "O chão da mesa é meu território."],
  ["Nina Pólen", "A Dama das Flores", "Meu time luta com leveza e uma boa dose de coragem."],
  ["Otto Pinça", "O Barão do Tronco", "Pode vir. Meus pequenos não saem do lugar."],
  ["Lia Tecelã", "A Sombra da Teia", "Às vezes, vencer é saber esperar o rival errar."],
  ["Beto Trovoada", "O Trovão das Folhas", "Um pouco de ritmo muda qualquer disputa."],
  ["Mimi Monarca", "A Rainha das Trilhas", "Bonito e forte podem andar juntos."],
  ["Zé Cascudo", "O Escudo do Bosque", "Meu trio aguenta qualquer rodada."],
  ["Iara Lâmina", "A Dançarina do Prado", "Olhe para as patas, não para as asas."],
  ["Caio Oráculo", "O Olho do Cipó", "Já vi essa partida em sonho. Quase sempre acerto."],
  ["Sol Emboscada", "A Raposa do Capim", "Nunca mostro meu próximo movimento."],
  ["Joca Crescente", "O Azarão do Mato", "Meu time é pequeno, mas nunca desiste."],
  ["Rosa Ferrugem", "A Voz do Enxame", "A floresta inteira torce por nós."],
  ["Davi Hércules", "O Herdeiro do Carvalho", "Vamos descobrir quem tem mais fibra."],
];

export const BUG_COMPETITOR_SEATS = [
  { x: 29, y: 10 }, { x: 26, y: 10 }, { x: 32, y: 10 },
  { x: 25, y: 12 }, { x: 33, y: 12 }, { x: 26, y: 14 },
  { x: 32, y: 14 }, { x: 29, y: 15 },
];

export function competitorsForDay(season, day, mode = "normal") {
  const key = `${mode}:${season}:${day}`;
  const random = seededRandom(`bug-competitors:${key}`);
  const totalEntrants = day === 15 ? 9 : 3 + Math.floor(random() * 4);
  const count = totalEntrants - 1;
  const catalog = bugsForMode(mode);
  const rivals = [...RIVALS].sort(() => random() - 0.5).slice(0, count - 1).map(([name, persona, dialogue], index) => ({
    id: `rival_${index}`,
    name,
    persona,
    dialogue,
    avatar: ["🎩", "🧢", "👒", "🥷", "🤠", "🧙", "🪖", "👑"][index % 8],
    team: createRivalTeam(catalog, random),
  }));
  return [
    {
      id: "joe_bug",
      name: "Joe Bug",
      persona: "Guardião da Clareira",
      dialogue: "Toda boa batalha começa com respeito pela floresta.",
      avatar: "🪲",
      team: createRivalTeam(catalog, random),
    },
    ...rivals,
  ];
}

function createRivalTeam(catalog, random) {
  const budgetChoices = [[4, 5, 9], [2, 7, 9], [4, 7, 7], [5, 5, 8]];
  const budget = budgetChoices[Math.floor(random() * budgetChoices.length)];
  return budget.map((points) => {
    const options = catalog.filter((bug) => bug.points === points);
    return options[Math.floor(random() * options.length)];
  });
}

function rollTotal(fighter, opponent, turn, random, fortune = 0) {
  let die = 1 + Math.floor(random() * 20);
  if (fighter.archetypeId === "agile" && die === 1) die = 1 + Math.floor(random() * 20);
  if (fighter.archetypeId === "lucky" && die === 1) die = 11;
  const bonus = (fighter.archetypeId === "tactician" && turn >= 3 ? 1 : 0)
    + (fighter.archetypeId === "momentum" && (turn === 2 || turn === 4) ? 1 : 0)
    + (fighter.archetypeId === "trickster" && die <= 6 ? 2 : 0)
    + (fighter.archetypeId === "balanced" && die % 2 === 0 ? 1 : 0)
    + (fighter.archetypeId === "underdog" && fighter.strength < opponent.strength ? 1 : 0);
  return die + fighter.strength + bonus + fortune;
}

export function resolveBugDuel(left, right, key, playerLuck = 0) {
  const random = seededRandom(key);
  let leftX = 35;
  let rightX = 65;
  let leftScore = 0;
  let rightScore = 0;
  const frames = [];

  for (let turn = 1; turn <= 5; turn++) {
    const leftTotal = rollTotal(left, right, turn, random, Math.min(1, playerLuck * 0.2));
    const rightTotal = rollTotal(right, left, turn, random);
    leftScore += leftTotal;
    rightScore += rightTotal;
    if (leftTotal !== rightTotal) {
      const winner = leftTotal > rightTotal ? left : right;
      const loser = winner === left ? right : left;
      const difference = Math.abs(leftTotal - rightTotal);
      const impact = (winner.archetypeId === "bruiser" ? 2 : 0)
        - (loser.archetypeId === "guardian" ? 2 : 0)
        - (loser.archetypeId === "anchor" && turn <= 2 ? 2 : 0);
      const push = Math.max(1, Math.ceil(difference / 2) + 3 + impact);
      if (winner === left) {
        leftX = Math.min(60, leftX + 2);
        rightX = Math.min(118, rightX + push);
      } else {
        rightX = Math.max(40, rightX - 2);
        leftX = Math.max(-18, leftX - push);
      }
    }
    frames.push({ leftX, rightX, leftFlipped: false, rightFlipped: false });
    if (leftX <= 0 || rightX >= 100) break;
  }

  let winner;
  if (leftX <= 0) winner = right;
  else if (rightX >= 100) winner = left;
  else if (leftScore !== rightScore) winner = leftScore > rightScore ? left : right;
  else winner = left.strength === right.strength
    ? (random() < 0.5 ? left : right)
    : left.strength > right.strength ? left : right;
  const finalFrame = frames[frames.length - 1];
  finalFrame.leftFlipped = winner !== left;
  finalFrame.rightFlipped = winner !== right;
  return { winner, frames };
}

export function prizeForCompetition(entrants, isSeasonFinal) {
  if (isSeasonFinal) return 2000;
  return entrants <= 3
    ? 100 + Math.floor(Math.random() * 401)
    : 500 + Math.floor(Math.random() * 501);
}

export function archetypeForBug(bug) {
  return BUG_ARCHETYPES[bug.archetypeId];
}