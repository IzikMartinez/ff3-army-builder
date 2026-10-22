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
  import {
    AMMO_HEAD,
    AMMO_HINT,
    CELL_AP,
    CELL_HEAT,
    CELL_RANGE,
    CELL_VALUE,
    GUN_HEAD,
    STAT_HEAD,
  } from "../../lib/ffot3/ui";
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

  const scale = $derived($force.scale);
  const kind = $derived(weaponKind(unit));
  const title = $derived(
    heading ??
      (gunLabel(unit) ||
        (kind === "mg" ? "Machine Gun" : kind === "autocannon" ? "Autocannon" : "Gun")),
  );
  const sub = $derived(caption ?? weaponCaption(kind));
  const bands = $derived(gunBands(unit.Gun_Rng));
  const pen = $derived(parsePen(unit.Gun_Pen));
  const showHitInf = $derived(kind === "mg" || kind === "autocannon");
  // Only the ammo this gun actually has. Flat (HEAT, HE) columns go last so
  // their row-spanning cells sit at the end of each grid row.
  const cols = $derived(
    3 + (showHitInf ? 1 : 0) + (pen.ap !== null ? 1 : 0) + (pen.heat !== null ? 1 : 0) + (pen.he !== null ? 1 : 0),
  );
  const gridStyle = $derived(`grid-template-columns: repeat(${cols}, minmax(0, 1fr))`);
</script>

{#snippet table()}
  {#if sub}
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">{sub}</p>
  {/if}
  {#if unit.Gun_Rng > 0 && kind !== "none"}
    <div class="{GUN_HEAD} grid gap-1" style={gridStyle}>
      <span class="py-1">Range</span>
      <span class="py-1">ROF</span>
      <span class="py-1">Hit</span>
      {#if showHitInf}<span class="py-1">Hit Inf</span>{/if}
      {#if pen.ap !== null}
        <span class="{AMMO_HEAD} bg-ammo-ap text-white" title={AMMO_HINT.ap}>AP</span>
      {/if}
      {#if pen.heat !== null}
        <span class="{AMMO_HEAD} bg-ammo-heat text-[#1a1406]" title={AMMO_HINT.heat}>HEAT</span>
      {/if}
      {#if pen.he !== null}
        <span class="{AMMO_HEAD} bg-ammo-ap text-white" title={AMMO_HINT.he}>HE</span>
      {/if}
    </div>
    <div class="grid gap-1 pt-1" style={gridStyle}>
      {#each bands as band, i (band.band)}
        {@const hit = adjustedHit(band.hitBase, quality)}
        <span class={CELL_RANGE}>{formatRange(band.range, scale)}</span>
        <span class={CELL_VALUE}>{adjustedRof(unit.Gun_ROF, quality)}</span>
        <span class={CELL_VALUE}>{hit}</span>
        {#if showHitInf}<span class={CELL_VALUE}>{hitInf(hit, unit.AI)}</span>{/if}
        {#if pen.ap !== null}
          <span class={CELL_AP}>{formatPen(pen.ap, band.penMod)}</span>
        {/if}
        {#if i === 0}
          <!-- HEAT and HE ignore range: one cell across all three bands. -->
          {#if pen.heat !== null}
            <span class="{CELL_HEAT} row-span-3" title={AMMO_HINT.heat}>{pen.heat}</span>
          {/if}
          {#if pen.he !== null}
            <span class="{CELL_AP} row-span-3 flex items-center justify-center" title={AMMO_HINT.he}
              >{pen.he}</span
            >
          {/if}
        {/if}
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
