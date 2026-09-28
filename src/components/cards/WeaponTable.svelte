<script lang="ts">
  import type { Quality, Vehicle } from "../../lib/ffot3/types";
  import {
    adjustedHit,
    adjustedRof,
    formatPen,
    formatRange,
    gunBands,
    hitInf,
    parsePen,
  } from "../../lib/ffot3/combat";
  import { gunLabel, weaponCaption, weaponKind } from "../../lib/ffot3/classify";
  import { CELL_RANGE, CELL_VALUE, GUN_HEAD, STAT_HEAD } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";

  let {
    unit,
    quality,
    heading,
    caption,
    bare = false,
  }: {
    unit: Vehicle;
    quality: Quality;
    heading?: string;
    caption?: string;
    bare?: boolean;
  } = $props();

  const system = $derived($force.rangeSystem);
  const kind = $derived(weaponKind(unit));
  const title = $derived(
    heading ??
      (gunLabel(unit) ||
        (kind === "mg" ? "Machine Gun" : kind === "autocannon" ? "Autocannon" : "Gun")),
  );
  const sub = $derived(caption ?? weaponCaption(kind));
  const bands = $derived(gunBands(unit.Gun_Rng));
  const pen = $derived(parsePen(unit.Gun_Pen));
  const cols = $derived(kind === "mg" ? 4 : kind === "autocannon" ? 6 : 5);
  const grid = $derived(cols === 4 ? "grid-cols-4" : cols === 6 ? "grid-cols-6" : "grid-cols-5");
</script>

{#snippet table()}
  {#if sub}
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">{sub}</p>
  {/if}
  {#if unit.Gun_Rng > 0 && kind !== "none"}
    <div class="{GUN_HEAD} grid {grid}">
      <span class="py-1">Range</span>
      <span class="py-1">ROF</span>
      <span class="py-1">Hit</span>
      {#if kind === "mg"}
        <span class="py-1">Hit Inf</span>
      {:else if kind === "autocannon"}
        <span class="py-1">Hit Inf</span>
        <span class="py-1">HE</span>
        <span class="py-1">HEAT</span>
      {:else}
        <span class="py-1">HE</span>
        <span class="py-1">HEAT</span>
      {/if}
    </div>
    <div class="flex flex-col gap-1 pt-1">
      {#each bands as band (band.band)}
        {@const hit = adjustedHit(band.hitBase, quality)}
        <div class="grid {grid} gap-1 text-center font-display text-sm">
          <span class={CELL_RANGE}>{formatRange(band.range, system)}</span>
          <span class={CELL_VALUE}>{adjustedRof(unit.Gun_ROF, quality)}</span>
          <span class={CELL_VALUE}>{hit}</span>
          {#if kind === "mg"}
            <span class={CELL_VALUE}>{hitInf(hit, unit.AI)}</span>
          {:else if kind === "autocannon"}
            <span class={CELL_VALUE}>{hitInf(hit, unit.AI)}</span>
            <span class={CELL_VALUE}>{formatPen(pen.he, band.penMod)}</span>
            <span class={CELL_VALUE}>{formatPen(pen.heat)}</span>
          {:else}
            <span class={CELL_VALUE}>{formatPen(pen.he, band.penMod)}</span>
            <span class={CELL_VALUE}>{formatPen(pen.heat)}</span>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="py-3 text-center text-sm text-muted">{kind === "mg" ? "No MG listed" : "Unarmed"}</p>
  {/if}
{/snippet}

{#if bare}
  {@render table()}
{:else}
  <section class="min-w-0 sm:col-span-2 xl:col-span-1">
    <div class="{STAT_HEAD} text-base leading-tight" {title}>
      {title}
    </div>
    {@render table()}
  </section>
{/if}
