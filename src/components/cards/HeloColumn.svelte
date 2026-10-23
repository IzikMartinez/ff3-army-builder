<script lang="ts">
  import type { Quality } from "../../lib/ffot3/types";
  import type { HeloWeapon } from "../../lib/ffot3/helo";
  import { podCost } from "../../lib/ffot3/helo";
  import {
    adjustedHit,
    aiMark,
    ammoMarks,
    missileMarks,
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
  import {
    CELL_HIT_SPLIT,
    CELL_RANGE,
    CELL_VALUE,
    GUN_HEAD,
    HIT_HALF_INF,
    HIT_HALF_VEH,
    STAT_HEAD,
    nationSurface,
    penCell,
  } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import EquipBubbles from "./EquipBubbles.svelte";
  import GunLadder from "./GunLadder.svelte";

  let {
    weapon,
    count = 1,
    quality,
    nationId = "",
    bare = false,
  }: {
    weapon: HeloWeapon;
    count?: number;
    quality: Quality;
    nationId?: string;
    /** Portrait loadout card: the wrapper names the pod, guns use the sideways ladder. */
    bare?: boolean;
  } = $props();


  const scale = $derived($force.scale);
  const isMissile = $derived(weapon.kind === "missile" || weapon.kind === "aam");
  const isRocket = $derived(weapon.kind === "rocket");
  const isMg = $derived(weapon.kind === "mg");
  const isAc = $derived(weapon.kind === "ac");
  // 17.3.1, counted per missile type: 4 pods = unlimited, 2–3 = limited,
  // 1 = very limited (fires twice per game, limited-ammo to-hit). One-shot
  // AAMs fire once per pod and have no ammo status.
  const ammo = $derived(
    weapon.oneShot ? null : count >= 4 ? "unlimited" : count >= 2 ? "limited" : "very-limited",
  );
  const unlimitedMissiles = $derived(ammo === "unlimited");
  const hit = $derived(
    isMissile ? missileHit(weapon.generation ?? 2, unlimitedMissiles, quality) : null,
  );
  const cost = $derived(podCost(weapon, count));
  const title = $derived(formatAutocannonName(weapon.label));
  const rangeLabel = $derived(
    weapon.range[0] > 0
      ? `${formatRangeBand(weapon.range, scale)}`
      : formatRange(weapon.range[1], scale),
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

  const grid = "grid-cols-4";
  const surface = $derived(nationSurface(nationId));
  const rocketRange = $derived(formatRange(30, scale));
</script>

<section class={bare ? "min-w-0" : "min-w-0 sm:col-span-2 xl:col-span-1"}>
  {#if !bare}
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
  {/if}

  {#if isMissile && hit}
    <div
      class="grid grid-cols-4 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted"
    >
      <span>Range</span>
      <span>ROF</span>
      <span>Hit</span>
      <span>Pen</span>
    </div>
    <div class="mt-1 grid grid-cols-4 gap-1 text-center font-display text-sm">
      <span class={CELL_RANGE}>{rangeLabel}</span>
      <span class={CELL_VALUE}>{weapon.rof}</span>
      <span class={CELL_VALUE}>{hit.hit}</span>
      <span class={penCell(weapon.pen)}>{!weapon.pen || weapon.pen === "-" ? "—" : weapon.pen}</span>
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
      <span class={penCell(weapon.pen)}>{!weapon.pen || weapon.pen === "-" ? "—" : weapon.pen}</span>
      <span class="{CELL_VALUE} text-xs">Area</span>
    </div>
  {:else if (isAc || isMg) && bare}
    <GunLadder range={weapon.range[1]} rof={weapon.rof} pen={[weapon.pen]} ai={weapon.ai ?? 0} {quality} />
  {:else if isAc || isMg}
    <div class="{GUN_HEAD} grid {grid}">
      <span class="py-1">Range</span>
      <span class="py-1">ROF</span>
      <span class="py-1" title="White: to-hit vs vehicles. Green: to-hit vs infantry.">Hit</span>
      <span class="py-1" title="White: AP penetration.">Pen</span>
    </div>
    <div class="flex flex-col gap-1 pt-1">
      {#each bands as band (band.band)}
        {@const bandHit = adjustedHit(band.hitBase, quality)}
        <div class="grid {grid} gap-1">
          <span class={CELL_RANGE}>{formatRange(band.range, scale)}</span>
          <span class={CELL_VALUE}>{adjustedRof(weapon.rof, quality)}</span>
          <span class={CELL_HIT_SPLIT}>
            <span class={HIT_HALF_VEH} title="To-hit vs vehicles">{bandHit}</span>
            <span class={HIT_HALF_INF} title="To-hit vs infantry (AI modifier applied)"
              >{hitInf(bandHit, weapon.ai)}</span
            >
          </span>
          <span class={penCell(pen.ap)}>{formatPen(pen.ap, band.penMod)}</span>
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
      <span class={penCell(weapon.pen)}>{!weapon.pen || weapon.pen === "-" ? "—" : weapon.pen}</span>
    </div>
    {#if weapon.oneShot}
      <p class="mt-1 text-center text-[11px] uppercase tracking-wider text-muted">1 shot/pod</p>
    {/if}
  {/if}

  {#if !((isAc || isMg) && bare)}
  <div
    class="badge-strip bg-strip px-2 py-1 rounded-b-lg flex gap-1 items-center justify-start text-center mt-2"
  >
    {#if isMissile}
      <EquipBubbles
        marks={missileMarks({
          generation: weapon.generation,
          ammo: weapon.oneShot ? null : ammo,
          heat: /h\d?$/.test(weapon.pen),
          topAttack: weapon.topAttack,
          oneShot: weapon.oneShot,
          platform: "helo",
        })}
      />
    {/if}
    {#if isAc || isMg}
      <EquipBubbles marks={[aiMark(weapon.ai ?? 0), ...ammoMarks(pen)]} />
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
  </div>
  {/if}
  {#if weapon.notes}
    <p class="mt-1 text-center text-[11px] leading-snug text-muted">{weapon.notes}</p>
  {/if}
</section>
