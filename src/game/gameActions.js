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
} from "./stores.js";
import {
  SEASONS,
  WEATHER_NAMES,
  FESTIVAL_STALL,
  BOAT_BOUNDS,
  inBounds,
  getNpcLocation,
  TOURNAMENT_CLOSE_MINUTES,
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
} from "./movement.js";
import { saveGame } from "./saveSystem.js";
import { ensureWorldPopulation } from "./worldCreatures.js";
import { generateDailyQuest, checkDailyQuestProgress } from "./quests.js";
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

    constructions.update((constr) => {
      Object.keys(constr).forEach((key) => {
        let c = constr[key];
        if (c.status === "ordered") c.status = "building";
        else if (c.status === "building") c.status = "built";
      });
      return { ...constr };
    });

    currentMap.set("player_house");
    player.set(interiorSpawn("player_house", "up"));
    ensureWorldPopulation();
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
  phase.set(PHASES.DIALOG);
  currentMessage.set(
    "Capitão Thomas: 'Quer zarpar para o alto-mar?' [SPACE] Sim / [X] Não"
  );
  dialogActions.set({
    " ": () => {
      phase.set(PHASES.SAILING);
      currentMessage.set("O barco se afasta do porto...");
      setTimeout(() => {
        deepSeaFishingActive.set(true);
        phase.set(PHASES.PLAYING);
        player.set({ x: 19, y: 20, dir: "down" });
        updateCamera();
        showRPGMessage(
          "Você chegou ao Alto-Mar! Águas profundas e perigosas."
        );
      }, 2000);
    },
    X: () => {
      phase.set(PHASES.PLAYING);
      showRPGMessage("");
    },
  });
}

export function returnFromDeepSea() {
  phase.set(PHASES.SAILING);
  setTimeout(() => {
    deepSeaFishingActive.set(false);
    phase.set(PHASES.PLAYING);
    player.set({ x: 19, y: 16, dir: "up" });
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
  const c = constr[key];
  if (c.required && constr[c.required].status !== "built") {
    showRPGMessage(`Construa ${constr[c.required].name} primeiro!`);
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
      `Mestre Gema: "Anotado! Começo a obra do ${c.name} amanhã."`
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
    checkDailyQuestProgress(pending);
    finishCatchSequence(pending);
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
  money.update((m) => m + item.priceFinal);
  inventory.set(inv.filter((_, i) => i !== index));
  saveGame();
}

export function sellAll() {
  const total = get(inventory).reduce((sum, f) => sum + f.priceFinal, 0);
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

  let line = atTavern ? npc.dialogTavern : friendLine(npc);
  if (npc.id === "veteran" && hasPerk("veteran")) {
    const tip = captainTip();
    if (tip) line = `${line} ${tip}`;
  }

  const actions = { " ": closeDialog };
  const options = ["[SPACE] Tchau"];

  const giftIndex = pickGift(npc);
  if (giftIndex >= 0 && canGiftToday(npc.id)) {
    options.push(`[G] Dar ${get(inventory)[giftIndex].name}`);
    actions.G = () => {
      const result = giveGift(npc, giftIndex);
      saveGame();
      const reaction = result.loved
        ? `${npc.name}: "Uau, ${result.fish.name}! Eu adoro ${tasteLabel(npc)}!"`
        : `${npc.name}: "Obrigado pelo ${result.fish.name}!"`;
      const perk = result.unlockedPerk ? ` ${PERK_MESSAGES[npc.id]}` : "";
      currentMessage.set(`${reaction} ${heartsText(npc.id)}${perk}`);
      dialogActions.set({ " ": closeDialog });
    };
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
  carpenter: "🎉 Gema agora dá 10% de desconto na oficina!",
  anna: "🎉 Ana agora cozinha seus pratos pela metade do preço!",
  old_joe: "🎉 Joe quer te contar a lenda do Rei do Rio! Fale com ele de novo.",
};

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
          ? `🏆 Você ficou em ${result.place}º lugar e ganhou ¥${result.prize}!`
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

  const clickedNpc = get(villagers).find((n) => {
    const loc = getNpcLocation(n, mins, curDay);
    return loc.map === cMap && loc.x === target.x && loc.y === target.y;
  });

  if (clickedNpc) {
    const loc = getNpcLocation(clickedNpc, mins, curDay);
    openNpcDialog(clickedNpc, loc.map === "tavern");
    return;
  }

  const constr = get(constructions);
  if (constr.boat.status === "built" && inBounds(target.x, target.y, BOAT_BOUNDS)) {
    startBoatVoyage();
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

  if (["~", "S", "X", "O"].includes(target.tile)) {
    if (get(deepSeaFishingActive)) {
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
