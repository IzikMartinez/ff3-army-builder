<script lang="ts">
  import { untrack } from "svelte";
  import { armyListsFor } from "../../lib/ffot3/armyLists";
  import {
    compose,
    formationsForYear,
    type Choices,
    type FormationSpec,
    type LineAlt,
    type ResolvedGroup,
  } from "../../lib/ffot3/formations";
  import { DEFAULT_QUALITY, QUALITIES, QUALITY_BY_ID, unitStandBase } from "../../lib/ffot3/catalog";
  import { force } from "../../lib/ffot3/store";
  import { qualityLabel } from "../../lib/ffot3/combat";

  /**
   * Order of battle: pick an Appendix E combat formation (regiment, battalion…)
   * for a year, adjust its equipment and options, and add every stand at once.
   */
  let {
    nationId,
    initialYear,
    onClose,
  }: { nationId: string; initialYear: number; onClose: () => void } = $props();

  const lists = $derived(armyListsFor(nationId));
  let listId = $state(untrack(() => armyListsFor(nationId)[0]?.id ?? ""));
  const list = $derived(lists.find((l) => l.id === listId) ?? lists[0]);
  const yearSpan = $derived(
    list
      ? [
          Math.min(...list.formations.map((f) => f.years[0])),
          Math.max(...list.formations.map((f) => f.years[1])),
        ]
      : [1970, 2015],
  );
  let year = $state(untrack(() => initialYear));
  const years = $derived(
    Array.from({ length: yearSpan[1]! - yearSpan[0]! + 1 }, (_, i) => yearSpan[0]! + i),
  );
  const formations = $derived(list ? formationsForYear(list, year) : []);
  let formationId = $state<string | null>(null);
  const formation = $derived<FormationSpec | undefined>(
    formations.find((f) => f.id === formationId) ?? formations[0],
  );
  let qualityId = $state(untrack(() => $force.qualityId));
  const quality = $derived(QUALITY_BY_ID[qualityId] ?? DEFAULT_QUALITY);

  let choices = $state<Choices>({ roles: {}, alts: {}, attachments: {} });
  const comp = $derived(list && formation ? compose(list, formation, year, choices) : null);
  const standCount = $derived(comp?.stands.reduce((n, s) => n + s.count, 0) ?? 0);
  const points = $derived(
    comp?.stands.reduce(
      (sum, s) => sum + Math.round(unitStandBase(s.unit, s.missileId) * quality.point_mod) * s.count,
      0,
    ) ?? 0,
  );
  let added = $state(false);

  // Keep the year inside the chosen list's span.
  $effect(() => {
    const [a, b] = yearSpan;
    if (year < a! || year > b!) year = Math.min(b!, Math.max(a!, year));
  });

  function pickFormation(id: string) {
    formationId = id;
    choices = { roles: choices.roles, alts: {}, attachments: {} };
  }

  function setRole(term: string, key: string) {
    choices = { ...choices, roles: { ...choices.roles, [term]: key } };
  }
  function setAlt(path: string, i: number) {
    choices = { ...choices, alts: { ...choices.alts, [path]: i } };
  }
  function toggleAttachment(i: number) {
    choices = { ...choices, attachments: { ...choices.attachments, [i]: !choices.attachments[i] } };
  }

  function addAll() {
    if (!comp) return;
    force.addBatch(
      comp.stands.map((s) => ({ unitId: s.unit.id, quantity: s.count, missileId: s.missileId })),
      qualityId,
    );
    added = true;
    setTimeout(() => (added = false), 1200);
  }

  /** Button text for a line alternative; all-zero alternatives are "None". */
  function altLabel(alt: LineAlt): string {
    const parts = alt.filter((slot) => slot[0]!.n > 0).map((slot) => `${slot[0]!.n} ${slot[0]!.term}`);
    return parts.length ? parts.join(" + ") : "None";
  }

  const SEG = "rounded-full border px-2.5 py-1 text-xs transition-colors duration-150";
  const SEG_ON = "border-brass bg-brass text-ink";
  const SEG_OFF = "border-line-2 text-paper hover:border-brass";
  const SELECT = "h-9 rounded-[10px] border border-line bg-ink px-2 text-sm text-paper";
</script>

{#snippet group(g: ResolvedGroup)}
  <div class="rounded-[14px] border border-line bg-ink p-3">
    <p class="mb-2 flex items-baseline justify-between gap-2 font-display text-sm tracking-wide uppercase">
      <span>{g.label}</span>
      {#if g.times > 1}<span class="text-brass">×{g.times}</span>{/if}
    </p>
    <ul class="flex flex-col gap-1.5">
      {#each g.lines as l (l.path)}
        <li class="flex flex-col gap-1">
          {#if l.line.alts.length > 1}
            <div class="flex flex-wrap gap-1" role="radiogroup" aria-label="Choose one">
              {#each l.line.alts as alt, i (i)}
                <button
                  type="button"
                  class="{SEG} {i === l.altIndex ? SEG_ON : SEG_OFF}"
                  onclick={() => setAlt(l.path, i)}
                >
                  {altLabel(alt)}
                </button>
              {/each}
            </div>
          {/if}
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {#each l.slots.filter((s) => s.resolved.item.n > 0) as s (s.path)}
              <span class="inline-flex flex-wrap items-center gap-1.5">
                <span class="font-display tabular-nums text-brass">{s.resolved.item.n}×</span>
                {#if s.options.length > 1}
                  {#each s.options as opt, i (i)}
                    <button
                      type="button"
                      class="{SEG} {i === s.chosen ? SEG_ON : SEG_OFF}"
                      onclick={() => setAlt(s.path, i)}>{opt.term}</button
                    >
                  {/each}
                {/if}
                {#if s.resolved.candidate}
                  <span class="text-paper">{s.resolved.candidate.label}</span>
                {:else}
                  <span class="text-danger" title="No card for this in {year}"
                    >no {s.resolved.item.term} in {year}</span
                  >
                {/if}
                {#if s.resolved.item.recon}
                  <span class="rounded-full bg-ink-3 px-1.5 text-[10px] uppercase tracking-wider text-muted"
                    >recon</span
                  >
                {/if}
              </span>
            {/each}
          </div>
        </li>
      {/each}
    </ul>
    {#if g.note}<p class="mt-2 text-[11px] text-muted">{g.note}</p>{/if}
  </div>
{/snippet}

<section
  class="print:hidden mb-5 flex flex-col gap-4 rounded-[20px] border border-brass/60 bg-ink-2 p-3 sm:p-4"
  aria-label="Order of battle"
>
  <div class="flex items-start justify-between gap-3 px-1">
    <div>
      <h2 class="font-display text-2xl leading-none tracking-wide uppercase">Order of battle</h2>
      <p class="mt-1 text-xs text-muted">
        Real combat formations from the rulebook's army lists. Pick one, adjust it, and add every
        stand to the force.
      </p>
    </div>
    <button
      type="button"
      class="h-9 shrink-0 rounded-[10px] border border-line px-3 text-sm text-paper hover:border-brass"
      onclick={onClose}>Close</button
    >
  </div>

  {#if !list}
    <p class="px-1 text-sm text-muted">No army lists for this nation yet.</p>
  {:else}
    <div class="flex flex-wrap items-end gap-3 px-1">
      {#if lists.length > 1}
        <div class="flex flex-wrap gap-1" role="radiogroup" aria-label="Army list">
          {#each lists as l (l.id)}
            <button
              type="button"
              class="h-9 rounded-[10px] border px-3 text-sm {l.id === list.id
                ? 'border-brass bg-brass text-ink'
                : 'border-line text-paper hover:border-brass'}"
              onclick={() => {
                listId = l.id;
                formationId = null;
                choices = { roles: {}, alts: {}, attachments: {} };
              }}>{l.name}</button
            >
          {/each}
        </div>
      {/if}
      <label class="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
        Year
        <select class={SELECT} value={year} onchange={(e) => (year = Number(e.currentTarget.value))}>
          {#each years as y (y)}<option value={y}>{y}</option>{/each}
        </select>
      </label>
      <label class="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
        Quality
        <select class={SELECT} value={qualityId} onchange={(e) => (qualityId = e.currentTarget.value)}>
          {#each QUALITIES as q (q.experience)}<option value={q.experience}>{qualityLabel(q)}</option>{/each}
        </select>
      </label>
    </div>

    {#if formations.length === 0}
      <p class="px-1 text-sm text-muted">No {list.name} formations in {year}.</p>
    {:else}
      <div class="flex flex-wrap gap-1.5 px-1" role="radiogroup" aria-label="Formation">
        {#each formations as f (f.id)}
          <button
            type="button"
            role="radio"
            aria-checked={f.id === formation?.id}
            class="flex flex-col items-start rounded-[12px] border px-3 py-1.5 text-left {f.id ===
            formation?.id
              ? 'border-brass bg-paper text-ink'
              : 'border-line text-paper hover:border-brass'}"
            onclick={() => pickFormation(f.id)}
          >
            <span class="font-display text-base leading-tight tracking-wide">{f.name}</span>
            <span class="text-[11px] tabular-nums opacity-70"
              >{f.years[1] >= 2015 ? `${f.years[0]}+` : `${f.years[0]}–${f.years[1]}`}</span
            >
          </button>
        {/each}
      </div>
    {/if}

    {#if comp && formation}
      {#if comp.terms.length}
        <div class="grid gap-2 px-1 sm:grid-cols-2 lg:grid-cols-3">
          {#each comp.terms as t (t.term)}
            <label class="flex min-w-0 items-center gap-2">
              <span class="w-28 shrink-0 text-xs uppercase tracking-[0.12em] text-muted">{t.term}</span>
              <select
                class="{SELECT} min-w-0 flex-1"
                value={t.chosen?.key}
                onchange={(e) => setRole(t.term, e.currentTarget.value)}
              >
                {#each t.candidates as c (c.key)}<option value={c.key}>{c.label}</option>{/each}
              </select>
            </label>
          {/each}
        </div>
      {/if}

      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {#each comp.groups as g, i (i)}
          {@render group(g)}
        {/each}
      </div>
      {#if formation.note}<p class="px-1 text-xs text-muted">{formation.note}</p>{/if}

      {#if comp.attachments.length}
        <details class="rounded-[14px] border border-line px-3 py-2">
          <summary class="cursor-pointer font-display text-sm tracking-wide uppercase">
            Attachments & artillery support
            <span class="ml-1 text-muted normal-case tracking-normal"
              >({comp.attachments.filter((a) => a.included).length} added)</span
            >
          </summary>
          <div class="mt-2 flex flex-col gap-2">
            {#each comp.attachments as a (a.index)}
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-[var(--color-brass)]"
                    checked={a.included}
                    onchange={() => toggleAttachment(a.index)}
                  />
                  {a.label}
                  <span class="text-xs text-muted"
                    >{a.lines.map((l) => altLabel(l.line.alts[l.altIndex]!)).join("; ")}</span
                  >
                </label>
                {#if a.included}{@render group(a)}{/if}
              </div>
            {/each}
          </div>
        </details>
      {/if}

      <div
        class="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-ink px-3 py-2 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.7)]"
      >
        <div class="min-w-0 text-sm">
          <span class="font-display text-lg tabular-nums">{standCount}</span> stands ·
          <span class="font-display text-lg tabular-nums">{points}</span> pts
          <span class="text-muted">({qualityLabel(quality)})</span>
          {#if comp.missing.length}
            <p class="text-xs text-danger">
              Skipped, no card in {year}: {comp.missing.join(", ")}
            </p>
          {/if}
          <p class="text-[11px] text-muted">{list.source}</p>
        </div>
        <button
          type="button"
          class="h-11 rounded-[12px] px-5 text-sm font-medium transition-colors duration-150 {added
            ? 'bg-ok text-on-nation'
            : 'bg-paper text-ink'}"
          disabled={standCount === 0}
          onclick={addAll}
        >
          {added ? "Added to force" : `Add ${standCount} stands to force`}
        </button>
      </div>
    {/if}
  {/if}
</section>
