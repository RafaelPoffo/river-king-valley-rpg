<script>
  import { cardName, cardPortrait, kindLabel, themeById } from "../game/cardCatalog.js";
  export let card;
  export let mode = "normal";
  export let hidden = false;
  export let compact = false;
  export let stats = null;
  const typeSymbols = {
    água: "💧", fogo: "🔥", planta: "🌿", elétrico: "⚡", psíquico: "🔮", lutador: "👊",
    inseto: "🐝", fantasma: "👻", dragão: "🐉", voador: "🦅", pedra: "🪨", normal: "✦",
    gelo: "❄️", veneno: "☠", terra: "⛰", fada: "🧚", aço: "🛡", sombrio: "🌙",
  };
  const magicSymbols = {
    field: "⌂", equip_atk: "⚔", equip_def: "🛡", heal: "✚", burn: "🔥", flip_pos: "◎",
    weaken: "↓", boost_atk: "⬆", strip_equip: "✖", strip_field: "☁", strip_trap: "⌫",
    remove_traps: "⌫", destroy_11: "1", doom: "💀", destroy_monster: "⚠", all_defense: "🛡",
    guard: "▣", destroy_all_11: "※", destroy_def: "⤵", destroy_5atk: "5", destroy_equipped: "⚔",
    silence: "✕",
  };
  $: displayStats = stats || card;
  $: kind = card?.type === "monster" ? kindLabel(card) : "";
</script>

<div
  class="card-face"
  class:compact
  class:rare={card?.rarity === "rare"}
  class:hidden
  class:pokemon-monster={mode === "pokemon" && card?.type === "monster"}
  class:stage-two={card?.kind === "fase 2"}
  class:stage-three={card?.kind === "fase 3" || card?.kind === "lendário"}
  style={`--card-color:${hidden ? "#426c75" : card?.type === "monster" ? themeById(card.themeId)?.color || "#e4ca76" : card?.type === "trap" ? "#e4aac7" : "#a4d4b4"}`}
>
  {#if hidden}
    <span class="back-mark" aria-label="Carta virada">◆</span>
  {:else if card}
    <div class="card-title" title={cardName(card, mode)}>
      <span class="title-name">{cardName(card, mode)}</span>
      {#if card.type === "monster"}<small class="stage-label">{kind}</small>{/if}
    </div>
    <div class="card-art" class:magic-art={card.type !== "monster"}>
      {#if mode === "pokemon" && card.type === "monster" && cardPortrait(card)}
        <img src={cardPortrait(card)} alt={cardName(card, mode)} />
      {:else if card.type !== "monster"}
        <span class="magic-symbol" role="img" aria-label={card.name}>{magicSymbols[card.effect] || "✧"}</span>
      {:else}
        <span role="img" aria-label={card.name}>{typeSymbols[card.types?.[0] || card.subtype] || "✦"}</span>
      {/if}
      {#if card.doomTurns > 0}<span class="counter doom">💀{card.doomTurns}</span>{/if}
      {#if card.silenceTurns > 0}<span class="counter silence">✕{card.silenceTurns}</span>{/if}
    </div>
    <div class="card-stats">
      {#if card.type === "monster"}
        {displayStats?.atk ?? card.atk} ATK · {displayStats?.def ?? card.def} DEF
      {:else}
        {card.type === "trap" ? "ARMADILHA" : card.type === "field" ? "CAMPO" : "MAGIA"}
      {/if}
    </div>
  {/if}
</div>

<style>
  .card-face { width:86px; height:108px; display:flex; flex-direction:column; justify-content:space-between; padding:4px; border:2px solid #202b28; border-radius:2px; background:var(--card-color); color:#172620; box-shadow:2px 2px 0 #202b28; }
  .card-face.compact { width:64px; height:78px; padding:2px; }
  .card-title { font-size:10px; line-height:12px; font-weight:800; overflow:hidden; height:24px; overflow-wrap:anywhere; display:flex; align-items:flex-start; justify-content:space-between; gap:2px; }
  .pokemon-monster { border:3px double #365d69; padding:3px; background:linear-gradient(145deg,#fff8,var(--card-color)); }
  .stage-two { border-color:#9b671b; box-shadow:2px 2px 0 #9b671b; }
  .stage-three { border-color:#ad4c32; box-shadow:2px 2px 0 #ad4c32; }
  .title-name { min-width:0; flex:1; overflow:hidden; overflow-wrap:anywhere; }
  .stage-label { flex-shrink:0; border:1px solid currentColor; background:#fffc; padding:1px 2px; font-size:6px; line-height:8px; text-transform:uppercase; }
  .compact .card-title { font-size:8px; line-height:9px; height:18px; }
  .compact .stage-label { font-size:5px; line-height:6px; }
  .card-art { position:relative; flex:1; min-height:0; display:flex; align-items:center; justify-content:center; background:#fff9; border:1px solid #202b2840; }
  .pokemon-monster .card-art { border:2px solid #365d6970; background:linear-gradient(145deg,#fff,#dbe9e5); }
  .pokemon-monster .card-stats { border:1px solid #365d69; background:#fff9; }
  .card-art.magic-art { background:radial-gradient(circle at center,#fff 0 13%,#d6e6dc 14% 40%,#a9c9bd 41% 100%); }
  .magic-symbol { font-size:30px; font-weight:900; color:#274c4a; text-shadow:1px 1px 0 #fff; }
  .card-art img { width:56px; height:56px; max-width:100%; max-height:100%; object-fit:contain; image-rendering:pixelated; }
  .card-art span { font-size:30px; }
  .compact .card-art span { font-size:24px; }
  .card-stats { font-size:8px; font-weight:800; text-align:center; padding-top:2px; white-space:nowrap; }
  .compact .card-stats { font-size:6px; }
  .rare { border-color:#9b671b; box-shadow:2px 2px 0 #9b671b; }
  .hidden { background:repeating-linear-gradient(45deg,#426c75 0 5px,#83b8be 5px 7px); align-items:center; justify-content:center; }
  .back-mark { color:#fff; font-size:30px; text-shadow:2px 2px #202b28; }
  .counter { position:absolute; top:1px; right:1px; border:1px solid #202b28; background:#fff; padding:0 2px; font-size:8px; line-height:10px; font-weight:800; }
  .counter.silence { left:1px; right:auto; }
</style>
