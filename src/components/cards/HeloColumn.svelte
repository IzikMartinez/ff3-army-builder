<script lang="ts">
  import type { Quality } from "../../lib/ffot3/types";
  import type { HeloWeapon } from "../../lib/ffot3/helo";
  import { heloFireNote, podCost } from "../../lib/ffot3/helo";
  import {
    adjustedHit,
    adjustedRof,
    formatPen,
    formatRange,
    formatRangeBand,
    gunBands,
    hitInf,
    missileHit,
    parsePen,
  } from "../../lib/ffot3/combat";
  import { formatAutocannonName, isAutocannonName, weaponKind } from "../../lib/ffot3/classify";
  import { CELL_RANGE, CELL_VALUE, GUN_HEAD, STAT_HEAD, nationSurface } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import EquipBubbles from "./EquipBubbles.svelte";

  let {
    weapon,
    count = 1,
    quality,
    nationId = "",
    missileCount = 0,
  }: {
    weapon: HeloWeapon;
    count?: number;
    quality: Quality;
    nationId?: string;
    missileCount?: number;
  } = $props();

  $inspect("Weapon", weapon);
  $inspect("count", missileCount);

  const system = $derived($force.rangeSystem);
  const isMissile = $derived(weapon.kind === "missile" || weapon.kind === "aam");
  const isRocket = $derived(weapon.kind === "rocket");
  const isMg = $derived(weapon.kind === "mg");
  const isAc = $derived(weapon.kind === "ac");
  const hit = $derived(isMissile ? missileHit(weapon.generation ?? 2, false) : null);
  const cost = $derived(podCost(weapon, count));
  const title = $derived(formatAutocannonName(weapon.label));
  const rangeLabel = $derived(
    weapon.range[0] > 0
      ? `${formatRangeBand(weapon.range, system)}`
      : formatRange(weapon.range[1], system),
  );
  const pen = $derived(parsePen([weapon.pen]));
  const bands = $derived(gunBands(weapon.range[1]));
  const kindCaptionMap = new Map([
    ["aam", "AAM Pod"],
    ["mg", "MG Pod"],
    ["ac", "Autocannon Pod"],
    ["rocket", "Rocket Pod"],
    ["missile", "Missile Pod"],
  ]);

  const grid = $derived(isMg ? "grid-cols-5" : isAc ? "grid-cols-5" : "grid-cols-4");
  const surface = $derived(nationSurface(nationId));
  const unlimitedMissiles = $derived(missileCount >= 4);
  const derivedHit = $derived.by(() => {
    switch (weapon.generation) {
      case 1:
        return 6;
      case 2:
        return 4;
      case 3:
        return 3;
      default:
        return -1;
    }
  });
  const rocketRange = $derived(formatRange(30, system));
</script>

<section class="min-w-0 sm:col-span-2 xl:col-span-1">
  <div
    class="mb-1 flex min-h-9 items-center justify-center rounded-sm px-2 py-1.5 text-center {surface} bw:bg-black bw:text-white"
  >
    <span class="block font-display text-[1.35rem] leading-none tracking-[0.16em] uppercase">
      {title}{#if count > 1}&nbsp;×{count}{/if}
    </span>
  </div>

  <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
    {kindCaptionMap.get(weapon.kind)} · {cost} pts
  </p>

  {#if isMissile && hit}
    <div
      class="grid grid-cols-5 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted"
    >
      <span>Range</span>
      <span>ROF</span>
      <span>Pen</span>
      <span>Hit</span>
    </div>
    <div class="mt-1 grid grid-cols-5 gap-1 text-center font-display text-sm">
      <span class={CELL_RANGE}>{rangeLabel}</span>
      <span class={CELL_VALUE}>{weapon.rof}</span>
      <span class={CELL_VALUE}>{!weapon.pen || weapon.pen === "-" ? "—" : weapon.pen}</span>
      <span class={CELL_VALUE}>{derivedHit - (unlimitedMissiles ? 1 : 0)}</span>
    </div>
  {:else if isRocket}
    <div
      class="grid grid-cols-5 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted"
    >
      <span>Range</span>
      <span>ROF</span>
      <span>Pen</span>
      <span>Hit</span>
    </div>
    <div class="mt-1 grid grid-cols-5 gap-1 text-center font-display text-sm">
      <span class={CELL_RANGE}>{rocketRange}</span>
      <span class={CELL_VALUE}>{weapon.rof}</span>
      <span class={CELL_VALUE}>{!weapon.pen || weapon.pen === "-" ? "—" : weapon.pen}</span>
      <span class={CELL_VALUE}>{derivedHit - (unlimitedMissiles ? 1 : 0)}</span>
    </div>
  {:else if isAc || isMg}
    <div class="{GUN_HEAD} grid {grid}">
      <span class="py-1">Range</span>
      <span class="py-1">ROF</span>
      <span class="py-1">Hit</span>
      <span class="py-1">Hit Inf</span>
      <span class="py-1">Pen</span>
    </div>
    <div class="flex flex-col gap-1 pt-1">
      {#each bands as band (band.band)}
        {@const bandHit = adjustedHit(band.hitBase, quality)}
        <div class="grid {grid} gap-1">
          <span class={CELL_RANGE}>{formatRange(band.range, system)}</span>
          <span class={CELL_VALUE}>{adjustedRof(weapon.rof, quality)}</span>
          <span class={CELL_VALUE}>{bandHit}</span>
          <span class={CELL_VALUE}>{hitInf(bandHit, weapon.ai)}</span>
          <span class={CELL_VALUE}>{formatPen(pen.he, band.penMod)}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="{GUN_HEAD} grid grid-cols-4">
      <span class="py-1">Range</span>
      <span class="py-1">ROF</span>
      <span class="py-1">Hit</span>
      <span class="py-1">Pen</span>
    </div>
    <div class="mt-1 grid grid-cols-4 gap-1">
      <span class={CELL_RANGE}>{rangeLabel}</span>
      <span class={CELL_VALUE}>{weapon.rof}</span>
      <span class={CELL_VALUE}>{!weapon.pen || weapon.pen === "-" ? "—" : weapon.pen}</span>
    </div>
    {#if weapon.oneShot}
      <p class="mt-1 text-center text-[11px] uppercase tracking-wider text-muted">1 shot/pod</p>
    {/if}
  {/if}

  <div
    class="bg-paper-2 px-2 py-1 rounded-b-lg flex gap-1 items-center justify-start text-center mt-2"
  >
    {#if isMissile}
      {#if unlimitedMissiles}
        <EquipBubbles
          marks={[
            {
              code: "Unlim",
              name: "Unlimited Ammo",
              effect:
                "The amount of ammo for this weapon is functionally limitless. Inceases chance to hit",
            },
          ]}
        />
      {:else}
        <EquipBubbles
          marks={[
            {
              code: "hl",
              name: "Limited Ammo",
              effect: "Limited ammo results in thin missile barages. Reduced chance to hit",
            },
          ]}
        />
      {/if}
    {/if}
    {#if weapon.generation}
      <EquipBubbles
        marks={[
          {
            code: `G${weapon.generation}`,
            name: `Generation ${weapon.generation} Missile`,
            effect: heloFireNote(weapon.generation),
          },
        ]}
      />
    {/if}
    {#if weapon.pen.endsWith("h")}
      <EquipBubbles
        marks={[
          {
            code: "Heat",
            name: "High Explosive Anti-Tank",
            effect: "Armor Penetration does not degrade with range",
          },
        ]}
      />
    {/if}
    {#if isRocket}
      <EquipBubbles
        marks={[
          {
            code: "AoE",
            name: "Area Fire",
            effect: "Armor Penetration does not degrade with range",
          },
        ]}
      />
    {/if}
    {#if weapon.topAttack}
      · Top attack{/if}
    {#if weapon.oneShot}
      · 1 shot/pod{/if}
  </div>
  {#if weapon.notes}
    <p class="mt-1 text-center text-[11px] leading-snug text-muted">{weapon.notes}</p>
  {/if}
</section>
