import type { EquipMark, GunBand, MissileLoadout, MoveTable, Quality, RangeSystem, Vehicle } from "./types";

export const YEAR_MIN = 1950;
export const YEAR_MAX = 2015;
export const STAND_SIZES = [1, 3, 4, 9, 12] as const;

const EQUIP_NOTES: Record<string, { name: string; effect: string }> = {
  s: {
    name: "Weapon stabilization",
    effect: "May fire the gun while moving.",
  },
  ss: {
    name: "Advanced weapon stabilization",
    effect: "Superior stabilizer — fire on the move with fewer restrictions than basic stab.",
  },
  t: {
    name: "1st generation thermal sights",
    effect: "Night vis 20″. No night to-hit penalty. −1 through normal smoke, −2 through incendiary.",
  },
  "2": {
    name: "2nd generation thermal sights",
    effect: "Night vis 40″. No night to-hit penalty. Better thermal vision through smoke than 1st gen.",
  },
  i: {
    name: "IR / image-intensification sights",
    effect: "Night vis 20″. Does not cancel the night to-hit penalty that thermals ignore.",
  },
  n: {
    name: "NBC system",
    effect: "Sealed NBC protection. Ignore chemical attacks.",
  },
  c: {
    name: "CITV",
    effect: "Commander’s Independent Thermal Viewer. Engage extra targets without the multiple-target ROF penalty.",
  },
  v: {
    name: "IVIS",
    effect: "Inter-Vehicular Information System. Each stand is a forward observer and cohesion distance is doubled.",
  },
  o: {
    name: "Open-topped vehicle",
    effect: "Crew is exposed overhead — more vulnerable to artillery and airbursts.",
  },
  f: {
    name: "Limited gun traverse — forward",
    effect: "Gun may only fire in the forward arc.",
  },
  r: {
    name: "Limited gun traverse — rearward",
    effect: "Gun may only fire in the rear arc.",
  },
  d: {
    name: "Smoke dischargers (pre-1950)",
    effect: "May fire discharger smoke. Later vehicles are assumed to have dischargers.",
  },
};

function parseEquipCodes(raw: string): string[] {
  const s = raw.trim();
  if (!s || s === "-" || s === "—") return [];
  if (s.includes(",")) {
    return s
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
  }
  const out: string[] = [];
  let i = 0;
  const compact = s.toLowerCase().replace(/\s+/g, "");
  while (i < compact.length) {
    if (compact.startsWith("ss", i)) {
      out.push("ss");
      i += 2;
      continue;
    }
    out.push(compact[i]!);
    i += 1;
  }
  return out;
}

export function decodeEquip(raw: string | null | undefined): EquipMark[] {
  return parseEquipCodes(raw ?? "").map((code) => {
    const note = EQUIP_NOTES[code];
    if (note) return { code, name: note.name, effect: note.effect };
    return { code, name: `Equipment “${code}”`, effect: "No listed in-game function." };
  });
}

export function parseEraYear(code: string): number {
  const n = Number.parseInt(String(code).replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return YEAR_MIN;
  return n <= 30 ? 2000 + n : 1900 + n;
}

export function formatEra(start: string, end: string): string {
  return `${parseEraYear(start)}–${parseEraYear(end)}`;
}

export function eraOverlaps(unit: Vehicle, minY: number, maxY: number): boolean {
  const a = parseEraYear(unit.era.start_era);
  const b = parseEraYear(unit.era.end_era);
  return a <= maxY && b >= minY;
}

export function inchesToCm(inches: number): number {
  const raw = Number(inches) === 1
    ? 1
    : Number(inches) * 2.5;
  if (!Number.isFinite(raw) || raw <= 0) return 0;

  const nearest = (step: number) => Math.round(raw / step) * step;
  const floorTo = (step: number) => Math.floor(raw / step) * step;
  const n12 = nearest(12);
  const n6 = nearest(6);
  const n3 = floorTo(3);
  const n2 = floorTo(2);
  const dist = (n: number) => Math.abs(raw - n);

  if (n12 > 0 && dist(n12) <= dist(n6)) return n12;
  if (n6 > 0 && dist(n6) <= dist(n3)) return n6;
  if (n3 > 0 && dist(n3) <= dist(n2)) return n3;
  return n2 > 0 ? n2 : nearest(2) || Math.round(raw);
}

function roundInch(inch: number): number {
  return Math.round(Number(inch) || 0);
}

export function formatRangeBand(inches: number[], system: RangeSystem): string {
  if (inches[0] === 1) {
    return system === "metric"
      ? `1 - ${inchesToCm(roundInch(inches[1]))}"`
      : `1 - ${roundInch(inches[1])}"`
  }
  else
    return system === "metric"
      ? `${inchesToCm(roundInch(inches[0]))}-${inchesToCm(roundInch(inches[1]))}"`
      : `${roundInch(inches[0])}-${roundInch(inches[1])}"`
}

export function formatRange(inches: number, system: RangeSystem): string {
  if (inches === -1) return `∞`
  return system === "metric" ? `${inchesToCm(roundInch(inches))}"` : `${roundInch(inches)}″`;
}

export function gunBands(range: number): GunBand[] {
  const r = Number(range) || 0;
  return [
    { band: "Close", range: Math.round(r / 2), hitBase: 3, penMod: 2 },
    { band: "Effect", range: r, hitBase: 4, penMod: 0 },
    { band: "Long", range: Math.round(r * 1.5), hitBase: 5, penMod: -2 },
  ];
}

export function parsePen(values: string[]): { he: number | null; heat: number | null } {
  let he: number | null = null;
  let heat: number | null = null;
  for (const raw of values ?? []) {
    const s = String(raw).trim().toLowerCase();
    if (!s || s === "-" || s === "—" || s === "n/a") continue;
    const heatFlag = /h$/.test(s);
    const n = Number.parseInt(s, 10);
    if (Number.isNaN(n)) continue;
    if (heatFlag) heat = n;
    else he = n;
  }
  return { he, heat };
}

export function formatPen(value: number | null, mod = 0): string {
  if (value === null) return "—";
  return String(value + mod);
}

export function terrainMove(move: number, moveType: string): MoveTable {
  const t = moveType.toLowerCase();
  if (t === "tracked" || t === "towed") {
    return {
      normal: move,
      rough: Math.round(move / 2),
      bad: Math.round(move / 2),
      road: Math.round(move * 2),
    };
  }
  if (t === "wheeled") {
    return {
      normal: move,
      rough: Math.round(move / 3),
      bad: Math.round(move / 3),
      road: Math.round(move * 4),
    };
  }
  return {
    normal: move,
    rough: Math.round(move / 3),
    bad: Math.round(move / 3),
    road: Math.round(move * 2),
  };
}

export function standPoints(base: number, pointMod: number): { size: number; cost: number }[] {
  return STAND_SIZES.map((size) => ({
    size,
    cost: Math.round(size * base * pointMod),
  }));
}

export function missileHit(
  gen: number,
  unlimited: boolean,
): { hit: number; moveShoot: boolean } {
  const unlim = unlimited ? 1 : 0;
  if (gen <= 1) return { hit: 6 - unlim, moveShoot: false };
  if (gen <= 2) return { hit: 4 - unlim, moveShoot: true };
  return { hit: 3 - unlim, moveShoot: true };
}

export function resolveLoadout(
  unit: Vehicle,
  missileId: string | null | undefined,
): MissileLoadout | null {
  const list = unit.missiles ?? [];
  if (!list.length) return null;
  if (missileId) {
    const found = list.find((m) => m.id === missileId);
    if (found) return found;
  }
  if (unit.missileRequired) return list[0] ?? null;
  return null;
}

export function unitBasePoints(unit: Vehicle, missileId: string | null | undefined): number {
  const loadout = resolveLoadout(unit, missileId);
  return loadout ? loadout.points : unit.Points;
}

export function adjustedHit(base: number, quality: Quality): number {
  return Math.max(2, base - quality.hit_mod);
}

export function hitInf(hit: number, ai: number | null | undefined): number {
  return Math.max(2, hit - (Number(ai) || 0));
}

export function adjustedRof(base: number, quality: Quality): number {
  return Math.max(0, base + quality.rof_mod);
}

export function armorLabels(armor: number[]): { label: string; value: number | string }[] {
  if (armor.length >= 4) {
    return [
      { label: "Front", value: armor[0] ?? 0 },
      { label: "Flank", value: armor[1] ?? 0 },
      { label: "Fr H", value: armor[2] ?? 0 },
      { label: "Fl H", value: armor[3] ?? 0 },
    ];
  }
  if (armor.length === 2) {
    return [
      { label: "Front", value: armor[0] ?? 0 },
      { label: "Flank", value: armor[1] ?? 0 },
    ];
  }
  const v = armor[0];
  return [{ label: "Armor", value: v ?? 0 }];
}

export function qualityLabel(q: Quality): string {
  return q.experience.charAt(0).toUpperCase() + q.experience.slice(1);
}

export function qualityShort(q: Quality): string {
  const map: Record<string, string> = {
    poor: "Poor",
    marginal: "Marg",
    fair: "Fair",
    average: "Avg",
    good: "Good",
    excellent: "Exc",
    elite: "Elite",
  };
  return map[q.experience] ?? qualityLabel(q);
}
