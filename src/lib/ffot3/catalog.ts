import unitsJson from "@/data/units.json";
import helosJson from "@/data/helicopters.json";
import missilesJson from "@/data/missiles.json";
import qualityJson from "@/data/quality.json";
import type { HeloPodPick, Missile, MissileLoadout, Quality, TowedPick, Vehicle } from "./types";
import { YEAR_MAX, YEAR_MIN, eraOverlaps, parseEraYear, unitBasePoints } from "./combat";
import { gunLabel, matchesClass } from "./classify";
import {
  heloExtraPoints,
  heloHasMissileLabel,
  heloMissileLabels,
  isHelicopter,
  sanitizeHeloPicks,
} from "./helo";
import { isZeroMoveTowed, isTowed, towedExtraPoints, visibleTowed } from "./towed";

type RawVehicle = Partial<Vehicle> & Omit<Vehicle, "id" | "kind" | "armorSoft" | "pods" | "podOptionKeys" | "maxMissilePods" | "maxKeyPods">;

type RawHelo = {
  nation: string;
  Name: string;
  era: { start_era: string; end_era: string };
  Points: number;
  move_value: string;
  armor: "s" | number;
  gun_name: string;
  Gun_Pen: string[];
  Gun_ROF: number;
  Gun_Rng: number;
  AI: number;
  infantry_capacity: number;
  Equip: string;
  pods: number;
  podOptionKeys: string[];
  notes?: string;
  maxMissilePods?: number | null;
  maxKeyPods?: Record<string, number>;
};

function unitId(u: { nation: string; Name: string; era: { start_era: string; end_era: string }; Points: number }): string {
  return [u.nation, u.Name, u.era.start_era, u.era.end_era, String(u.Points)].join("::");
}

function normalizeUnit(u: RawVehicle, index: number): Vehicle {
  return {
    AI: u.AI ?? 0,
    Equip: u.Equip ?? "",
    Gun_Pen: Array.isArray(u.Gun_Pen) ? u.Gun_Pen : [],
    Gun_ROF: u.Gun_ROF ?? 0,
    Gun_Rng: u.Gun_Rng ?? 0,
    Name: u.Name,
    Points: u.Points,
    era: u.era,
    gun_name: u.gun_name ?? "",
    move_type: u.move_type ?? ["tracked"],
    move_value: String(u.move_value ?? "0"),
    nation: u.nation,
    armor: u.armor ?? [0],
    unlimited_missiles: Boolean(u.unlimited_missiles),
    infantry_capacity: u.infantry_capacity ?? 0,
    missiles: Array.isArray(u.missiles) ? u.missiles : [],
    missileRequired: Boolean(u.missileRequired),
    notes: u.notes ?? "",
    kind: "ground",
    armorSoft: false,
    pods: 0,
    podOptionKeys: [],
    maxMissilePods: null,
    maxKeyPods: {},
    id: `${unitId(u)}::${index}`,
  };
}

function normalizeHelo(raw: RawHelo, index: number): Vehicle {
  const armorSoft = raw.armor === "s";
  const armorVal = armorSoft ? 0 : Number(raw.armor) || 0;
  return {
    kind: "helicopter",
    AI: raw.AI ?? 0,
    Equip: raw.Equip ?? "",
    Gun_Pen: Array.isArray(raw.Gun_Pen) ? raw.Gun_Pen : [],
    Gun_ROF: raw.Gun_ROF ?? 0,
    Gun_Rng: raw.Gun_Rng ?? 0,
    Name: raw.Name,
    Points: raw.Points,
    era: raw.era,
    gun_name: raw.gun_name ?? "",
    move_type: ["helicopter"],
    move_value: String(raw.move_value),
    nation: raw.nation,
    armor: [armorVal],
    armorSoft,
    unlimited_missiles: false,
    infantry_capacity: raw.infantry_capacity ?? 0,
    missiles: [],
    missileRequired: false,
    notes: raw.notes ?? "",
    pods: raw.pods ?? 0,
    podOptionKeys: raw.podOptionKeys ?? [],
    maxMissilePods: raw.maxMissilePods ?? null,
    maxKeyPods: raw.maxKeyPods ?? {},
    id: `helo::${unitId(raw)}::${index}`,
  };
}

const ALL: Vehicle[] = [
  ...(unitsJson as RawVehicle[]).map(normalizeUnit),
  ...(helosJson as RawHelo[]).map(normalizeHelo),
];

export const TOWED_WEAPONS: Vehicle[] = ALL.filter(isTowed);

export const UNITS: Vehicle[] = ALL.filter((u) => !isZeroMoveTowed(u));

export const MISSILES: Missile[] = missilesJson as unknown as Missile[];

export const QUALITIES: Quality[] = qualityJson as Quality[];

export const QUALITY_BY_ID: Record<string, Quality> = Object.fromEntries(
  QUALITIES.map((q) => [q.experience, q]),
);

export const DEFAULT_QUALITY = QUALITY_BY_ID.average ?? QUALITIES[3]!;

const BY_ID = new Map(ALL.map((u) => [u.id, u]));

export function getUnit(id: string): Vehicle | undefined {
  return BY_ID.get(id);
}

export function unitsForNation(nationId: string): Vehicle[] {
  return UNITS.filter((u) => u.nation === nationId);
}

export function countForNation(nationId: string): number {
  return UNITS.reduce((n, u) => (u.nation === nationId ? n + 1 : n), 0);
}

export function missileVisible(opt: MissileLoadout, yearMin: number, yearMax: number): boolean {
  const a = parseEraYear(opt.era.start_era);
  const b = parseEraYear(opt.era.end_era);
  return a <= yearMax && b >= yearMin;
}

function betterLoadout(a: MissileLoadout, b: MissileLoadout): MissileLoadout {
  if (b.pen !== a.pen) return b.pen > a.pen ? b : a;
  return parseEraYear(b.era.start_era) >= parseEraYear(a.era.start_era) ? b : a;
}

export function visibleMissiles(unit: Vehicle, yearMin?: number, yearMax?: number): MissileLoadout[] {
  const lo = yearMin ?? YEAR_MIN;
  const hi = yearMax ?? YEAR_MAX;
  const vis = (unit.missiles ?? []).filter((m) => missileVisible(m, lo, hi));
  const byKey = new Map<string, MissileLoadout>();
  for (const m of vis) {
    const prev = byKey.get(m.key);
    byKey.set(m.key, prev ? betterLoadout(prev, m) : m);
  }
  const byLabel = new Map<string, MissileLoadout>();
  for (const m of byKey.values()) {
    const prev = byLabel.get(m.label);
    byLabel.set(m.label, prev ? betterLoadout(prev, m) : m);
  }
  return [...byLabel.values()].sort((a, b) => a.points - b.points || a.label.localeCompare(b.label));
}

export function defaultMissileId(unit: Vehicle, yearMin?: number, yearMax?: number): string | null {
  const opts = visibleMissiles(unit, yearMin, yearMax);
  if (!opts.length) return null;
  if (unit.missileRequired) return opts[0]?.id ?? null;
  return null;
}

export function unitHasMissiles(unit: Vehicle, yearMin?: number, yearMax?: number): boolean {
  if (isHelicopter(unit)) return heloMissileLabels(unit, yearMin ?? YEAR_MIN, yearMax ?? YEAR_MAX).length > 0;
  return visibleMissiles(unit, yearMin, yearMax).length > 0;
}

export function towedWeaponPoints(weapon: Vehicle, yearMin?: number, yearMax?: number): number {
  return unitBasePoints(weapon, defaultMissileId(weapon, yearMin, yearMax));
}

export function unitHasTowedOptions(unit: Vehicle, yearMin?: number, yearMax?: number): boolean {
  return visibleTowed(unit, TOWED_WEAPONS, yearMin, yearMax).length > 0;
}

export function unitStandBase(
  unit: Vehicle,
  missileId?: string | null,
  heloPods?: HeloPodPick[] | null,
  towedLoad?: TowedPick[] | null,
  yearMin?: number,
  yearMax?: number,
): number {
  const chassis = isHelicopter(unit)
    ? unit.Points + heloExtraPoints(sanitizeHeloPicks(unit, heloPods))
    : unitBasePoints(unit, missileId);
  const cargo = isHelicopter(unit) ? [] : (towedLoad ?? []);
  return chassis + towedExtraPoints(cargo, getUnit, (w) => towedWeaponPoints(w, yearMin, yearMax));
}

export type UnitFilter = {
  query?: string;
  yearMin: number;
  yearMax: number;
  classId?: string | null;
  gun?: string;
  missile?: string;
};

function towedOptions(unit: Vehicle, yearMin: number, yearMax: number): Vehicle[] {
  return visibleTowed(unit, TOWED_WEAPONS, yearMin, yearMax);
}

export function filterUnits(nationId: string, filter: UnitFilter): Vehicle[] {
  const q = (filter.query ?? "").trim().toLowerCase();
  const gun = filter.gun ?? "";
  const missile = filter.missile ?? "";
  return unitsForNation(nationId).filter((u) => {
    if (!eraOverlaps(u, filter.yearMin, filter.yearMax)) return false;
    if (!matchesClass(u, filter.classId)) return false;
    const cargo = towedOptions(u, filter.yearMin, filter.yearMax);
    if (gun && gunLabel(u) !== gun) {
      if (!cargo.some((w) => gunLabel(w) === gun)) return false;
    }
    if (missile) {
      const onGround = visibleMissiles(u, filter.yearMin, filter.yearMax).some((m) => m.label === missile);
      const onHelo = isHelicopter(u) && heloHasMissileLabel(u, missile, filter.yearMin, filter.yearMax);
      const onTowed = cargo.some((w) =>
        visibleMissiles(w, filter.yearMin, filter.yearMax).some((m) => m.label === missile),
      );
      if (!onGround && !onHelo && !onTowed) return false;
    }
    if (!q) return true;
    const hay = [
      u.Name,
      u.gun_name,
      gunLabel(u),
      u.notes,
      u.kind === "helicopter" ? "helicopter helo" : "",
      cargo.length ? "towed" : "",
      ...(u.missiles ?? []).flatMap((m) => [m.label, m.key]),
      ...(isHelicopter(u) ? heloMissileLabels(u, filter.yearMin, filter.yearMax) : []),
      ...(u.podOptionKeys ?? []),
      ...cargo.flatMap((w) => [
        w.Name,
        w.gun_name,
        gunLabel(w),
        ...(w.missiles ?? []).map((m) => m.label),
      ]),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function availableGunsFor(units: Vehicle[], yearMin: number, yearMax: number): string[] {
  const set = new Set<string>();
  for (const u of units) {
    const own = gunLabel(u);
    if (own) set.add(own);
    for (const w of towedOptions(u, yearMin, yearMax)) {
      const g = gunLabel(w);
      if (g) set.add(g);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function availableMissilesFor(
  units: Vehicle[],
  yearMin: number,
  yearMax: number,
): string[] {
  const set = new Set<string>();
  for (const u of units) {
    for (const m of visibleMissiles(u, yearMin, yearMax)) {
      if (m.label) set.add(m.label);
    }
    if (isHelicopter(u)) {
      for (const label of heloMissileLabels(u, yearMin, yearMax)) set.add(label);
    }
    for (const w of towedOptions(u, yearMin, yearMax)) {
      for (const m of visibleMissiles(w, yearMin, yearMax)) {
        if (m.label) set.add(m.label);
      }
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
