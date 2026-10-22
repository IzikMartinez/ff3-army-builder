<script lang="ts">
  import type { InfantryWeapon, Quality, Vehicle } from "../../lib/ffot3/types";
  import {
    adjustedHit,
    adjustedRof,
    clampHit,
    formatRange,
    formatRangeBand,
    gunBands,
    hitInf,
    missileHit,
  } from "../../lib/ffot3/combat";
  import { CELL_RANGE, CELL_VALUE, GUN_HEAD, STAT_HEAD, penCell } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";

  let { unit, quality }: { unit: Vehicle; quality: Quality } = $props();

  const scale = $derived($force.scale);
  const inf = $derived(unit.infantry!);
  const bands = $derived(gunBands(unit.Gun_Rng));

  type Row = { type: string; pen: string; rof: string; rng: string; hit: string; tag: string };

  /** "12h2" → pen "12h", generation 2; "2A" (SAM) → pen 2, all-aspect. */
  function parseWeapon(type: "LAW" | "MAW" | "SAM", w: InfantryWeapon): Row {
    const missile = w.rof.endsWith("*");
    const rof = w.rof.replace("*", "");
    const rng = w.rng === "C" ? "CC" : w.rng.includes("-")
      ? formatRangeBand(w.rng.split("-").map(Number), scale)
      : formatRange(Number(w.rng), scale);
    if (type === "SAM") {
      const aspect = w.pen.slice(-1);
      // 17.4: SAMs hit helicopters on 5+ at short/effective range, quality applies.
      return {
        type, pen: w.pen.replace(/[AR]$/, ""), rof, rng,
        hit: `${clampHit(5 - quality.hit_mod)}`,
        tag: aspect === "A" ? "all-aspect" : aspect === "R" ? "rear-aspect" : "",
      };
    }
    const gen = /h(\d)\D*$/.exec(w.pen)?.[1];
    const pen = gen ? w.pen.replace(/(h)\d/, "$1") : w.pen;
    // Guided missiles (generation marked) use 13.4.6; infantry missiles are
    // limited ammo (B.11 example). Others hit as a gun at effective range.
    const hit = gen
      ? missileHit(Number(gen), false, quality).hit
      : adjustedHit(4, quality);
    const tags = [gen ? `gen ${gen}` : "", missile && Number(gen) === 1 ? "no fire if moved" : "", pen.includes("†") ? "top attack" : ""];
    return { type, pen, rof, rng, hit: `${hit}`, tag: tags.filter(Boolean).join(" · ") };
  }

  const weapons = $derived(
    (
      [
        ["LAW", inf.law],
        ["MAW", inf.maw],
        ["SAM", inf.sam],
      ] as const
    )
      .filter(([, w]) => w)
      .map(([t, w]) => parseWeapon(t, w!)),
  );
</script>

<section class="min-w-0 sm:col-span-2 xl:col-span-1">
  <div class="{STAT_HEAD} h-8 text-lg">Anti-Infantry</div>
  <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
    Close combat ROF {adjustedRof(inf.rof[1], quality)}{#if inf.reducedOnMove} · −1 ROF if moved{/if}
  </p>
  <div class="{GUN_HEAD} grid grid-cols-3">
    <span class="py-1">Range</span>
    <span class="py-1">ROF</span>
    <span class="py-1">Hit Inf</span>
  </div>
  <div class="flex flex-col gap-1 pt-1">
    {#each bands as band (band.band)}
      <div class="grid grid-cols-3 gap-1">
        <span class={CELL_RANGE}>{formatRange(band.range, scale)}</span>
        <span class={CELL_VALUE}>{adjustedRof(inf.rof[0], quality)}</span>
        <span class={CELL_VALUE}>{hitInf(adjustedHit(band.hitBase, quality), unit.AI)}</span>
      </div>
    {/each}
  </div>
</section>

{#if weapons.length}
  <section class="min-w-0 sm:col-span-2 xl:col-span-1">
    <div class="{STAT_HEAD} h-8 text-lg">AT &amp; AA Weapons</div>
    <p class="mb-1 truncate text-center text-[10px] uppercase tracking-[0.16em] text-muted" title={unit.notes}>
      {unit.notes || "Weapons"}
    </p>
    <div class="{GUN_HEAD} grid grid-cols-5">
      <span class="py-1">Type</span>
      <span class="py-1">Pen</span>
      <span class="py-1">ROF</span>
      <span class="py-1">Range</span>
      <span class="py-1">Hit</span>
    </div>
    <div class="flex flex-col gap-1 pt-1">
      {#each weapons as w (w.type)}
        <div class="grid grid-cols-5 gap-1">
          <span class={CELL_RANGE}>{w.type}</span>
          <span class={w.type === "SAM" ? CELL_VALUE : penCell(w.pen)}>{w.pen}</span>
          <span class={CELL_VALUE}>{w.rof}</span>
          <span class={CELL_VALUE}>{w.rng}</span>
          <span class={CELL_VALUE}>{w.hit}</span>
        </div>
        {#if w.tag}
          <p class="-mt-0.5 text-center text-[10px] uppercase tracking-wider text-muted">{w.type}: {w.tag}</p>
        {/if}
      {/each}
    </div>
  </section>
{/if}
