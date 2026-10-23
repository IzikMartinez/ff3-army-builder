<script lang="ts">
  import type { Quality, Vehicle } from "../../lib/ffot3/types";
  import { formatRange, missileHit, missileMarks, resolveLoadout } from "../../lib/ffot3/combat";
  import WeaponBadges from "./WeaponBadges.svelte";
  import { visibleMissiles } from "../../lib/ffot3/catalog";
  import { weaponCaption, weaponKind } from "../../lib/ffot3/classify";
  import { formatCap, towedCap } from "../../lib/ffot3/towed";
  import { CELL_RANGE, CELL_VALUE, STAT_HEAD, nationSurface, penCell } from "../../lib/ffot3/ui";
  import { force } from "../../lib/ffot3/store";
  import WeaponTable from "./WeaponTable.svelte";
  import GunLadder from "./GunLadder.svelte";
  import { gunLabel } from "../../lib/ffot3/classify";
  import { splitEquip } from "../../lib/ffot3/combat";

  let {
    weapon,
    count = 1,
    missileId = null,
    quality,
    yearMin,
    yearMax,
    nationId = "",
    bare = false,
  }: {
    weapon: Vehicle;
    count?: number;
    missileId?: string | null;
    quality: Quality;
    yearMin?: number;
    yearMax?: number;
    nationId?: string;
    /** Portrait loadout card: the wrapper names the weapon, the gun uses the sideways ladder. */
    bare?: boolean;
  } = $props();

  const scale = $derived($force.scale);
  const kind = $derived(weaponKind(weapon));
  const options = $derived(visibleMissiles(weapon, yearMin, yearMax));
  // Same resolution as unitStandBase prices it with.
  const loadout = $derived(resolveLoadout(weapon, missileId));
  const mslStats = $derived(loadout ? missileHit(loadout.generation, loadout.unlimited, quality) : null);
  const showGun = $derived(weapon.Gun_Rng > 0 && kind !== "none");
  const optionalMsl = $derived(!weapon.missileRequired ? options : []);
  const surface = $derived(nationSurface(nationId));
</script>

<section class={bare ? "min-w-0" : "min-w-0 sm:col-span-2 xl:col-span-1"}>
  {#if !bare}
    <div class="{STAT_HEAD} text-base leading-tight" title={weapon.Name}>
      {weapon.Name}{#if count > 1}&nbsp;×{count}{/if}
    </div>
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
      Towed · cap {formatCap(towedCap(weapon))}
      {#if showGun} · {weaponCaption(kind)}{/if}
    </p>
  {/if}

  {#if showGun && bare}
    <GunLadder
      title={/^towed by/i.test(gunLabel(weapon)) ? weaponCaption(kind) : gunLabel(weapon) || weaponCaption(kind)}
      range={weapon.Gun_Rng}
      rof={weapon.Gun_ROF}
      pen={weapon.Gun_Pen}
      ai={weapon.AI}
      {quality}
      marks={splitEquip(weapon.Equip).weapon}
    />
  {:else if showGun}
    <WeaponTable unit={weapon} {quality} caption="" bare />
  {/if}

  {#if loadout && mslStats}
    <div class="mt-2 mb-1 flex min-h-10 items-center justify-center rounded-sm px-2 py-1.5 text-center {surface} bw:bg-black bw:text-white">
      <span class="block font-display text-[1.35rem] leading-none tracking-[0.16em] uppercase">
        {loadout.label}
      </span>
    </div>
    <p class="mb-1 text-center text-[10px] uppercase tracking-[0.16em] text-muted">Missile</p>
    <div class="grid grid-cols-4 gap-1 text-center font-display text-[11px] uppercase tracking-wider text-muted">
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
  {:else if optionalMsl.length}
    <p class="mt-2 text-center text-[11px] uppercase tracking-wider text-muted">
      Optional {optionalMsl.map((m) => m.label).join(" / ")}
    </p>
  {/if}
  {#if loadout}
    <WeaponBadges
      marks={missileMarks({
        generation: loadout.generation,
        ammo: loadout.unlimited ? "unlimited" : "limited",
        heat: true,
        topAttack: loadout.topAttack,
        sam: loadout.sam,
        platform: "ground",
      })}
    />
  {/if}
</section>
