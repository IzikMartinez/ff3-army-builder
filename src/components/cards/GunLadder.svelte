<script lang="ts">
  import type { EquipMark, Quality } from "../../lib/ffot3/types";
  import {
    adjustedHit,
    adjustedRof,
    ammoMarks,
    formatPen,
    formatRange,
    gunBands,
    hitInf,
    parsePen,
  } from "../../lib/ffot3/combat";
  import { AMMO_HINT, CELL_HEAT, CELL_VALUE } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import WeaponBadges from "./WeaponBadges.svelte";

  /**
   * Portrait gun table turned sideways: the three range bands are columns, and
   * each row is one thing to look up (Hit, Hit vs infantry, AP, HE, HEAT).
   * Values that ignore range (HE, HEAT) are one bar across all three bands.
   */
  let {
    title = "",
    range,
    rof,
    pen,
    ai = null,
    quality,
    marks = [],
    caption = "",
  }: {
    /** Omitted when the surrounding card already names the weapon. */
    title?: string;
    range: number;
    rof: number;
    pen: (string | number)[];
    ai?: number | null;
    quality: Quality;
    /** Extra weapon badges (stabilised, traverse…), after the AI and ammo ones. */
    marks?: EquipMark[];
    caption?: string;
  } = $props();

  const scale = $derived($force.scale);
  const bands = $derived(gunBands(range));
  const parsed = $derived(parsePen(pen.map(String)));
  const shownRof = $derived(adjustedRof(rof, quality));
  const ROW_HEAD =
    "flex items-center text-[9px] font-semibold uppercase tracking-[0.12em] text-muted";
  const INF_CELL =
    "hit-inf gun-cell flex items-center justify-center rounded-xs bg-vs-inf py-1 text-center font-display text-sm tabular-nums text-vs-inf-ink bw:border bw:border-black bw:bg-white bw:text-black";
</script>

<div class="mb-1 flex items-baseline justify-between gap-2">
  <span class="min-w-0 truncate font-display text-lg tracking-wide uppercase" {title}>{title}</span>
  {#if range > 0}
    <span
      class="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em] bg-indigo-400 p-1 rounded text-yellow-50"
      >ROF {shownRof}</span
    >
  {/if}
</div>
{#if caption}
  <p class="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted">{caption}</p>
{/if}

{#if range > 0}
  <div class="grid grid-cols-[3.5rem_repeat(3,minmax(0,1fr))] gap-[3px]">
    <span></span>
    {#each bands as band (band.band)}
      <span
        class="cell-range text-center font-display text-base tabular-nums text-brass bw:text-black"
        >{formatRange(band.range, scale)}</span
      >
    {/each}

    <span class={ROW_HEAD}>Hit</span>
    {#each bands as band (band.band)}
      <span class={CELL_VALUE} title="To-hit vs vehicles">{adjustedHit(band.hitBase, quality)}</span
      >
    {/each}

    <span class={ROW_HEAD}>vs Inf</span>
    {#each bands as band (band.band)}
      <span class={INF_CELL} title="To-hit vs infantry (AI modifier applied)"
        >{hitInf(adjustedHit(band.hitBase, quality), ai)}</span
      >
    {/each}

    {#if parsed.ap !== null}
      <span class={ROW_HEAD}>AP</span>
      {#each bands as band (band.band)}
        <span class={CELL_VALUE} title={AMMO_HINT.ap}>{formatPen(parsed.ap, band.penMod)}</span>
      {/each}
    {/if}
    {#if parsed.he !== null}
      <span class={ROW_HEAD}>HE</span>
      <span class="{CELL_VALUE} col-span-3" title={AMMO_HINT.he}>{parsed.he}</span>
    {/if}
    {#if parsed.heat !== null}
      <span class={ROW_HEAD}>HEAT</span>
      <span class="{CELL_HEAT} col-span-3" title={AMMO_HINT.heat}>{parsed.heat}</span>
    {/if}
  </div>
  <WeaponBadges {ai} marks={[...ammoMarks(parsed), ...marks]} />
{:else}
  <p class="py-2 text-center text-sm text-muted">Unarmed</p>
{/if}
