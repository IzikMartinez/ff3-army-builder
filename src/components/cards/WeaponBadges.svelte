<script lang="ts">
  import type { EquipMark } from "../../lib/ffot3/types";
  import { aiMark } from "../../lib/ffot3/combat";
  import EquipBubbles from "./EquipBubbles.svelte";

  /**
   * Badge strip at the bottom of a weapon sub-card (same strip as helicopter pod
   * columns): the weapon's AI modifier and gun badges (stabilised, traverse).
   * Unit badges (sights, NBC…) stay in the card footer.
   */
  let { ai = null, marks = [] }: { ai?: number | null; marks?: EquipMark[] } = $props();

  const all = $derived([...(ai === null ? [] : [aiMark(ai)]), ...marks]);
</script>

{#if all.length}
  <div class="badge-strip mt-2 flex items-center justify-start gap-1 rounded-b-lg bg-strip px-2 py-1 bw:bg-white">
    <EquipBubbles marks={all} />
  </div>
{/if}
