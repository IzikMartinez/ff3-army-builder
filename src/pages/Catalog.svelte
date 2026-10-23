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
    CLASS_FAMILIES,
    SUBTYPE_LABEL,
    classifyUnit,
    type UnitClassId,
  } from "../lib/ffot3/classify";
  import { YEAR_MAX, YEAR_MIN, eraOverlaps } from "../lib/ffot3/combat";
  import { NATION_BY_ID } from "../lib/ffot3/nations";
  import { force } from "../lib/ffot3/store";
  import type { Vehicle } from "../lib/ffot3/types";
  import { cardName, groupByName, variantsForBand } from "../lib/ffot3/variants";

  let { nationId }: { nationId: string } = $props();

  onMount(() => {
    force.setSearch("");
  });

  const nation = $derived(NATION_BY_ID[nationId]);

  /** Type family chip, and optionally one of its sub-types. */
  let family = $state<string | null>(null);
  let sub = $state<UnitClassId | null>(null);
  let gun = $state("");
  let missile = $state("");
  let moreOpen = $state(false);
  let moreEl = $state<HTMLElement | null>(null);

  const eras = [
    { id: "all", label: "All years", min: YEAR_MIN, max: YEAR_MAX },
    { id: "1950s", label: "1950s", min: 1950, max: 1959 },
    { id: "1960s", label: "1960s", min: 1960, max: 1969 },
    { id: "1970s", label: "1970s", min: 1970, max: 1979 },
    { id: "1980s", label: "1980s", min: 1980, max: 1989 },
    { id: "1990s", label: "1990s", min: 1990, max: 1999 },
    { id: "2000s", label: "2000s", min: 2000, max: YEAR_MAX },
  ];
  const era = $derived(
    eras.find((e) => e.min === $force.yearMin && e.max === $force.yearMax) ?? eras[0]!,
  );
  const decadeSelected = $derived(era.id !== "all");

  // Distinct cards (same-name / mark-family variants count once).
  const countCards = (units: Vehicle[]) => new Set(units.map(cardName)).size;

  const eraPool = $derived(
    unitsForNation(nationId).filter((u) => eraOverlaps(u, $force.yearMin, $force.yearMax)),
  );
  const classOf = $derived(new Map(eraPool.map((u) => [u.id, classifyUnit(u)])));
  type Family = (typeof CLASS_FAMILIES)[number];
  const inFamily = (u: Vehicle, f: Family) => f.classes.includes(classOf.get(u.id)!);

  const families = $derived(
    CLASS_FAMILIES.map((f) => ({ ...f, count: countCards(eraPool.filter((u) => inFamily(u, f))) })).filter(
      (f) => f.count > 0,
    ),
  );
  const activeFamily = $derived(CLASS_FAMILIES.find((f) => f.id === family) ?? null);
  const subtypes = $derived(
    activeFamily
      ? activeFamily.classes
          .map((c) => ({
            id: c,
            label: SUBTYPE_LABEL[c] ?? c,
            count: countCards(eraPool.filter((u) => classOf.get(u.id) === c)),
          }))
          .filter((c) => c.count > 0)
      : [],
  );
  const typedPool = $derived(
    sub
      ? eraPool.filter((u) => classOf.get(u.id) === sub)
      : activeFamily
        ? eraPool.filter((u) => inFamily(u, activeFamily))
        : eraPool,
  );
  const gunOptions = $derived(availableGunsFor(typedPool, $force.yearMin, $force.yearMax));
  const missileOptions = $derived(availableMissilesFor(typedPool, $force.yearMin, $force.yearMax));

  const units = $derived.by(() => {
    const list = filterUnits(nationId, {
      query: $force.search,
      yearMin: $force.yearMin,
      yearMax: $force.yearMax,
      classId: sub,
      gun,
      missile,
    });
    return activeFamily && !sub ? list.filter((u) => inFamily(u, activeFamily)) : list;
  });
  // A decade narrows each card to the variants serving most of it.
  const cards = $derived(
    decadeSelected
      ? groupByName(units).map((g) => variantsForBand(g, $force.yearMin, $force.yearMax))
      : groupByName(units),
  );

  const moreCount = $derived((gun ? 1 : 0) + (missile ? 1 : 0));
  const anyActive = $derived(
    decadeSelected || !!family || !!gun || !!missile || !!$force.search.trim(),
  );

  function pickEra(id: string) {
    const e = eras.find((x) => x.id === id) ?? eras[0]!;
    force.setYearRange(e.min, e.max);
  }

  function pickFamily(id: string | null) {
    family = family === id ? null : id;
    sub = null;
  }

  function clearAll() {
    family = null;
    sub = null;
    gun = "";
    missile = "";
    force.setSearch("");
    pickEra("all");
  }

  // Drop selections the current era/type no longer offers.
  $effect(() => {
    if (family && !families.some((f) => f.id === family)) family = null;
    if (sub && !subtypes.some((s) => s.id === sub)) sub = null;
  });
  $effect(() => {
    if (gun && !gunOptions.includes(gun)) gun = "";
    if (missile && !missileOptions.includes(missile)) missile = "";
  });

  function closeMoreOnOutside(e: MouseEvent) {
    if (moreOpen && moreEl && !moreEl.contains(e.target as Node)) moreOpen = false;
  }

  const CHIP =
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-150";
  const CHIP_ON = "border-paper bg-paper text-ink";
  const CHIP_OFF = "border-line bg-ink text-paper hover:border-brass";
  const ACTIVE_CHIP =
    "inline-flex h-7 items-center gap-1 rounded-full bg-ink-3 pl-2.5 pr-1.5 text-xs text-paper";
  const CLEAR_X = "px-1 text-muted hover:text-paper";
</script>

<svelte:window
  onclick={closeMoreOnOutside}
  onkeydown={(e) => {
    if (e.key === "Escape") moreOpen = false;
  }}
/>

<div class="min-h-dvh">
  <AppHeader title={nation?.name ?? "Unknown nation"} backHref="/" />

  {#if !nation}
    <main class="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 class="font-display text-3xl">Nation not found</h2>
      <p class="mt-2 text-muted">That catalog is not in this build.</p>
    </main>
  {:else}
    <main class="mx-auto max-w-6xl px-4 py-5">
      <section
        class="print:hidden mb-5 flex flex-col gap-3 rounded-[20px] border border-line bg-ink-2 p-3 sm:p-4"
      >
        <div class="flex items-baseline justify-between gap-3 px-1">
          <div class="flex min-w-0 items-baseline gap-2.5">
            <span class="font-display text-xl leading-none tracking-wide text-paper uppercase"
              >{nation.short}</span
            >
            <span class="font-display text-lg leading-none tabular-nums text-brass"
              >{$force.yearMin}–{$force.yearMax}</span
            >
          </div>
          <span class="shrink-0 text-sm tabular-nums text-muted">{cards.length} cards</span>
        </div>

        <!-- Row 1: search, era, weapons (gun / missile) -->
        <div class="flex gap-2">
          <label class="relative min-w-0 flex-1">
            <span class="sr-only">Search units</span>
            <svg
              class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg
            >
            <input
              class="h-10 w-full rounded-[12px] border border-line bg-ink pr-3 pl-9 text-base text-paper placeholder:text-muted"
              placeholder="Search name, gun, missile…"
              value={$force.search}
              oninput={(e) => force.setSearch(e.currentTarget.value)}
            />
          </label>
          <label class="shrink-0">
            <span class="sr-only">Era</span>
            <select
              class="h-10 rounded-[12px] border bg-ink px-3 text-sm text-paper {decadeSelected
                ? 'border-brass'
                : 'border-line'}"
              value={era.id}
              onchange={(e) => pickEra(e.currentTarget.value)}
            >
              {#each eras as e (e.id)}
                <option value={e.id}>{e.label}</option>
              {/each}
            </select>
          </label>
          {#if gunOptions.length || missileOptions.length}
            <div class="relative shrink-0" bind:this={moreEl}>
              <button
                type="button"
                class="{CHIP} h-10 rounded-[12px] {moreCount ? 'border-brass bg-ink text-paper' : CHIP_OFF}"
                aria-expanded={moreOpen}
                onclick={() => (moreOpen = !moreOpen)}
              >
                Weapons
                {#if moreCount}
                  <span class="rounded-full bg-brass px-1.5 text-xs text-ink tabular-nums"
                    >{moreCount}</span
                  >
                {/if}
                <span aria-hidden="true" class="text-xs">▾</span>
              </button>
              {#if moreOpen}
                <div
                  class="absolute right-0 z-20 mt-2 flex w-72 max-w-[calc(100vw-3rem)] flex-col gap-3 rounded-[14px] border border-line bg-ink p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]"
                >
                  {#if gunOptions.length}
                    <label class="block">
                      <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted">Gun</span>
                      <select
                        class="h-10 w-full rounded-[10px] border border-line bg-ink-2 px-2 text-sm text-paper"
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
                      <span class="mb-1 block text-xs uppercase tracking-[0.16em] text-muted"
                        >Missile</span
                      >
                      <select
                        class="h-10 w-full rounded-[10px] border border-line bg-ink-2 px-2 text-sm text-paper"
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
            </div>
          {/if}
        </div>

        <!-- Row 2: type families -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            class="{CHIP} {family === null ? CHIP_ON : CHIP_OFF}"
            onclick={() => pickFamily(null)}
          >
            All types
          </button>
          {#each families as f (f.id)}
            <button
              type="button"
              class="{CHIP} {family === f.id ? CHIP_ON : CHIP_OFF}"
              aria-pressed={family === f.id}
              onclick={() => pickFamily(f.id)}
            >
              {f.label}
              <span class="text-xs tabular-nums opacity-60">{f.count}</span>
            </button>
          {/each}

        </div>

        <!-- Row 3: sub-types of the picked family -->
        {#if activeFamily && subtypes.length > 1}
          <div class="-mt-1 flex flex-wrap gap-1.5 border-l-2 border-brass pl-2.5">
            <button
              type="button"
              class="{CHIP} h-8 text-xs {sub === null ? CHIP_ON : CHIP_OFF}"
              onclick={() => (sub = null)}
            >
              All {activeFamily.label.toLowerCase()}
            </button>
            {#each subtypes as s (s.id)}
              <button
                type="button"
                class="{CHIP} h-8 text-xs {sub === s.id ? CHIP_ON : CHIP_OFF}"
                aria-pressed={sub === s.id}
                onclick={() => (sub = sub === s.id ? null : s.id)}
              >
                {s.label}
                <span class="tabular-nums opacity-60">{s.count}</span>
              </button>
            {/each}
          </div>
        {/if}

        <!-- Active filters -->
        {#if anyActive}
          <div class="flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
            {#if decadeSelected}
              <span class={ACTIVE_CHIP}
                >{era.label}<button
                  type="button"
                  class={CLEAR_X}
                  aria-label="Clear era"
                  onclick={() => pickEra("all")}>✕</button
                ></span
              >
            {/if}
            {#if activeFamily}
              <span class={ACTIVE_CHIP}
                >{activeFamily.label}{sub ? ` · ${SUBTYPE_LABEL[sub] ?? sub}` : ""}<button
                  type="button"
                  class={CLEAR_X}
                  aria-label="Clear type"
                  onclick={() => pickFamily(null)}>✕</button
                ></span
              >
            {/if}
            {#if gun}
              <span class={ACTIVE_CHIP}
                >Gun: {gun}<button
                  type="button"
                  class={CLEAR_X}
                  aria-label="Clear gun"
                  onclick={() => (gun = "")}>✕</button
                ></span
              >
            {/if}
            {#if missile}
              <span class={ACTIVE_CHIP}
                >Missile: {missile}<button
                  type="button"
                  class={CLEAR_X}
                  aria-label="Clear missile"
                  onclick={() => (missile = "")}>✕</button
                ></span
              >
            {/if}
            {#if $force.search.trim()}
              <span class={ACTIVE_CHIP}
                >“{$force.search.trim()}”<button
                  type="button"
                  class={CLEAR_X}
                  aria-label="Clear search"
                  onclick={() => force.setSearch("")}>✕</button
                ></span
              >
            {/if}
            <button
              type="button"
              class="ml-auto text-xs text-muted underline underline-offset-2 hover:text-paper"
              onclick={clearAll}
            >
              Clear all
            </button>
          </div>
        {/if}
      </section>

      {#if cards.length === 0}
        <div class="rounded-[24px] border border-line bg-ink-2 px-4 py-16 text-center">
          <p class="font-display text-2xl">No units match</p>
          <p class="mt-2 text-muted">Loosen a filter above, or clear them all.</p>
        </div>
      {:else}
        <ul class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {#each cards as variants (`${variants[0]!.nation}::${cardName(variants[0]!)}`)}
            <CatalogEntry
              {variants}
              yearMin={$force.yearMin}
              yearMax={$force.yearMax}
              bw={$force.bwMode}
            />
          {/each}
        </ul>
      {/if}
    </main>
  {/if}
</div>
