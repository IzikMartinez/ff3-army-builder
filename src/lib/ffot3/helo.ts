import type { Era, HeloPodPick, Vehicle } from "./types";
import { YEAR_MAX, YEAR_MIN, parseEraYear } from "./combat";

export type HeloWeaponKind = "gun" | "rocket" | "missile" | "aam" | "mg" | "ac";

export type HeloWeapon = {
  id: string;
  key: string;
  label: string;
  kind: HeloWeaponKind;
  era: Era;
  costPerPod?: number;
  costByCount?: [number, number, number];
  pen: string;
  rof: number;
  range: [number, number];
  ai?: number;
  generation?: number;
  topAttack?: boolean;
  oneShot?: boolean;
  notes?: string;
  maxPods?: number;
};

function era(start: string, end: string): Era {
  return { start_era: start, end_era: end };
}

export const HELO_WEAPONS: HeloWeapon[] = [
  {
    id: "mg-guv8700",
    key: "mg-guv8700",
    label: "GUV-8700 Tri-Rotary",
    kind: "mg",
    era: era("60", "10"),
    costPerPod: 64,
    pen: "1",
    rof: 8,
    range: [0, 6],
    ai: 0,
  },
  {
    id: "mg-guv1",
    key: "mg-guv1",
    label: "GUV-1 Twin AGS",
    kind: "mg",
    era: era("60", "10"),
    costPerPod: 72,
    pen: "3he",
    rof: 4,
    range: [0, 8],
    ai: 0,
  },
  {
    id: "ac-upk23",
    key: "ac-upk23",
    label: "UPK-23 Twin 23mm",
    kind: "ac",
    era: era("60", "10"),
    costPerPod: 106,
    pen: "2",
    rof: 4,
    range: [0, 10],
    ai: 0,
  },
  {
    id: "ac-upk23-dl",
    key: "ac-upk23-dl",
    label: "Dual-Linked UPK-23",
    kind: "ac",
    era: era("60", "10"),
    costPerPod: 106,
    pen: "2",
    rof: 6,
    range: [0, 10],
    ai: 0,
  },
  {
    id: "mg-pk762",
    key: "mg-pk762",
    label: "PK 7.62mm MG",
    kind: "mg",
    era: era("60", "10"),
    costPerPod: 16,
    pen: "-",
    rof: 2,
    range: [0, 6],
    ai: -1,
  },
  {
    id: "cannon-20",
    key: "cannon-20",
    label: "20mm Autocannon",
    kind: "ac",
    era: era("60", "10"),
    costPerPod: 106,
    pen: "2",
    rof: 4,
    range: [0, 10],
    ai: 0,
  },
  {
    id: "cannon-30",
    key: "cannon-30",
    label: "30mm Autocannon",
    kind: "ac",
    era: era("70", "10"),
    costPerPod: 154,
    pen: "4h",
    rof: 4,
    range: [0, 12],
    ai: 0,
  },
  {
    id: "rocket-he",
    key: "rocket-he",
    label: "HE Rockets",
    kind: "rocket",
    era: era("60", "10"),
    costPerPod: 4,
    pen: "-",
    rof: 1,
    range: [0, 30],
    notes: "1 fire unit of Helo HE rockets. Range 30″.",
  },
  {
    id: "rocket-sbm",
    key: "rocket-sbm",
    label: "SBM Rockets",
    kind: "rocket",
    era: era("60", "10"),
    costPerPod: 12,
    pen: "-",
    rof: 1,
    range: [0, 30],
    notes: "1 fire unit of Helo SBM rockets. Range 30″.",
  },
  {
    id: "at-2b",
    key: "at-2",
    label: "AT-2B Falanga",
    kind: "missile",
    era: era("67", "10"),
    costByCount: [52, 130, 190],
    pen: "14h",
    rof: 1,
    range: [10, 35],
    generation: 1,
  },
  {
    id: "at-2c",
    key: "at-2",
    label: "AT-2C Falanga-M",
    kind: "missile",
    era: era("77", "10"),
    costByCount: [105, 262, 307],
    pen: "14h",
    rof: 1,
    range: [10, 40],
    generation: 2,
  },
  {
    id: "at-3b",
    key: "at-3",
    label: "AT-3B Malyutka",
    kind: "missile",
    era: era("61", "10"),
    costByCount: [46, 115, 168],
    pen: "11h",
    rof: 1,
    range: [5, 30],
    generation: 1,
  },
  {
    id: "at-3c",
    key: "at-3",
    label: "AT-3C Malyutka-P",
    kind: "missile",
    era: era("72", "10"),
    costByCount: [88, 219, 257],
    pen: "12h",
    rof: 1,
    range: [5, 30],
    generation: 2,
  },
  {
    id: "at-3d",
    key: "at-3",
    label: "AT-3D Malyutka-3",
    kind: "missile",
    era: era("90", "10"),
    costByCount: [106, 266, 312],
    pen: "15h",
    rof: 1,
    range: [1, 30],
    generation: 2,
  },
  {
    id: "at-6",
    key: "at-6",
    label: "AT-6 Shturm",
    kind: "missile",
    era: era("78", "10"),
    costByCount: [132, 330, 387],
    pen: "13h",
    rof: 1,
    range: [1, 50],
    generation: 2,
  },
  {
    id: "at-6-m1",
    key: "at-6",
    label: "AT-6M1 Shturm-M",
    kind: "missile",
    era: era("89", "10"),
    costByCount: [163, 407, 477],
    pen: "16h",
    rof: 1,
    range: [1, 60],
    generation: 2,
  },
  {
    id: "at-6-m2",
    key: "at-6",
    label: "AT-6M2 Shturm-M2",
    kind: "missile",
    era: era("90", "10"),
    costByCount: [178, 444, 520],
    pen: "16h",
    rof: 1,
    range: [1, 70],
    generation: 2,
  },
  {
    id: "at-9",
    key: "at-9",
    label: "AT-9 Ataka",
    kind: "missile",
    era: era("90", "10"),
    costByCount: [183, 458, 536],
    pen: "17h",
    rof: 1,
    range: [1, 70],
    generation: 2,
  },
  {
    id: "at-16",
    key: "at-16",
    label: "AT-16 Vikhr",
    kind: "missile",
    era: era("92", "10"),
    costByCount: [231, 578, 653],
    pen: "17h",
    rof: 1,
    range: [1, 80],
    generation: 3,
  },
  {
    id: "hellfire-abc",
    key: "hellfire",
    label: "Hellfire",
    kind: "missile",
    era: era("85", "10"),
    costByCount: [220, 550, 622],
    pen: "19h",
    rof: 1,
    range: [15, 80],
    generation: 3,
  },
  {
    id: "hellfire-f",
    key: "hellfire",
    label: "Hellfire-F",
    kind: "missile",
    era: era("92", "10"),
    costByCount: [206, 515, 583],
    pen: "20h",
    rof: 1,
    range: [15, 70],
    generation: 3,
  },
  {
    id: "hellfire-k",
    key: "hellfire",
    label: "Hellfire-K",
    kind: "missile",
    era: era("95", "10"),
    costByCount: [269, 672, 759],
    pen: "20h",
    rof: 1,
    range: [1, 90],
    generation: 3,
  },
  {
    id: "hellfire-l",
    key: "hellfire-l",
    label: "Hellfire-L",
    kind: "missile",
    era: era("98", "10"),
    costByCount: [269, 672, 759],
    pen: "20h",
    rof: 2,
    range: [1, 90],
    generation: 3,
  },
  {
    id: "hellfire-m",
    key: "hellfire",
    label: "Hellfire-M",
    kind: "missile",
    era: era("01", "10"),
    costByCount: [37, 93, 117],
    pen: "12he",
    rof: 2,
    range: [1, 90],
    generation: 3,
    notes: "A hit on soft causes a QC; target gets a terrain save.",
  },
  {
    id: "hellfire-n",
    key: "hellfire",
    label: "Hellfire-N",
    kind: "missile",
    era: era("02", "10"),
    costByCount: [47, 117, 140],
    pen: "15he",
    rof: 2,
    range: [1, 90],
    generation: 3,
    notes: "A hit on soft causes a QC; no terrain save.",
  },
  {
    id: "hot-1",
    key: "hot",
    label: "HOT",
    kind: "missile",
    era: era("77", "10"),
    costByCount: [126, 314, 367],
    pen: "15h",
    rof: 1,
    range: [1, 40],
    generation: 2,
  },
  {
    id: "hot-2",
    key: "hot",
    label: "HOT 2",
    kind: "missile",
    era: era("83", "10"),
    costByCount: [130, 324, 380],
    pen: "16h",
    rof: 1,
    range: [1, 40],
    generation: 2,
  },
  {
    id: "hot-2t",
    key: "hot",
    label: "HOT 2T",
    kind: "missile",
    era: era("90", "10"),
    costByCount: [138, 345, 404],
    pen: "18h",
    rof: 1,
    range: [1, 40],
    generation: 2,
  },
  {
    id: "hot-3",
    key: "hot",
    label: "HOT 3",
    kind: "missile",
    era: era("97", "10"),
    costByCount: [142, 355, 415],
    pen: "19h",
    rof: 1,
    range: [1, 40],
    generation: 2,
  },
  {
    id: "spike-er",
    key: "spike-er",
    label: "Spike-ER",
    kind: "missile",
    era: era("99", "15"),
    costByCount: [208, 519, 587],
    pen: "14h",
    rof: 1,
    range: [2, 80],
    generation: 3,
    topAttack: true,
  },
  {
    id: "ss-11",
    key: "ss-11",
    label: "SS.11",
    kind: "missile",
    era: era("60", "10"),
    costByCount: [50, 125, 183],
    pen: "13h",
    rof: 1,
    range: [5, 30],
    generation: 1,
  },
  {
    id: "ss-12",
    key: "ss-12",
    label: "SS.12",
    kind: "missile",
    era: era("75", "10"),
    costByCount: [78, 194, 284],
    pen: "13h",
    rof: 1,
    range: [4, 60],
    generation: 1,
    notes: "Mainly anti-ship and anti-fortification.",
  },
  {
    id: "tow",
    key: "tow",
    label: "TOW",
    kind: "missile",
    era: era("70", "10"),
    costByCount: [99, 248, 290],
    pen: "13h",
    rof: 1,
    range: [1, 30],
    generation: 2,
  },
  {
    id: "tow-er",
    key: "tow",
    label: "TOW-ER",
    kind: "missile",
    era: era("76", "10"),
    costByCount: [113, 283, 332],
    pen: "13h",
    rof: 1,
    range: [1, 38],
    generation: 2,
  },
  {
    id: "itow",
    key: "tow",
    label: "I-TOW",
    kind: "missile",
    era: era("82", "10"),
    costByCount: [118, 294, 344],
    pen: "14h",
    rof: 1,
    range: [1, 38],
    generation: 2,
  },
  {
    id: "tow-2",
    key: "tow",
    label: "TOW-2",
    kind: "missile",
    era: era("84", "10"),
    costByCount: [122, 305, 357],
    pen: "15h",
    rof: 1,
    range: [1, 38],
    generation: 2,
  },
  {
    id: "tow-2a",
    key: "tow",
    label: "TOW-2A",
    kind: "missile",
    era: era("87", "10"),
    costByCount: [138, 344, 403],
    pen: "19h",
    rof: 1,
    range: [1, 38],
    generation: 2,
  },
  {
    id: "tow-2b",
    key: "tow",
    label: "TOW-2B",
    kind: "missile",
    era: era("92", "10"),
    costByCount: [122, 305, 357],
    pen: "15h",
    rof: 1,
    range: [1, 38],
    generation: 2,
    topAttack: true,
  },
  {
    id: "zt-3",
    key: "zt-3",
    label: "ZT-3",
    kind: "missile",
    era: era("87", "10"),
    costByCount: [121, 303, 355],
    pen: "14h",
    rof: 1,
    range: [1, 40],
    generation: 2,
  },
  {
    id: "zt-3b",
    key: "zt-3",
    label: "ZT-3B",
    kind: "missile",
    era: era("98", "10"),
    costByCount: [186, 466, 526],
    pen: "19h",
    rof: 1,
    range: [2, 50],
    generation: 3,
  },
  {
    id: "igla",
    key: "igla",
    label: "Igla",
    kind: "aam",
    era: era("85", "15"),
    costPerPod: 265,
    pen: "2A",
    rof: 2,
    range: [5, 32],
    generation: 2,
    oneShot: true,
    maxPods: 4,
    notes: "One shot per pod. Maximum 4 pods.",
  },
  {
    id: "stinger",
    key: "stinger",
    label: "Stinger",
    kind: "aam",
    era: era("88", "15"),
    costPerPod: 265,
    pen: "2A",
    rof: 2,
    range: [2, 32],
    generation: 2,
    oneShot: true,
    maxPods: 2,
    notes: "One shot per pod. Maximum 2 pods.",
  },
];

const BY_ID = new Map(HELO_WEAPONS.map((w) => [w.id, w]));

export function isHelicopter(unit: Vehicle): boolean {
  return unit.kind === "helicopter" || (unit.move_type ?? []).includes("helicopter");
}

export function getHeloWeapon(id: string): HeloWeapon | undefined {
  return BY_ID.get(id);
}

export function weaponEraOverlaps(w: HeloWeapon, yearMin: number, yearMax: number): boolean {
  const a = parseEraYear(w.era.start_era);
  const b = parseEraYear(w.era.end_era);
  return a <= yearMax && b >= yearMin;
}

function betterVariant(a: HeloWeapon, b: HeloWeapon): HeloWeapon {
  const pa = Number.parseInt(b.pen, 10);
  const pb = Number.parseInt(a.pen, 10);
  if (!Number.isNaN(pa) && !Number.isNaN(pb) && pa !== pb) return pa > pb ? b : a;
  return parseEraYear(b.era.start_era) >= parseEraYear(a.era.start_era) ? b : a;
}

export function variantsForKey(key: string, yearMin?: number, yearMax?: number): HeloWeapon[] {
  const lo = yearMin ?? YEAR_MIN;
  const hi = yearMax ?? YEAR_MAX;
  return HELO_WEAPONS.filter((w) => w.key === key && weaponEraOverlaps(w, lo, hi)).sort(
    (a, b) => parseEraYear(a.era.start_era) - parseEraYear(b.era.start_era),
  );
}

export function defaultVariant(key: string, yearMin?: number, yearMax?: number): HeloWeapon | undefined {
  const list = variantsForKey(key, yearMin, yearMax);
  if (!list.length) return undefined;
  return list.reduce((best, w) => betterVariant(best, w));
}

export function visibleHeloKeys(unit: Vehicle, yearMin?: number, yearMax?: number): string[] {
  return (unit.podOptionKeys ?? []).filter((key) => variantsForKey(key, yearMin, yearMax).length > 0);
}

export function familyLabel(key: string): string {
  const hit = HELO_WEAPONS.find((w) => w.key === key);
  if (!hit) return key;
  if (hit.kind === "missile" || hit.kind === "aam") {
    const first = HELO_WEAPONS.find((w) => w.key === key);
    return first?.label ?? key;
  }
  return hit.label;
}

export function usedPodCount(picks: HeloPodPick[] | null | undefined): number {
  return (picks ?? []).reduce((n, p) => n + Math.max(0, p.count), 0);
}

export function missilePodCount(picks: HeloPodPick[] | null | undefined): number {
  return (picks ?? []).reduce((n, p) => {
    const w = BY_ID.get(p.variantId);
    if (!w || (w.kind !== "missile" && w.kind !== "aam")) return n;
    return n + Math.max(0, p.count);
  }, 0);
}

export function pickForKey(picks: HeloPodPick[] | null | undefined, key: string): HeloPodPick | undefined {
  return (picks ?? []).find((p) => p.key === key);
}

export function podCost(weapon: HeloWeapon, count: number): number {
  const n = Math.max(0, count);
  if (n === 0) return 0;
  if (weapon.costPerPod != null) return weapon.costPerPod * n;
  const table = weapon.costByCount;
  if (!table) return 0;
  if (n === 1) return table[0];
  if (n <= 3) return table[1];
  return table[2];
}

export function heloExtraPoints(
  picks: HeloPodPick[] | null | undefined,
): number {
  let sum = 0;
  for (const p of picks ?? []) {
    const w = BY_ID.get(p.variantId);
    if (!w) continue;
    sum += podCost(w, p.count);
  }
  return sum;
}

function keyCount(picks: HeloPodPick[], key: string): number {
  return picks.filter((p) => p.key === key).reduce((n, p) => n + p.count, 0);
}

export function canIncrement(
  unit: Vehicle,
  picks: HeloPodPick[],
  key: string,
  yearMin?: number,
  yearMax?: number,
): boolean {
  if (!unit.podOptionKeys.includes(key)) return false;
  const variant = pickForKey(picks, key);
  const weapon = variant
    ? BY_ID.get(variant.variantId)
    : defaultVariant(key, yearMin, yearMax);
  if (!weapon) return false;
  const next = usedPodCount(picks) + 1;
  if (next > (unit.pods || 0)) return false;
  const maxForKey = unit.maxKeyPods?.[key] ?? weapon.maxPods;
  if (maxForKey != null && keyCount(picks, key) + 1 > maxForKey) return false;
  if (unit.maxMissilePods != null && (weapon.kind === "missile" || weapon.kind === "aam")) {
    if (missilePodCount(picks) + 1 > unit.maxMissilePods) return false;
  }
  return true;
}

export function setHeloCount(
  unit: Vehicle,
  picks: HeloPodPick[],
  key: string,
  count: number,
  yearMin?: number,
  yearMax?: number,
): HeloPodPick[] {
  const nextCount = Math.max(0, Math.round(count));
  const rest = picks.filter((p) => p.key !== key);
  if (nextCount === 0) return rest;
  const prev = pickForKey(picks, key);
  const variant =
    (prev ? BY_ID.get(prev.variantId) : undefined) ??
    defaultVariant(key, yearMin, yearMax);
  if (!variant) return picks;
  const candidate = [...rest, { key, variantId: variant.id, count: nextCount }];
  if (usedPodCount(candidate) > (unit.pods || 0)) return picks;
  const maxForKey = unit.maxKeyPods?.[key] ?? variant.maxPods;
  if (maxForKey != null && nextCount > maxForKey) return picks;
  if (unit.maxMissilePods != null && (variant.kind === "missile" || variant.kind === "aam")) {
    if (missilePodCount(candidate) > unit.maxMissilePods) return picks;
  }
  return candidate;
}

export function setHeloVariant(
  picks: HeloPodPick[],
  key: string,
  variantId: string,
): HeloPodPick[] {
  const w = BY_ID.get(variantId);
  if (!w || w.key !== key) return picks;
  const prev = pickForKey(picks, key);
  if (!prev) {
    return [...picks, { key, variantId, count: 0 }].filter((p) => p.count > 0 || p.variantId === variantId);
  }
  return picks.map((p) => (p.key === key ? { ...p, variantId } : p));
}

export function selectedHeloWeapons(picks: HeloPodPick[] | null | undefined): { weapon: HeloWeapon; count: number }[] {
  const out: { weapon: HeloWeapon; count: number }[] = [];
  for (const p of picks ?? []) {
    if (p.count <= 0) continue;
    const w = BY_ID.get(p.variantId);
    if (w) out.push({ weapon: w, count: p.count });
  }
  return out;
}

export function heloMissileLabels(
  unit: Vehicle,
  yearMin: number,
  yearMax: number,
): string[] {
  const labels = new Set<string>();
  for (const key of visibleHeloKeys(unit, yearMin, yearMax)) {
    for (const w of variantsForKey(key, yearMin, yearMax)) {
      if (w.kind === "missile" || w.kind === "aam") labels.add(w.label);
    }
  }
  return [...labels];
}

export function heloHasMissileLabel(
  unit: Vehicle,
  label: string,
  yearMin: number,
  yearMax: number,
): boolean {
  return heloMissileLabels(unit, yearMin, yearMax).includes(label);
}

export function heloFireNote(generation: number | undefined): string {
  if (!generation || generation <= 1) return "Fire if the helicopter moved half or less.";
  return "May fire after a full move.";
}

export function sanitizeHeloPicks(
  unit: Vehicle,
  picks: HeloPodPick[] | null | undefined,
  yearMin?: number,
  yearMax?: number,
): HeloPodPick[] {
  const allowed = new Set(visibleHeloKeys(unit, yearMin, yearMax));
  const next: HeloPodPick[] = [];
  for (const p of picks ?? []) {
    if (!allowed.has(p.key) || p.count <= 0) continue;
    const variants = variantsForKey(p.key, yearMin, yearMax);
    const variant =
      variants.find((w) => w.id === p.variantId) ?? defaultVariant(p.key, yearMin, yearMax);
    if (!variant) continue;
    next.push({ key: p.key, variantId: variant.id, count: p.count });
  }
  return next;
}

export function heloPicksEqual(a: HeloPodPick[] | null | undefined, b: HeloPodPick[] | null | undefined): boolean {
  const aa = [...(a ?? [])].filter((p) => p.count > 0).sort((x, y) => x.key.localeCompare(y.key));
  const bb = [...(b ?? [])].filter((p) => p.count > 0).sort((x, y) => x.key.localeCompare(y.key));
  if (aa.length !== bb.length) return false;
  return aa.every(
    (p, i) => p.key === bb[i]!.key && p.variantId === bb[i]!.variantId && p.count === bb[i]!.count,
  );
}
