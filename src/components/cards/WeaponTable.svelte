<script lang="ts">
  import type { Quality, Vehicle } from "../../lib/ffot3/types";
  import {
    adjustedHit,
    adjustedRof,
    formatPen,
    formatRange,
    gunBands,
    hitInf,
    ammoMarks,
    parsePen,
    splitEquip,
  } from "../../lib/ffot3/combat";
  import { gunLabel, weaponCaption, weaponKind } from "../../lib/ffot3/classify";
  import {
    AMMO_HINT,
    CELL_HEAT,
    CELL_HIT_SPLIT,
    HIT_HALF_INF,
    HIT_HALF_VEH,
    CELL_RANGE,
    CELL_VALUE,
    GUN_HEAD,
    STAT_HEAD,
  } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import WeaponBadges from "./WeaponBadges.svelte";

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
  // One Pen column: white half = AP (range-modified) or HE (flat), orange half =
  // HEAT (flat). A gun with only one kind gets a single cell in that colour.
  const white = $derived(pen.ap !== null || pen.he !== null);
  const orange = $derived(pen.heat !== null);
  const hasPen = $derived(white || orange);
  // Pen takes one column's width; with both colours it's two half-width parts
  // (white | orange) under one header. Values that don't change with range
  // (HE, HEAT) are one tall cell across all three bands; AP is per band.
  const penTracks = $derived(
    white && orange ? "minmax(0, 0.5fr) minmax(0, 0.5fr)" : hasPen ? "minmax(0, 1fr)" : "",
  );
  const gridStyle = $derived(`grid-template-columns: repeat(3, minmax(0, 1fr)) ${penTracks}`);
  const whiteFlat = $derived(pen.ap === null && pen.he !== null);
  const whitePen = (penMod: number) =>
    pen.ap !== null ? formatPen(pen.ap, penMod) : pen.he !== null ? String(pen.he) : "";
  const badges = $derived([...ammoMarks(pen), ...splitEquip(unit.Equip).weapon]);
</script>

{#snippet table()}
  {#if sub}
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">{sub}</p>
  {/if}
  {#if unit.Gun_Rng > 0 && kind !== "none"}
    <div class="{GUN_HEAD} grid gap-1" style={gridStyle}>
      <span class="py-1">Range</span>
      <span class="py-1">ROF</span>
      <span class="py-1" title="White: to-hit vs vehicles. Green: to-hit vs infantry.">Hit</span>
      {#if hasPen}
        <span
          class="py-1 {white && orange ? 'col-span-2' : ''}"
          title="White: AP / HE penetration. Orange: HEAT penetration.">Pen</span
        >
      {/if}
    </div>
    <div class="grid gap-1 pt-1" style={gridStyle}>
      {#each bands as band, i (band.band)}
        {@const hit = adjustedHit(band.hitBase, quality)}
        <span class={CELL_RANGE}>{formatRange(band.range, scale)}</span>
        <span class={CELL_VALUE}>{adjustedRof(unit.Gun_ROF, quality)}</span>
        <span class={CELL_HIT_SPLIT}>
          <span class={HIT_HALF_VEH} title="To-hit vs vehicles">{hit}</span>
          <span class={HIT_HALF_INF} title="To-hit vs infantry (AI modifier applied)"
            >{hitInf(hit, unit.AI)}</span
          >
        </span>
        {#if white && !whiteFlat}
          <!-- AP: changes with range, one value per band. -->
          <span class="{CELL_VALUE} {orange ? 'rounded-r-none' : ''}" title={AMMO_HINT.ap}
            >{whitePen(band.penMod)}</span
          >
        {/if}
        {#if i === 0}
          <!-- Flat values (HE, HEAT) once, spanning all three bands. Kept last in
               the row so grid auto-placement fills the bands beside them. -->
          {#if whiteFlat}
            <span class="{CELL_VALUE} row-span-3 flex items-center justify-center" title={AMMO_HINT.he}
              >{pen.he}</span
            >
          {/if}
          {#if orange}
            <span
              class="{CELL_HEAT} row-span-3 {white ? '-ml-1 rounded-l-none' : ''}"
              title={AMMO_HINT.heat}>{pen.heat}</span
            >
          {/if}
        {/if}
      {/each}
    </div>
    <WeaponBadges ai={unit.AI} marks={badges} />
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
