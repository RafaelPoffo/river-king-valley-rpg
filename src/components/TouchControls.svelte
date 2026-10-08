<script>
  import { PHASES } from "../game/phases.js";
  import { phase, dialogActions } from "../game/stores.js";
  import { pressKey, releaseKey } from "../game/input.js";

  const DPAD = [
    { key: "ArrowUp", label: "▲", cls: "col-start-2 row-start-1" },
    { key: "ArrowLeft", label: "◀", cls: "col-start-1 row-start-2" },
    { key: "ArrowRight", label: "▶", cls: "col-start-3 row-start-2" },
    { key: "ArrowDown", label: "▼", cls: "col-start-2 row-start-3" },
  ];

  $: extraKeys =
    $phase === PHASES.DIALOG && $dialogActions
      ? Object.keys($dialogActions).filter((k) => k !== " " && k !== "ESCAPE" && k !== "X")
      : [];

  function hold(key) {
    return {
      destroy: () => releaseKey(key),
    };
  }

  function down(event, key) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pressKey(key);
  }

  function up(event, key) {
    event.preventDefault();
    releaseKey(key);
  }
</script>

<div class="absolute inset-x-0 top-0 h-[468px] pointer-events-none {$phase === PHASES.BIRD_WATCHING ? 'z-[120]' : 'z-[60]'} select-none touch-none">
  <div class="absolute bottom-4 left-4 grid grid-cols-3 grid-rows-3 gap-1 w-36 h-36 opacity-80">
    {#each DPAD as b}
      <button
        use:hold={b.key}
        class="{b.cls} pointer-events-auto bg-black/60 text-white rounded border-2 border-white/70 text-lg active:bg-black"
        on:pointerdown={(e) => down(e, b.key)}
        on:pointerup={(e) => up(e, b.key)}
        on:pointercancel={(e) => up(e, b.key)}
        on:contextmenu|preventDefault
      >
        {b.label}
      </button>
    {/each}
  </div>

  <div class="absolute bottom-20 right-4 flex items-end gap-3 opacity-80">
    {#each extraKeys as key}
      <button
        class="pointer-events-auto w-12 h-12 rounded-full bg-amber-500 text-black border-2 border-black retro-font text-[10px]"
        on:pointerdown={(e) => down(e, key)}
      >
        {key}
      </button>
    {/each}
    <button
      class="pointer-events-auto w-14 h-14 rounded-full bg-gray-700 text-white border-2 border-white/70 retro-font text-[10px]"
      on:pointerdown={(e) => down(e, $phase === PHASES.PLAYING ? "Enter" : "x")}
    >
      {$phase === PHASES.PLAYING ? "MENU" : "B"}
    </button>
    <button
      class="pointer-events-auto w-16 h-16 rounded-full bg-red-600 text-white border-2 border-white/70 retro-font text-xs mb-4"
      on:pointerdown={(e) => down(e, " ")}
    >
      A
    </button>
  </div>
</div>
