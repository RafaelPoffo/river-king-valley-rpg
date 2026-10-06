<script>
  import { cardName, cardPortrait, themeById } from "../game/cardCatalog.js";
  export let card;
  export let mode = "normal";
  export let hidden = false;
  export let compact = false;
  export let stats = null;
  const symbols = { voador:"🦅", fada:"🧚", humano:"👑", mago:"🔮", "morto-vivo":"💀", orc:"👹", dragao:"🐉", fera:"🐺", demonio:"😈", pirata:"🏴‍☠️", gelo:"❄️", ninja:"🥷", inseto:"🐝", espirito:"👻", agua:"🐟", reptil:"🦎", elemental:"🔥" };
</script>

<div class="card-face" class:compact class:rare={card?.rarity === "rare"} class:hidden style={`--card-color:${hidden ? "#426c75" : card?.type === "monster" ? themeById(card.themeId)?.color || "#e4ca76" : card?.type === "trap" ? "#e4aac7" : "#a4d4b4"}`}>
  {#if hidden}
    <span class="back-mark" aria-label="Carta virada">◆</span>
  {:else if card}
    <div class="card-title" title={cardName(card,mode)}>{cardName(card,mode)}</div>
    <div class="card-art">
      {#if mode === "pokemon"}<img src={cardPortrait(card)} alt={cardName(card,mode)} />
      {:else}<span role="img" aria-label={card.name}>{card.type === "monster" ? symbols[card.subtype] || "✦" : card.type === "trap" ? "◆" : card.type === "field" ? "🌳" : "✧"}</span>{/if}
    </div>
    <div class="card-stats">{#if card.type === "monster"}{stats?.atk ?? card.atk} ATK · {stats?.def ?? card.def} DEF{:else}{card.type === "trap" ? "ARMADILHA" : card.type === "field" ? "CAMPO" : "MAGIA"}{/if}</div>
  {/if}
</div>

<style>
  .card-face { width:86px; height:108px; display:flex; flex-direction:column; justify-content:space-between; padding:4px; border:2px solid #202b28; border-radius:2px; background:var(--card-color); color:#172620; box-shadow:2px 2px 0 #202b28; }
  .card-face.compact { width:64px; height:78px; padding:2px; }
  .card-title { font-size:10px; line-height:12px; font-weight:800; overflow:hidden; height:24px; overflow-wrap:anywhere; }
  .compact .card-title { font-size:8px; line-height:9px; height:18px; }
  .card-art { flex:1; min-height:0; display:flex; align-items:center; justify-content:center; background:#fff9; border:1px solid #202b2840; }
  .card-art img { width:56px; height:56px; max-width:100%; max-height:100%; object-fit:contain; image-rendering:pixelated; }
  .card-art span { font-size:30px; }
  .compact .card-art span { font-size:24px; }
  .card-stats { font-size:8px; font-weight:800; text-align:center; padding-top:2px; white-space:nowrap; }
  .compact .card-stats { font-size:6px; }
  .rare { border-color:#9b671b; box-shadow:2px 2px 0 #9b671b; }
  .hidden { background:repeating-linear-gradient(45deg,#426c75 0 5px,#83b8be 5px 7px); align-items:center; justify-content:center; }
  .back-mark { color:#fff; font-size:30px; text-shadow:2px 2px #202b28; }
</style>