<script lang="ts">
  import type { HeloPodPick, Quality, TowedPick, Vehicle } from "../lib/ffot3/types";
  import type { VariantOption } from "../lib/ffot3/variants";
  import { NATION_BY_ID } from "../lib/ffot3/nations";
  import { nationSurface, qualityBtnClass } from "../lib/ffot3/ui";
  import { force } from "../lib/ffot3/store";
  import {
    armorTable,
    formatEra,
    formatRange,
    splitEquip,
    terrainMove,
    unitBasePoints,
  } from "../lib/ffot3/combat";
  import { getUnit, missileChoices, TOWED_WEAPONS, unitStandBase } from "../lib/ffot3/catalog";
  import { formatAutocannonName, gunLabel, weaponKind } from "../lib/ffot3/classify";
  import {
    isHelicopter,
    isTransportHelo,
    podCost,
    selectedHeloWeapons,
    usedPodCount,
    type HeloWeapon,
  } from "../lib/ffot3/helo";
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
  import GunLadder from "./cards/GunLadder.svelte";
  import HeloColumn from "./cards/HeloColumn.svelte";
  import HeloPods from "./cards/HeloPods.svelte";
  import IndirectColumn from "./cards/IndirectColumn.svelte";
  import InfantryColumn from "./cards/InfantryColumn.svelte";
  import MissileSection from "./cards/MissileSection.svelte";
  import TowedColumn from "./cards/TowedColumn.svelte";
  import TowedPicker from "./cards/TowedPicker.svelte";
  import VariantPicker from "./cards/VariantPicker.svelte";

  /**
   * Portrait card (one stand per playing-card-sized face). Pods and towed
   * weapons are laid out by `layout`: companion cards beside the unit, a
   * fold-out loadout face, or riders hung underneath.
   */
  let {
    layout,
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
    layout: "companion" | "foldout" | "rider";
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
    variants?: VariantOption[];
    onVariant?: (id: string) => void;
    yearMin?: number;
    yearMax?: number;
  } = $props();

  type Attachment =
    | { kind: "pod"; key: string; name: string; count: number; pts: number; weapon: HeloWeapon }
    | {
        kind: "towed";
        key: string;
        name: string;
        count: number;
        pts: number;
        weapon: Vehicle;
        missileId: string | null;
      };

  const scale = $derived($force.scale);
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
  const split = $derived((armorTbl.bonus ?? 0) > 0);
  const kind = $derived(weaponKind(unit));
  const showWeapon = $derived(kind !== "none" && !infantry);
  const gunTitle = $derived(
    gunLabel(unit) ||
      (kind === "mg" ? "Machine Gun" : kind === "autocannon" ? "Autocannon" : "Gun"),
  );
  const hasMissileFeature = $derived(
    !helo && missileChoices(unit, missileId, yearMin, yearMax).length > 0,
  );
  const equipSplit = $derived(splitEquip(unit.Equip));
  const weaponBadgesInMissile = $derived(!showWeapon && hasMissileFeature);
  const equip = $derived(
    showWeapon || weaponBadgesInMissile
      ? equipSplit.unit
      : [...equipSplit.unit, ...equipSplit.weapon],
  );
  const hasPods = $derived(helo && (unit.pods ?? 0) > 0 && (unit.podOptionKeys?.length ?? 0) > 0);
  const hasTowedFeature = $derived(visibleTowed(unit, TOWED_WEAPONS, yearMin, yearMax).length > 0);
  const showCapacity = $derived(!towedUnit && towedCap(unit) > 0);
  const capMax = $derived(towedCap(unit));
  const capRemain = $derived(remainingCap(unit, towedLoad, getUnit));
  const towedMounted = $derived(selectedTowed(towedLoad, getUnit));
  const attachments = $derived<Attachment[]>([
    ...selectedHeloWeapons(heloPods).map((r) => ({
      kind: "pod" as const,
      key: r.weapon.id,
      name: formatAutocannonName(r.weapon.label),
      count: r.count,
      pts: podCost(r.weapon, r.count),
      weapon: r.weapon,
    })),
    ...towedMounted.map((r) => ({
      kind: "towed" as const,
      key: r.weapon.id,
      name: r.weapon.Name,
      count: r.count,
      pts: unitBasePoints(r.weapon, r.missileId) * r.count,
      weapon: r.weapon,
      missileId: r.missileId,
    })),
  ]);
  const podPicker = $derived(hasPods && Boolean(onHeloPods));
  const towedPicker = $derived(hasTowedFeature && Boolean(onTowed));
  const hasLoadout = $derived(podPicker || towedPicker || attachments.length > 0);
  const loadPts = $derived(attachments.reduce((n, a) => n + a.pts, 0));
  const hullPts = $derived(helo ? unit.Points : unitBasePoints(unit, missileId));
  const podSlots = $derived(helo ? (unit.pods ?? 0) : 0);
  const podsUsed = $derived(usedPodCount(heloPods));
  // Filled pod slots in order, true for missile pods (brass on the slot bar).
  const slotFill = $derived(
    attachments.flatMap((a) =>
      a.kind === "pod"
        ? Array.from(
            { length: a.count },
            () => a.weapon.kind === "missile" || a.weapon.kind === "aam",
          )
        : [],
    ),
  );
  const loadNoun = $derived(helo ? "Pods" : "Towed");
  const surface = $derived(nationSurface(unit.nation));
  const qualityClass = $derived(qualityBtnClass(unit.nation, bw));
  const carries = $derived(Number(unit.infantry_capacity) || 0);
  const meta = $derived(
    [
      nation?.short ?? unit.nation,
      formatEra(unit.era.start_era, unit.era.end_era),
      unit.move_type.join(" / "),
      carries > 0 && !towedUnit ? `Carries ${formatCap(carries)}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  );

  const CARD =
    "flex min-w-0 flex-col rounded-2xl border border-line bg-ink-2 text-paper shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] bw:rounded-md bw:border-black bw:bg-white bw:text-black bw:shadow-none";
  const CARD_W = "w-[22.5rem] max-w-full";
  // Cards don't clip (badge tooltips must overflow them), so fills that touch a
  // corner round themselves to the card's inner radius.
  const MINI = "rounded-[14px]";
  const headRound = $derived(
    layout === "foldout" && hasLoadout ? "rounded-t-[15px] sm:rounded-tr-none" : "rounded-t-[15px]",
  );
  const SEC = "border-t border-line px-3.5 py-3 bw:border-black";
  const LABEL =
    "mb-2 flex items-baseline justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted bw:text-black";
  const BIG_WHITE =
    "gun-cell flex h-7 min-w-9 items-center justify-center rounded-md bg-cell px-1.5 font-display text-lg tabular-nums text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 bw:border bw:border-black bw:bg-white bw:text-black";
  const BIG_HEAT =
    "pen-heat gun-cell flex h-7 min-w-9 items-center justify-center rounded-md bg-ammo-heat px-1.5 font-display text-lg tabular-nums text-ammo-heat-ink bw:border bw:border-black";
  const TILE = "rounded-lg border border-line-2 py-1 text-center bw:rounded-sm bw:border-black";
  const TILE_V = "block font-display text-xl leading-tight tabular-nums";
  const TILE_L =
    "block text-[9px] font-semibold uppercase tracking-[0.14em] text-muted bw:text-black";
</script>

{#snippet armorPair(ap: number | string, heat: number | null, vertical = false)}
  <div class="flex gap-[3px] {vertical ? 'flex-col' : ''}">
    <span class={BIG_WHITE} title="vs AP / HE">{ap}</span>
    {#if heat !== null}<span class={BIG_HEAT} title="vs HEAT">{heat}</span>{/if}
  </div>
{/snippet}

{#snippet mainFace()}
  <header
    class="card-head relative px-3.5 pt-3 pb-5 {headRound} {bw ? 'bg-black text-white' : surface}"
  >
    <div class="flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-[10.5px] font-semibold uppercase leading-snug tracking-[0.16em] opacity-85">
          {meta}
        </p>
        <h3 class="mt-1 pr-14 font-display text-[1.85rem] leading-[0.95] tracking-wide uppercase">
          {unit.Name}
        </h3>
        {#if isDedicated}
          <span
            class="mt-1.5 inline-block rounded-sm bg-brass px-1.5 py-0.5 font-display text-[0.7rem] tracking-[0.14em] text-ink uppercase bw:bg-white bw:text-black"
            title="Dedicated transport: double cost (Rule 17.10)">Dedicated · 2× pts</span
          >
        {/if}
      </div>
      <QualityPicker
        {quality}
        onChange={onQuality}
        interactive={Boolean(onQuality)}
        btnClass={qualityClass}
      />
    </div>
    <div
      class="card-pts absolute right-3.5 -bottom-7 z-[5] flex h-15 w-15 flex-col items-center justify-center rounded-full border-[3px] border-brass bg-ink-2 leading-none text-paper bw:border-2 bw:border-black bw:bg-white bw:text-black"
      style={bw ? "" : `border-color: var(--color-nation-${unit.nation}, var(--color-brass))`}
      title="Points per stand"
      aria-label="{standCost} points per stand"
    >
      <span class="font-display text-[1.35rem] tabular-nums">{standCost}</span>
      <span class="mt-0.5 text-[8px] font-semibold tracking-[0.16em] text-muted bw:text-black"
        >PTS{#if quantity > 1}&nbsp;×{quantity}{/if}</span
      >
    </div>
  </header>

  {#if variants.length > 1 && onVariant}
    <VariantPicker {unit} {variants} {onVariant} inset />
  {/if}

  <section class="{SEC} border-t-0 pt-8">
    <div class={LABEL}>
      <span>Armor</span>
      {#if !helo && !armorTbl.soft && armorTbl.bonus !== null}
        <span
          >{split
            ? `h-class ${unit.armorH} · +${armorTbl.bonus} vs HEAT`
            : "No h-class bonus"}</span
        >
      {/if}
    </div>
    {#if helo || armorTbl.soft || armorTbl.rows.length < 2}
      {@const row = armorTbl.rows[0]}
      <div class="flex items-center justify-center gap-3 py-1">
        {#if armorTbl.soft}
          <span class="{BIG_WHITE} h-11 px-4 text-2xl">Soft</span>
        {:else}
          <span class="{BIG_WHITE} h-11 min-w-16 text-3xl">{row?.ap ?? 0}</span>
          {#if split && row}<span class="{BIG_HEAT} h-11 min-w-16 text-3xl">{row.heat}</span>{/if}
        {/if}
        <span
          class="text-[10px] font-semibold uppercase leading-snug tracking-[0.14em] text-muted bw:text-black"
        >
          {#if armorTbl.soft}Soft target<br />no armor save{:else}All facings<br />{split
              ? "AP / HE · HEAT"
              : "all ammo"}{/if}
        </span>
      </div>
    {:else}
      {@const front = armorTbl.rows[0]!}
      {@const flank = armorTbl.rows[1]!}
      <!-- Top-down hull: front values at the nose, flank values either side. -->
      <div
        class="relative mx-auto h-[8.6rem] w-[15rem]"
        aria-label="Armor: front {front.ap}, flank {flank.ap}"
      >
        {#if showWeapon}
          <span
            class="absolute top-[1.1rem] left-1/2 h-[2.6rem] w-1 -translate-x-1/2 bg-line-2 bw:bg-black"
          ></span>
        {/if}
        <span
          class="absolute top-[2.3rem] left-1/2 h-[6rem] w-[4.6rem] -translate-x-1/2 rounded-lg border-2 border-line-2 bg-ink-3 bw:border-black bw:bg-white"
        ></span>
        {#if showWeapon}
          <span
            class="absolute top-[3.7rem] left-1/2 h-9 w-9 -translate-x-1/2 rounded-full border-2 border-line-2 bg-ink-2 bw:border-black bw:bg-white"
          ></span>
        {/if}
        <div class="absolute top-0 left-1/2 -translate-x-1/2">
          {@render armorPair(front.ap, split ? front.heat : null)}
        </div>
        <div class="absolute top-[3.9rem] left-1">
          {@render armorPair(flank.ap, split ? flank.heat : null, true)}
        </div>
        <div class="absolute top-[3.9rem] right-1">
          {@render armorPair(flank.ap, split ? flank.heat : null, true)}
        </div>
      </div>
      {#if split}
        <div class="mt-1 flex justify-center gap-3 text-[11px] text-muted bw:text-black">
          <span class="inline-flex items-center gap-1"
            ><i
              class="inline-block h-2.5 w-2.5 rounded-xs bg-cell ring-1 ring-cell-line bw:ring-0 bw:border bw:border-black bw:bg-white"
            ></i>vs AP / HE</span
          >
          <span class="inline-flex items-center gap-1"
            ><i
              class="pen-heat inline-block h-2.5 w-2.5 rounded-xs bg-ammo-heat bw:border bw:border-black"
            ></i>vs HEAT</span
          >
        </div>
      {/if}
    {/if}
  </section>

  {#if showMove}
    <section class={SEC}>
      <div class={LABEL}><span>Move</span></div>
      <div class="flex items-center gap-3">
        <div class="flex shrink-0 items-baseline gap-1.5">
          <span class="font-display text-[2.9rem] leading-none tabular-nums"
            >{formatRange(move, scale)}</span
          >
          <span
            class="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted bw:text-black"
            >{helo ? "NOE" : moveType === "leg" ? "Any terrain" : "Normal"}</span
          >
        </div>
        {#if helo}
          <div class="ml-auto grid w-24 grid-cols-1 gap-1">
            <div class={TILE}>
              <b class={TILE_V}>{formatRange(-1, scale)}</b><span class={TILE_L}>High</span>
            </div>
          </div>
        {:else if moveType !== "leg"}
          <div class="ml-auto grid min-w-0 flex-1 grid-cols-3 gap-1">
            <div class={TILE}>
              <b class={TILE_V}>{formatRange(terrain.rough, scale)}</b><span class={TILE_L}
                >Rough</span
              >
            </div>
            <div class={TILE}>
              <b class={TILE_V}>{formatRange(terrain.bad, scale)}</b><span class={TILE_L}>Bad</span>
            </div>
            <div class={TILE}>
              <b class={TILE_V}>{formatRange(terrain.road, scale)}</b><span class={TILE_L}
                >Road</span
              >
            </div>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  {#if showCapacity}
    <section class={SEC}>
      <div class={LABEL}>
        <span>Capacity</span>
        <span>{formatCap(capMax - capRemain)} of {formatCap(capMax)} used</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#each towedMounted as row (row.weapon.id)}
          {#each Array.from({ length: row.count }, (_, i) => i) as i (i)}
            <span
              class="flex h-7 max-w-full items-center truncate rounded-md bg-brass px-2 font-display text-sm tracking-wide text-ink bw:border bw:border-black bw:bg-[#dcdcdc] bw:text-black"
              title="{row.weapon.Name} · uses {formatCap(towedCap(row.weapon))}"
              >{row.weapon.Name}</span
            >
          {/each}
        {/each}
        {#if capRemain > 0.001}
          <span
            class="flex h-7 items-center rounded-md border-2 border-dashed border-brass/70 px-2 font-display text-sm tracking-wide text-brass bw:border-black bw:text-black"
            >{formatCap(capRemain)} free</span
          >
        {/if}
      </div>
    </section>
  {/if}

  {#if showWeapon}
    <section class={SEC}>
      <GunLadder
        title={gunTitle}
        range={unit.Gun_Rng}
        rof={unit.Gun_ROF}
        pen={unit.Gun_Pen}
        ai={unit.AI}
        {quality}
        marks={equipSplit.weapon}
      />
    </section>
  {/if}

  {#if infantry}
    <div class={SEC}><InfantryColumn {unit} {quality} /></div>
  {/if}

  {#if unit.indirect}
    <div class={SEC}><IndirectColumn {unit} /></div>
  {/if}

  {#if hasMissileFeature}
    <div class={SEC}>
      <MissileSection
        {unit}
        {quality}
        {missileId}
        {yearMin}
        {yearMax}
        {bw}
        portrait
        {onMissile}
        extraMarks={weaponBadgesInMissile ? equipSplit.weapon : []}
      />
    </div>
  {/if}

  <footer
    class="card-foot mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-line px-3.5 py-2 bw:border-black"
  >
    {#if transport && onDedicated}
      <button
        type="button"
        role="switch"
        aria-checked={isDedicated}
        class="mr-auto flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 font-display text-xs tracking-[0.14em] uppercase transition-colors duration-150 print:hidden {isDedicated
          ? 'border-brass bg-brass text-ink'
          : 'border-line-2 text-muted hover:border-brass hover:text-paper'}"
        title={isDedicated
          ? "Stays after dropping cargo · cost doubled"
          : "Must leave after dropping cargo (17.10)"}
        onclick={() => onDedicated?.(!isDedicated)}
      >
        <span class="h-2 w-2 rounded-full {isDedicated ? 'bg-ink' : 'bg-line-2'}" aria-hidden="true"
        ></span>
        Dedicated
      </button>
    {/if}
    {#if !helo && unit.notes}
      <p class="mr-auto min-w-0 text-[11px] leading-snug text-muted bw:text-black">{unit.notes}</p>
    {/if}
    {#if attachments.length && layout !== "foldout"}
      <span class="mr-auto text-[11px] text-muted tabular-nums bw:text-black">
        Hull {hullPts} + {loadNoun.toLowerCase()}
        {loadPts}
      </span>
    {/if}
    <EquipBubbles marks={equip} />
  </footer>
{/snippet}

{#snippet pickers()}
  {#if podPicker}
    <HeloPods {unit} picks={heloPods} {yearMin} {yearMax} onChange={onHeloPods} />
  {/if}
  {#if towedPicker}
    <TowedPicker {unit} picks={towedLoad} {yearMin} {yearMax} onChange={onTowed} />
  {/if}
{/snippet}

{#snippet itemBody(a: Attachment)}
  {#if a.kind === "pod"}
    <HeloColumn weapon={a.weapon} count={a.count} {quality} nationId={unit.nation} bare />
  {:else}
    <TowedColumn
      weapon={a.weapon}
      count={a.count}
      {quality}
      missileId={a.missileId}
      {yearMin}
      {yearMax}
      nationId={unit.nation}
      bare
    />
  {/if}
{/snippet}

{#snippet itemHead(a: Attachment, cls = "")}
  <div class="flex items-baseline gap-2 {cls}">
    <span
      class="min-w-0 flex-1 truncate font-display text-xl leading-tight tracking-wide uppercase"
      title={a.name}>{a.name}</span
    >
    {#if a.count > 1}<span class="font-display text-lg text-brass bw:text-black">×{a.count}</span
      >{/if}
    <span
      class="shrink-0 rounded-md border border-line-2 px-1.5 font-display text-base tabular-nums bw:border-black"
      >{a.pts}<span
        class="ml-0.5 text-[8px] font-semibold tracking-[0.14em] text-muted bw:text-black">PTS</span
      ></span
    >
  </div>
{/snippet}

{#snippet towedFacts(w: Vehicle)}
  <div class="mb-2 flex flex-wrap gap-1.5">
    {#each [["Armor", w.armorSoft ? "Soft" : String(w.armor[0] ?? 0)], ["Size", formatCap(towedCap(w))], ["Move", formatRange(Number(w.move_value) || 0, scale)]] as [k, v] (k)}
      <span
        class="flex items-center gap-1.5 rounded-lg border border-line-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted bw:border-black bw:text-black"
        >{k}<b class="font-display text-base tracking-wide text-paper bw:text-black">{v}</b></span
      >
    {/each}
  </div>
{/snippet}

{#if layout === "companion"}
  <div class="flex flex-wrap items-start gap-3 print:flex-nowrap">
    <article data-bw={bw ? "true" : undefined} class="{CARD} {CARD_W} break-inside-avoid">
      {@render mainFace()}
    </article>
    {#if hasLoadout}
      <div class="flex {CARD_W} flex-col gap-2 {attachments.length ? '' : 'print:hidden'}">
        {#if attachments.length}
          <span
            class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted bw:text-black"
            >Mounted on {unit.Name}</span
          >
        {/if}
        {#if podPicker || towedPicker}
          <div class="rounded-xl border border-dashed border-line-2 bg-ink-2 p-3 print:hidden">
            <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {helo ? `Pods · ${podsUsed} of ${podSlots}` : "Towed load"}
            </p>
            {@render pickers()}
          </div>
        {/if}
        {#each attachments as a (a.key)}
          <article
            data-bw={bw ? "true" : undefined}
            class="{CARD} relative {MINI} break-inside-avoid"
          >
            <span
              class="absolute inset-y-0 left-0 w-1.5 rounded-l-[13px] {bw ? 'bg-black' : surface}"
              aria-hidden="true"
            ></span>
            <header
              class="card-head rounded-tr-[13px] border-b border-line bg-ink-3 py-2 pr-3 pl-4 bw:border-black bw:bg-white"
            >
              {@render itemHead(a)}
            </header>
            <div class="py-2.5 pr-3 pl-4">{@render itemBody(a)}</div>
          </article>
        {/each}
      </div>
    {/if}
  </div>
{:else if layout === "foldout"}
  <article
    data-bw={bw ? "true" : undefined}
    class="{CARD} break-inside-avoid {hasLoadout
      ? `grid w-[45rem] max-w-full sm:grid-cols-2 ${attachments.length ? '' : 'print:w-[22.5rem] print:grid-cols-1'}`
      : CARD_W}"
  >
    <div class="flex min-w-0 flex-col">{@render mainFace()}</div>
    {#if hasLoadout}
      <div
        class="flex min-w-0 flex-col border-t-2 border-dashed border-line-2 sm:border-t-0 sm:border-l-2 bw:border-black {attachments.length
          ? ''
          : 'print:hidden'}"
      >
        <div
          class="card-head flex items-baseline justify-between border-b border-line bg-ink-3 px-3.5 py-3 sm:rounded-tr-[15px] bw:border-black bw:bg-white"
        >
          <span class="font-display text-2xl tracking-[0.08em] uppercase">Loadout</span>
          <span
            class="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted bw:text-black"
          >
            {#if helo}{podsUsed} of {podSlots} pods{:else if showCapacity}{formatCap(
                capMax - capRemain,
              )} of {formatCap(capMax)} capacity{/if}
          </span>
        </div>
        {#if podSlots > 0}
          <!-- One segment per pod slot: brass = missiles, grey = other pods. -->
          <div class="flex gap-1 px-3.5 pt-2.5" aria-hidden="true">
            {#each slotFill as missile, i (i)}
              <span
                class="h-2 flex-1 rounded-full {missile
                  ? 'bg-brass'
                  : 'bg-muted'} bw:border bw:border-black {missile
                  ? 'bw:bg-black'
                  : 'bw:bg-[#dcdcdc]'}"
              ></span>
            {/each}
            {#each Array.from({ length: Math.max(0, podSlots - podsUsed) }, (_, i) => i) as i (i)}
              <span
                class="h-2 flex-1 rounded-full border border-dashed border-line-2 bw:border-black"
              ></span>
            {/each}
          </div>
        {/if}
        {#if podPicker || towedPicker}
          <div class="px-3.5 pt-3 print:hidden">{@render pickers()}</div>
        {/if}
        {#each attachments as a (a.key)}
          <div class="border-b border-line px-3.5 py-3 last:border-b-0 bw:border-black">
            {@render itemHead(a, "mb-2")}
            {#if a.kind === "towed"}{@render towedFacts(a.weapon)}{/if}
            {@render itemBody(a)}
          </div>
        {/each}
        {#if attachments.length}
          <div
            class="mt-auto flex items-baseline justify-between border-t border-line px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted bw:border-black bw:text-black"
          >
            <span>Hull {hullPts} · {loadNoun} {loadPts}{isDedicated ? " · ×2 dedicated" : ""}</span>
            <b class="font-display text-2xl tracking-wide text-paper tabular-nums bw:text-black"
              >{basePts} pts</b
            >
          </div>
        {/if}
      </div>
    {/if}
  </article>
{:else}
  <div class="flex {CARD_W} flex-col">
    <article data-bw={bw ? "true" : undefined} class="{CARD} break-inside-avoid">
      {@render mainFace()}
    </article>
    {#each attachments as a (a.key)}
      <!-- Hitch: the rider hangs off the card above. -->
      <div class="relative h-6 break-after-avoid" aria-hidden="true">
        <span
          class="absolute inset-y-0 left-1/2 border-l-[3px] border-dashed border-brass bw:border-black"
        ></span>
        <span
          class="absolute top-1 left-[calc(50%+0.6rem)] text-[10px] font-semibold uppercase tracking-[0.16em] text-brass bw:text-black"
          >{a.kind === "pod" ? "Mounted" : "Towing"}</span
        >
      </div>
      <article data-bw={bw ? "true" : undefined} class="{CARD} relative {MINI} break-inside-avoid">
        <span
          class="pointer-events-none absolute inset-0 overflow-hidden rounded-[13px]"
          aria-hidden="true"
        >
          <span
            class="absolute top-3 -right-9 rotate-[35deg] bg-brass px-10 py-0.5 font-display text-xs tracking-[0.2em] text-ink uppercase bw:border-y bw:border-black bw:bg-white bw:text-black"
            >{a.kind === "pod" ? "Pod" : "Towed"}</span
          >
        </span>
        <header
          class="card-head rounded-t-[13px] border-b border-line bg-ink-3 py-2.5 pr-16 pl-3.5 bw:border-black bw:bg-white"
        >
          {@render itemHead(a)}
        </header>
        <div class="px-3.5 py-3">
          {#if a.kind === "towed"}{@render towedFacts(a.weapon)}{/if}
          {@render itemBody(a)}
        </div>
      </article>
    {/each}
    {#if podPicker || towedPicker}
      <div class="mt-3 rounded-xl border border-dashed border-line-2 bg-ink-2 p-3 print:hidden">
        <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          {helo ? `Pods · ${podsUsed} of ${podSlots}` : "Towed load"}
        </p>
        {@render pickers()}
      </div>
    {/if}
  </div>
{/if}
