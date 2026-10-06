<script>
  import { onDestroy } from "svelte";
  import { birdwatchingLuck, phase, day, gameMode, insectInventory, money, seasonIndex, showBugTournament } from "../game/stores.js";
  import { PHASES } from "../game/phases.js";
  import { saveGame } from "../game/saveSystem.js";
  import { competitorsForDay, prizeForCompetition, resolveBugDuel } from "../game/bugTournament.js";
  import { CHARACTER_SPRITES, insectSpriteFor } from "../game/overworldAtlas.js";
  import OverworldSprite from "./OverworldSprite.svelte";

  let step = "rank";
  let order = [];
  let playerTeam = [];
  let opponent = null;
  let opponents = [];
  let opponentIndex = 0;
  let duelIndex = 0;
  let playerWins = 0;
  let opponentWins = 0;
  let duel = null;
  let duelResult = null;
  let frameIndex = 0;
  let champion = false;
  let prize = 0;
  let timeoutId = null;

  $: bag = $insectInventory;
  $: if (step === "rank" && order.length !== bag.length) {
    const existing = order.filter((id) => bag.some((insect) => insect.caughtId === id));
    order = [...existing, ...bag.filter((insect) => !existing.includes(insect.caughtId)).map((insect) => insect.caughtId)];
  }
  $: isSeasonFinal = $day === 15;

  function moveInsect(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= order.length) return;
    const reordered = [...order];
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    order = reordered;
  }

  function startTournament() {
    if (order.length < 3) return;
    playerTeam = order.slice(0, 3).map((id) => bag.find((insect) => insect.caughtId === id));
    opponents = competitorsForDay($seasonIndex, $day, $gameMode);
    opponentIndex = 0;
    champion = false;
    prize = 0;
    beginMatch();
  }

  function beginMatch() {
    opponent = opponents[opponentIndex];
    duelIndex = 0;
    playerWins = 0;
    opponentWins = 0;
    step = "battle";
    startDuel();
  }

  function startDuel() {
    const key = `${$seasonIndex}:${$day}:${opponentIndex}:${duelIndex}`;
    duel = resolveBugDuel(playerTeam[duelIndex], opponent.team[duelIndex], key, $birdwatchingLuck);
    duelResult = null;
    frameIndex = 0;
    animateFrame();
  }

  function animateFrame() {
    if (!duel) return;
    if (frameIndex < duel.frames.length - 1) {
      timeoutId = window.setTimeout(() => {
        frameIndex += 1;
        animateFrame();
      }, 620);
      return;
    }
    duelResult = duel.winner === playerTeam[duelIndex] ? "player" : "opponent";
    timeoutId = window.setTimeout(resolveDuel, 1300);
  }

  function resolveDuel() {
    if (duel.winner === playerTeam[duelIndex]) playerWins += 1;
    else opponentWins += 1;
    if (playerWins === 2) {
      opponentIndex += 1;
      if (opponentIndex >= opponents.length) finishTournament(true);
      else timeoutId = window.setTimeout(beginMatch, 850);
      return;
    }
    if (opponentWins === 2) {
      finishTournament(false);
      return;
    }
    duelIndex += 1;
    timeoutId = window.setTimeout(startDuel, 550);
  }

  function finishTournament(won) {
    champion = won;
    if (won) {
      prize = prizeForCompetition(opponents.length + 1, isSeasonFinal);
      money.update((amount) => amount + prize);
    }
    insectInventory.set([]);
    saveGame();
    step = "finished";
  }

  function closeTournament() {
    if (timeoutId) window.clearTimeout(timeoutId);
    showBugTournament.set(false);
    phase.set(PHASES.PLAYING);
    step = "rank";
    order = [];
    playerTeam = [];
    opponents = [];
    duel = null;
    duelResult = null;
  }

  function fighterStyle(position, flipped) {
    const fade = Math.max(0, 1 - Math.max(0, (position - 100) / 14, -position / 14));
    return `left:${position}%;opacity:${fade};transform:translate(-50%,-50%) rotate(${flipped ? 180 : 0}deg);transition:left 650ms ease-in-out,transform 500ms ease,opacity 650ms ease`;
  }

  onDestroy(() => {
    if (timeoutId) window.clearTimeout(timeoutId);
  });
</script>

{#if $showBugTournament}
  <div class="absolute inset-0 z-[90] flex items-center justify-center bg-black/75 p-3" role="presentation">
    <dialog open class="flex h-[540px] max-h-full w-[660px] max-w-full flex-col overflow-hidden border-4 border-[#67462c] bg-[#f2e6d1] p-0 text-[#382718] shadow-2xl" aria-modal="true" aria-label="Campeonato de insetos">
      <header class="flex shrink-0 items-center justify-between border-b-2 border-[#9a7651] bg-[#d8bc91] px-4 py-2">
        <h2 class="font-bold uppercase">Batalha dos Insetos</h2>
        <button class="border border-[#67462c] bg-[#f7eddd] px-3 py-1 text-sm" on:click={closeTournament} aria-label="Fechar campeonato">Fechar</button>
      </header>

      {#if step === "rank"}
        <div class="min-h-0 flex-1 overflow-y-auto p-4">
          <div class="mb-3 border-b border-[#b2936d] pb-3">
            <h3 class="text-lg font-black">Joe Bug espera seu trio</h3>
            <p class="text-sm">Escolha a ordem dos três insetos que vão lutar. Os demais ficam de fora.</p>
            {#if isSeasonFinal}<p class="mt-1 text-sm font-bold">Campeonato final da estação</p>{/if}
          </div>
          {#each order as caughtId, index (caughtId)}
            {@const insect = bag.find((item) => item.caughtId === caughtId)}
            <div class="mb-2 flex items-center gap-3 border border-[#b99d79] bg-white px-3 py-2">
              <span class="w-10 shrink-0 font-black">{index < 3 ? `${index + 1}º` : "Fora"}</span>
              <span class="h-9 w-9"><OverworldSprite sprite={insectSpriteFor(insect?.caughtId || insect?.id, insect?.dexId)} label={insect?.name || "Inseto"} /></span>
              <span class="min-w-0 flex-1 truncate font-bold">{insect?.name}</span>
              <button class="h-8 w-8 border border-[#8b6845] bg-[#f6ebd9] text-lg disabled:opacity-30" aria-label={`Mover ${insect?.name} para cima`} disabled={index === 0} on:click={() => moveInsect(index, -1)}>↑</button>
              <button class="h-8 w-8 border border-[#8b6845] bg-[#f6ebd9] text-lg disabled:opacity-30" aria-label={`Mover ${insect?.name} para baixo`} disabled={index === order.length - 1} on:click={() => moveInsect(index, 1)}>↓</button>
            </div>
          {/each}
        </div>
        <footer class="flex shrink-0 items-center justify-between border-t-2 border-[#9a7651] px-4 py-3">
          <span class="text-sm">{competitorsForDay($seasonIndex, $day, $gameMode).length + 1} competidores na mesa</span>
          <button class="border-2 border-[#3c6541] bg-[#628459] px-5 py-2 font-bold text-white disabled:opacity-40" disabled={order.length < 3} on:click={startTournament}>Participar</button>
        </footer>
      {:else if step === "battle"}
        <div class="flex min-h-0 flex-1 flex-col p-4">
          <div class="mb-2 flex items-center justify-between gap-3">
            <div class="min-w-0"><strong class="block truncate">{opponent?.persona}</strong><span class="text-xs">{opponent?.name}</span></div>
            <div class="shrink-0 text-right"><strong class="block">{playerTeam[duelIndex]?.name}</strong><span class="text-xs">contra {opponent?.team[duelIndex]?.name}</span></div>
          </div>
          <div class="relative flex min-h-0 flex-1 items-center overflow-hidden border-[10px] border-[#795535] bg-[#b98b5d] shadow-[inset_0_0_0_4px_#dfc096]">
            <div class="absolute left-3 top-3 z-10 h-11 w-11 overflow-hidden border-2 border-[#52361f] bg-white p-1">
              <OverworldSprite sprite={CHARACTER_SPRITES.player} label="Jogador" />
            </div>
            <div class="absolute right-3 top-3 z-10 h-11 w-11 overflow-hidden border-2 border-[#52361f] bg-white p-1">
              <OverworldSprite sprite={CHARACTER_SPRITES[opponent?.id] || CHARACTER_SPRITES.veteran} label={opponent?.name || "Rival"} />
            </div>
            {#if duel}
              {@const frame = duel.frames[frameIndex]}
              <div class="absolute top-1/2 h-20 w-20 text-center" style={fighterStyle(frame.leftX, frame.leftFlipped)}>
                <OverworldSprite sprite={insectSpriteFor(playerTeam[duelIndex]?.caughtId || playerTeam[duelIndex]?.id, playerTeam[duelIndex]?.dexId)} direction="right" moving label={playerTeam[duelIndex]?.name} />
              </div>
              <div class="absolute top-1/2 h-20 w-20 text-center" style={fighterStyle(frame.rightX, frame.rightFlipped)}>
                <OverworldSprite sprite={insectSpriteFor(opponent?.team[duelIndex]?.id, opponent?.team[duelIndex]?.dexId)} direction="left" moving label={opponent?.team[duelIndex]?.name} />
              </div>
            {/if}
          </div>
          <div class="mt-3 flex items-center justify-between gap-3 text-sm">
            <div class="flex items-center gap-2">{#each playerTeam as bug, index}<span class="h-5 w-5" class:opacity-40={index < duelIndex} title={bug.name}><OverworldSprite sprite={insectSpriteFor(bug.caughtId || bug.id, bug.dexId)} label={bug.name} /></span>{/each}</div>
            <span class="truncate text-center font-bold" aria-live="polite">
              {#if duelResult === "player"}{playerTeam[duelIndex]?.name} venceu a rodada!{:else if duelResult === "opponent"}{opponent?.team[duelIndex]?.name} venceu a rodada!{:else}A disputa segue na mesa{/if}
            </span>
            <div class="flex items-center gap-2">{#each opponent?.team || [] as bug, index}<span class="h-5 w-5" class:opacity-40={index < duelIndex} title={bug.name}><OverworldSprite sprite={insectSpriteFor(bug.id, bug.dexId)} label={bug.name} /></span>{/each}</div>
          </div>
        </div>
      {:else}
        <div class="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p class="text-6xl">{champion ? "🏆" : "🪲"}</p>
          <h3 class="mt-3 text-2xl font-black">{champion ? "Campeão da Clareira!" : "Uma bela disputa"}</h3>
          <p class="mt-2 max-w-md">{champion ? `Joe Bug entrega o prêmio${isSeasonFinal ? " do campeonato final" : " do dia"}.` : "Joe Bug agradece sua participação. Haverá outra disputa amanhã."}</p>
          {#if champion}<p class="mt-1 font-bold">Prêmio recebido: ¥{prize}</p>{/if}
          <p class="mt-5 border-t border-[#b2936d] pt-3 font-bold">Joe Bug: “Hora de libertar os insetos.”</p>
          <button class="mt-5 border-2 border-[#3c6541] bg-[#628459] px-6 py-2 font-bold text-white" on:click={closeTournament}>Voltar à floresta</button>
        </div>
      {/if}
    </dialog>
  </div>
{/if}