<script lang="ts">
  import type { HeloPodPick, Quality, TowedPick, Vehicle } from "../lib/ffot3/types";
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
  import { getUnit, TOWED_WEAPONS, unitStandBase, visibleMissiles } from "../lib/ffot3/catalog";
  import { weaponKind } from "../lib/ffot3/classify";
  import { isHelicopter, selectedHeloWeapons } from "../lib/ffot3/helo";
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

  let {
    unit,
    quality,
    bw = false,
    quantity = 1,
    missileId = null,
    heloPods = [],
    towedLoad = [],
    onQuality,
    onMissile,
    onHeloPods,
    onTowed,
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
    onQuality?: (id: string) => void;
    onMissile?: (id: string | null) => void;
    onHeloPods?: (picks: HeloPodPick[]) => void;
    onTowed?: (picks: TowedPick[]) => void;
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
  const basePts = $derived(unitStandBase(unit, missileId, heloPods, towedLoad, yearMin, yearMax));
  const standCost = $derived(Math.round(basePts * quality.point_mod));
  const armor = $derived(
    helo
      ? [{ label: "Armor", value: unit.armorSoft ? "Soft" : (unit.armor[0] ?? 0) }]
      : armorLabels(unit.armor),
  );
  const options = $derived(visibleMissiles(unit, yearMin, yearMax));
  const hasMissileFeature = $derived(!helo && options.length > 0);
  const hasPods = $derived(helo && (unit.pods ?? 0) > 0 && (unit.podOptionKeys?.length ?? 0) > 0);
  const towedOptions = $derived(visibleTowed(unit, TOWED_WEAPONS, yearMin, yearMax));
  const hasTowedFeature = $derived(towedOptions.length > 0);
  const towedMounted = $derived(selectedTowed(towedLoad, getUnit));
  const heloMounted = $derived(selectedHeloWeapons(heloPods));
  const showCapacity = $derived(!towedUnit && towedCap(unit) > 0);
  const capMax = $derived(towedCap(unit));
  const capRemain = $derived(remainingCap(unit, towedLoad, getUnit));
  const loadout = $derived(resolveLoadout({ ...unit, missiles: options }, missileId));
  const mslStats = $derived(loadout ? missileHit(loadout.generation, loadout.unlimited) : null);
  const equip = $derived(decodeEquip(unit.Equip));
  const system = $derived($force.rangeSystem);
  const kind = $derived(weaponKind(unit));
  const showWeapon = $derived(kind !== "none");
  const colCount = $derived(
    (showMove ? 2 : 1) +
      (showWeapon ? 1 : 0) +
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
  const surface = $derived(nationSurface(unit.nation));
  const qualityClass = $derived(qualityBtnClass(unit.nation, bw));

  function pickMissile(id: string | null) {
    onMissile?.(id);
  }

  $inspect("Mounted Weapons", heloMounted);
  let missileCount = $derived(
    heloMounted
      .map((item) => (item.weapon.kind === "missile" ? item.count : 0))
      .reduce((acc, n) => acc + n, 0),
  );
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
                {formatRange(move, system)}
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
                {formatRange(-1, system)}
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
                  {formatRange(Number(row[1]), system)}
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
              {formatRange(loadout.range[0], system)}–{formatRange(loadout.range[1], system)}
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
        {missileCount}
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
        {yearMin}
        {yearMax}
        nationId={unit.nation}
      />
    {/each}
  </div>

  <footer
    class="flex flex-wrap items-center justify-end gap-2 border-t border-line px-3 py-2 bw:border-black"
  >
    {#if helo && unit.Gun_Rng <= 0}
      <span class="mr-auto text-[11px] uppercase tracking-[0.16em] text-muted">Helicopter</span>
    {/if}
    <EquipBubbles marks={equip} />
  </footer>
</article>
