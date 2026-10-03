<script>
  import { draw } from "../game/sprites.js";

  export let label;
  export let sprite;
  export let title;
  export let detail = "";
  export let previousLabel;
  export let nextLabel;
  export let canPrevious = false;
  export let canNext = false;
  export let onPrevious = () => {};
  export let onNext = () => {};

  const arrowClass =
    "h-7 w-7 shrink-0 rounded-full border-2 border-black bg-white text-xs text-black active:bg-[#9ce6e6] disabled:cursor-not-allowed disabled:opacity-30";
</script>

<div
  class="flex w-[208px] items-center gap-1 rounded border-2 border-black bg-black/60 p-1 text-white pixel-shadow"
  role="group"
  aria-label={label}
>
  <button
    type="button"
    class={arrowClass}
    aria-label={previousLabel}
    title={previousLabel}
    disabled={!canPrevious}
    on:click={onPrevious}
  >
    ←
  </button>
  <div class="h-9 w-9 shrink-0 rounded-full border-2 border-black bg-white p-1.5" aria-hidden="true">
    {@html draw(sprite)}
  </div>
  <div class="min-w-0 flex-1 retro-font text-[7px] leading-relaxed" aria-live="polite">
    <div class="truncate">{title}</div>
    {#if detail}
      <div class="text-[6px] text-gray-200">{detail}</div>
    {/if}
  </div>
  <button
    type="button"
    class={arrowClass}
    aria-label={nextLabel}
    title={nextLabel}
    disabled={!canNext}
    on:click={onNext}
  >
    →
  </button>
</div>
