<script lang="ts">
  import type { HeloPodPick, Quality, TowedPick, Vehicle } from "../lib/ffot3/types";
  import type { VariantOption } from "../lib/ffot3/variants";
  import { NATION_BY_ID } from "../lib/ffot3/nations";
  import {
    AMMO_HEAD,
    AMMO_HINT,
    CELL_AP,
    CELL_HEAT,
    CELL_RANGE,
    CELL_VALUE,
    GUN_HEAD,
    STAT_HEAD,
    nationSurface,
    qualityBtnClass,
  } from "../lib/ffot3/ui";
  import { force } from "../lib/ffot3/store";
  import {
    armorLabels,
    armorTable,
    splitEquip,
    formatEra,
    formatRange,
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
  import WeaponBadges from "./cards/WeaponBadges.svelte";
  import HeloPods from "./cards/HeloPods.svelte";
  import HeloColumn from "./cards/HeloColumn.svelte";
  import TowedPicker from "./cards/TowedPicker.svelte";
  import TowedColumn from "./cards/TowedColumn.svelte";
  import WeaponTable from "./cards/WeaponTable.svelte";
  import InfantryColumn from "./cards/InfantryColumn.svelte";
  import IndirectColumn from "./cards/IndirectColumn.svelte";
  import VariantPicker from "./cards/VariantPicker.svelte";
  import MissileSection from "./cards/MissileSection.svelte";
  import PortraitUnit from "./PortraitUnit.svelte";

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
  const armorTbl = $derived(armorTable(unit));
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
  const scale = $derived($force.scale);
  const kind = $derived(weaponKind(unit));
  // Infantry anti-infantry fire has its own column; Gun_* holds its AI ratings.
  const showWeapon = $derived(kind !== "none" && !infantry);
  // Gun badges (stabilised, traverse) live on the weapon sub-card: the gun table
  // if shown, else the missile sub-card; only with neither do they stay here.
  const equipSplit = $derived(splitEquip(unit.Equip));
  const weaponBadgesInMissile = $derived(!showWeapon && hasMissileFeature);
  const equip = $derived(
    showWeapon || weaponBadgesInMissile ? equipSplit.unit : [...equipSplit.unit, ...equipSplit.weapon],
  );
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
  // Print lays the sections out across the page (up to 4), counting only what
  // prints: the pod and towed pickers are hidden on paper.
  const printCols = $derived(Math.min(4, colCount - (hasPods ? 1 : 0) - (hasTowedFeature ? 1 : 0)));
  const gridClass = $derived(
    colCount >= 4 ? "xl:grid-cols-4" : colCount === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2",
  );
  const moveRows = $derived([
    ["Normal", terrain.normal],
    ["Rough", terrain.rough],
    ["Bad", terrain.bad],
    ["Road", terrain.road],
  ] as const);
  const surface = $derived(nationSurface(unit.nation));
  const qualityClass = $derived(qualityBtnClass(unit.nation, bw));

  function pickMissile(id: string | null) {
    onMissile?.(id);
  }

</script>

{#if $force.cardStyle !== "classic"}
  <PortraitUnit
    layout={$force.cardStyle}
    {unit}
    {quality}
    {bw}
    {quantity}
    {missileId}
    {heloPods}
    {towedLoad}
    {dedicated}
    {variants}
    {onVariant}
    {onQuality}
    {onMissile}
    {onHeloPods}
    {onTowed}
    {onDedicated}
    {yearMin}
    {yearMax}
  />
{:else}
  <article
    data-bw={bw ? "true" : undefined}
    class="flex flex-col rounded-lg border border-line bg-ink-2 text-paper shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] break-inside-avoid bw:border-black bw:bg-white bw:text-black bw:shadow-none"
  >
    <header
      class="card-head grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-t-[17px] px-3 py-2 {bw
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
          class="card-pts inline-flex h-9 min-w-12 items-center justify-center rounded-sm border px-2.5 font-display text-[1.05rem] tracking-wide tabular-nums {bw
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
      <VariantPicker {unit} {variants} {onVariant} />
    {/if}

    <div
      class="card-body grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 {gridClass}"
      style="--print-cols: {printCols}"
    >
      <section>
        <div class="{STAT_HEAD} h-8 text-lg">Armor</div>
        {#if helo || armorTbl.soft}
          <ul class="flex flex-col gap-1">
            {#each armor as row (row.label)}
              <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
                <span
                  class="flex w-14 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
                  >{row.label}</span
                >
                <span
                  class="flex flex-1 items-center justify-center bg-cell text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 tabular-nums bw:bg-white bw:text-black"
                  >{row.value}</span
                >
              </li>
            {/each}
          </ul>
        {:else}
          <!-- Target side of the ammo colour code: grey vs AP/HE, amber vs HEAT. -->
          {@const split = (armorTbl.bonus ?? 0) > 0}
          <div class="{GUN_HEAD} grid gap-1 {split ? 'grid-cols-[3.5rem_1fr_1fr]' : 'grid-cols-[3.5rem_1fr]'}">
            <span class="py-1"></span>
            {#if split}
              <span class="{AMMO_HEAD} bg-cell text-cell-ink" title={AMMO_HINT.ap}>AP / HE</span>
              <span class="{AMMO_HEAD} bg-ammo-heat text-ammo-heat-ink" title={AMMO_HINT.heat}>HEAT</span>
            {:else}
              <span class="py-1">{armorTbl.bonus === 0 ? "All ammo" : "Armor"}</span>
            {/if}
          </div>
          <div class="mt-1 grid gap-1 {split ? 'grid-cols-[3.5rem_1fr_1fr]' : 'grid-cols-[3.5rem_1fr]'}">
            {#each armorTbl.rows as row (row.label)}
              <span class={CELL_RANGE}>{row.label}</span>
              {#if split}
                <span class={CELL_AP}>{row.ap}</span>
                <span class={CELL_HEAT}>{row.heat}</span>
              {:else}
                <span class={CELL_VALUE}>{row.ap}</span>
              {/if}
            {/each}
          </div>
          {#if armorTbl.bonus !== null}
            <p class="mt-1 text-center text-[10px] uppercase tracking-[0.14em] text-muted">
              {split ? `h-class ${unit.armorH} · +${armorTbl.bonus} vs HEAT` : "No h-class bonus"}
            </p>
          {/if}
        {/if}

        {#if showCapacity}
          <div class="{STAT_HEAD} mt-3 h-8 text-lg">Capacity</div>
          <ul class="flex flex-col gap-1">
            <li class="flex h-7 overflow-hidden rounded-md text-sm font-display">
              <span
                class="flex w-16 items-center justify-start bg-ink-3 px-2 text-paper bw:bg-black bw:text-white"
                >Remain</span
              >
              <span
                class="flex flex-1 items-center justify-center bg-cell text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 tabular-nums bw:bg-white bw:text-black {capRemain <
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
                class="flex flex-1 items-center justify-center bg-cell text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 tabular-nums bw:bg-white bw:text-black"
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
                  class="flex flex-1 items-center justify-center bg-cell text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 tabular-nums bw:bg-white bw:text-black"
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
                  class="flex flex-1 items-center justify-center bg-cell text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 tabular-nums bw:bg-white bw:text-black"
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
                    class="flex flex-1 items-center justify-center bg-cell text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 tabular-nums bw:bg-white bw:text-black"
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
        <MissileSection
          {unit}
          {quality}
          {missileId}
          {yearMin}
          {yearMax}
          {bw}
          onMissile={pickMissile}
          extraMarks={weaponBadgesInMissile ? equipSplit.weapon : []}
        />
      {/if}

      {#if hasPods}
        <section class="print:hidden min-w-0 sm:col-span-2 xl:col-span-1">
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
        <section class="print:hidden min-w-0 sm:col-span-2 xl:col-span-1">
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
      class="card-foot flex flex-wrap items-center justify-end gap-2 border-t border-line px-3 py-2 bw:border-black"
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
{/if}
