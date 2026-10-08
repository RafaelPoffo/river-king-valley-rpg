<script>
  import { onDestroy } from "svelte";
  import { phase, gameMode, money, inventory, cardCollection, cardDecks, cardTradeUsed, cardVictories, cardOpponent, cardChampionship, gardenDay, day, seasonIndex } from "../game/stores.js";
  import { PHASES } from "../game/phases.js";
  import {
    ALL_CARDS, CARD_THEMES, DECK_SIZE, DECK_PRICE, BASIC_SHOP_CARDS,
    cardName, kindLabel, themeDeck, themeById, isBasicMonster,
  } from "../game/cardCatalog.js";
  import { buyDeck, buySingleCard, saveDeck, validateDeck, grantChampionshipPrize } from "../game/cards.js";
  import { createCardDuel, cardStats, performCardAction, nextCardAIAction, resolveCardTrap, canAttack, effectNeedsTarget } from "../game/cardGame.js";
  import { saveGame } from "../game/saveSystem.js";
  import { setQuestFlag } from "../game/quests.js";
  import CardFace from "./CardFace.svelte";

  let message = "";
  let filter = "";
  let themeFilter = "all";
  let editingId = null;
  let editingName = "";
  let draft = [];
  let duel = null;
  let inspectCard = null;
  let inspectOwner = null;
  let selected = null;
  let source = null;
  let selectedIndex = null;
  let attacker = null;
  let targeting = null;
  let summonPos = "atk";
  let aiTimer = null;
  let attackAnimation = null;
  let animationTimer = null;
  let surrender = false;
  let rewardHandled = false;
  let rewardText = "";

  $: shop = $phase === PHASES.CARD_SHOP;
  $: choosing = $phase === PHASES.CARD_DUEL && !duel;
  $: ownedCards = ALL_CARDS.filter((card) => ($cardCollection[card.id] || 0) > 0);
  $: visibleCards = (shop ? BASIC_SHOP_CARDS : ownedCards).filter((card) => (themeFilter === "all" || (themeFilter === "rare" ? card.rarity === "rare" : themeFilter === "basico" ? isBasicMonster(card) : card.themeId === themeFilter)) && cardName(card, $gameMode).toLowerCase().includes(filter.toLowerCase()));
  $: tradeFish = $gameMode === "pokemon" ? "dratini" : "tilapia_dourada";
  $: canTrade = !$cardTradeUsed && !$cardDecks.length && $inventory.some((fish) => fish.id === tradeFish);
  $: inspectStats = inspectCard?.type === "monster" && duel ? cardStats(inspectCard, inspectOwner === "p2" ? duel.p2 : duel?.p1 || { field: null }) : null;
  $: selectedStats = selected?.type === "monster" ? cardStats(selected, duel?.p1 || { field: null }) : null;
  $: evolutionTargetIndex = selected?.evolvesFrom ? duel?.p1.monsters.findIndex((card) => card?.dexId === selected.evolvesFrom) ?? -1 : -1;
  $: editingDeck = $cardDecks.find((deck) => deck.id === editingId);
  $: if (duel?.turn === "p2" && !duel.winner && ["main", "battle"].includes(duel.state) && !aiTimer) scheduleAI();
  $: if (duel?.winner && !rewardHandled) claimVictory();

  function finishAction(result) {
    message = result.message;
    if (result.ok) saveGame();
  }

  function close() {
    if (duel && !duel.winner) { surrender = true; return; }
    phase.set(PHASES.PLAYING);
  }

  function startEditing(deck) {
    editingId = deck.id; editingName = deck.name; draft = [...deck.cards]; message = "";
  }

  function changeCount(id, delta) {
    const card = ALL_CARDS.find((item) => item.id === id);
    if (!isBasicMonster(card)) { message = "So pokemon basicos podem ser trocados no deck."; return; }
    if (delta > 0) {
      if (draft.length >= DECK_SIZE || draft.filter((cardId) => cardId === id).length >= ($cardCollection[id] || 0)) return;
      draft = [...draft, id];
    } else {
      const index = draft.lastIndexOf(id);
      if (index >= 0) draft = draft.filter((_, cardIndex) => cardIndex !== index);
    }
  }

  function currentOpponentTheme() {
    if ($cardOpponent?.championship) {
      return $cardChampionship.opponents[$cardChampionship.wins] || $cardOpponent.cardTheme;
    }
    return $cardOpponent.cardTheme;
  }

  function beginDuel(deck) {
    if (!$cardOpponent || !validateDeck(deck.cards)) { message = "Escolha um deck valido."; return; }
    const theme = currentOpponentTheme();
    duel = createCardDuel(deck.cards, themeDeck(theme), Math.random, $gameMode);
    selected = null; source = null; attacker = null; targeting = null;
    inspectCard = null; inspectOwner = null;
    rewardHandled = false; rewardText = ""; message = "";
  }

  function scheduleAI() {
    aiTimer = window.setTimeout(() => {
      aiTimer = null;
      if (!duel || duel.winner || duel.turn !== "p2" || $phase !== PHASES.CARD_DUEL) return;
      const action = nextCardAIAction(duel);
      if (!action) return;
      const result = performCardAction(duel, "p2", action);
      if (action.type === "attack") animateAttack("p2", action.index, action.target);
      if (!result.ok) { message = result.message; performCardAction(duel, "p2", { type: "end" }); }
      duel = { ...duel };
    }, 700);
  }

  function claimVictory() {
    rewardHandled = true;
    if (duel.winner !== "p1") return;
    if ($cardOpponent?.championship) {
      const nextWins = $cardChampionship.wins + 1;
      const total = $cardChampionship.opponents.length;
      cardChampionship.update((state) => ({ ...state, wins: nextWins }));
      const beaten = $cardChampionship.opponents[nextWins - 1];
      if (beaten === "lendas_gelo") setQuestFlag("beat_ice_legend");
      if (beaten === "lendas_fogo") setQuestFlag("beat_fire_legend");
      if (beaten === "lendas_raio") setQuestFlag("beat_thunder_legend");
      if (beaten === "lendas_mistico") setQuestFlag("beat_mystic_legend");
      if (nextWins >= total && !$cardChampionship.claimed) {
        const prize = grantChampionshipPrize();
        cardChampionship.update((state) => ({ ...state, claimed: true }));
        rewardText = `Campeao! Premio: ${prize.map((card) => cardName(card, $gameMode)).join(", ")} e ¥1000.`;
      } else {
        rewardText = `Vitoria ${nextWins}/${total}. Prepare-se para o proximo.`;
      }
      saveGame();
      return;
    }
    const key = `${$gardenDay}:${$cardOpponent.id}`;
    if ($cardVictories.includes(key)) { rewardText = "Voce ja recebeu o premio deste rival hoje."; return; }
    money.update((amount) => amount + 600);
    cardVictories.update((keys) => [...keys, key]);
    const theme = $cardOpponent?.cardTheme;
    if ($cardOpponent?.isLegend || theme?.startsWith("lendas_")) {
      if (theme === "lendas_gelo") setQuestFlag("beat_ice_legend");
      if (theme === "lendas_fogo") setQuestFlag("beat_fire_legend");
      if (theme === "lendas_raio") setQuestFlag("beat_thunder_legend");
      if (theme === "lendas_mistico") setQuestFlag("beat_mystic_legend");
      rewardText = "Vitoria contra uma lenda. 600. As cartas lendarias dele nao saem do baralho.";
    } else {
      rewardText = "Premio recebido: 600.";
    }
    saveGame();
  }

  function continueChampionship(deck) {
    rewardHandled = false;
    rewardText = "";
    beginDuel(deck);
  }

  function animateAttack(owner, index, target) {
    const from = owner === "p1" ? -28 : 28;
    const toward = target === "direct" ? from * 1.4 : from;
    attackAnimation = { owner, index, lift: from, shift: toward };
    if (animationTimer) window.clearTimeout(animationTimer);
    animationTimer = window.setTimeout(() => { attackAnimation = null; }, 520);
  }

  function act(action) {
    if (!duel || duel.turn !== "p1" || duel.winner) return;
    const result = performCardAction(duel, "p1", action);
    message = result.ok ? "" : result.message;
    if (result.ok) { selected = null; source = null; selectedIndex = null; targeting = null; attacker = null; }
    if (result.ok && action.type === "attack") animateAttack("p1", action.index, action.target);
    duel = { ...duel };
  }

  function inspect(card, owner = "p1") {
    if (!card) return;
    inspectCard = card;
    inspectOwner = owner;
  }

  function chooseHand(card) {
    if (duel.turn !== "p1" || !["main", "battle"].includes(duel.state)) return;
    selected = card; source = "hand"; targeting = null; attacker = null;
    inspect(card, "p1");
  }

  function chooseMonster(index) {
    if (duel.turn !== "p1") return;
    const card = duel.p1.monsters[index];
    if (targeting === "summon") { act({ type: "summon", uid: selected.uid, pos: summonPos, target: index }); return; }
    if (targeting === "ally" || targeting === "equip") { act({ type: "activate", uid: selected.uid, target: index, side: "self" }); return; }
    if (!card) return;
    selected = card; source = "monster"; selectedIndex = index;
    inspect(card, "p1");
    attacker = duel.state === "battle" && canAttack(card) ? index : null;
  }

  function chooseEnemy(index) {
    if (targeting === "enemy") { act({ type: "activate", uid: selected.uid, target: index, side: "enemy" }); return; }
    if (attacker !== null) act({ type: "attack", index: attacker, target: index });
  }

  function summon(pos) {
    summonPos = pos;
    if (selected.isBoss || duel.p1.monsters.every(Boolean)) {
      targeting = "summon";
      message = selected.isBoss ? "Escolha um aliado para sacrificar." : "Escolha um aliado para substituir.";
    } else act({ type: "summon", uid: selected.uid, pos });
  }

  function activate() {
    if (effectNeedsTarget(selected.effect)) {
      targeting = selected.effect.startsWith("equip_") || ["boost_atk", "guard", "flip_pos"].includes(selected.effect) ? "ally" : "enemy";
      message = "Escolha o alvo da carta.";
    } else act({ type: "activate", uid: selected.uid });
  }

  function answerTrap(use) {
    resolveCardTrap(duel, use); selected = null; attacker = null; duel = { ...duel };
  }

  function confirmSurrender() {
    performCardAction(duel, "p1", { type: "surrender" }); duel = { ...duel }; surrender = false;
  }

  function attackStyle(owner, index) {
    if (attackAnimation?.owner !== owner || attackAnimation?.index !== index) return "";
    return `--lift:${attackAnimation.lift}px`;
  }

  onDestroy(() => {
    if (aiTimer) window.clearTimeout(aiTimer);
    if (animationTimer) window.clearTimeout(animationTimer);
  });
</script>

<div class="absolute inset-0 z-[150] flex flex-col border-4 border-[#243c35] bg-[#eef3e9] text-[#182d26]" role="dialog" aria-modal="true" aria-label={shop ? "Loja de cartas" : choosing ? "Escolher deck" : duel ? "Duelo de cartas" : "Colecao de cartas"}>
  <header class="flex h-11 shrink-0 items-center justify-between border-b-4 border-[#243c35] bg-[#9ce6e6] px-3">
    <h2 class="font-bold">{shop ? "Ivo · Casa dos Jogos" : choosing ? `Duelo com ${$cardOpponent?.name}` : duel ? "Mestres das Cartas" : "Cartas e Decks"}</h2>
    <div class="flex items-center gap-3"><span class="text-xs">¥{$money}</span><button class="h-7 w-7 border-2 border-black bg-white font-bold" aria-label="Fechar cartas" title="Fechar" on:click={close}>×</button></div>
  </header>

  {#if !duel}
    {#if shop}
      <div class="shrink-0 border-b border-[#9bb3a4] bg-white px-3 py-3">
        <p class="text-sm">{!$cardTradeUsed && !$cardDecks.length ? $gameMode === "pokemon" ? 'Ivo: "Eu sempre quis um dragao."' : 'Ivo: "Eu sempre quis uma Tilapia Dourada."' : 'Ivo: "Decks por 4000. Avulsas so pokemon basico."'}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          {#each CARD_THEMES as theme}
            <button class="command" disabled={$money < DECK_PRICE || $cardDecks.some((deck) => deck.themeId === theme.id)} on:click={() => finishAction(buyDeck(false, theme.id))}>{theme.name} · {DECK_PRICE}</button>
          {/each}
          {#if !$cardTradeUsed && !$cardDecks.length}<button class="command" disabled={!canTrade} on:click={() => finishAction(buyDeck(true))}>{$gameMode === "pokemon" ? "Trocar Dratini" : "Trocar Tilapia Dourada"}</button>{/if}
        </div>
      </div>
    {/if}

    {#if choosing}
      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {#if $cardOpponent?.championship}<p class="text-sm">Campeonato · luta {$cardChampionship.wins + 1} de {$cardChampionship.opponents.length}</p>{/if}
        {#each $cardDecks as deck}<button class="deck-row" disabled={!validateDeck(deck.cards)} on:click={() => beginDuel(deck)}><strong>{deck.name}</strong><span>{deck.cards.length}/{DECK_SIZE} cartas · Duelar →</span></button>{/each}
        {#if !$cardDecks.length}<p class="text-sm">Voce ainda nao tem um deck. Ivo vende decks no balcao.</p>{/if}
      </div>
    {:else}
      {#if !shop}
        <div class="flex shrink-0 gap-2 overflow-x-auto border-b border-[#9bb3a4] p-2">
          {#each $cardDecks as deck}<button class="command whitespace-nowrap" class:chosen={editingId === deck.id} on:click={() => startEditing(deck)}>{deck.name}</button>{/each}
          {#if !$cardDecks.length}<p class="px-2 text-sm">Nenhum deck adquirido.</p>{/if}
        </div>
        {#if editingId}<div class="flex shrink-0 items-center gap-2 border-b border-[#9bb3a4] p-2"><input aria-label="Nome do deck" maxlength="30" class="min-w-0 flex-1 border-2 border-[#53756a] bg-white px-2 py-1 text-sm" bind:value={editingName} /><strong>{draft.length}/{DECK_SIZE}</strong><button class="command" disabled={!validateDeck(draft, $cardCollection, editingDeck?.cards)} on:click={() => finishAction(saveDeck(editingId, draft, editingName))}>Salvar</button></div>
          <p class="shrink-0 px-3 py-1 text-[11px]">So pokemon basicos (sem evolucao e sem pre-evolucao) podem ser trocados.</p>
        {/if}
      {/if}
      <div class="flex shrink-0 gap-2 border-b border-[#9bb3a4] p-2">
        <input aria-label="Buscar cartas" placeholder="Buscar carta" class="min-w-0 flex-1 border border-[#53756a] bg-white px-2 py-1 text-sm" bind:value={filter} />
        <select aria-label="Filtrar cartas por deck" class="max-w-[190px] border border-[#53756a] bg-white px-2 text-xs" bind:value={themeFilter}><option value="all">Todos os temas</option><option value="basico">Basicos</option><option value="rare">Raras</option>{#each CARD_THEMES as theme}<option value={theme.id}>{theme.name}</option>{/each}</select>
      </div>
      <div class="card-grid min-h-0 flex-1 overflow-y-auto p-3">
        {#each visibleCards as card}
          <div class="flex flex-col items-center gap-2">
            <CardFace {card} mode={$gameMode} />
            {#if shop}<button class="command text-[10px]" disabled={$money < (card.price || 500)} on:click={() => finishAction(buySingleCard(card.id))}>¥{card.price || 500}</button>
            {:else if editingId}
              <div class="flex items-center gap-1">
                <button class="count-button" aria-label={`Remover ${cardName(card, $gameMode)}`} title="Remover carta" disabled={!isBasicMonster(card) || !draft.includes(card.id)} on:click={() => changeCount(card.id, -1)}>−</button>
                <span class="w-10 text-center text-xs">{draft.filter((id) => id === card.id).length}/{$cardCollection[card.id]}</span>
                <button class="count-button" aria-label={`Adicionar ${cardName(card, $gameMode)}`} title="Adicionar carta" disabled={!isBasicMonster(card) || draft.length >= DECK_SIZE || draft.filter((id) => id === card.id).length >= $cardCollection[card.id]} on:click={() => changeCount(card.id, 1)}>+</button>
              </div>
            {:else}<span class="text-xs">Possuidas: {$cardCollection[card.id]}</span>{/if}
            <p class="w-[110px] text-center text-[10px] leading-tight">{card.desc}</p>
          </div>
        {/each}
        {#if !visibleCards.length}<p class="col-span-full text-sm">Nenhuma carta nesta selecao.</p>{/if}
      </div>
    {/if}
  {:else}
    <div class="flex min-h-0 flex-1">
      <aside class="inspector">
        {#if inspectCard}
          <h3 class="text-[11px] font-bold">INSPETOR</h3>
          <CardFace card={inspectCard} mode={$gameMode} stats={inspectStats} />
          <p class="mt-2 text-xs font-bold">{cardName(inspectCard, $gameMode)}</p>
          <p class="mt-1 text-[10px]">{inspectCard.desc}</p>
          {#if inspectCard.type === "monster"}
            <p class="mt-1 text-[10px]">{kindLabel(inspectCard)} · {(inspectCard.types || [inspectCard.subtype]).join(" / ")} · {inspectStats?.atk ?? inspectCard.atk} ATK / {inspectStats?.def ?? inspectCard.def} DEF</p>
            {#if inspectCard.pos === "atk" || inspectCard.pos === "def"}<p class="text-[10px]">{inspectCard.pos === "atk" ? "Postura de ataque" : "Postura de defesa"}</p>{/if}
            {#if inspectCard.gear?.length}<p class="text-[10px]">Equipado</p>{/if}
            {#if inspectCard.doomTurns}<p class="text-[10px]">Destruido em {inspectCard.doomTurns} rodada(s)</p>{/if}
            {#if inspectCard.silenceTurns}<p class="text-[10px]">Nao ataca por {inspectCard.silenceTurns} rodada(s)</p>{/if}
          {/if}
        {:else}
          <h3 class="text-sm font-bold">{duel.state === "main" ? "Fase principal" : "Fase de batalha"}</h3>
          <p class="mt-2 text-[11px]">Passe o mouse numa carta virada para cima para inspeciona-la aqui.</p>
        {/if}
        {#if selected && duel.turn === "p1" && ["main", "battle"].includes(duel.state)}
          <div class="mt-2 flex flex-wrap gap-1">
            {#if source === "hand"}
              {#if selected.type === "monster"}
                <button class="command" disabled={duel.state !== "main" || duel.p1.summoned || (!selected.isBoss && !["básico", "fase 1"].includes(selected.kind))} on:click={() => summon("atk")}>Invocar ATK</button>
                <button class="command" disabled={duel.state !== "main" || duel.p1.summoned || (!selected.isBoss && !["básico", "fase 1"].includes(selected.kind))} on:click={() => summon("def")}>Baixar DEF</button>
                {#if selected.evolvesFrom}<button class="command" disabled={duel.state !== "main" || duel.p1.evolvedThisTurn || evolutionTargetIndex < 0} on:click={() => act({ type: "evolve", uid: selected.uid })}>Evoluir</button>{/if}
              {:else}
                <button class="command" disabled={duel.state !== "main" || selected.type === "trap"} on:click={activate}>Ativar</button>
                <button class="command" disabled={duel.state !== "main"} on:click={() => act({ type: "set", uid: selected.uid })}>Armar</button>
              {/if}
              <button class="command" disabled={duel.p1.discarded} on:click={() => act({ type: "discard", uid: selected.uid })}>Trocar carta</button>
            {:else if source === "monster"}<button class="command" disabled={selected.changed} on:click={() => act({ type: "position", index: selectedIndex })}>ATK / DEF</button>
            {:else if source === "spell"}<button class="command" disabled={duel.state !== "main" || selected.type === "trap"} on:click={activate}>Ativar</button>{/if}
          </div>
        {/if}
        <div class="mt-2 flex flex-wrap gap-1"><button class="command" disabled={duel.turn !== "p1" || duel.state !== "main"} on:click={() => act({ type: "battle" })}>Batalha</button><button class="command" disabled={duel.turn !== "p1" || !["main", "battle"].includes(duel.state)} on:click={() => act({ type: "end" })}>Fim de turno</button><button class="command" on:click={() => { surrender = true; }}>Desistir</button></div>
        {#if targeting}<button class="command my-2" on:click={() => { targeting = null; message = ""; }}>Cancelar alvo</button>{/if}
        {#if message}<p class="my-2 text-xs text-red-800" role="status">{message}</p>{/if}
        <div class="min-h-0 flex-1 overflow-y-auto text-[10px] leading-relaxed" aria-live="polite">{#each duel.log as entry}<p class="border-b border-[#d8e3dc] py-1">{entry}</p>{/each}</div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col bg-[#d7e7dc] p-2">
        <div class="flex shrink-0 items-center justify-between text-xs font-bold"><span>{themeById(currentOpponentTheme())?.name || $cardOpponent?.name} · HP {duel.p2.hp}</span><span>{$cardOpponent?.championship ? `Campeonato ${$cardChampionship.wins + 1}/${$cardChampionship.opponents.length}` : $cardOpponent?.name}</span></div>
        <div class="mt-1 flex h-6 justify-center gap-1">{#each duel.p2.hand as _}<span class="h-5 w-4 border border-[#243c35] bg-[#53818b]" title="Carta na mao do rival"></span>{/each}<span class="ml-2 text-[10px]">Deck {duel.p2.deck.length} · Cemiterio {duel.p2.graveyard.length}</span></div>
        <div class="flex h-7 shrink-0 items-center justify-center gap-2">
          {#each duel.p2.spells as card}<span class="spell-slot" title={card ? "Carta armada" : "Zona vazia"}>{card ? "◆" : ""}</span>{/each}
          {#if duel.p2.field}<button class="scan-field" on:mouseenter={() => inspect(duel.p2.field, "p2")}>{duel.p2.field.name}</button>{:else}<span class="max-w-40 truncate text-[9px]">Sem campo</span>{/if}
        </div>
        <div class="zone-row">
          {#each duel.p2.monsters as card, index}
            <button
              class="monster-slot"
              class:defending={card?.pos === "def"}
              class:can-attack={duel.state === "battle" && canAttack(card) && duel.turn === "p2"}
              class:attacking={attackAnimation?.owner === "p2" && attackAnimation?.index === index}
              style={attackStyle("p2", index)}
              disabled={!card || (attacker === null && targeting !== "enemy") || duel.turn !== "p1"}
              aria-label={card ? `Atacar ${cardName(card, $gameMode)}` : "Zona vazia"}
              on:mouseenter={() => inspect(card, "p2")}
              on:click={() => chooseEnemy(index)}
            >{#if card}<CardFace {card} mode={$gameMode} compact stats={cardStats(card, duel.p2)} />{/if}</button>
          {/each}
        </div>
        <div class="my-1 flex h-6 shrink-0 items-center justify-between border-y-2 border-[#53756a] text-xs font-bold"><span>Rodada {Math.min(15, duel.round)}/15 · {duel.turn === "p1" ? "Sua vez" : "Rival"}</span><button class="border border-[#243c35] bg-white px-2 text-[10px] disabled:opacity-40" disabled={attacker === null || duel.p2.monsters.some(Boolean)} on:click={() => act({ type: "attack", index: attacker, target: "direct" })}>Ataque direto</button></div>
        <div class="zone-row">
          {#each duel.p1.monsters as card, index}
            <button
              class="monster-slot"
              class:defending={card?.pos === "def"}
              class:chosen={source === "monster" && selectedIndex === index}
              class:can-attack={duel.state === "battle" && canAttack(card) && duel.turn === "p1"}
              class:attacking={attackAnimation?.owner === "p1" && attackAnimation?.index === index}
              style={attackStyle("p1", index)}
              aria-label={card ? cardName(card, $gameMode) : "Zona vazia"}
              disabled={duel.turn !== "p1" || (!card && !targeting)}
              on:mouseenter={() => inspect(card, "p1")}
              on:click={() => chooseMonster(index)}
            >{#if card}<CardFace {card} mode={$gameMode} compact stats={cardStats(card, duel.p1)} />{/if}</button>
          {/each}
        </div>
        <div class="flex h-8 shrink-0 items-center justify-center gap-2">
          {#each duel.p1.spells as card, index}
            <button class="spell-slot" disabled={!card || duel.turn !== "p1"} title={card ? cardName(card, $gameMode) : "Zona vazia"} aria-label={card ? cardName(card, $gameMode) : "Zona vazia"} on:mouseenter={() => card && inspect(card, "p1")} on:click={() => { selected = card; source = "spell"; selectedIndex = index; targeting = null; }}>{card ? "◆" : ""}</button>
          {/each}
          <span role="note" class="max-w-40 truncate text-[9px]" on:mouseenter={() => duel.p1.field && inspect(duel.p1.field, "p1")}>{duel.p1.field?.name || "Sem campo"}</span>
        </div>
        <div class="flex min-h-0 flex-1 items-end justify-center gap-2 overflow-x-auto pb-2">
          {#each duel.p1.hand as card}
            <button class="shrink-0 transition-transform" class:hand-selected={selected?.uid === card.uid} disabled={duel.turn !== "p1"} aria-label={cardName(card, $gameMode)} on:mouseenter={() => inspect(card, "p1")} on:click={() => chooseHand(card)}><CardFace {card} mode={$gameMode} compact /></button>
          {/each}
        </div>
        <div class="flex shrink-0 justify-between text-xs font-bold"><span>Voce · HP {duel.p1.hp}</span><span>Deck {duel.p1.deck.length} · Cemiterio {duel.p1.graveyard.length}</span></div>
      </div>
    </div>
    {#if duel.state === "trap"}<div class="modal-shade"><div class="prompt"><h3 class="font-bold">Ativar sua armadilha?</h3><div class="mt-4 flex justify-center gap-3"><button class="command" on:click={() => answerTrap(true)}>Ativar</button><button class="command" on:click={() => answerTrap(false)}>Nao usar</button></div></div></div>{/if}
    {#if duel.state === "dice"}<div class="modal-shade"><div class="prompt"><h3 class="font-bold">Empate · Desempate nos dados</h3>{#if duel.dice}<p class="my-4 text-3xl">{duel.dice.join(" x ")}</p>{/if}<button class="command mt-4" on:click={() => { performCardAction(duel, duel.turn, { type: "dice" }); duel = { ...duel }; }}>Rolar dados</button></div></div>{/if}
    {#if surrender}<div class="modal-shade"><div class="prompt"><h3 class="font-bold">Desistir do duelo?</h3><div class="mt-4 flex justify-center gap-3"><button class="command" on:click={confirmSurrender}>Sim</button><button class="command" on:click={() => { surrender = false; }}>Continuar</button></div></div></div>{/if}
    {#if duel.winner}
      <div class="modal-shade">
        <div class="prompt">
          <h3 class="text-2xl font-bold">{duel.winner === "p1" ? "Vitoria!" : "O rival venceu"}</h3>
          {#if rewardText}<p class="mt-3 text-sm">{rewardText}</p>{/if}
          {#if duel.winner === "p1" && $cardOpponent?.championship && !$cardChampionship.claimed}
            {#each $cardDecks as deck}<button class="command mt-3" disabled={!validateDeck(deck.cards)} on:click={() => continueChampionship(deck)}>Proximo oponente com {deck.name}</button>{/each}
          {:else}
            <button class="command mt-5" on:click={() => { phase.set(PHASES.PLAYING); }}>Voltar a mesa</button>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
  {#if !duel && message}<footer class="shrink-0 border-t-2 border-[#53756a] bg-white px-3 py-2 text-sm" role="status">{message}</footer>{/if}
</div>

<style>
  .command { border:2px solid #243c35; background:#d6e9e0; padding:4px 7px; font-size:11px; font-weight:700; }
  .command:hover:not(:disabled) { background:#9ce6e6; }
  button:disabled { opacity:0.45; cursor:not-allowed; }
  .chosen { outline:3px solid #b85935; outline-offset:1px; }
  .deck-row { display:flex; width:100%; justify-content:space-between; align-items:center; gap:12px; border:2px solid #53756a; background:white; padding:12px; text-align:left; }
  .card-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(115px,1fr)); align-content:start; gap:18px 8px; }
  .count-button { width:24px; height:24px; border:1px solid #243c35; background:white; font-weight:800; }
  .inspector { display:flex; width:228px; flex-shrink:0; flex-direction:column; border-right:4px solid #243c35; background:#fff; padding:8px; }
  .zone-row { display:flex; justify-content:center; gap:20px; height:90px; flex-shrink:0; padding:5px 0; }
  .monster-slot { width:72px; height:80px; display:flex; justify-content:center; align-items:center; border:1px dashed #53756a; transition:transform 180ms ease; }
  .scan-field { max-width:110px; overflow:hidden; border:1px solid #53756a; background:#fff; padding:1px 4px; text-overflow:ellipsis; white-space:nowrap; font-size:9px; }
  .monster-slot.defending { transform:rotate(90deg); }
  .monster-slot.can-attack { outline:3px solid #c62828; outline-offset:2px; }
  .monster-slot.attacking { transform:translateY(var(--lift, -24px)) scale(1.08); z-index:5; }
  .spell-slot { display:inline-flex; justify-content:center; align-items:center; width:40px; height:22px; border:1px dashed #53756a; background:#7aabb5; color:white; }
  .hand-selected { transform:translateY(-7px); outline:2px solid #b85935; }
  .modal-shade { position:absolute; inset:0; z-index:20; display:flex; justify-content:center; align-items:center; padding:16px; background:#0c252bce; }
  .prompt { width:360px; max-width:100%; padding:24px; border:4px solid #243c35; background:#eef3e9; text-align:center; box-shadow:6px 6px 0 #15261f; }
</style>
