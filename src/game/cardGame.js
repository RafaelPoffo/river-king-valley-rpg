import { cardById, pokemonCardStats } from "./cardCatalog.js";

const HAND_LIMIT = 3;
const enemyOf = (owner) => owner === "p1" ? "p2" : "p1";
const note = (duel, message) => { duel.log = [message, ...duel.log].slice(0,50); return { ok:true, message }; };
const fail = (message) => ({ ok:false, message });
const shuffle = (cards, random) => {
  for (let index = cards.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
};
const playerState = (ids, owner, random, mode) => ({ hp:10, deck:shuffle(ids.map((id,index) => {
  const card = cardById(id);
  const stats = mode === "pokemon" && card.type === "monster" ? pokemonCardStats(card) : {};
  return { ...card, ...stats, uid:`${owner}:${index}`, gear:[], pos:"hand", hasAttacked:false, changed:false };
}), random), hand:[], monsters:[null,null,null], spells:[null,null,null], field:null, graveyard:[], summoned:false, discarded:false, evolvedThisTurn:false });
function draw(player, count) {
  for (let index = 0; index < count && player.hand.length < HAND_LIMIT && player.deck.length; index++) player.hand.push(player.deck.pop());
}

export function createCardDuel(playerCards, opponentCards, random = Math.random, mode = "normal") {
  const duel = { p1:playerState(playerCards,"p1",random,mode), p2:playerState(opponentCards,"p2",random,mode), mode, turn:"p1", state:"main", round:1, winner:null, pending:null, dice:null, log:["O duelo comeca!"] };
  draw(duel.p1,HAND_LIMIT); draw(duel.p2,HAND_LIMIT);
  return duel;
}

export function cardStats(card, player) {
  const fieldBonus = player.field?.subtype === card.subtype ? 1 : 0;
  return { atk:(card.atk || 0) + fieldBonus + card.gear.filter((item) => item === "equip_atk").length * 2, def:(card.def || 0) + fieldBonus + card.gear.filter((item) => item === "equip_def").length * 3 };
}

function bury(player, card) {
  player.graveyard.push({ ...card, gear:[], pos:"graveyard", hasAttacked:true });
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
  const attack = cardStats(attacker,attacking).atk;
  if (!defender) { defending.hp -= attack; note(duel,`Ataque direto: ${attack} de dano.`); }
  else {
    const defense = cardStats(defender,defending)[defender.pos === "atk" ? "atk" : "def"];
    if (attack > defense) {
      bury(defending,defender); defending.monsters[defenderIndex] = null;
      if (defender.pos === "atk") defending.hp -= attack - defense;
      note(duel,`${defender.name} foi derrotado.`);
    } else if (attack < defense) {
      attacking.hp -= defense - attack;
      if (defender.pos === "atk") { bury(attacking,attacker); attacking.monsters[attackerIndex] = null; }
      note(duel,`Ataque repelido: ${defense - attack} de dano.`);
    } else if (defender.pos === "atk") {
      bury(attacking,attacker); attacking.monsters[attackerIndex] = null;
      bury(defending,defender); defending.monsters[defenderIndex] = null;
      note(duel,"Os dois monstros foram derrotados.");
    } else note(duel,"A defesa anulou o ataque.");
  }
  finish(duel);
}

function beginTurn(duel, owner) {
  duel.turn = owner; duel.state = "main";
  const player = duel[owner]; player.summoned = false; player.discarded = false; player.evolvedThisTurn = false;
  player.monsters.forEach((card) => { if (card) { card.hasAttacked = false; card.changed = false; } });
  draw(player,Math.max(0,HAND_LIMIT - player.hand.length));
  note(duel,`Rodada ${duel.round}: turno de ${owner === "p1" ? "voce" : "seu rival"}.`);
}

export function resolveCardTrap(duel, useTrap) {
  if (duel.state !== "trap" || !duel.pending) return fail("Nao ha ataque pendente.");
  const pending = duel.pending;
  const defender = duel[enemyOf(pending.owner)];
  duel.pending = null; duel.state = "battle";
  if (useTrap) {
    const trap = defender.spells[pending.trapIndex];
    if (!trap) return fail("Armadilha indisponivel.");
    bury(defender,trap); defender.spells[pending.trapIndex] = null;
    const player = duel[pending.owner];
    bury(player,player.monsters[pending.attackerIndex]); player.monsters[pending.attackerIndex] = null;
    return note(duel,"Armadilha ativada! O atacante foi destruido.");
  }
  damage(duel,pending);
  return { ok:true, message:"Ataque resolvido." };
}

export function performCardAction(duel, owner, action, random = Math.random) {
  if (!duel || duel.winner) return fail("Este duelo ja terminou.");
  if (action.type === "surrender") {
    duel.winner = enemyOf(owner); duel.state = "finished";
    return note(duel,"Duelo encerrado por desistencia.");
  }
  if (duel.turn !== owner || !["main","battle","dice"].includes(duel.state)) return fail("Aguarde seu turno ou resolva o ataque.");
  const player = duel[owner];
  const enemy = duel[enemyOf(owner)];
  const handIndex = player.hand.findIndex((card) => card.uid === action.uid);
  const spellIndex = player.spells.findIndex((card) => card?.uid === action.uid);
  const card = handIndex >= 0 ? player.hand[handIndex] : player.spells[spellIndex];
  const consume = () => {
    if (handIndex >= 0) player.hand.splice(handIndex,1);
    else if (spellIndex >= 0) player.spells[spellIndex] = null;
  };
  if (action.type === "dice") {
    if (duel.state !== "dice") return fail("Nao ha desempate.");
    duel.dice = [1 + Math.floor(random()*6),1 + Math.floor(random()*6)];
    if (duel.dice[0] !== duel.dice[1]) { duel.winner = duel.dice[0] > duel.dice[1] ? "p1" : "p2"; duel.state = "finished"; }
    return note(duel,`Dados: ${duel.dice.join(" x ")}${duel.winner ? "." : ". Empate: role novamente."}`);
  }
  if (duel.state === "dice") return fail("Role os dados para desempatar.");
  if (action.type === "end") {
    if (owner === "p2" && ++duel.round > 15) {
      if (duel.p1.hp === duel.p2.hp) duel.state = "dice";
      else { duel.winner = duel.p1.hp > duel.p2.hp ? "p1" : "p2"; duel.state = "finished"; }
      return note(duel,"Quinze rodadas encerradas: vence quem tem mais HP.");
    }
    beginTurn(duel,enemyOf(owner)); return { ok:true, message:"Turno encerrado." };
  }
  if (action.type === "battle") {
    if (duel.state !== "main") return fail("Voce ja esta na batalha.");
    duel.state = "battle"; return note(duel,"Fase de batalha.");
  }
  if (action.type === "attack") {
    const attacker = player.monsters[action.index];
    if (duel.state !== "battle" || !attacker || attacker.pos !== "atk" || attacker.hasAttacked) return fail("Escolha um monstro apto para atacar.");
    if (action.target === "direct" ? enemy.monsters.some(Boolean) : !enemy.monsters[action.target]) return fail("Escolha um alvo valido. Ataques diretos exigem campo inimigo vazio.");
    attacker.hasAttacked = true;
    const trapIndex = enemy.spells.findIndex((item) => item?.type === "trap");
    const pending = { owner, attackerIndex:action.index, defenderIndex:action.target, trapIndex };
    if (trapIndex >= 0) {
      duel.pending = pending; duel.state = "trap";
      if (owner === "p1") return resolveCardTrap(duel,true);
      return note(duel,"O rival atacou. Ativar sua armadilha?");
    }
    damage(duel,pending); return { ok:true, message:"Ataque resolvido." };
  }
  if (action.type === "position") {
    const monster = player.monsters[action.index];
    if (!monster || monster.changed) return fail("Cada monstro muda de posicao apenas uma vez por turno.");
    monster.pos = monster.pos === "atk" ? "def" : "atk"; monster.changed = true;
    return note(duel,`${monster.name} mudou para ${monster.pos.toUpperCase()}.`);
  }
  if (!card) return fail("Selecione uma carta sua.");
  if (action.type === "evolve") {
    if (duel.mode !== "pokemon" || duel.state !== "main" || handIndex < 0 || card.type !== "monster" || !card.evolvesFrom) return fail("Esta carta nao pode evoluir agora.");
    if (player.evolvedThisTurn) return fail("Voce ja evoluiu uma carta neste turno.");
    const index = player.monsters.findIndex((monster) => monster?.dexId === card.evolvesFrom);
    if (index < 0) return fail("A carta em campo nao e a pre-evolucao desta especie.");
    const previous = player.monsters[index];
    consume();
    card.pos = previous.pos;
    card.hasAttacked = previous.hasAttacked;
    card.changed = previous.changed;
    card.gear = [...previous.gear];
    bury(player,previous);
    player.monsters[index] = card;
    player.evolvedThisTurn = true;
    return note(duel,`${previous.name} evoluiu para ${card.name}.`);
  }
  if (action.type === "discard") {
    if (handIndex < 0 || player.discarded) return fail("A troca de carta e permitida uma vez por turno.");
    consume(); bury(player,card); draw(player,1); player.discarded = true;
    return note(duel,`${card.name} foi trocada.`);
  }
  if (duel.state !== "main") return fail("Invoque, arme e ative cartas na fase principal.");
  if (action.type === "summon") {
    if (handIndex < 0 || card.type !== "monster" || player.summoned) return fail("Apenas uma invocacao por turno.");
    let index = player.monsters.findIndex((item) => !item);
    if (card.isBoss || index < 0) {
      if (!player.monsters[action.target]) return fail(card.isBoss ? "Escolha um aliado para sacrificar." : "Escolha um aliado para substituir.");
      index = action.target; bury(player,player.monsters[index]);
    }
    consume(); card.pos = action.pos === "def" ? "def" : "atk"; card.hasAttacked = true; card.changed = false;
    player.monsters[index] = card; player.summoned = true;
    return note(duel,`${card.name} entrou em ${card.pos.toUpperCase()}.`);
  }
  if (action.type === "set") {
    const index = player.spells.findIndex((item) => !item);
    if (handIndex < 0 || card.type === "monster" || index < 0) return fail("Nao ha espaco para armar esta carta.");
    consume(); card.pos = "set"; player.spells[index] = card;
    return note(duel,"Uma carta foi armada.");
  }
  if (action.type !== "activate" || card.type === "monster" || card.type === "trap") return fail("Armadilhas precisam ser armadas e respondem a ataques.");
  const target = player.monsters[action.target];
  if (card.effect.startsWith("equip_")) {
    if (!target || target.subtype !== card.subtype) return fail(`Escolha um aliado de subtipo ${card.subtype}.`);
    target.gear.push(card.effect);
  } else if (card.effect === "revive_one") {
    const index = player.monsters.findIndex((item) => !item);
    const dead = player.graveyard.findIndex((item) => item.uid === action.target && item.type === "monster");
    if (index < 0 || dead < 0) return fail("Escolha um monstro do cemiterio e libere uma zona.");
    const revived = player.graveyard.splice(dead,1)[0]; revived.pos = "atk"; revived.hasAttacked = true; revived.changed = false;
    player.monsters[index] = revived;
  } else if (card.effect === "heal") player.hp = Math.min(15,player.hp + 2);
  else if (card.effect === "burn") enemy.hp -= 2;
  else if (card.effect === "draw_extra") { consume(); draw(player,1); bury(player,card); return note(duel,`${card.name}: uma carta extra.`); }
  else if (card.effect === "control") {
    const strongest = enemy.monsters.filter(Boolean).sort((first,second) => cardStats(second,enemy).atk - cardStats(first,enemy).atk)[0];
    if (strongest) strongest.pos = strongest.pos === "atk" ? "def" : "atk";
  }
  consume();
  if (card.effect === "field") {
    if (player.field) bury(player,player.field);
    card.pos = "field"; player.field = card;
  } else bury(player,card);
  finish(duel);
  return note(duel,`${card.name} foi ativada.`);
}

export function nextCardAIAction(duel) {
  if (duel.turn !== "p2" || duel.winner || !["main","battle"].includes(duel.state)) return null;
  const player = duel.p2;
  if (duel.state === "main") {
    if (duel.mode === "pokemon" && !player.evolvedThisTurn) {
      const evolution = player.hand.find((card) => card.type === "monster" && card.evolvesFrom && player.monsters.some((monster) => monster?.dexId === card.evolvesFrom));
      if (evolution) return { type:"evolve", uid:evolution.uid };
    }
    for (const card of [...player.hand,...player.spells.filter(Boolean)]) {
      if (card.type === "field" && !player.field) return { type:"activate", uid:card.uid };
      if (card.type === "trap" && player.hand.includes(card) && player.spells.some((item) => !item)) return { type:"set", uid:card.uid };
      if (card.type !== "spell") continue;
      if (card.effect.startsWith("equip_")) {
        const target = player.monsters.findIndex((item) => item?.subtype === card.subtype);
        if (target >= 0) return { type:"activate", uid:card.uid, target };
      } else if (card.effect === "revive_one") {
        const target = player.graveyard.find((item) => item.type === "monster");
        if (target && player.monsters.some((item) => !item)) return { type:"activate", uid:card.uid, target:target.uid };
      } else if (card.effect !== "heal" || player.hp < 15) return { type:"activate", uid:card.uid };
    }
    if (!player.summoned) {
      const monster = player.hand.filter((item) => item.type === "monster" && (!item.isBoss || player.monsters.some(Boolean))).sort((first,second) => second.atk - first.atk)[0];
      if (monster) {
        const occupied = player.monsters.map((item,index) => item ? {item,index} : null).filter(Boolean).sort((first,second) => first.item.atk - second.item.atk);
        const target = occupied[0]?.index;
        const strongestEnemy = Math.max(0,...duel.p1.monsters.filter(Boolean).map((item) => cardStats(item,duel.p1).atk));
        return { type:"summon", uid:monster.uid, target, pos:monster.atk < strongestEnemy ? "def" : "atk" };
      }
    }
    const defender = player.monsters.findIndex((item) => item && item.pos === "def" && !item.changed && cardStats(item,player).atk >= Math.max(0,...duel.p1.monsters.filter(Boolean).map((target) => cardStats(target,duel.p1).atk)));
    if (defender >= 0) return { type:"position", index:defender };
    return { type:"battle" };
  }
  for (let index = 0; index < player.monsters.length; index++) {
    const attacker = player.monsters[index];
    if (!attacker || attacker.pos !== "atk" || attacker.hasAttacked) continue;
    if (!duel.p1.monsters.some(Boolean)) return { type:"attack", index, target:"direct" };
    const target = duel.p1.monsters.findIndex((item) => item && cardStats(attacker,player).atk >= cardStats(item,duel.p1)[item.pos === "atk" ? "atk" : "def"]);
    if (target >= 0) return { type:"attack", index, target };
  }
  return { type:"end" };
}