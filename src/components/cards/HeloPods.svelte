<script lang="ts">
  import type { HeloPodPick, Vehicle } from "../../lib/ffot3/types";
  import {
    canIncrement,
    defaultVariant,
    familyLabel,
    pickForKey,
    podCost,
    setHeloCount,
    setHeloVariant,
    usedPodCount,
    variantsForKey,
    visibleHeloKeys,
    type HeloWeapon,
  } from "../../lib/ffot3/helo";
  import { formatAutocannonName, isAutocannonName } from "../../lib/ffot3/classify";
  import { STEP_BTN } from "../../lib/ffot3/ui";

  let {
    unit,
    picks = [],
    yearMin,
    yearMax,
    onChange,
  }: {
    unit: Vehicle;
    picks?: HeloPodPick[];
    yearMin?: number;
    yearMax?: number;
    onChange?: (next: HeloPodPick[]) => void;
  } = $props();

  const keys = $derived(visibleHeloKeys(unit, yearMin, yearMax));
  const used = $derived(usedPodCount(picks));

  function currentVariant(key: string): HeloWeapon | undefined {
    const pick = pickForKey(picks, key);
    const list = variantsForKey(key, yearMin, yearMax);
    return list.find((w) => w.id === pick?.variantId) ?? defaultVariant(key, yearMin, yearMax);
  }

  function inc(key: string) {
    const pick = pickForKey(picks, key);
    onChange?.(setHeloCount(unit, picks, key, (pick?.count ?? 0) + 1, yearMin, yearMax));
  }

  function dec(key: string) {
    const pick = pickForKey(picks, key);
    onChange?.(setHeloCount(unit, picks, key, (pick?.count ?? 0) - 1, yearMin, yearMax));
  }

  function choose(key: string, id: string) {
    onChange?.(setHeloVariant(picks, key, id));
  }

  function kindCaption(kind: HeloWeapon["kind"], label: string): string {
    if (kind === "rocket") return "Rocket";
    if (kind === "missile") return "Missile";
    if (kind === "aam") return "AAM";
    if (isAutocannonName(label)) return "Autocannon";
    if (/^(mg|hmg|lmg)\b/i.test(label)) return "Machine gun";
    return "Gun";
  }
</script>

<div class="flex flex-col gap-2">
  <p class="text-center font-display text-sm tabular-nums tracking-wider text-brass">
    {used} / {unit.pods} pods left
  </p>
  {#if unit.notes}
    <p class="text-center text-[11px] uppercase tracking-wider text-muted">{unit.notes}</p>
  {/if}

  <div class="flex max-h-72 flex-col gap-2 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
    {#each keys as key (key)}
      {@const pick = pickForKey(picks, key)}
      {@const count = pick?.count ?? 0}
      {@const variant = currentVariant(key)}
      {@const vars = variantsForKey(key, yearMin, yearMax)}
      {#if variant}
        <div class="rounded-[12px] border border-line bg-ink-3/60 p-2">
          <div class="flex items-center gap-2">
            <div class="min-w-0 flex-1">
              <span class="block truncate font-display text-sm tracking-wide uppercase">{formatAutocannonName(variant.label)}</span>
              <span class="block truncate text-[11px] uppercase tracking-wider text-muted">
                {kindCaption(variant.kind, variant.label)}
                · {count ? podCost(variant, count) : variant.costPerPod ?? variant.costByCount?.[0] ?? 0} pts
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class={STEP_BTN}
                aria-label="Remove {familyLabel(key)} pod"
                disabled={count <= 0}
                onclick={() => dec(key)}
              >
                −
              </button>
              <span class="w-6 text-center font-display text-lg tabular-nums">{count}</span>
              <button
                type="button"
                class={STEP_BTN}
                aria-label="Add {familyLabel(key)} pod"
                disabled={!canIncrement(unit, picks, key, yearMin, yearMax)}
                onclick={() => inc(key)}
              >
                +
              </button>
            </div>
          </div>

          {#if vars.length > 1}
            <div class="mt-2 flex flex-wrap gap-1">
              {#each vars as opt (opt.id)}
                <button
                  type="button"
                  class="h-8 rounded-full px-2.5 text-xs font-medium {variant.id === opt.id
                    ? 'bg-paper text-ink'
                    : 'border border-line text-paper'}"
                  onclick={() => choose(key, opt.id)}
                >
                  {opt.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
