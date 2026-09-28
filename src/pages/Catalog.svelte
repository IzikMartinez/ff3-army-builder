<script lang="ts">
  import { onMount } from "svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import CatalogEntry from "../components/catalog/CatalogEntry.svelte";
  import {
    availableGunsFor,
    availableMissilesFor,
    filterUnits,
    unitsForNation,
  } from "../lib/ffot3/catalog";
  import {
    availableClasses,
    matchesClass,
    type UnitClassId,
  } from "../lib/ffot3/classify";
  import { YEAR_MAX, YEAR_MIN, eraOverlaps } from "../lib/ffot3/combat";
  import { NATION_BY_ID } from "../lib/ffot3/nations";
  import { force } from "../lib/ffot3/store";

  let { nationId }: { nationId: string } = $props();

  onMount(() => {
    force.setSearch("");
  });

  const nation = $derived(NATION_BY_ID[nationId]);

  let classId = $state<UnitClassId | null>(null);
  let gun = $state("");
  let missile = $state("");

  const decades = [
    { label: "All", min: YEAR_MIN, max: YEAR_MAX },
    { label: "1950s", min: 1950, max: 1959 },
    { label: "1960s", min: 1960, max: 1969 },
    { label: "1970s", min: 1970, max: 1979 },
    { label: "1980s", min: 1980, max: 1989 },
    { label: "1990s", min: 1990, max: 1999 },
    { label: "2000s", min: 2000, max: YEAR_MAX },
  ];

  const decadeSelected = $derived(
    decades.some((d) => d.label !== "All" && d.min === $force.yearMin && d.max === $force.yearMax),
  );

  const eraPool = $derived(
    unitsForNation(nationId).filter((u) => eraOverlaps(u, $force.yearMin, $force.yearMax)),
  );
  const typeOptions = $derived(availableClasses(eraPool));
  const typedPool = $derived(
    classId ? eraPool.filter((u) => matchesClass(u, classId)) : eraPool,
  );
  const gunOptions = $derived(availableGunsFor(typedPool, $force.yearMin, $force.yearMax));
  const missileOptions = $derived(availableMissilesFor(typedPool, $force.yearMin, $force.yearMax));

  const units = $derived(
    filterUnits(nationId, {
      query: $force.search,
      yearMin: $force.yearMin,
      yearMax: $force.yearMax,
      classId: decadeSelected ? classId : null,
      gun: decadeSelected ? gun : "",
      missile: decadeSelected ? missile : "",
    }),
  );

  function isDecadeActive(min: number, max: number) {
    return $force.yearMin === min && $force.yearMax === max;
  }

  function pickDecade(min: number, max: number) {
    classId = null;
    gun = "";
    missile = "";
    force.setYearRange(min, max);
  }

  $effect(() => {
    if (classId && !typeOptions.some((c) => c.id === classId)) {
      classId = null;
    }
  });

  $effect(() => {
    if (gun && !gunOptions.includes(gun)) gun = "";
    if (missile && !missileOptions.includes(missile)) missile = "";
  });
</script>

<div class="min-h-dvh">
  <AppHeader title={nation?.name ?? "Unknown nation"} backHref="/" />

  {#if !nation}
    <main class="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 class="font-display text-3xl">Nation not found</h2>
      <p class="mt-2 text-muted">That catalog is not in this build.</p>
    </main>
  {:else}
    <main class="mx-auto max-w-6xl px-4 py-5">
      <section class="print:hidden mb-5 rounded-[24px] border border-line bg-ink-2 p-4">
        <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div class="flex min-w-0 items-baseline gap-3">
            <span class="font-display text-2xl leading-none tracking-wide text-paper uppercase">{nation.short}</span>
            <span class="font-display text-xl leading-none tabular-nums text-brass">{$force.yearMin}–{$force.yearMax}</span>
          </div>
          <p class="text-sm text-muted">{units.length} cards in this window</p>
        </div>

        <div>
          <span class="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">Decade</span>
          <div class="flex flex-wrap gap-2">
            {#each decades as d (d.label)}
              <button
                type="button"
                class="h-11 rounded-full px-3 text-sm {isDecadeActive(d.min, d.max) ? 'bg-paper text-ink' : 'border border-line bg-ink text-paper'}"
                aria-pressed={isDecadeActive(d.min, d.max)}
                onclick={() => pickDecade(d.min, d.max)}
              >
                {d.label}
              </button>
            {/each}
          </div>
        </div>

        {#if decadeSelected && typeOptions.length}
          <div class="mt-4">
            <span class="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">Type</span>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="h-11 rounded-full px-3 text-sm {classId === null ? 'bg-paper text-ink' : 'border border-line bg-ink text-paper'}"
                aria-pressed={classId === null}
                onclick={() => (classId = null)}
              >
                All types
              </button>
              {#each typeOptions as c (c.id)}
                <button
                  type="button"
                  class="h-11 rounded-full px-3 text-sm {classId === c.id ? 'bg-paper text-ink' : 'border border-line bg-ink text-paper'}"
                  aria-pressed={classId === c.id}
                  onclick={() => (classId = c.id)}
                >
                  {c.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        {#if decadeSelected && (gunOptions.length || missileOptions.length)}
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            {#if gunOptions.length}
              <label class="block">
                <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Gun</span>
                <select
                  class="h-11 w-full rounded-[12px] border border-line bg-ink px-3 text-base text-paper"
                  value={gun}
                  onchange={(e) => (gun = e.currentTarget.value)}
                >
                  <option value="">Any gun</option>
                  {#each gunOptions as g (g)}
                    <option value={g}>{g}</option>
                  {/each}
                </select>
              </label>
            {/if}
            {#if missileOptions.length}
              <label class="block">
                <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Missile</span>
                <select
                  class="h-11 w-full rounded-[12px] border border-line bg-ink px-3 text-base text-paper"
                  value={missile}
                  onchange={(e) => (missile = e.currentTarget.value)}
                >
                  <option value="">Any missile</option>
                  {#each missileOptions as m (m)}
                    <option value={m}>{m}</option>
                  {/each}
                </select>
              </label>
            {/if}
          </div>
        {/if}

        <label class="mt-4 block">
          <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Search units</span>
          <input
            class="h-11 w-full rounded-[12px] border border-line bg-ink px-3 text-base text-paper placeholder:text-muted"
            placeholder="Name, gun, missile, or towed weapon"
            value={$force.search}
            oninput={(e) => force.setSearch(e.currentTarget.value)}
          />
        </label>
      </section>

      {#if units.length === 0}
        <div class="rounded-[24px] border border-line bg-ink-2 px-4 py-16 text-center">
          <p class="font-display text-2xl">No units in this window</p>
          <p class="mt-2 text-muted">
            {decadeSelected ? "Pick another type, weapon, or decade." : "Choose a decade to start filtering, or search by name."}
          </p>
        </div>
      {:else}
        <ul class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {#each units as unit (unit.id)}
            <CatalogEntry {unit} yearMin={$force.yearMin} yearMax={$force.yearMax} bw={$force.bwMode} />
          {/each}
        </ul>
      {/if}
    </main>
  {/if}
</div>
