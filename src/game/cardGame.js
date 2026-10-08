import { cardById, matchesBonusType, canNormalSummon, TRAP_SLOTS } from "./cardCatalog.js";

const HAND_LIMIT = 3;
const enemyOf = (owner) => owner === "p1" ? "p2" : "p1";
const note = (duel, message) => { duel.log = [message, ...duel.log].slice(0, 50); return { ok: true, message }; };
const fail = (message) => ({ ok: false, message });
const shuffle = (cards, random) => {
  for (let index = cards.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
};

function prepareCard(card, owner, index) {
  return {
    ...card,
    uid: `${owner}:${index}`,
    gear: [],
    pos: "hand",
    hasAttacked: false,
    changed: false,
    summonedThisTurn: false,
    modAtk: 0,
    modDef: 0,
    tempAtk: 0,
    tempDef: 0,
    doomTurns: 0,
    silenceTurns: 0,
  };
}

const playerState = (ids, owner, random) => ({
  hp: 10,
  deck: shuffle(ids.map((id, index) => prepareCard(cardById(id), owner, index)), random),
  hand: [],
  monsters: [null, null, null],
  spells: Array(TRAP_SLOTS).fill(null),
  field: null,
  graveyard: [],
  summoned: false,
  discarded: false,
  evolvedThisTurn: false,
});

function draw(player, count) {
  for (let index = 0; index < count && player.hand.length < HAND_LIMIT && player.deck.length; index++) {
    player.hand.push(player.deck.pop());
  }
}

export function createCardDuel(playerCards, opponentCards, random = Math.random, mode = "normal") {
  const duel = {
    p1: playerState(playerCards, "p1", random),
    p2: playerState(opponentCards, "p2", random),
    mode, turn: "p1", state: "main", round: 1, winner: null, pending: null, dice: null,
    log: ["O duelo comeca!"],
  };
  draw(duel.p1, HAND_LIMIT);
  draw(duel.p2, HAND_LIMIT);
  return duel;
}

export function cardStats(card, player) {
  if (!card) return { atk: 0, def: 0 };
  const fieldBonus = player?.field && matchesBonusType(card, player.field.subtype) ? 1 : 0;
  const gearAtk = card.gear.includes("equip_atk") ? 1 : 0;
  const gearDef = card.gear.includes("equip_def") ? 1 : 0;
  return {
    atk: Math.max(0, (card.atk || 0) + fieldBonus + gearAtk + (card.modAtk || 0) + (card.tempAtk || 0)),
    def: Math.max(0, (card.def || 0) + fieldBonus + gearDef + (card.modDef || 0) + (card.tempDef || 0)),
  };
}

export function canAttack(card) {
  return !!card && card.pos === "atk" && !card.hasAttacked && !card.summonedThisTurn && !(card.silenceTurns > 0);
}

function bury(player, card) {
  player.graveyard.push({
    ...card, gear: [], pos: "graveyard", hasAttacked: true, summonedThisTurn: false,
    tempAtk: 0, tempDef: 0, doomTurns: 0, silenceTurns: 0,
  });
}

function finish(duel) {
  if (duel.p1.hp <= 0 && duel.p2.hp <= 0) duel.state = "dice";
  else if (duel.p1.hp <= 0 || duel.p2.hp <= 0) {
    duel.winner = duel.p1.hp <= 0 ? "p2" : "p1";
    duel.state = "finished";
  }
}

function damage(duel, pending) {
  const { owner, attackerIndex, defenderIndex } = pending;
  const attacking = duel[owner];
  const defending = duel[enemyOf(owner)];
  const attacker = attacking.monsters[attackerIndex];
  const defender = defenderIndex === "direct" ? null : defending.monsters[defenderIndex];
  const attack = cardStats(attacker, attacking).atk;
  if (!defender) {
    defending.hp -= attack;
    note(duel, `Ataque direto: ${attack} de dano.`);
  } else {
    const defense = cardStats(defender, defending)[defender.pos === "atk" ? "atk" : "def"];
    if (attack > defense) {
      bury(defending, defender);
      defending.monsters[defenderIndex] = null;
      if (defender.pos === "atk") defending.hp -= attack - defense;
      note(duel, `${defender.name} foi derrotado.`);
    } else if (attack < defense) {
      attacking.hp -= defense - attack;
      if (defender.pos === "atk") {
        bury(attacking, attacker);
        attacking.monsters[attackerIndex] = null;
      }
      note(duel, `Ataque repelido: ${defense - attack} de dano.`);
    } else if (defender.pos === "atk") {
      bury(attacking, attacker);
      attacking.monsters[attackerIndex] = null;
      bury(defending, defender);
      defending.monsters[defenderIndex] = null;
      note(duel, "Os dois monstros foram derrotados.");
    } else note(duel, "A defesa anulou o ataque.");
  }
  finish(duel);
}

function tickDoom(duel, player) {
  player.monsters.forEach((card, index) => {
    if (!card?.doomTurns) return;
    card.doomTurns -= 1;
    if (card.doomTurns <= 0) {
      note(duel, `${card.name} sucumbiu a maldicao.`);
      bury(player, card);
      player.monsters[index] = null;
    }
  });
}

function beginTurn(duel, owner) {
  duel.turn = owner;
  duel.state = "main";
  const player = duel[owner];
  const enemy = duel[enemyOf(owner)];
  player.summoned = false;
  player.discarded = false;
  player.evolvedThisTurn = false;
  player.monsters.forEach((card) => {
    if (!card) return;
    card.hasAttacked = false;
    card.changed = false;
    card.summonedThisTurn = false;
    card.tempAtk = 0;
    if (card.silenceTurns > 0) card.silenceTurns -= 1;
  });
  enemy.monsters.forEach((card) => { if (card) card.tempDef = 0; });
  tickDoom(duel, player);
  finish(duel);
  if (duel.winner) return;
  draw(player, Math.max(0, HAND_LIMIT - player.hand.length));
  note(duel, `Rodada ${duel.round}: turno de ${owner === "p1" ? "voce" : "seu rival"}.`);
}

export function resolveCardTrap(duel, useTrap) {
  if (duel.state !== "trap" || !duel.pending) return fail("Nao ha ataque pendente.");
  const pending = duel.pending;
  const defender = duel[enemyOf(pending.owner)];
  duel.pending = null;
  duel.state = "battle";
  if (useTrap) {
    const trap = defender.spells[pending.trapIndex];
    if (!trap) return fail("Armadilha indisponivel.");
    const result = applyEffect(duel, enemyOf(pending.owner), trap, {
      target: pending.attackerIndex,
      side: pending.owner,
      fromTrapWindow: true,
    });
    if (!result.ok) {
      duel.pending = pending;
      duel.state = "trap";
      return result;
    }
    bury(defender, trap);
    defender.spells[pending.trapIndex] = null;
    finish(duel);
    return note(duel, `${trap.name} foi ativada!`);
  }
  damage(duel, pending);
  return { ok: true, message: "Ataque resolvido." };
}

function targetMonster(duel, owner, action, side = "self") {
  const player = side === "enemy" ? duel[enemyOf(owner)] : duel[owner];
  return { player, card: player.monsters[action.target], index: action.target };
}

function applyEffect(duel, owner, card, action = {}) {
  const player = duel[owner];
  const enemy = duel[enemyOf(owner)];
  const effect = card.effect;
  const ally = () => targetMonster(duel, owner, action, "self");
  const foe = () => targetMonster(duel, owner, action, "enemy");

  if (effect === "field") {
    if (player.field) bury(player, player.field);
    card.pos = "field";
    player.field = card;
    return { ok: true, consume: "keep" };
  }
  if (effect.startsWith("equip_")) {
    const { card: target } = ally();
    if (!target || !matchesBonusType(target, card.subtype)) return fail(`Escolha um aliado do tipo ${card.subtype}.`);
    if (target.gear.length) return fail("Cada monstro so aceita um equipamento.");
    target.gear = [effect];
    return { ok: true };
  }
  if (effect === "heal") { player.hp += 1; return { ok: true }; }
  if (effect === "burn") { enemy.hp -= 1; return { ok: true }; }
  if (effect === "flip_pos") {
    const { card: target } = action.side === "enemy" ? foe() : ally();
    if (!target) return fail("Escolha um monstro.");
    target.pos = target.pos === "atk" ? "def" : "atk";
    return { ok: true };
  }
  if (effect === "weaken") {
    const chosen = Number.isInteger(action.target) ? (action.side === "self" ? ally() : foe()) : foe();
    if (!chosen.card) return fail("Escolha um monstro.");
    chosen.card.modAtk -= 1;
    chosen.card.modDef -= 1;
    return { ok: true };
  }
  if (effect === "boost_atk") {
    const { card: target } = ally();
    if (!target) return fail("Escolha um aliado.");
    target.tempAtk += 2;
    return { ok: true };
  }
  if (effect === "guard") {
    const { card: target } = ally();
    if (!target) return fail("Escolha um aliado.");
    target.tempDef += 2;
    return { ok: true };
  }
  if (effect === "strip_equip") {
    const chosen = player.monsters[action.target] || enemy.monsters[action.target];
    const host = player.monsters[action.target] ? player : enemy;
    if (!chosen?.gear.length) return fail("Escolha um monstro equipado.");
    chosen.gear = [];
    return { ok: true, host };
  }
  if (effect === "strip_field" || effect === "strip_field_trap") {
    if (!enemy.field) return fail("O rival nao tem carta de campo.");
    bury(enemy, enemy.field);
    enemy.field = null;
    return { ok: true };
  }
  if (effect === "strip_trap") {
    const index = enemy.spells.findIndex((item) => item?.type === "trap");
    if (index < 0) return fail("O rival nao tem armadilhas.");
    bury(enemy, enemy.spells[index]);
    enemy.spells[index] = null;
    return { ok: true };
  }
  if (effect === "remove_traps") {
    enemy.spells.forEach((item, index) => {
      if (!item) return;
      bury(enemy, item);
      enemy.spells[index] = null;
    });
    return { ok: true };
  }
  if (effect === "destroy_11") {
    const { card: target, index, player: host } = foe();
    if (!target || cardStats(target, host).atk !== 1 || cardStats(target, host).def !== 1) {
      return fail("Escolha um monstro 1/1 do rival.");
    }
    bury(host, target);
    host.monsters[index] = null;
    return { ok: true };
  }
  if (effect === "destroy_all_11") {
    enemy.monsters.forEach((item, index) => {
      if (!item) return;
      const stats = cardStats(item, enemy);
      if (stats.atk === 1 && stats.def === 1) {
        bury(enemy, item);
        enemy.monsters[index] = null;
      }
    });
    return { ok: true };
  }
  if (effect === "destroy_monster") {
    const { card: target, index, player: host } = foe();
    if (!target) return fail("Escolha um monstro do rival.");
    bury(host, target);
    host.monsters[index] = null;
    return { ok: true };
  }
  if (effect === "all_defense") {
    enemy.monsters.forEach((item) => { if (item) item.pos = "def"; });
    return { ok: true };
  }
  if (effect === "destroy_def") {
    for (const side of [player, enemy]) {
      side.monsters.forEach((item, index) => {
        if (item?.pos === "def") {
          bury(side, item);
          side.monsters[index] = null;
        }
      });
    }
    return { ok: true };
  }
  if (effect === "destroy_5atk") {
    const { card: target, index, player: host } = foe();
    if (!target || cardStats(target, host).atk < 5) return fail("Escolha um monstro com 5 de ataque ou mais.");
    bury(host, target);
    host.monsters[index] = null;
    return { ok: true };
  }
  if (effect === "destroy_equipped") {
    const { card: target, index, player: host } = foe();
    if (!target?.gear.length) return fail("Escolha um monstro equipado do rival.");
    bury(host, target);
    host.monsters[index] = null;
    return { ok: true };
  }
  if (effect === "doom") {
    const { card: target } = foe();
    if (!target) return fail("Escolha um monstro do rival.");
    target.doomTurns = 2;
    return { ok: true };
  }
  if (effect === "silence") {
    const { card: target } = foe();
    if (!target) return fail("Escolha um monstro do rival.");
    target.silenceTurns = 2;
    return { ok: true };
  }
  return fail("Esta carta nao pode ser ativada assim.");
}

const NEEDS_TARGET = new Set([
  "equip_atk", "equip_def", "flip_pos", "weaken", "boost_atk", "guard",
  "strip_equip", "destroy_11", "destroy_monster", "destroy_5atk", "destroy_equipped", "doom", "silence",
]);

export function effectNeedsTarget(effect) {
  return NEEDS_TARGET.has(effect);
}

export function performCardAction(duel, owner, action, random = Math.random) {
  if (!duel || duel.winner) return fail("Este duelo ja terminou.");
  if (action.type === "surrender") {
    duel.winner = enemyOf(owner);
    duel.state = "finished";
    return note(duel, "Duelo encerrado por desistencia.");
  }
  if (duel.turn !== owner || !["main", "battle", "dice"].includes(duel.state)) return fail("Aguarde seu turno ou resolva o ataque.");
  const player = duel[owner];
  const enemy = duel[enemyOf(owner)];
  const handIndex = player.hand.findIndex((card) => card.uid === action.uid);
  const spellIndex = player.spells.findIndex((card) => card?.uid === action.uid);
  const card = handIndex >= 0 ? player.hand[handIndex] : player.spells[spellIndex];
  const consume = () => {
    if (handIndex >= 0) player.hand.splice(handIndex, 1);
    else if (spellIndex >= 0) player.spells[spellIndex] = null;
  };

  if (action.type === "dice") {
    if (duel.state !== "dice") return fail("Nao ha desempate.");
    duel.dice = [1 + Math.floor(random() * 6), 1 + Math.floor(random() * 6)];
    if (duel.dice[0] !== duel.dice[1]) {
      duel.winner = duel.dice[0] > duel.dice[1] ? "p1" : "p2";
      duel.state = "finished";
    }
    return note(duel, `Dados: ${duel.dice.join(" x ")}${duel.winner ? "." : ". Empate: role novamente."}`);
  }
  if (duel.state === "dice") return fail("Role os dados para desempatar.");
  if (action.type === "end") {
    if (owner === "p2" && ++duel.round > 15) {
      if (duel.p1.hp === duel.p2.hp) duel.state = "dice";
      else {
        duel.winner = duel.p1.hp > duel.p2.hp ? "p1" : "p2";
        duel.state = "finished";
      }
      return note(duel, "Quinze rodadas encerradas: vence quem tem mais HP.");
    }
    beginTurn(duel, enemyOf(owner));
    return { ok: true, message: "Turno encerrado." };
  }
  if (action.type === "battle") {
    if (duel.state !== "main") return fail("Voce ja esta na batalha.");
    duel.state = "battle";
    return note(duel, "Fase de batalha.");
  }
  if (action.type === "attack") {
    const attacker = player.monsters[action.index];
    if (duel.state !== "battle" || !canAttack(attacker)) return fail("Escolha um monstro apto para atacar.");
    if (action.target === "direct" ? enemy.monsters.some(Boolean) : !enemy.monsters[action.target]) {
      return fail("Escolha um alvo valido. Ataques diretos exigem campo inimigo vazio.");
    }
    attacker.hasAttacked = true;
    const trapIndex = enemy.spells.findIndex((item) => item?.type === "trap");
    const pending = { owner, attackerIndex: action.index, defenderIndex: action.target, trapIndex };
    if (trapIndex >= 0) {
      duel.pending = pending;
      duel.state = "trap";
      if (owner === "p1") return resolveCardTrap(duel, true);
      return note(duel, "O rival atacou. Ativar sua armadilha?");
    }
    damage(duel, pending);
    return { ok: true, message: "Ataque resolvido." };
  }
  if (action.type === "position") {
    const monster = player.monsters[action.index];
    if (!monster || monster.changed) return fail("Cada monstro muda de posicao apenas uma vez por turno.");
    monster.pos = monster.pos === "atk" ? "def" : "atk";
    monster.changed = true;
    return note(duel, `${monster.name} mudou para ${monster.pos.toUpperCase()}.`);
  }
  if (!card) return fail("Selecione uma carta sua.");
  if (action.type === "evolve") {
    if (duel.state !== "main" || handIndex < 0 || card.type !== "monster" || !card.evolvesFrom) {
      return fail("Esta carta nao pode evoluir agora.");
    }
    if (player.evolvedThisTurn) return fail("Voce ja evoluiu uma carta neste turno.");
    const index = player.monsters.findIndex((monster) => monster?.dexId === card.evolvesFrom);
    if (index < 0) return fail("So e possivel evoluir sobre a pre-evolucao correta.");
    const previous = player.monsters[index];
    consume();
    card.pos = previous.pos;
    card.hasAttacked = previous.hasAttacked;
    card.changed = previous.changed;
    card.gear = [...previous.gear];
    card.modAtk = previous.modAtk;
    card.modDef = previous.modDef;
    card.tempAtk = previous.tempAtk;
    card.tempDef = previous.tempDef;
    card.doomTurns = previous.doomTurns;
    card.silenceTurns = previous.silenceTurns;
    card.summonedThisTurn = previous.summonedThisTurn;
    bury(player, previous);
    player.monsters[index] = card;
    player.evolvedThisTurn = true;
    return note(duel, `${previous.name} evoluiu para ${card.name}.`);
  }
  if (action.type === "discard") {
    if (handIndex < 0 || player.discarded) return fail("A troca de carta e permitida uma vez por turno.");
    consume();
    bury(player, card);
    draw(player, 1);
    player.discarded = true;
    return note(duel, `${card.name} foi trocada.`);
  }
  if (duel.state !== "main") return fail("Invoque, arme e ative cartas na fase principal.");
  if (action.type === "summon") {
    if (handIndex < 0 || card.type !== "monster" || player.summoned) return fail("Apenas uma invocacao por turno.");
    if (card.isBoss) {
      if (!player.monsters[action.target]) return fail("Escolha um aliado para sacrificar.");
      bury(player, player.monsters[action.target]);
      consume();
      card.pos = action.pos === "def" ? "def" : "atk";
      card.hasAttacked = true;
      card.summonedThisTurn = true;
      card.changed = false;
      player.monsters[action.target] = card;
      player.summoned = true;
      return note(duel, `${card.name} foi invocado com um sacrificio.`);
    }
    if (!canNormalSummon(card)) return fail("Este monstro so entra evoluindo da linha correta.");
    let index = player.monsters.findIndex((item) => !item);
    if (index < 0) {
      if (!player.monsters[action.target]) return fail("Escolha um aliado para substituir.");
      index = action.target;
      bury(player, player.monsters[index]);
    }
    consume();
    card.pos = action.pos === "def" ? "def" : "atk";
    card.hasAttacked = true;
    card.summonedThisTurn = true;
    card.changed = false;
    player.monsters[index] = card;
    player.summoned = true;
    return note(duel, `${card.name} entrou em ${card.pos.toUpperCase()}.`);
  }
  if (action.type === "set") {
    const index = player.spells.findIndex((item) => !item);
    if (handIndex < 0 || card.type === "monster" || index < 0) return fail("Nao ha espaco para armar esta carta.");
    consume();
    card.pos = "set";
    player.spells[index] = card;
    return note(duel, "Uma carta foi armada.");
  }
  if (action.type !== "activate" || card.type === "monster") return fail("Selecione uma magia ou campo.");
  if (card.type === "trap" && handIndex >= 0) return fail("Armadilhas precisam ser armadas e respondem a ataques.");
  const result = applyEffect(duel, owner, card, action);
  if (!result.ok) return result;
  consume();
  if (result.consume !== "keep" && card.effect !== "field") bury(player, card);
  finish(duel);
  return note(duel, `${card.name} foi ativada.`);
}

function firstTarget(list, test) {
  return list.findIndex((item) => item && (!test || test(item)));
}

export function nextCardAIAction(duel) {
  if (duel.turn !== "p2" || duel.winner || !["main", "battle"].includes(duel.state)) return null;
  const player = duel.p2;
  const enemy = duel.p1;
  if (duel.state === "main") {
    if (!player.evolvedThisTurn) {
      const evolution = player.hand.find((card) => card.type === "monster" && card.evolvesFrom && player.monsters.some((monster) => monster?.dexId === card.evolvesFrom));
      if (evolution) return { type: "evolve", uid: evolution.uid };
    }
    for (const card of [...player.hand, ...player.spells.filter(Boolean)]) {
      if (card.type === "field" && !player.field) return { type: "activate", uid: card.uid };
      if (card.type === "trap" && player.hand.includes(card) && player.spells.some((item) => !item)) return { type: "set", uid: card.uid };
      if (card.type !== "spell") continue;
      if (card.effect.startsWith("equip_")) {
        const target = player.monsters.findIndex((item) => item && matchesBonusType(item, card.subtype) && !item.gear.length);
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "heal" && player.hp < 10) return { type: "activate", uid: card.uid };
      else if (card.effect === "burn") return { type: "activate", uid: card.uid };
      else if (card.effect === "boost_atk") {
        const target = firstTarget(player.monsters, (item) => item.pos === "atk");
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "flip_pos") {
        const target = firstTarget(player.monsters, (item) => item.pos === "def");
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "weaken") {
        const target = firstTarget(enemy.monsters);
        if (target >= 0) return { type: "activate", uid: card.uid, target, side: "enemy" };
      } else if (card.effect === "doom" || card.effect === "silence" || card.effect === "destroy_monster") {
        const target = firstTarget(enemy.monsters);
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "destroy_11") {
        const target = enemy.monsters.findIndex((item) => item && cardStats(item, enemy).atk === 1 && cardStats(item, enemy).def === 1);
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "destroy_5atk") {
        const target = enemy.monsters.findIndex((item) => item && cardStats(item, enemy).atk >= 5);
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "destroy_equipped" || card.effect === "strip_equip") {
        const target = enemy.monsters.findIndex((item) => item?.gear.length);
        if (target >= 0) return { type: "activate", uid: card.uid, target };
      } else if (card.effect === "strip_field" && enemy.field) return { type: "activate", uid: card.uid };
      else if ((card.effect === "strip_trap" || card.effect === "remove_traps") && enemy.spells.some(Boolean)) return { type: "activate", uid: card.uid };
      else if (card.effect === "destroy_all_11" && enemy.monsters.some((item) => item && cardStats(item, enemy).atk === 1 && cardStats(item, enemy).def === 1)) return { type: "activate", uid: card.uid };
      else if (card.effect === "destroy_def" && [...player.monsters, ...enemy.monsters].some((item) => item?.pos === "def")) return { type: "activate", uid: card.uid };
    }
    if (!player.summoned) {
      const monster = player.hand
        .filter((item) => item.type === "monster" && (item.isBoss ? player.monsters.some(Boolean) : canNormalSummon(item)))
        .sort((first, second) => second.atk - first.atk)[0];
      if (monster) {
        const occupied = player.monsters.map((item, index) => item ? { item, index } : null).filter(Boolean).sort((first, second) => first.item.atk - second.item.atk);
        const target = monster.isBoss || player.monsters.every(Boolean) ? occupied[0]?.index : undefined;
        const strongestEnemy = Math.max(0, ...enemy.monsters.filter(Boolean).map((item) => cardStats(item, enemy).atk));
        return { type: "summon", uid: monster.uid, target, pos: monster.atk < strongestEnemy ? "def" : "atk" };
      }
    }
    const defender = player.monsters.findIndex((item) => item && item.pos === "def" && !item.changed && cardStats(item, player).atk >= Math.max(0, ...enemy.monsters.filter(Boolean).map((target) => cardStats(target, enemy).atk)));
    if (defender >= 0) return { type: "position", index: defender };
    return { type: "battle" };
  }
  for (let index = 0; index < player.monsters.length; index++) {
    const attacker = player.monsters[index];
    if (!canAttack(attacker)) continue;
    if (!enemy.monsters.some(Boolean)) return { type: "attack", index, target: "direct" };
    const target = enemy.monsters.findIndex((item) => item && cardStats(attacker, player).atk > cardStats(item, enemy)[item.pos === "atk" ? "atk" : "def"]);
    if (target >= 0) return { type: "attack", index, target };
  }
  return { type: "end" };
}
