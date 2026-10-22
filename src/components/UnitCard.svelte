<script lang="ts">
  import type { HeloPodPick, Quality, TowedPick, Vehicle } from "../lib/ffot3/types";
  import type { VariantOption } from "../lib/ffot3/variants";
  import { NATION_BY_ID } from "../lib/ffot3/nations";
  import {
    CELL_RANGE,
    CELL_VALUE,
    STAT_HEAD,
    nationSurface,
    qualityBtnClass,
  } from "../lib/ffot3/ui";
  import { force } from "../lib/ffot3/store";
  import {
    armorLabels,
    decodeEquip,
    formatEra,
    formatRange,
    missileHit,
    resolveLoadout,
    terrainMove,
  } from "../lib/ffot3/combat";
  import { getUnit, missileChoices, TOWED_WEAPONS, unitStandBase } from "../lib/ffot3/catalog";
  import { weaponKind } from "../lib/ffot3/classify";
  import { isHelicopter, isTransportHelo, selectedHeloWeapons } from "../lib/ffot3/helo";
  import {
    formatCap,
    isTowed,
    isZeroMoveTowed,
    remainingCap,
    selectedTowed,
    towedCap,
    visibleTowed,
  } from "../lib/ffot3/towed";
  import QualityPicker from "./QualityPicker.svelte";
  import EquipBubbles from "./cards/EquipBubbles.svelte";
  import HeloPods from "./cards/HeloPods.svelte";
  import HeloColumn from "./cards/HeloColumn.svelte";
  import TowedPicker from "./cards/TowedPicker.svelte";
  import TowedColumn from "./cards/TowedColumn.svelte";
  import WeaponTable from "./cards/WeaponTable.svelte";
  import InfantryColumn from "./cards/InfantryColumn.svelte";
  import IndirectColumn from "./cards/IndirectColumn.svelte";

  let {
    unit,
    quality,
    bw = false,
    quantity = 1,
    missileId = null,
    heloPods = [],
    towedLoad = [],
    dedicated = false,
    variants = [],
    onVariant,
    onQuality,
    onMissile,
    onHeloPods,
    onTowed,
    onDedicated,
    yearMin,
    yearMax,
  }: {
    unit: Vehicle;
    quality: Quality;
    bw?: boolean;
    quantity?: number;
    missileId?: string | null;
    heloPods?: HeloPodPick[];
    towedLoad?: TowedPick[];
    dedicated?: boolean;
    onQuality?: (id: string) => void;
    onMissile?: (id: string | null) => void;
    onHeloPods?: (picks: HeloPodPick[]) => void;
    onTowed?: (picks: TowedPick[]) => void;
    onDedicated?: (dedicated: boolean) => void;
    /** Same-name variants (2+) for the picker under the header. */
    variants?: VariantOption[];
    onVariant?: (id: string) => void;
    yearMin?: number;
    yearMax?: number;
  } = $props();

  const nation = $derived(NATION_BY_ID[unit.nation]);
  const helo = $derived(isHelicopter(unit));
  const towedUnit = $derived(isTowed(unit));
  const showMove = $derived(!isZeroMoveTowed(unit));
  const move = $derived(Number(unit.move_value) || 0);
  const moveType = $derived(unit.move_type[0] ?? "tracked");
  const terrain = $derived(terrainMove(move, moveType));
  const transport = $derived(isTransportHelo(unit));
  const isDedicated = $derived(transport && dedicated);
  const basePts = $derived(unitStandBase(unit, missileId, heloPods, towedLoad, isDedicated));
  const standCost = $derived(Math.round(basePts * quality.point_mod));
  const infantry = $derived(unit.kind === "infantry" && unit.infantry ? unit.infantry : null);
  const armor = $derived(
    helo || unit.armorSoft
      ? [{ label: "Armor", value: unit.armorSoft ? "Soft" : (unit.armor[0] ?? 0) }]
      : armorLabels(unit.armor),
  );
  const options = $derived(missileChoices(unit, missileId, yearMin, yearMax));
  const hasMissileFeature = $derived(!helo && options.length > 0);
  const hasPods = $derived(helo && (unit.pods ?? 0) > 0 && (unit.podOptionKeys?.length ?? 0) > 0);
  const towedOptions = $derived(visibleTowed(unit, TOWED_WEAPONS, yearMin, yearMax));
  const hasTowedFeature = $derived(towedOptions.length > 0);
  const towedMounted = $derived(selectedTowed(towedLoad, getUnit));
  const heloMounted = $derived(selectedHeloWeapons(heloPods));
  const showCapacity = $derived(!towedUnit && towedCap(unit) > 0);
  const capMax = $derived(towedCap(unit));
  const capRemain = $derived(remainingCap(unit, towedLoad, getUnit));
  // Same resolution as unitBasePoints, so the shown missile is the one priced.
  const loadout = $derived(resolveLoadout(unit, missileId));
  const mslStats = $derived(loadout ? missileHit(loadout.generation, loadout.unlimited, quality) : null);
  const equip = $derived(decodeEquip(unit.Equip));
  const scale = $derived($force.scale);
  const kind = $derived(weaponKind(unit));
  // Infantry anti-infantry fire has its own column; Gun_* holds its AI ratings.
  const showWeapon = $derived(kind !== "none" && !infantry);
  const colCount = $derived(
    (showMove ? 2 : 1) +
      (showWeapon ? 1 : 0) +
      (infantry ? (infantry.law || infantry.maw || infantry.sam ? 2 : 1) : 0) +
      (unit.indirect ? 1 : 0) +
      (hasMissileFeature ? 1 : 0) +
      (hasPods ? 1 : 0) +
      heloMounted.length +
      (hasTowedFeature ? 1 : 0) +
      towedMounted.length,
  );
  const gridClass = $derived(
    colCount >= 4 ? "xl:grid-cols-4" : colCount === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2",
  );
  const moveRows = $derived([
    ["Normal", terrain.normal],
    ["Rough", terrain.rough],
    ["Bad", terrain.bad],
    ["Road", terrain.road],
  ] as const);
  // Variant picker: mark chips (when a card spans several marks), then the
  // era options of the current mark.
  const marks = $derived([...new Set(variants.map((v) => v.mark).filter((m): m is string => !!m))]);
  const currentMark = $derived(variants.find((v) => v.id === unit.id)?.mark ?? null);
  const eraOptions = $derived(variants.filter((v) => v.mark === currentMark));
  const surface = $derived(nationSurface(unit.nation));
  const qualityClass = $derived(qualityBtnClass(unit.nation, bw));

  function pickMissile(id: string | null) {
    onMissile?.(id);
  }

</script>

<article
  data-bw={bw ? "true" : undefined}
  class="flex flex-col rounded-lg border border-line bg-ink-2 text-paper shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] break-inside-avoid bw:border-black bw:bg-white bw:text-black bw:shadow-none"
>
  <header
    class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-t-[17px] px-3 py-2 {bw
      ? 'bg-black text-white'
      : surface}"
  >
    <div class="flex min-w-0 items-baseline gap-2">
      <span class="font-display text-sm tracking-[0.14em] uppercase"
        >{nation?.short ?? unit.nation}</span
      >
      <span class="font-display text-sm tabular-nums opacity-90"
        >{formatEra(unit.era.start_era, unit.era.end_era)}</span
      >
      {#if isDedicated}
        <span
          class="self-center truncate rounded-sm bg-brass px-1.5 py-0.5 font-display text-[0.7rem] tracking-[0.14em] text-ink uppercase bw:bg-white bw:text-black"
          title="Dedicated transport: double cost (Rule 17.10)">Dedicated · 2× pts</span
        >
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <span
        class="inline-flex h-9 min-w-12 items-center justify-center rounded-sm border px-2.5 font-display text-[1.05rem] tracking-wide tabular-nums {bw
          ? 'border-white bg-white text-black'
          : 'border-current/40 bg-current/15'}"
        title="Points per stand"
        aria-label="{standCost} points per stand"
      >
        {standCost}<span class="ml-1 text-[0.7rem] tracking-[0.12em] uppercase opacity-80">pts</span
        >{#if quantity > 1}<span class="ml-1 text-xs opacity-80">×{quantity}</span>{/if}
      </span>
      <QualityPicker
        {quality}
        onChange={onQuality}
        interactive={Boolean(onQuality)}
        btnClass={qualityClass}
      />
    </div>
    <h3
      class="col-span-2 min-w-0 truncate text-center font-display text-[1.35rem] leading-none tracking-wide uppercase"
    >
      {unit.Name}
    </h3>
  </header>

  {#if variants.length > 1 && onVariant}
    <div class="print:hidden flex flex-col gap-1.5 border-b border-line bg-ink-3/60 px-3 py-2">
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
  {/if}

  <div class="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 {gridClass}">
    <section>
      <div class="{STAT_HEAD} h-8 text-lg">Armor</div>
      <ul class="flex flex-col gap-1">
        {#each armor as row (row.label)}
          <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
            <span
              class="flex w-14 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
              >{row.label}</span
            >
            <span
              class="flex flex-1 items-center justify-center bg-paper text-ink tabular-nums bw:bg-white bw:text-black"
              >{row.value}</span
            >
          </li>
        {/each}
      </ul>

      {#if showCapacity}
        <div class="{STAT_HEAD} mt-3 h-8 text-lg">Capacity</div>
        <ul class="flex flex-col gap-1">
          <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
            <span
              class="flex w-16 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
              >Remain</span
            >
            <span
              class="flex flex-1 items-center justify-center bg-paper text-ink tabular-nums bw:bg-white bw:text-black {capRemain <
              0.001
                ? 'opacity-60'
                : ''}"
            >
              {formatCap(capRemain)}
            </span>
          </li>
          <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
            <span
              class="flex w-16 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
              >Max</span
            >
            <span
              class="flex flex-1 items-center justify-center bg-paper text-ink tabular-nums bw:bg-white bw:text-black"
            >
              {formatCap(capMax)}
            </span>
          </li>
        </ul>
      {/if}
    </section>

    {#if showMove}
      <section>
        <div class="{STAT_HEAD} h-8 text-lg">Move</div>
        {#if helo}
          <ul class="flex flex-col gap-1">
            <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
              <span
                class="flex w-16 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
                >NOE</span
              >
              <span
                class="flex flex-1 items-center justify-center bg-paper text-ink tabular-nums bw:bg-white bw:text-black"
              >
                {formatRange(move, scale)}
              </span>
            </li>
            <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
              <span
                class="flex w-16 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
                >High</span
              >
              <span
                class="flex flex-1 items-center justify-center bg-paper text-ink tabular-nums bw:bg-white bw:text-black"
              >
                {formatRange(-1, scale)}
              </span>
            </li>
          </ul>
        {:else}
          <ul class="flex flex-col gap-1">
            {#each moveRows as row (row[0])}
              <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
                <span
                  class="flex w-16 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
                  >{row[0]}</span
                >
                <span
                  class="flex flex-1 items-center justify-center bg-paper text-ink tabular-nums bw:bg-white bw:text-black"
                >
                  {formatRange(Number(row[1]), scale)}
                </span>
              </li>
            {/each}
          </ul>
          <p class="mt-1 text-center font-display text-sm uppercase tracking-wider text-brass">
            {unit.move_type.join(" / ")}
          </p>
        {/if}
      </section>
    {/if}

    {#if showWeapon}
      <WeaponTable {unit} {quality} />
    {/if}

    {#if infantry}
      <InfantryColumn {unit} {quality} />
    {/if}

    {#if unit.indirect}
      <IndirectColumn {unit} />
    {/if}

    {#if hasMissileFeature}
      <section class="min-w-0 sm:col-span-2 xl:col-span-1">
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

        {#if options.length > 1 || !unit.missileRequired}
          <div class="mb-2 flex flex-wrap gap-1">
            {#if !unit.missileRequired}
              <button
                type="button"
                class="h-8 rounded-full px-2.5 text-xs font-medium {loadout
                  ? 'border border-line text-muted'
                  : 'bg-paper text-ink'}"
                onclick={() => pickMissile(null)}
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
                onclick={() => pickMissile(opt.id)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        {/if}

        {#if loadout && mslStats}
          <div
            class="grid grid-cols-5 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted"
          >
            <span>Range</span>
            <span>ROF</span>
            <span>Pen</span>
            <span>Hit</span>
            <span>M&S</span>
          </div>
          <div class="mt-1 grid grid-cols-5 gap-1">
            <span class={CELL_RANGE}>
              {formatRange(loadout.range[0], scale)}–{formatRange(loadout.range[1], scale)}
            </span>
            <span class={CELL_VALUE}>{loadout.rof}</span>
            <span class={CELL_VALUE}>{loadout.pen}</span>
            <span class={CELL_VALUE}>{mslStats.hit}</span>
            <span class={CELL_VALUE}>{mslStats.moveShoot ? "Yes" : "No"}</span>
          </div>
          <p class="mt-1 text-center text-[11px] uppercase tracking-wider text-muted">
            {loadout.unlimited ? "Unlimited ammo" : "Limited ammo"}
            {#if loadout.topAttack}
              · Top attack{/if}
            {#if loadout.sam}
              · SAM{/if}
          </p>
        {:else}
          <p class="py-3 text-center text-sm text-muted">Gun tank · missile stowed</p>
        {/if}
      </section>
    {/if}

    {#if hasPods}
      <section class="min-w-0 sm:col-span-2 xl:col-span-1">
        <div class="{STAT_HEAD} h-8 text-lg">Pods</div>
        <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
          Weapon pods
        </p>
        <HeloPods {unit} picks={heloPods} {yearMin} {yearMax} onChange={onHeloPods} />
      </section>
    {/if}

    {#each heloMounted as row (row.weapon.id)}
      <HeloColumn
        weapon={row.weapon}
        count={row.count}
        {quality}
        nationId={unit.nation}
      />
    {/each}

    {#if hasTowedFeature}
      <section class="min-w-0 sm:col-span-2 xl:col-span-1">
        <div class="{STAT_HEAD} h-8 text-lg">Towed</div>
        <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
          Towed weapons
        </p>
        <TowedPicker {unit} picks={towedLoad} {yearMin} {yearMax} onChange={onTowed} />
      </section>
    {/if}

    {#each towedMounted as row (row.weapon.id)}
      <TowedColumn
        weapon={row.weapon}
        count={row.count}
        {quality}
        missileId={row.missileId}
        {yearMin}
        {yearMax}
        nationId={unit.nation}
      />
    {/each}
  </div>

  <footer
    class="flex flex-wrap items-center justify-end gap-2 border-t border-line px-3 py-2 bw:border-black"
  >
    {#if transport && onDedicated}
      <div class="mr-auto flex min-w-0 items-center gap-2 print:hidden">
        <button
          type="button"
          role="switch"
          aria-checked={isDedicated}
          class="flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 font-display text-xs tracking-[0.14em] uppercase transition-colors duration-150 {isDedicated
            ? 'border-brass bg-brass text-ink'
            : 'border-line-2 text-muted hover:border-brass hover:text-paper'}"
          onclick={() => onDedicated?.(!isDedicated)}
        >
          <span class="h-2 w-2 rounded-full {isDedicated ? 'bg-ink' : 'bg-line-2'}" aria-hidden="true"
          ></span>
          Dedicated transport
        </button>
        <span class="min-w-0 text-[11px] leading-tight text-muted">
          {isDedicated
            ? "Stays after dropping cargo · cost doubled"
            : "Must leave after dropping cargo (17.10)"}
        </span>
      </div>
    {/if}
    {#if helo && unit.Gun_Rng <= 0 && !(transport && onDedicated)}
      <span class="mr-auto text-[11px] uppercase tracking-[0.16em] text-muted">Helicopter</span>
    {/if}
    {#if !helo && unit.notes}
      <!-- Helicopter notes already show under the pod picker. -->
      <p class="mr-auto min-w-0 text-[11px] leading-snug text-muted bw:text-black">{unit.notes}</p>
    {/if}
    <EquipBubbles marks={equip} />
  </footer>
</article>
