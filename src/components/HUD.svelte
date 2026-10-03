<script>
  import { PHASES } from "../game/phases.js";
  import {
    inGameMinutes,
    day,
    seasonIndex,
    currentWeather,
    money,
    currentMessage,
    phase,
    activeDish,
    baitStock,
    eqBaitId,
    currentBaitData,
    ownedRods,
    ownedNets,
    eqRodId,
    eqNetId,
    currentToolType,
  } from "../game/stores.js";
  import { todaysDish } from "../game/dishes.js";
  import { BAITS, SEASONS, TOOLS, WEATHER_NAMES } from "../game/constants.js";
  import { equipItem, equipTool } from "../game/gameActions.js";
  import HudSelector from "./HudSelector.svelte";
  import { SPRITES } from "../game/sprites.js";

  const baitSprites = {
    sem_isca: ["...0....", "...0....", "...0....", "...0....", "...0..0.", "...0..0.", "....00..", "........"],
    minhoca: ["........", ".0440...", ".040....", ".04440..", "....040.", "..04440.", "..040...", "........"],
    massa_pao: ["........", "..0000..", ".015510.", "01555510", "01555510", ".015510.", "..0000..", "........"],
    camarao_vivo: SPRITES.shrimp,
    isca_metalica: ["...0....", "..010...", ".01210..", ".01210..", "..010...", "...0..0.", "...0..0.", "....00.."],
    sardinha_alto_mar: ["........", "...000..", "..02220.", "00220220", "03222220", "0022220.", "...000..", "........"],
    isca_brilhante: [".....5..", "....555.", "..00.5..", ".0550...", ".05250..", "..050...", "...0..0.", "....00.."],
  };

  $: dish = ($activeDish, $day, $seasonIndex, todaysDish());
  $: availableBaits = BAITS.filter(
    (bait) => bait.id === "sem_isca" || ($baitStock[bait.id] || 0) > 0,
  );
  $: previousBait = [...availableBaits].reverse().find(
    (bait) => bait.tier < $currentBaitData.tier,
  );
  $: nextBait = availableBaits.find(
    (bait) => bait.tier > $currentBaitData.tier,
  );

  function switchBait(bait) {
    if ($phase === PHASES.PLAYING && bait) equipItem(bait.id, "bait");
  }

  $: tools = [
    ...TOOLS.rod.filter((tool) => $ownedRods.includes(tool.id)).map((tool) => ({ ...tool, kind: "rod" })),
    ...TOOLS.net.filter((tool) => $ownedNets.includes(tool.id)).map((tool) => ({ ...tool, kind: "net" })),
  ];
  $: toolIndex = tools.findIndex((tool) =>
    tool.kind === $currentToolType && tool.id === ($currentToolType === "rod" ? $eqRodId : $eqNetId),
  );
  $: currentTool = tools[toolIndex];

  function switchTool(step) {
    const tool = tools[toolIndex + step];
    if ($phase === PHASES.PLAYING && tool) equipTool(tool.id, tool.kind);
  }

  function formatTime(mins) {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
</script>

{#if $phase === PHASES.PLAYING}
  <div class="absolute top-2 left-2 z-40 flex flex-col gap-1">
    <HudSelector
      label="Isca equipada"
      sprite={baitSprites[$eqBaitId] || baitSprites.sem_isca}
      title={$currentBaitData.name.replace(/ \(Nv \d+\)$/, "")}
      detail={$eqBaitId !== "sem_isca" ? `Qtd: ${$baitStock[$eqBaitId] || 0}` : ""}
      previousLabel="Isca anterior"
      nextLabel="Próxima isca"
      canPrevious={!!previousBait}
      canNext={!!nextBait}
      onPrevious={() => switchBait(previousBait)}
      onNext={() => switchBait(nextBait)}
    />
    {#if currentTool}
      <HudSelector
        label="Equipamento"
        sprite={currentTool.kind === "rod" ? SPRITES.rod : SPRITES.net}
        title={currentTool.name}
        detail={currentTool.kind === "rod" ? `Força: ${currentTool.strength}` : "Só criaturas de rede"}
        previousLabel="Equipamento anterior"
        nextLabel="Próximo equipamento"
        canPrevious={toolIndex > 0}
        canNext={toolIndex < tools.length - 1}
        onPrevious={() => switchTool(-1)}
        onNext={() => switchTool(1)}
      />
    {/if}
  </div>
{/if}

<!-- Top Right Clock & Stats HUD -->
<div
  class="absolute top-2 right-2 bg-white border-4 border-black p-2 pixel-shadow flex flex-col gap-1 z-40 pointer-events-none text-right"
>
  <div class="retro-font text-[9px] text-black">
    🕒 {formatTime($inGameMinutes)}
  </div>
  <div class="retro-font text-[7px] text-gray-700">
    {SEASONS[$seasonIndex]} - Dia {$day}/15
  </div>
  <div class="retro-font text-[7px] text-gray-700">
    {WEATHER_NAMES[$currentWeather]}
  </div>
  {#if dish}
    <div class="retro-font text-[7px] text-orange-700">🍲 {dish.name}</div>
  {/if}
  <div class="retro-font text-[8px] text-[#4a9090] mt-1 font-bold">
    ¥ {$money}
  </div>
</div>

<!-- Bottom Dialogue & Message Box -->
<div
  class="h-[100px] bg-gray-200 p-2 flex items-center justify-center relative select-none"
>
  <div
    class="w-full h-full border-4 border-black bg-white px-3 py-2 flex flex-col justify-start shadow-[inset_4px_4px_0_#9ce6e6] relative overflow-y-auto"
  >
    <p class="retro-font text-[10px] text-black leading-relaxed pr-4">
      {$currentMessage}
    </p>
    {#if $phase === PHASES.DIALOG || $phase === PHASES.SAILING}
      <div
        class="absolute bottom-2 right-3 retro-font text-red-600 animate-bounce text-[10px]"
      >
        ▼
      </div>
    {/if}
  </div>
</div>
