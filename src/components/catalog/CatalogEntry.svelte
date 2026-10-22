<script lang="ts">
  import { untrack } from "svelte";
  import UnitCard from "../UnitCard.svelte";
  import {
    DEFAULT_QUALITY,
    QUALITY_BY_ID,
    TOWED_WEAPONS,
    defaultMissileId,
    getUnit,
    unitHasMissiles,
    unitHasTowedOptions,
    visibleMissiles,
  } from "../../lib/ffot3/catalog";
  import { isHelicopter } from "../../lib/ffot3/helo";
  import { sanitizeTowedPicks, towedPicksEqual } from "../../lib/ffot3/towed";
  import { force } from "../../lib/ffot3/store";
  import type { HeloPodPick, TowedPick, Vehicle } from "../../lib/ffot3/types";
  import { variantOptions } from "../../lib/ffot3/variants";

  let {
    variants,
    yearMin,
    yearMax,
    bw = false,
  }: {
    /** Same-name cards, sorted by era; the picker switches between them. */
    variants: Vehicle[];
    yearMin: number;
    yearMax: number;
    bw?: boolean;
  } = $props();

  let selectedId = $state(untrack(() => variants[0]!.id));
  // Falls back to the first variant when the year filter hides the selected one.
  const unit = $derived(variants.find((v) => v.id === selectedId) ?? variants[0]!);
  const variantList = $derived(variants.length > 1 ? variantOptions(variants) : []);

  let qualityId = $state(DEFAULT_QUALITY.experience);
  let missileId = $state<string | null>(untrack(() => defaultMissileId(unit, yearMin, yearMax)));
  let heloPods = $state<HeloPodPick[]>([]);
  let towedLoad = $state<TowedPick[]>([]);
  let dedicated = $state(false);
  let added = $state(false);
  let addedTimer: ReturnType<typeof setTimeout> | null = null;

  const options = $derived(visibleMissiles(unit, yearMin, yearMax));
  const wide = $derived(
    Boolean(unit.infantry && (unit.infantry.law || unit.infantry.maw || unit.infantry.sam)) ||
      Boolean(unit.indirect) ||
      unitHasMissiles(unit, yearMin, yearMax) ||
      (isHelicopter(unit) && (unit.pods ?? 0) > 0 && (unit.podOptionKeys?.length ?? 0) > 0) ||
      unitHasTowedOptions(unit, yearMin, yearMax),
  );
  const quality = $derived(QUALITY_BY_ID[qualityId] ?? DEFAULT_QUALITY);

  $effect(() => {
    const ids = new Set(options.map((o) => o.id));
    const fallback = defaultMissileId(unit, yearMin, yearMax);
    if (missileId && !ids.has(missileId)) {
      missileId = fallback;
    } else if (unit.missileRequired && !missileId && fallback) {
      missileId = fallback;
    }
  });

  $effect(() => {
    const next = sanitizeTowedPicks(unit, towedLoad, TOWED_WEAPONS, yearMin, yearMax, getUnit).map(
      (p) => {
        const w = getUnit(p.id);
        if (!w || !w.missileRequired) return p;
        const visible = visibleMissiles(w, yearMin, yearMax).some((m) => m.id === p.missileId);
        return visible ? p : { ...p, missileId: defaultMissileId(w, yearMin, yearMax) };
      },
    );
    if (!towedPicksEqual(towedLoad, next)) {
      towedLoad = next;
    }
  });

  function add() {
    force.addUnit(unit.id, qualityId, missileId, heloPods, towedLoad, dedicated);
    added = true;
    if (addedTimer) clearTimeout(addedTimer);
    addedTimer = setTimeout(() => {
      added = false;
    }, 900);
  }
</script>

<li class="min-w-0 {wide ? 'xl:col-span-2' : ''}">
  <div class="flex flex-col gap-2">
    <UnitCard
      {unit}
      {quality}
      {bw}
      {missileId}
      {heloPods}
      {towedLoad}
      {dedicated}
      variants={variantList}
      onVariant={(id) => (selectedId = id)}
      {yearMin}
      {yearMax}
      onQuality={(id) => (qualityId = id)}
      onMissile={(id) => (missileId = id)}
      onHeloPods={(next) => (heloPods = next)}
      onTowed={(next) => (towedLoad = next)}
      onDedicated={(next) => (dedicated = next)}
    />
    <div class="print:hidden flex justify-end">
      <button
        type="button"
        class="h-11 min-w-28 rounded-[12px] px-5 text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.98] {added
          ? 'bg-ok text-paper'
          : 'bg-paper text-ink'}"
        onclick={add}
      >
        {added ? "Added" : "Add to force"}
      </button>
    </div>
  </div>
</li>
