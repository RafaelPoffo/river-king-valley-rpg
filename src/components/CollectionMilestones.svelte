<script>
  import { museum, aquarium, claimedRewards, currentDatabase } from "../game/stores.js";
  import { collectionProgress, describeReward } from "../game/collections.js";

  export let kind;

  $: progress = ($museum, $aquarium, $claimedRewards, collectionProgress(kind, $currentDatabase));
</script>

<div class="border-2 border-black p-2 bg-yellow-50 space-y-1">
  <div class="retro-font text-[8px] font-bold">
    COLEÇÃO: {progress.count}/{progress.total}
  </div>
  {#each progress.milestones as m}
    <div class="flex justify-between retro-font text-[7px] {m.claimed ? 'text-gray-400 line-through' : ''}">
      <span>{m.claimed ? "✔" : progress.count >= m.need ? "🎁" : "○"} {m.need} — {m.title}</span>
      <span>{describeReward(m.reward)}</span>
    </div>
  {/each}
</div>
