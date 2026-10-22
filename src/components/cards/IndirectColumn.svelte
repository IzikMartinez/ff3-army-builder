<script lang="ts">
  import type { Vehicle } from "../../lib/ffot3/types";
  import { formatRange, formatRangeBand } from "../../lib/ffot3/combat";
  import { CELL_RANGE, CELL_VALUE, STAT_HEAD } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";

  let { unit }: { unit: Vehicle } = $props();

  /** Ind Fire Ammo codes (Data Chart legend, 4.5). */
  const AMMO: Record<string, string> = {
    h: "HE",
    s: "Smoke",
    c: "Chemical",
    i: "ICM",
    l: "Laser-guided",
    g: "GPS-guided",
    m: "Mines",
  };
  /** B.13.3: points per HE fire unit, 1950 onward. */
  const FIRE_UNIT_PTS = { light: 2, medium: 4, heavy: 23, "very heavy": 35 } as const;

  const scale = $derived($force.scale);
  const ind = $derived(unit.indirect!);
  const range = $derived(
    ind.range[0] > 0 ? formatRangeBand(ind.range, scale) : formatRange(ind.range[1], scale),
  );
  const ammo = $derived([...ind.ammo].map((c) => AMMO[c] ?? c));
</script>

<section class="min-w-0 sm:col-span-2 xl:col-span-1">
  <div class="{STAT_HEAD} h-8 text-lg">Indirect Fire</div>
  <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
    {ind.mrl ? "Rocket launcher" : "Area fire"}
  </p>
  <ul class="flex flex-col gap-1">
    <li class="grid grid-cols-[5rem_1fr] gap-1">
      <span class={CELL_RANGE}>Range</span>
      <span class={CELL_VALUE}>{range}</span>
    </li>
    {#if ind.mrl}
      <li class="grid grid-cols-[5rem_1fr] gap-1">
        <span class={CELL_RANGE}>Class</span>
        <span class="{CELL_VALUE} capitalize">{ind.mrl.class}</span>
      </li>
      <li class="grid grid-cols-[5rem_1fr] gap-1">
        <span class={CELL_RANGE}>Fire units</span>
        <span class={CELL_VALUE}>{ind.mrl.fireUnits}</span>
      </li>
    {/if}
  </ul>
  <div class="mt-2 flex flex-wrap justify-center gap-1">
    {#each ammo as a (a)}
      <span
        class="rounded-full border border-line-2 px-2 py-0.5 font-display text-[11px] tracking-wider uppercase text-paper bw:border-black bw:text-black"
        >{a}</span
      >
    {/each}
  </div>
  {#if ind.mrl}
    <p class="mt-1 text-center text-[11px] text-muted">
      Priced as {ind.mrl.fireUnits} × {FIRE_UNIT_PTS[ind.mrl.class]} pts HE fire units (B.13.3)
    </p>
  {/if}
</section>
