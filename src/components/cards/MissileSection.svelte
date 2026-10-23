<script lang="ts">
  import type { EquipMark, Quality, Vehicle } from "../../lib/ffot3/types";
  import { missileChoices } from "../../lib/ffot3/catalog";
  import { formatRange, missileHit, missileMarks, resolveLoadout } from "../../lib/ffot3/combat";
  import { CELL_RANGE, CELL_VALUE, nationSurface, penCell } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import WeaponBadges from "./WeaponBadges.svelte";

  /**
   * The unit's own missile sub-card: option buttons, Range/ROF/Hit/Pen, and
   * generation badges. `portrait` swaps the nation banner for a plain heading.
   */
  let {
    unit,
    quality,
    missileId = null,
    yearMin,
    yearMax,
    bw = false,
    onMissile,
    extraMarks = [],
    portrait = false,
  }: {
    unit: Vehicle;
    quality: Quality;
    missileId?: string | null;
    yearMin?: number;
    yearMax?: number;
    bw?: boolean;
    onMissile?: (id: string | null) => void;
    /** Gun badges that land here when the unit has no gun table. */
    extraMarks?: EquipMark[];
    portrait?: boolean;
  } = $props();

  const scale = $derived($force.scale);
  const options = $derived(missileChoices(unit, missileId, yearMin, yearMax));
  // Same resolution as unitBasePoints, so the shown missile is the one priced.
  const loadout = $derived(resolveLoadout(unit, missileId));
  const mslStats = $derived(loadout ? missileHit(loadout.generation, loadout.unlimited, quality) : null);
  const surface = $derived(nationSurface(unit.nation));
</script>

<section class={portrait ? "min-w-0" : "min-w-0 sm:col-span-2 xl:col-span-1"}>
  {#if portrait}
    <div class="mb-2 flex items-baseline justify-between gap-2">
      <span class="min-w-0 truncate font-display text-lg tracking-wide uppercase"
        >{loadout?.label ?? "No ATGM"}</span
      >
      <span class="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Missile</span>
    </div>
  {:else}
    <div
      class="mb-1 flex min-h-10 items-center justify-center rounded-sm px-2 py-1.5 text-center {bw
        ? 'bg-black text-white'
        : surface}"
    >
      <span class="block font-display text-[1.65rem] leading-none tracking-[0.18em] uppercase">
        {loadout?.label ?? "No ATGM"}
      </span>
    </div>
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">Missile</p>
  {/if}

  {#if onMissile && (options.length > 1 || !unit.missileRequired)}
    <div class="mb-2 flex flex-wrap gap-1 print:hidden">
      {#if !unit.missileRequired}
        <button
          type="button"
          class="h-8 rounded-full px-2.5 text-xs font-medium {loadout
            ? 'border border-line text-muted'
            : 'bg-paper text-ink'}"
          onclick={() => onMissile(null)}
        >
          None
        </button>
      {/if}
      {#each options as opt (opt.id)}
        <button
          type="button"
          class="h-8 rounded-full px-2.5 text-xs font-medium {loadout?.id === opt.id
            ? 'bg-paper text-ink'
            : 'border border-line text-paper'}"
          onclick={() => onMissile(opt.id)}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  {/if}

  {#if loadout && mslStats}
    <div
      class="grid grid-cols-4 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted"
    >
      <span>Range</span>
      <span>ROF</span>
      <span>Hit</span>
      <span>Pen</span>
    </div>
    <div class="mt-1 grid grid-cols-4 gap-1">
      <span class={CELL_RANGE}>
        {formatRange(loadout.range[0], scale)}–{formatRange(loadout.range[1], scale)}
      </span>
      <span class={CELL_VALUE}>{loadout.rof}</span>
      <span class={CELL_VALUE}>{mslStats.hit}</span>
      <span class={penCell(loadout.pen, { missile: !loadout.sam })}>{loadout.pen}</span>
    </div>
  {:else}
    <p class="py-3 text-center text-sm text-muted">Gun tank · missile stowed</p>
  {/if}
  <WeaponBadges
    marks={[
      ...(loadout
        ? missileMarks({
            generation: loadout.generation,
            ammo: loadout.unlimited ? "unlimited" : "limited",
            heat: true,
            topAttack: loadout.topAttack,
            sam: loadout.sam,
            platform: "ground",
          })
        : []),
      ...extraMarks,
    ]}
  />
</section>
