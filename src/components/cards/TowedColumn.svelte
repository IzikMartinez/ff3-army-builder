<script lang="ts">
  import type { Quality, Vehicle } from "../../lib/ffot3/types";
  import { formatRange, missileHit, resolveLoadout } from "../../lib/ffot3/combat";
  import { defaultMissileId, visibleMissiles } from "../../lib/ffot3/catalog";
  import { weaponCaption, weaponKind } from "../../lib/ffot3/classify";
  import { formatCap, towedCap } from "../../lib/ffot3/towed";
  import { CELL_RANGE, CELL_VALUE, STAT_HEAD, nationSurface } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import WeaponTable from "./WeaponTable.svelte";

  let {
    weapon,
    count = 1,
    quality,
    yearMin,
    yearMax,
    nationId = "",
  }: {
    weapon: Vehicle;
    count?: number;
    quality: Quality;
    yearMin?: number;
    yearMax?: number;
    nationId?: string;
  } = $props();

  const system = $derived($force.rangeSystem);
  const kind = $derived(weaponKind(weapon));
  const options = $derived(visibleMissiles(weapon, yearMin, yearMax));
  const loadout = $derived(
    resolveLoadout(
      { ...weapon, missiles: options },
      weapon.missileRequired ? defaultMissileId(weapon, yearMin, yearMax) : null,
    ),
  );
  const mslStats = $derived(loadout ? missileHit(loadout.generation, loadout.unlimited) : null);
  const showGun = $derived(weapon.Gun_Rng > 0 && kind !== "none");
  const optionalMsl = $derived(!weapon.missileRequired ? options : []);
  const surface = $derived(nationSurface(nationId));
</script>

<section class="min-w-0 sm:col-span-2 xl:col-span-1">
  <div class="{STAT_HEAD} text-base leading-tight" title={weapon.Name}>
    {weapon.Name}{#if count > 1}&nbsp;×{count}{/if}
  </div>
  <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
    Towed · cap {formatCap(towedCap(weapon))}
    {#if showGun} · {weaponCaption(kind)}{/if}
  </p>

  {#if showGun}
    <WeaponTable unit={weapon} {quality} caption="" bare />
  {/if}

  {#if loadout && mslStats}
    <div class="mt-2 mb-1 flex min-h-10 items-center justify-center rounded-sm px-2 py-1.5 text-center {surface} bw:bg-black bw:text-white">
      <span class="block font-display text-[1.35rem] leading-none tracking-[0.16em] uppercase">
        {loadout.label}
      </span>
    </div>
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">Missile</p>
    <div class="grid grid-cols-5 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted">
      <span>Range</span>
      <span>ROF</span>
      <span>Pen</span>
      <span>Hit</span>
      <span>M&S</span>
    </div>
    <div class="mt-1 grid grid-cols-5 gap-1">
      <span class="{CELL_RANGE}">
        {formatRange(loadout.range[0], system)}–{formatRange(loadout.range[1], system)}
      </span>
      <span class="{CELL_VALUE}">{loadout.rof}</span>
      <span class="{CELL_VALUE}">{loadout.pen}</span>
      <span class="{CELL_VALUE}">{mslStats.hit}</span>
      <span class="{CELL_VALUE}">{mslStats.moveShoot ? "Yes" : "No"}</span>
    </div>
    <p class="mt-1 text-center text-[11px] uppercase tracking-wider text-muted">
      {loadout.unlimited ? "Unlimited ammo" : "Limited ammo"}
      {#if loadout.topAttack} · Top attack{/if}
      {#if loadout.sam} · SAM{/if}
    </p>
  {:else if optionalMsl.length}
    <p class="mt-2 text-center text-[11px] uppercase tracking-wider text-muted">
      Optional {optionalMsl.map((m) => m.label).join(" / ")}
    </p>
  {/if}
</section>
