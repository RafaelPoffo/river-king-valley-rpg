import { get } from "svelte/store";
import { PHASES } from "./phases.js";
import {
  phase,
  currentMessage,
  dialogActions,
  isFading,
  inGameMinutes,
  day,
  seasonIndex,
  currentWeather,
  eveningWarned,
  currentMap,
  player,
  deepSeaFishingActive,
  constructions,
  upgrades,
  money,
  inventory,
  inventoryFullPendingFish,
  selectedBackpackIndex,
  aquarium,
  lastWormHarvestDay,
  baitStock,
  villagers,
  currentToolData,
  currentToolType,
  fishingBiome,
  shopTab,
  showAquariumModal,
  showTavernQuestModal,
  showCalendarModal,
  showKitchenModal,
  currentFestival,
  lastFestivalClaim,
  ownedRods,
  ownedNets,
  ownedBaits,
  eqRodId,
  eqNetId,
  eqBaitId,
  gameMode,
  wildInsects,
  insectInventory,
  showBugTournament,
  showBirdWatching,
  eqSeedId, birdwatchingLuck,
  forestFeathers,
  maxInventorySize,
  cardOpponent, cardTradeUsed, cardDecks, cardChampionship,
} from "./stores.js";
import {
  SEASONS,
  WEATHER_NAMES,
  FESTIVAL_STALL,
  BOAT_BOUNDS,
  BOAT_BOARDING,
  DEEP_SEA_CAPTAIN,
  DEEP_SEA_SPAWN,
  LAST_DEPARTURE_HOUR,
  INITIAL_CONSTRUCTIONS,
  inBounds,
  getNpcLocation,
  TOURNAMENT_CLOSE_MINUTES,
  cardPlayersForDay,
  CARD_CHAMPIONSHIP_DAY,
  isCardEventDay,
} from "./constants.js";
import { todaysTournament, submitTournament, formatScore, dayKey } from "./tournament.js";
import { claimCollectionRewards, rewardMessage } from "./collections.js";
import {
  talkTo,
  friendLine,
  heartsText,
  hasPerk,
  captainTip,
  pickGift,
  canGiftToday,
  giveGift,
  tasteLabel,
  friendPrice,
} from "./friendship.js";
import { openJoeQuest } from "./joeQuest.js";
import {
  updateCamera,
  getTileInFront,
  isWalking,
  afterCurrentStep,
  interiorSpawn,
  canWalkOn,
} from "./movement.js";
import { saveGame } from "./saveSystem.js";
import { ensureWorldPopulation } from "./worldCreatures.js";
import { generateDailyQuest, checkDailyQuestProgress, offerQuestOnTalk, setQuestFlag, describeQuestReward } from "./quests.js";
import { actorAt, spokenLine, isBirthday, playerHasCard, playerHasFish } from "./npcLife.js";
import { tradeBasicCard, addCards } from "./cards.js";
import { catchInsect, ensureDailyInsects, insectSpecies } from "./insectHunt.js";
import { BUG_ARCHETYPE_LINES, BUG_ARCHETYPES } from "./bugCatalog.js";
import { BUG_COMPETITOR_SEATS, competitorsForDay } from "./bugTournament.js";
import { ensureDailyBirds } from "./birdWatching.js";
import { advanceGardenDay, eatFruit, plantSeed, GARDEN_PLOTS, gardenBonus } from "./garden.js";
import {
  startAim,
  useNetAtShore,
  finishCatchSequence,
  resetAction,
} from "./fishingEngine.js";

export function showRPGMessage(msg) {
  currentMessage.set(msg);
}

export function sleep() {
  phase.set(PHASES.FADE);
  isFading.set(true);
  setTimeout(() => {
    inGameMinutes.set(6 * 60);
    day.update((d) => d + 1);
    eveningWarned.set(false);

    let curDay = get(day);
    if (curDay > 15) {
      day.set(1);
      seasonIndex.update((s) => (s + 1) % 4);
    }

    const weathers = ["sunny", "sunny", "rainy", "storm"];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    currentWeather.set(newWeather);
    generateDailyQuest();
    advanceGardenDay();
    birdwatchingLuck.set(0);

    constructions.update((constr) => {
      Object.keys(constr).forEach((key) => {
        let c = constr[key];
        if (c.status === "ordered") c.status = "building";
        else if (c.status === "building") c.status = "built";
      });
      return { ...constr };
    });

    deepSeaFishingActive.set(false);
    currentMap.set("player_house");
    player.set(interiorSpawn("player_house", "up"));
    ensureWorldPopulation();
    ensureDailyInsects();
    ensureDailyBirds();
    phase.set(PHASES.PLAYING);
    isFading.set(false);

    const sIndex = get(seasonIndex);
    const dVal = get(day);
    showRPGMessage(
      `Dia ${dVal} de ${SEASONS[sIndex]} - ${WEATHER_NAMES[newWeather]}.`
    );
    saveGame();
    updateCamera();
  }, 1500);
}

export function forceSleep() {
  phase.set(PHASES.DIALOG);
  currentMessage.set("A noite cai de vez... Você desmaia de exaustão.");
  setTimeout(sleep, 3000);
}

export function startBoatVoyage() {
  if (get(inGameMinutes) >= LAST_DEPARTURE_HOUR * 60) {
    showRPGMessage(`Capitão Thomas: "Já é tarde, o sol se põe às 17h. Zarpamos amanhã, até as ${LAST_DEPARTURE_HOUR}h!"`);
    return;
  }
  phase.set(PHASES.DIALOG);
  currentMessage.set(
    "Capitão Thomas: 'O meu barco aguenta até as correntes de inverno. Vamos para o Norte?' [SPACE] Sim / [X] Não"
  );
  dialogActions.set({
    " ": () => {
      phase.set(PHASES.SAILING);
      currentMessage.set("O barco se afasta do porto...");
      setTimeout(() => {
        deepSeaFishingActive.set(true);
        currentMap.set("deep_sea");
        player.set({ ...DEEP_SEA_SPAWN });
        phase.set(PHASES.PLAYING);
        updateCamera();
        setQuestFlag("sailed_north");
        showRPGMessage(
          "Alto-mar do Norte! Água e gelo aparecem aqui o ano todo. Ande pelo convés e pesque pelos lados."
        );
      }, 2000);
    },
    X: closeDialog,
  });
}

function offerReturnToPort() {
  phase.set(PHASES.DIALOG);
  currentMessage.set("Capitão Thomas: 'Voltamos para o porto?' [SPACE] Sim / [X] Não");
  dialogActions.set({ " ": returnFromDeepSea, X: closeDialog });
}

export function returnFromDeepSea() {
  phase.set(PHASES.SAILING);
  currentMessage.set("O barco volta para o porto...");
  setTimeout(() => {
    deepSeaFishingActive.set(false);
    currentMap.set("village");
    player.set({ ...BOAT_BOARDING });
    phase.set(PHASES.PLAYING);
    updateCamera();
    showRPGMessage("Retornou em segurança às Docas.");
  }, 1500);
}

const WORM_RESERVE = 2;

function addWorms(qty) {
  baitStock.update((stock) => ({ ...stock, minhoca: (stock.minhoca || 0) + qty }));
  ownedBaits.update((list) => (list.includes("minhoca") ? list : [...list, "minhoca"]));
  saveGame();
}

// The box never leaves the player without bait: one daily harvest, plus a
// small reserve whenever the worm stock runs out.
export function harvestWorms() {
  const today = dayKey(get(seasonIndex), get(day));
  if (get(lastWormHarvestDay) !== today) {
    lastWormHarvestDay.set(today);
    const qty = 2 + Math.floor(Math.random() * 3);
    addWorms(qty);
    showRPGMessage(`Você encontrou ${qty} Minhocas na caixa do Velho Joe!`);
  } else if ((get(baitStock).minhoca || 0) === 0) {
    addWorms(WORM_RESERVE);
    showRPGMessage(`Joe deixou ${WORM_RESERVE} Minhocas de reserva para você não ficar sem isca.`);
  } else {
    showRPGMessage("Você já pegou minhocas hoje. Volte quando acabarem.");
  }
}

export function orderConstruction(key) {
  const constr = get(constructions);
  const c = INITIAL_CONSTRUCTIONS[key];
  if (c.required && constr[c.required]?.status !== "built") {
    showRPGMessage(`Construa ${INITIAL_CONSTRUCTIONS[c.required].name} primeiro!`);
    return;
  }
  const curMoney = get(money);
  const cost = friendPrice(c.cost);
  if (curMoney >= cost) {
    money.set(curMoney - cost);
    constr[key].status = "ordered";
    constructions.set({ ...constr });
    saveGame();
    showRPGMessage(
      `Mestre Gino: "Anotado! Começo a obra do ${c.name} amanhã."`
    );
  } else {
    showRPGMessage("Dinheiro insuficiente!");
  }
}

export function buyUpgrade(key) {
  const upObj = get(upgrades);
  const up = upObj[key];
  const curMoney = get(money);
  const cost = friendPrice(up.cost);
  if (!up.bought && curMoney >= cost) {
    money.set(curMoney - cost);
    upObj[key].bought = true;
    upgrades.set({ ...upObj });
    saveGame();
    showRPGMessage(`${up.name} adquirido com sucesso!`);
  } else {
    showRPGMessage("Dinheiro insuficiente ou já adquirido!");
  }
}

export function donateFishToAquarium(index) {
  const inv = get(inventory);
  const fish = inv[index];
  if (!fish || fish.type !== "fish") {
    showRPGMessage("O Aquário só aceita peixes!");
    return;
  }
  aquarium.update((aq) => ({
    ...aq,
    [fish.id]: {
      donated: true,
      name: fish.name,
      sprite: fish.sprite,
      weight: fish.weight,
      stars: fish.stars,
    },
  }));
  inventory.set(inv.filter((_, i) => i !== index));
  const earned = claimCollectionRewards("aquarium");
  saveGame();
  showRPGMessage(`Você doou ${fish.name} ao Aquário!${rewardMessage("aquarium", earned)}`);
}

export function confirmReplaceInventory() {
  const pending = get(inventoryFullPendingFish);
  if (pending) {
    inventory.update((inv) => {
      inv[0] = pending;
      return [...inv];
    });
    inventoryFullPendingFish.set(null);
    const questReward = checkDailyQuestProgress(pending);
    finishCatchSequence(pending, questReward);
  }
}

export function cancelReplaceInventory() {
  inventoryFullPendingFish.set(null);
  resetAction("Peixe devolvido ao rio por falta de espaço.");
}

export function removeFishFromInventory(index) {
  inventory.update((inv) => {
    inv.splice(index, 1);
    return [...inv];
  });
  saveGame();
}

export function releaseInsect(index) {
  insectInventory.update((insects) => insects.filter((_, itemIndex) => itemIndex !== index));
  saveGame();
}

export function selectBackpackItem(index) {
  const selected = get(selectedBackpackIndex);
  if (selected === null) {
    selectedBackpackIndex.set(index);
  } else {
    inventory.update((inv) => {
      const temp = inv[selected];
      inv[selected] = inv[index];
      inv[index] = temp;
      return [...inv];
    });
    selectedBackpackIndex.set(null);
    saveGame();
  }
}

export function sellFish(index) {
  const inv = get(inventory);
  const item = inv[index];
  if (!item) return;
  money.update((m) => m + Math.round(item.priceFinal * (1 + gardenBonus("sale"))));
  inventory.set(inv.filter((_, i) => i !== index));
  saveGame();
}

export function sellAll() {
  const total = get(inventory).reduce((sum, f) => sum + Math.round(f.priceFinal * (1 + gardenBonus("sale"))), 0);
  money.update((m) => m + total);
  inventory.set([]);
  saveGame();
}

export function buyItem(item, type) {
  const curMoney = get(money);
  if (curMoney >= item.price) {
    money.set(curMoney - item.price);
    if (type === "rod") {
      ownedRods.update((r) => [...r, item.id]);
      eqRodId.set(item.id);
    } else if (type === "net") {
      ownedNets.update((n) => [...n, item.id]);
      eqNetId.set(item.id);
    } else if (type === "bait") {
      ownedBaits.update((b) => [...b, item.id]);
      baitStock.update((stock) => {
        stock[item.id] = (stock[item.id] || 0) + 5;
        return { ...stock };
      });
      eqBaitId.set(item.id);
    }
    saveGame();
    showRPGMessage(`Adquirido: ${item.name}!`);
  }
}

export function equipItem(id, type) {
  if (type === "rod") eqRodId.set(id);
  if (type === "net") eqNetId.set(id);
  if (type === "bait") eqBaitId.set(id);
  if (type === "seed") eqSeedId.set(id);
  saveGame();
}

export function equipTool(id, type) {
  currentToolType.set(type);
  equipItem(id, type);
}

export function toggleTool() {
  currentToolType.update((t) => (t === "rod" ? "net" : "rod"));
}

function closeDialog() {
  phase.set(PHASES.PLAYING);
  showRPGMessage("Setas para andar. [ENTER] para o Menu.");
}

function openKitchen() {
  phase.set(PHASES.DIALOG);
  currentMessage.set("Ana: \"O que vai ser hoje?\"");
  dialogActions.set({ X: closeKitchen, ESCAPE: closeKitchen });
  showKitchenModal.set(true);
}

export function closeKitchen() {
  showKitchenModal.set(false);
  saveGame();
  closeDialog();
}

function openNpcDialog(npc, atTavern) {
  talkTo(npc.id);
  saveGame();
  phase.set(PHASES.DIALOG);

  const legendToday = npc.cardTheme?.startsWith("lendas_") && isCardEventDay(get(day));
  if (legendToday) setQuestFlag("met_legend");

  let line = spokenLine(npc, atTavern);
  if (!line) line = atTavern ? npc.dialogTavern : friendLine(npc);
  if (isBirthday(npc)) {
    line = `${line} Pode me dar um presente se quiser.`;
  }
  if (npc.id === "veteran" && hasPerk("veteran")) {
    const tip = captainTip();
    if (tip) line = `${line} ${tip}`;
  }

  const actions = { " ": closeDialog };
  const options = ["[SPACE] Tchau"];

  const quest = offerQuestOnTalk(npc.id);
  if (quest?.met) {
    line = `${quest.stage.title}: "Era isso que eu precisava!" Você recebeu ${describeQuestReward(quest.stage.reward)}.${quest.next ? ` Agora: ${quest.next.hint}` : " Missão concluída."}`;
    currentMessage.set(`${npc.name} ${heartsText(npc.id)}: "${line}" [SPACE] Tchau`);
    dialogActions.set({ " ": closeDialog });
    saveGame();
    return;
  }

  if (npc.id === "card_seller") {
    const championshipOpen = get(day) === CARD_CHAMPIONSHIP_DAY;
    const eventOpen = isCardEventDay(get(day));
    line = get(cardTradeUsed) || get(cardDecks).length
      ? `Decks tematicos por 4000. Cartas avulsas so de pokemon basico.${championshipOpen ? " O campeonato esta aberto!" : eventOpen ? " Hoje a casa encheu: tem lenda nas mesas." : ""}`
      : get(gameMode) === "pokemon"
        ? "Eu sempre quis um dragao. Troco um Dratini pelo seu primeiro deck, ou vendo um por 4000."
        : "Eu sempre quis uma Tilapia Dourada. Troco uma pelo seu primeiro deck, ou vendo um por 4000.";
    options.push("[C] Comprar cartas");
    actions.C = () => phase.set(PHASES.CARD_SHOP);
    if (championshipOpen) {
      options.push("[T] Campeonato");
      actions.T = () => {
        const opponents = cardPlayersForDay(get(day), get(seasonIndex));
        cardChampionship.update((state) => {
          const key = `${get(seasonIndex)}:${get(day)}`;
          return state.dayKey === key ? state : { dayKey: key, wins: 0, claimed: false, opponents };
        });
        cardOpponent.set({
          id: "championship",
          name: "Campeonato das Cartas",
          cardTheme: opponents[get(cardChampionship).wins] || opponents[0],
          championship: true,
          opponents,
        });
        phase.set(PHASES.CARD_DUEL);
      };
    }
  }
  if (npc.cardTheme && !atTavern) {
    line = legendToday
      ? `${line} Sou uma lenda deste salão. Pode duelar, mas minhas cartas lendárias não saem daqui.`
      : `${line} Quer duelar?`;
    options[0] = "[SPACE] Sim";
    options.push("[X] Nao");
    actions[" "] = () => {
      cardOpponent.set({ ...npc, isLegend: legendToday });
      phase.set(PHASES.CARD_DUEL);
    };
    actions.X = closeDialog;
  }

  if (npc.role === "shop_visitor") {
    options.push("[T] Trocar carta");
    actions.T = () => {
      if (!playerHasCard(npc.wantCard)) {
        currentMessage.set(`${npc.name}: "Ainda não tem ${npc.wantName}? Volte quando tiver."`);
        dialogActions.set({ " ": closeDialog });
        return;
      }
      const result = tradeBasicCard(npc.wantCard, npc.offerCard);
      saveGame();
      currentMessage.set(`${npc.name}: "${result.message}"`);
      dialogActions.set({ " ": closeDialog });
    };
    const fishIndex = playerHasFish(npc.wantFish);
    if (fishIndex >= 0) {
      options.push("[P] Peixe por carta");
      actions.P = () => {
        inventory.update((items) => items.filter((_, index) => index !== fishIndex));
        addCards([npc.offerCard]);
        saveGame();
        currentMessage.set(`${npc.name}: "Esse ${npc.wantFish} é raro! Fica com ${npc.offerName}."`);
        dialogActions.set({ " ": closeDialog });
      };
    }
  }

  const giftIndex = pickGift(npc);
  if (giftIndex >= 0 && canGiftToday(npc.id) && giftIndex !== undefined) {
    const loved = (npc.likes || []).includes(get(inventory)[giftIndex]?.id);
    if (npc.dislikes?.includes(get(inventory)[giftIndex]?.id)) {
      /* skip disliked automatic gift */
    } else {
      options.push(`[G] Dar ${get(inventory)[giftIndex].name}`);
      actions.G = () => {
        const result = giveGift(npc, giftIndex);
        saveGame();
        if (!result) {
          currentMessage.set(`${npc.name}: "Isso eu não quero."`);
          dialogActions.set({ " ": closeDialog });
          return;
        }
        const reaction = result.loved
          ? `${npc.name}: "Uau, ${result.fish.name}! ${loved ? "Era exatamente o que eu queria!" : `Eu adoro ${tasteLabel(npc)}!`}"`
          : `${npc.name}: "Obrigado pelo ${result.fish.name}!"`;
        const perk = result.unlockedPerk ? ` ${PERK_MESSAGES[npc.id] || "Sua amizade floresceu!"}` : "";
        const extra = result.present ? " Trouxe um presente em troca!" : "";
        currentMessage.set(`${reaction} ${heartsText(npc.id)}${perk}${result.seed ? ` Presente: ${result.seed.seedName}!` : ""}${extra}`);
        dialogActions.set({ " ": closeDialog });
      };
    }
  }

  if (npc.id === "old_joe" && hasPerk("old_joe")) {
    options.push("[J] A lenda");
    actions.J = openJoeQuest;
  }

  currentMessage.set(`${npc.name} ${heartsText(npc.id)}: "${line}" ${options.join(" / ")}`);
  dialogActions.set(actions);
}

const PERK_MESSAGES = {
  veteran: "🎉 Thomas agora te dá dicas de peixes raros do mar!",
  carpenter: "🎉 Gino agora dá 10% de desconto na oficina!",
  anna: "🎉 Ana agora cozinha seus pratos pela metade do preço!",
  old_joe: "🎉 Joe quer te contar a lenda do Rei do Rio! Fale com ele de novo.",
};

function openBugTournamentDialog() {
  const captured = get(insectInventory);
  phase.set(PHASES.DIALOG);
  if (captured.length < 3) {
    currentMessage.set('Joe Bug: "Procure pelo menos 3 insetos para o campeonato."');
    dialogActions.set({ " ": closeDialog });
    return;
  }

  const names = captured.map((bug) => bug.name).join(", ");
  currentMessage.set(`Joe Bug: "Deseja participar do campeonato com os insetos: ${names}?" [SPACE] Sim / [X] Não`);
  dialogActions.set({
    " ": () => {
      showBugTournament.set(true);
      phase.set(PHASES.BUG_TOURNAMENT);
      showRPGMessage("");
    },
    X: closeDialog,
  });
}

export function bugCompetitorAt(x, y) {
  if (get(currentMap) !== "bug_forest") return null;
  return competitorsForDay(get(seasonIndex), get(day), get(gameMode)).find((competitor, index) => {
    const seat = BUG_COMPETITOR_SEATS[index];
    return seat.x === x && seat.y === y;
  }) || null;
}

function openTournamentStall() {
  const { name, rule, entry, rivals } = todaysTournament();
  phase.set(PHASES.DIALOG);

  if (entry.submitted) {
    const prizeText = entry.prize > 0 ? ` Prêmio: ¥${entry.prize}.` : "";
    currentMessage.set(`${name} encerrado: você ficou em ${entry.place}º lugar.${prizeText}`);
    dialogActions.set({ " ": closeDialog });
    return;
  }

  const leader = [...rivals].sort((a, b) => b.score - a.score)[0];
  const leaderText = `Líder: ${leader.name} (${formatScore(rule, leader.score)}).`;
  const closed = get(inGameMinutes) >= TOURNAMENT_CLOSE_MINUTES;

  if (!entry.best) {
    currentMessage.set(
      closed
        ? `${name}: as capturas fecharam às 17h e você não trouxe nada. ${leaderText}`
        : `${name}! Traga ${rule.goal} até as 17h. ${leaderText}`
    );
    dialogActions.set({ " ": closeDialog });
    return;
  }

  const bestText = `Seu melhor: ${entry.best.name} (${formatScore(rule, entry.best.score)}).`;
  currentMessage.set(
    `${name}: ${bestText} ${leaderText} [SPACE] Entregar / [X] ${closed ? "Depois" : "Continuar pescando"}`
  );
  dialogActions.set({
    " ": () => {
      const result = submitTournament();
      saveGame();
      currentMessage.set(
        result.prize > 0
          ? `🏆 Você ficou em ${result.place}º lugar e ganhou ¥${result.prize}!${result.seed ? ` Presente: ${result.seed.seedName}.` : ""}`
          : `Você ficou em ${result.place}º lugar. Fica para o próximo festival!`
      );
      dialogActions.set({ " ": closeDialog });
    },
    X: closeDialog,
  });
}

export function interact() {
  if (get(phase) !== PHASES.PLAYING) return;
  if (isWalking()) {
    afterCurrentStep(() => interact());
    return;
  }

  const target = getTileInFront();
  const mins = get(inGameMinutes);
  const curDay = get(day);
  const cMap = get(currentMap);

  if (cMap === "bug_forest" && GARDEN_PLOTS.some((plot) => plot.x === target.x && plot.y === target.y)) {
    const result = eatFruit(target.x, target.y) || plantSeed(target.x, target.y);
    showRPGMessage(result.message);
    if (result.ok) saveGame();
    return;
  }

  const found = actorAt(cMap, target.x, target.y, mins, curDay, get(seasonIndex), get(gameMode), get(villagers));
  const clickedNpc = found?.npc;

  const bugCompetitor = bugCompetitorAt(target.x, target.y);
  if (bugCompetitor) {
    if (bugCompetitor.id === "joe_bug") openBugTournamentDialog();
    else {
      phase.set(PHASES.DIALOG);
      currentMessage.set(`${bugCompetitor.name} (${bugCompetitor.persona}): "${bugCompetitor.dialogue}" [SPACE] Tchau`);
      dialogActions.set({ " ": closeDialog });
    }
    return;
  }

  if (cMap === "bug_forest") {
    const droppedFeather = get(forestFeathers).find((feather) => feather.x === target.x && feather.y === target.y);
    if (droppedFeather) {
      if (get(inventory).length >= get(maxInventorySize)) {
        showRPGMessage("A mochila está cheia. Venda ou descarte algo para guardar a pena.");
        return;
      }
      inventory.update((items) => [...items, droppedFeather.item]);
      forestFeathers.update((list) => list.filter((feather) => feather.id !== droppedFeather.id));
      saveGame();
      showRPGMessage(`Você guardou ${droppedFeather.item.name} na mochila.`);
      return;
    }
    const wildBug = get(wildInsects).find((insect) => insect.x === target.x && insect.y === target.y);
    if (wildBug) {
      const species = insectSpecies(wildBug);
      const profile = BUG_ARCHETYPES[species.archetypeId];
      phase.set(PHASES.DIALOG);
      currentMessage.set(`${species.emoji} ${species.name}. ${profile.name}: ${BUG_ARCHETYPE_LINES[species.archetypeId]} [SPACE] Adicionar à mochila / [X] Deixar na floresta`);
      dialogActions.set({
        " ": () => {
          const captured = catchInsect(wildBug.id);
          if (!captured) {
            currentMessage.set("Sua mochila está cheia de insetos. Solte um para capturar outro. [SPACE] Voltar");
            dialogActions.set({ " ": closeDialog });
            return;
          }
          if (captured) saveGame();
          closeDialog();
          showRPGMessage(`${captured.name} agora está na sua mochila.`);
        },
        X: closeDialog,
      });
      return;
    }
  }

  if (clickedNpc) {
    const loc = getNpcLocation(clickedNpc, mins, curDay, get(seasonIndex));
    openNpcDialog(clickedNpc, loc.map === "tavern");
    return;
  }

  const constr = get(constructions);
  if (cMap === "village" && constr.boat.status === "built" && inBounds(target.x, target.y, BOAT_BOUNDS)) {
    startBoatVoyage();
    return;
  }

  if (cMap === "deep_sea" && target.x === DEEP_SEA_CAPTAIN.x && target.y === DEEP_SEA_CAPTAIN.y) {
    offerReturnToPort();
    return;
  }

  if (target.tile === "Z") {
    if (constr.aquarium_building.status === "built") {
      showAquariumModal.set(true);
    } else {
      showRPGMessage("O terreno do aquário municipal ainda está vazio.");
    }
    return;
  }

  const festival = get(currentFestival);
  if (
    cMap === "village" &&
    festival &&
    target.x === FESTIVAL_STALL.x &&
    target.y === FESTIVAL_STALL.y
  ) {
    if (todaysTournament()) {
      openTournamentStall();
      return;
    }
    const claimKey = dayKey(get(seasonIndex), curDay);
    phase.set(PHASES.DIALOG);
    if (get(lastFestivalClaim) !== claimKey) {
      lastFestivalClaim.set(claimKey);
      money.update((m) => m + 200);
      saveGame();
      currentMessage.set(`${festival}! A barraca entrega ¥200 de brinde.`);
    } else {
      currentMessage.set(`${festival}. A praça já te presenteou hoje.`);
    }
    dialogActions.set({
      " ": () => {
        phase.set(PHASES.PLAYING);
        showRPGMessage("Setas para andar. [ENTER] para o Menu.");
      },
    });
    return;
  }

  if (cMap === "village" && target.tile === "X" && canWalkOn("X", target.x, target.y, constr)) return;

  if (["~", "S", "X", "O"].includes(target.tile)) {
    if (get(deepSeaFishingActive)) {
      if (get(currentToolType) === "net") {
        currentToolType.set("rod");
        showRPGMessage("A rede não alcança o fundo do alto-mar. Você pegou a vara.");
      }
      startAim();
      return;
    }
    const tool = get(currentToolData);
    if (!tool) {
      showRPGMessage("Você não tem nenhum equipamento ativo!");
      return;
    }

    const toolType = get(currentToolType);
    if (toolType === "net") {
      if (target.tile === "X") {
        showRPGMessage("A rede só funciona na Área Rasa ou beiradas!");
        return;
      }
      useNetAtShore(target.tile === "~" ? "river" : "sea");
      return;
    }

    fishingBiome.set(
      target.tile === "X" || (cMap === "village" && target.y >= 16)
        ? "sea"
        : "river"
    );
    startAim();
  } else if (target.tile === "C") {
    if (cMap === "shop_gear") {
      phase.set(PHASES.SHOP);
      shopTab.set("buy_rod");
    } else if (cMap === "shop_bait") {
      phase.set(PHASES.SHOP);
      shopTab.set("buy_bait");
    } else if (cMap === "carpenter_shop") {
      phase.set(PHASES.CARPENTER);
    } else if (cMap === "game_house") {
      phase.set(PHASES.CARD_SHOP);
    } else if (cMap === "tavern") {
      openKitchen();
    }
  } else if (target.tile === "Q") {
    showTavernQuestModal.set(true);
  } else if (target.tile === "A") {
    showCalendarModal.set(true);
  } else if (target.tile === "M") {
    harvestWorms();
  } else if (target.tile === "U") {
    showRPGMessage("Tábuas e madeira de lei.");
  } else if (target.tile === "N" && cMap === "bug_forest") {
    ensureDailyBirds();
    phase.set(PHASES.DIALOG);
    currentMessage.set('Deseja observar os pássaros? [SPACE] Sim / [X] Não');
    dialogActions.set({
      " ": () => {
        currentMessage.set("");
        dialogActions.set(null);
        showBirdWatching.set(true);
        phase.set(PHASES.BIRD_WATCHING);
      },
      X: closeDialog,
    });
  } else if (target.tile === "_") {
    if (cMap === "player_house") {
      phase.set(PHASES.DIALOG);
      currentMessage.set(
        "Deseja terminar o dia e ir dormir? [SPACE] Sim / [X] Não"
      );
      dialogActions.set({
        " ": sleep,
        X: () => {
          phase.set(PHASES.PLAYING);
          showRPGMessage("");
        },
      });
    } else {
      showRPGMessage("Uma cama confortável...");
    }
  } else {
    showRPGMessage("Não há nada aqui.");
  }
}
