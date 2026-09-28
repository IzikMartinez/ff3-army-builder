<script lang="ts">
  import type { TowedPick, Vehicle } from "../../lib/ffot3/types";
  import { TOWED_WEAPONS, getUnit, towedWeaponPoints } from "../../lib/ffot3/catalog";
  import {
    canAddTowed,
    formatCap,
    pickForTowed,
    remainingCap,
    setTowedCount,
    towedCap,
    visibleTowed,
  } from "../../lib/ffot3/towed";
  import { formatEra } from "../../lib/ffot3/combat";
  import { gunLabel } from "../../lib/ffot3/classify";
  import { STEP_BTN } from "../../lib/ffot3/ui";

  let {
    unit,
    picks = [],
    yearMin,
    yearMax,
    onChange,
  }: {
    unit: Vehicle;
    picks?: TowedPick[];
    yearMin?: number;
    yearMax?: number;
    onChange?: (next: TowedPick[]) => void;
  } = $props();

  const options = $derived(visibleTowed(unit, TOWED_WEAPONS, yearMin, yearMax));
  const remain = $derived(remainingCap(unit, picks, getUnit));
  const maxCap = $derived(towedCap(unit));

  function inc(weapon: Vehicle) {
    const pick = pickForTowed(picks, weapon.id);
    onChange?.(setTowedCount(unit, picks, weapon, (pick?.count ?? 0) + 1, getUnit));
  }

  function dec(weapon: Vehicle) {
    const pick = pickForTowed(picks, weapon.id);
    onChange?.(setTowedCount(unit, picks, weapon, (pick?.count ?? 0) - 1, getUnit));
  }
</script>

<div class="flex flex-col gap-2">
  <p class="text-center font-display text-sm tabular-nums tracking-wider text-brass">
    {formatCap(remain)} / {formatCap(maxCap)} cap left
  </p>
  <div class="flex max-h-72 flex-col gap-2 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
    {#each options as weapon (weapon.id)}
      {@const pick = pickForTowed(picks, weapon.id)}
      {@const count = pick?.count ?? 0}
      {@const cost = towedWeaponPoints(weapon, yearMin, yearMax)}
      {@const need = towedCap(weapon)}
      {@const gun = gunLabel(weapon)}
      <div class="rounded-[12px] border border-line bg-ink-3/60 p-2">
        <div class="flex items-center gap-2">
          <div class="min-w-0 flex-1">
            <span class="block truncate font-display text-sm tracking-wide uppercase">{weapon.Name}</span>
            <span class="block truncate text-[11px] uppercase tracking-wider text-muted">
              cap {formatCap(need)}
              · {cost} pts
              {#if gun}· {gun}{/if}
              · {formatEra(weapon.era.start_era, weapon.era.end_era)}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class={STEP_BTN}
              aria-label="Remove {weapon.Name}"
              disabled={count <= 0}
              onclick={() => dec(weapon)}
            >
              −
            </button>
            <span class="w-6 text-center font-display text-lg tabular-nums">{count}</span>
            <button
              type="button"
              class={STEP_BTN}
              aria-label="Add {weapon.Name}"
              disabled={!canAddTowed(unit, picks, weapon, getUnit)}
              onclick={() => inc(weapon)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
