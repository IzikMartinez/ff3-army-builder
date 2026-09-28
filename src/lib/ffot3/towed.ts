import type { TowedPick, Vehicle } from "./types";
import { YEAR_MAX, YEAR_MIN, eraOverlaps, parseEraYear } from "./combat";

export function isTowed(unit: Vehicle): boolean {
  return (unit.move_type ?? []).includes("towed");
}

export function isHelicopterUnit(unit: Vehicle): boolean {
  return unit.kind === "helicopter" || (unit.move_type ?? []).includes("helicopter");
}

export function isZeroMoveTowed(unit: Vehicle): boolean {
  return isTowed(unit) && (Number(unit.move_value) || 0) <= 0;
}

export function towedCap(unit: Vehicle): number {
  return Number(unit.infantry_capacity) || 0;
}

export function isCarrier(unit: Vehicle): boolean {
  if (isHelicopterUnit(unit) || isTowed(unit)) return false;
  return towedCap(unit) > 0;
}

export function formatCap(n: number): string {
  if (Math.abs(n) < 0.001) return "0";
  if (Math.abs(n - 0.5) < 0.01) return "½";
  if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
  return String(n);
}

export function towedDedupeKey(w: Vehicle): string {
  return [w.nation, w.Name, w.era.start_era, w.era.end_era, String(w.Points), w.gun_name].join("|");
}

export function usedTowedCap(picks: TowedPick[] | null | undefined, resolve: (id: string) => Vehicle | undefined): number {
  let used = 0;
  for (const p of picks ?? []) {
    const w = resolve(p.id);
    if (!w) continue;
    used += towedCap(w) * Math.max(0, p.count);
  }
  return used;
}

export function remainingCap(
  unit: Vehicle,
  picks: TowedPick[] | null | undefined,
  resolve: (id: string) => Vehicle | undefined,
): number {
  return Math.max(0, towedCap(unit) - usedTowedCap(picks, resolve));
}

export function towedExtraPoints(
  picks: TowedPick[] | null | undefined,
  resolve: (id: string) => Vehicle | undefined,
  pointsOf?: (weapon: Vehicle) => number,
): number {
  let sum = 0;
  for (const p of picks ?? []) {
    const w = resolve(p.id);
    if (!w) continue;
    const pts = pointsOf ? pointsOf(w) : Number(w.Points) || 0;
    sum += pts * Math.max(0, p.count);
  }
  return sum;
}

export function selectedTowed(
  picks: TowedPick[] | null | undefined,
  resolve: (id: string) => Vehicle | undefined,
): { weapon: Vehicle; count: number }[] {
  const out: { weapon: Vehicle; count: number }[] = [];
  for (const p of picks ?? []) {
    if (p.count <= 0) continue;
    const w = resolve(p.id);
    if (w) out.push({ weapon: w, count: p.count });
  }
  return out;
}

export function pickForTowed(picks: TowedPick[] | null | undefined, id: string): TowedPick | undefined {
  return (picks ?? []).find((p) => p.id === id);
}

export function canAddTowed(
  unit: Vehicle,
  picks: TowedPick[],
  weapon: Vehicle,
  resolve: (id: string) => Vehicle | undefined,
): boolean {
  if (isTowed(unit) || isHelicopterUnit(unit)) return false;
  const need = towedCap(weapon);
  if (need <= 0) return remainingCap(unit, picks, resolve) >= 0;
  return remainingCap(unit, picks, resolve) + 1e-6 >= need;
}

export function setTowedCount(
  unit: Vehicle,
  picks: TowedPick[],
  weapon: Vehicle,
  count: number,
  resolve: (id: string) => Vehicle | undefined,
): TowedPick[] {
  if (isTowed(unit) || isHelicopterUnit(unit)) return picks.filter((p) => p.count > 0);
  const nextCount = Math.max(0, Math.round(count));
  const rest = picks.filter((p) => p.id !== weapon.id);
  if (nextCount === 0) return rest;
  const candidate = [...rest, { id: weapon.id, count: nextCount }];
  if (remainingCap(unit, candidate, resolve) < -1e-6) return picks;
  return candidate;
}

export function towedPicksEqual(a: TowedPick[] | null | undefined, b: TowedPick[] | null | undefined): boolean {
  const aa = [...(a ?? [])].filter((p) => p.count > 0).sort((x, y) => x.id.localeCompare(y.id));
  const bb = [...(b ?? [])].filter((p) => p.count > 0).sort((x, y) => x.id.localeCompare(y.id));
  if (aa.length !== bb.length) return false;
  return aa.every((p, i) => p.id === bb[i]!.id && p.count === bb[i]!.count);
}

export function visibleTowed(
  unit: Vehicle,
  allTowed: Vehicle[],
  yearMin?: number,
  yearMax?: number,
): Vehicle[] {
  if (isTowed(unit) || isHelicopterUnit(unit)) return [];
  const cap = towedCap(unit);
  if (cap <= 0) return [];
  const lo = yearMin ?? YEAR_MIN;
  const hi = yearMax ?? YEAR_MAX;
  const carrierLo = parseEraYear(unit.era.start_era);
  const carrierHi = parseEraYear(unit.era.end_era);
  const seen = new Set<string>();
  const out: Vehicle[] = [];
  for (const w of allTowed) {
    if (w.nation !== unit.nation) continue;
    if (w.id === unit.id) continue;
    if (towedCap(w) > cap + 1e-6) continue;
    if (!eraOverlaps(w, lo, hi)) continue;
    if (!eraOverlaps(w, carrierLo, carrierHi)) continue;
    const key = towedDedupeKey(w);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out.sort((a, b) => a.Name.localeCompare(b.Name) || towedCap(a) - towedCap(b));
}

export function sanitizeTowedPicks(
  unit: Vehicle,
  picks: TowedPick[] | null | undefined,
  allTowed: Vehicle[],
  yearMin?: number,
  yearMax?: number,
  resolve?: (id: string) => Vehicle | undefined,
): TowedPick[] {
  const allowed = new Set(visibleTowed(unit, allTowed, yearMin, yearMax).map((w) => w.id));
  const next: TowedPick[] = [];
  for (const p of picks ?? []) {
    if (!allowed.has(p.id) || p.count <= 0) continue;
    next.push({ id: p.id, count: p.count });
  }
  if (!resolve) return next;
  let acc: TowedPick[] = [];
  for (const p of next) {
    const w = resolve(p.id);
    if (!w) continue;
    const trial = [...acc, p];
    if (remainingCap(unit, trial, resolve) < -1e-6) continue;
    acc = trial;
  }
  return acc;
}
