<script lang="ts">
  import type { Vehicle } from "../../lib/ffot3/types";
  import type { VariantOption } from "../../lib/ffot3/variants";

  /**
   * Same-name variant picker under a card header: mark chips (when a card spans
   * several marks), then the era options of the current mark.
   */
  let {
    unit,
    variants,
    onVariant,
    inset = false,
  }: {
    unit: Vehicle;
    variants: VariantOption[];
    onVariant: (id: string) => void;
    /** Keep clear of the portrait card's points disc on the right. */
    inset?: boolean;
  } = $props();

  const marks = $derived([...new Set(variants.map((v) => v.mark).filter((m): m is string => !!m))]);
  const currentMark = $derived(variants.find((v) => v.id === unit.id)?.mark ?? null);
  const eraOptions = $derived(variants.filter((v) => v.mark === currentMark));
</script>

<div
  class="print:hidden flex flex-col gap-1.5 border-b border-line bg-ink-3/60 px-3 py-2 {inset
    ? 'pr-20'
    : ''}"
>
  {#if marks.length > 1}
    <div class="flex flex-wrap gap-1" role="radiogroup" aria-label="{unit.Name} marks">
      {#each marks as mark (mark)}
        {@const active = mark === currentMark}
        <button
          type="button"
          role="radio"
          aria-checked={active}
          class="h-8 rounded-md border px-2.5 font-display text-sm tracking-wide transition-colors duration-150 {active
            ? 'border-brass bg-brass text-ink'
            : 'border-line-2 text-paper hover:border-brass'}"
          onclick={() => onVariant(variants.find((v) => v.mark === mark)!.id)}
        >
          {mark}
        </button>
      {/each}
    </div>
  {/if}
  {#if eraOptions.length > 1}
    <div class="flex flex-wrap gap-1" role="radiogroup" aria-label="{unit.Name} eras">
      {#each eraOptions as v (v.id)}
        {@const active = v.id === unit.id}
        <button
          type="button"
          role="radio"
          aria-checked={active}
          class="flex shrink-0 flex-col items-start rounded-md border px-2.5 py-1 text-left transition-colors duration-150 {active
            ? 'border-brass/80 bg-paper text-ink'
            : 'border-line-2 text-paper hover:border-brass'}"
          onclick={() => onVariant(v.id)}
        >
          <span class="font-display text-sm leading-tight tracking-wide tabular-nums">
            {v.era} · {v.points} pts
          </span>
          {#if v.diffs.length}
            <span class="text-[10px] leading-tight tabular-nums {active ? 'text-ink/75' : 'text-muted'}">
              {v.diffs.join(" · ")}
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
