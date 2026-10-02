<script>
  import { DISHES } from "../game/constants.js";
  import { inventory, money, activeDish, friendship, seasonIndex, day } from "../game/stores.js";
  import { canCook, cookDish, todaysDish } from "../game/dishes.js";
  import { dishPrice, hasPerk } from "../game/friendship.js";
  import { closeKitchen } from "../game/gameActions.js";

  let feedback = "";

  $: state = ($inventory, $money, $activeDish, $friendship, $seasonIndex, $day, {
    today: todaysDish(),
    discount: hasPerk("anna"),
    rows: DISHES.map((dish) => ({ dish, price: dishPrice(dish.price), ready: canCook(dish) })),
  });

  function cook(id) {
    const result = cookDish(id);
    feedback = result.ok
      ? `Ana: "Prontinho, ${result.dish.name}! Bom proveito."`
      : `Ana: "${result.reason}"`;
  }
</script>

<div class="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 select-none">
  <div class="bg-white border-8 border-black p-6 w-[560px] pixel-shadow space-y-3">
    <div class="flex justify-between items-center border-b-2 border-black pb-2">
      <h3 class="retro-font text-xs">
        🍲 COZINHA DA ANA
        {#if state.discount}<span class="text-[8px] text-red-600"> ❤️ -50%</span>{/if}
      </h3>
      <button
        class="bg-black text-white px-2 py-1 retro-font text-[8px] hover:bg-gray-800"
        on:click={closeKitchen}
      >
        X
      </button>
    </div>
    <p class="retro-font text-[7px] text-gray-600 leading-relaxed">
      Um prato por dia. O efeito dura até você dormir. Ana usa os peixes mais baratos da mochila.
    </p>
    {#if state.today}
      <div class="retro-font text-[8px] bg-emerald-100 border-2 border-black p-2">
        Hoje você comeu: <b>{state.today.name}</b> ({state.today.effectLabel})
      </div>
    {/if}
    <div class="space-y-2">
      {#each state.rows as row}
        <div class="border-2 border-black p-2 flex justify-between items-center bg-orange-50">
          <div class="retro-font text-[8px] space-y-1">
            <div class="font-bold">{row.dish.name} — ¥{row.price}</div>
            <div>{row.dish.ingredientsLabel}: {row.dish.effectLabel}</div>
          </div>
          <button
            class="retro-font text-[8px] px-3 py-2 border-2 border-black {row.ready
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-500'}"
            on:click={() => cook(row.dish.id)}
          >
            COZINHAR
          </button>
        </div>
      {/each}
    </div>
    {#if feedback}
      <div class="retro-font text-[8px] border-t-2 border-black pt-2">{feedback}</div>
    {/if}
  </div>
</div>
