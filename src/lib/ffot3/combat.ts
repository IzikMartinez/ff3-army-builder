import type {
  EquipMark,
  GunBand,
  MissileLoadout,
  MoveTable,
  Quality,
  Scale,
  Vehicle,
} from "./types";

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
    effect:
      "Night vis 20″. No night to-hit penalty. −1 through normal smoke, −2 through incendiary.",
  },
  "2": {
    name: "2nd generation thermal sights",
    effect:
      "Night vis 40″. No night to-hit penalty. Better thermal vision through smoke than 1st gen.",
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
    effect:
      "Commander’s Independent Thermal Viewer. Engage extra targets without the multiple-target ROF penalty.",
  },
  v: {
    name: "IVIS",
    effect:
      "Inter-Vehicular Information System. Each stand is a forward observer and cohesion distance is doubled.",
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

/** Equipment codes that describe the gun rather than the vehicle: stabilisation, limited traverse. */
const WEAPON_EQUIP = new Set(["s", "ss", "f", "r"]);

/** Split equipment badges into weapon sub-card badges and unit (card footer) badges. */
export function splitEquip(raw: string | null | undefined): {
  weapon: EquipMark[];
  unit: EquipMark[];
} {
  const marks = decodeEquip(raw);
  return {
    weapon: marks.filter((m) => WEAPON_EQUIP.has(m.code)),
    unit: marks.filter((m) => !WEAPON_EQUIP.has(m.code)),
  };
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

/**
 * Convert a 1:5 distance to 1:1 (×2.5), rounded to a tape-friendly step
 * (12/6/3/2″). A 1″ minimum range stays 1″.
 */
export function toOneToOne(inches: number): number {
  const raw = Number(inches) === 1 ? 1 : Number(inches) * 2.5;
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

/** Inches at the chosen scale, without the ″ mark. */
export function scaleDistance(inches: number, scale: Scale): number {
  const n = Math.round(Number(inches) || 0);
  return scale === "1:1" ? toOneToOne(n) : n;
}

export function formatRangeBand(inches: number[], scale: Scale): string {
  return `${scaleDistance(inches[0] ?? 0, scale)}–${scaleDistance(inches[1] ?? 0, scale)}″`;
}

export function formatRange(inches: number, scale: Scale): string {
  if (inches === -1) return "∞";
  return `${scaleDistance(inches, scale)}″`;
}

export function gunBands(range: number): GunBand[] {
  const r = Number(range) || 0;
  return [
    { band: "Close", range: Math.round(r / 2), hitBase: 3, penMod: 2 },
    { band: "Effect", range: r, hitBase: 4, penMod: 0 },
    { band: "Long", range: Math.round(r * 1.5), hitBase: 5, penMod: -2 },
  ];
}

/**
 * Split a gun's Pen ratings by attack type (13.6.1): a plain number is a
 * normal (kinetic AP) attack and gets range modifiers; "12h" is h-class
 * (HEAT/HEAP/HESH) and "7he" is he-class (plain HE shell), both flat.
 */
export function parsePen(values: string[]): {
  ap: number | null;
  heat: number | null;
  he: number | null;
} {
  let ap: number | null = null;
  let heat: number | null = null;
  let he: number | null = null;
  for (const raw of values ?? []) {
    const s = String(raw).trim().toLowerCase();
    const n = Number.parseInt(s, 10);
    if (Number.isNaN(n)) continue;
    if (/he$/.test(s)) he = n;
    else if (/h/.test(s)) heat = n;
    else ap = n;
  }
  return { ap, heat, he };
}

/** h-class armor modifier letters (13.6.1): added to armor vs HEAT/HEAP/HESH. */
export const H_CLASS_BONUS: Record<string, number> = { "-": 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };

export type ArmorTable = {
  soft: boolean;
  /** Front/flank rows: armor vs AP & HE, and vs HEAT (armor + h-class bonus). */
  rows: { label: string; ap: number; heat: number }[];
  /** h-class bonus, or null when the letter is unknown. */
  bonus: number | null;
};

export function armorTable(unit: Vehicle): ArmorTable {
  const bonus = unit.armorH ? (H_CLASS_BONUS[unit.armorH] ?? null) : null;
  const labels = unit.armor.length >= 2 ? ["Front", "Flank"] : ["Armor"];
  return {
    soft: unit.armorSoft,
    bonus,
    rows: labels.map((label, i) => {
      const ap = unit.armor[i] ?? 0;
      return { label, ap, heat: ap + (bonus ?? 0) };
    }),
  };
}

export function formatPen(value: number | null, mod = 0): string {
  if (value === null) return "—";
  return String(value + mod);
}

export function terrainMove(move: number, moveType: string): MoveTable {
  const t = moveType.toLowerCase();
  if (t === "leg") {
    // Infantry: clear, rough and bad going all cost 1; no road bonus (Terrain Effects Chart).
    return { normal: move, rough: move, bad: move, road: move };
  }
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

/** A natural 1 always misses and a natural 6 always hits (13.4.1, 13.4.6). */
export function clampHit(n: number): number {
  return Math.min(6, Math.max(2, n));
}

/**
 * Missile to-hit by generation and ammo (13.4.6): 1st gen 6+ (5+ unlimited),
 * 2nd 4+ (3+), 3rd 3+ (2+). Troop quality to-hit modifiers apply.
 */
export function missileHit(
  gen: number,
  unlimited: boolean,
  quality?: Quality,
): { hit: number; moveShoot: boolean } {
  const unlim = unlimited ? 1 : 0;
  const base = gen <= 1 ? 6 : gen <= 2 ? 4 : 3;
  return { hit: clampHit(base - unlim - (quality?.hit_mod ?? 0)), moveShoot: gen > 1 };
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
  return clampHit(base - quality.hit_mod);
}

export function hitInf(hit: number, ai: number | null | undefined): number {
  return clampHit(hit - (Number(ai) || 0));
}

/** Gun ROF with quality modifier; a reduced ROF cannot drop below 1 (5.2). */
/** Ammo badges for a weapon's Pen: white AP / HE, orange HEAT (13.6.1), explained in tooltips. */
export function ammoMarks(pen: {
  ap: number | null;
  heat: number | null;
  he: number | null;
}): EquipMark[] {
  const marks: EquipMark[] = [];
  if (pen.ap !== null)
    marks.push({
      code: "ap",
      label: "AP",
      tone: "white",
      name: "Armor-piercing (white Pen)",
      effect:
        "+2 Pen at close range, −2 at long range — already worked into the white Pen. Compare with the target's white (AP / HE) armor.",
    });
  if (pen.he !== null)
    marks.push({
      code: "he",
      label: "HE",
      tone: "white",
      name: "High-explosive shell (white Pen)",
      effect: "Same Pen at every range. Compare with the target's white (AP / HE) armor.",
    });
  if (pen.heat !== null) marks.push(heatMark());
  return marks;
}

/** HEAT badge (guns' orange Pen, and missiles, which are shaped-charge too). */
export function heatMark(): EquipMark {
  return {
    code: "heat",
    label: "HEAT",
    tone: "heat",
    name: "Shaped charge (orange Pen)",
    effect:
      "Same Pen at every range. Compare with the target's orange (HEAT) armor, which already includes its h-class bonus.",
  };
}

export type MissileBadgeOpts = {
  generation?: number;
  ammo: "unlimited" | "limited" | "very-limited" | null;
  heat: boolean;
  topAttack?: boolean;
  sam?: boolean;
  oneShot?: boolean;
  /** Firing after moving differs for ground stands (13.4.6) and helicopters (17.3.1). */
  platform: "ground" | "helo";
};

/** Badges for a missile sub-card: ammo, generation (move-and-fire rule), HEAT, top attack, SAM. */
export function missileMarks(o: MissileBadgeOpts): EquipMark[] {
  const marks: EquipMark[] = [];
  if (o.ammo === "unlimited")
    marks.push({
      code: "unlim",
      label: "UNLIM",
      name: "Unlimited missile ammo",
      effect: "−1 to the to-hit number — already in Hit.",
    });
  else if (o.ammo === "limited")
    marks.push({
      code: "lim",
      label: "LIM",
      name: "Limited missile ammo",
      effect: "Uses the limited-ammo to-hit number — already in Hit.",
    });
  else if (o.ammo === "very-limited")
    marks.push({
      code: "vlim",
      label: "V.LIM",
      name: "Very limited missile ammo",
      effect: "One pod: may fire missiles only twice per game, at the limited-ammo to-hit.",
    });
  if (o.generation) {
    const g = o.generation;
    const ord = g === 1 ? "1st" : g === 2 ? "2nd" : "3rd";
    const move =
      o.platform === "helo"
        ? g <= 1
          ? "Fire only if the helicopter moved half or less."
          : "May fire after a full move."
        : g <= 1
          ? "Can't fire if the stand moved this turn (pivoting is fine)."
          : "Can fire if the stand moved half its move or less.";
    marks.push({
      code: `g${g}`,
      label: `G${g}`,
      name: `${ord} generation missile`,
      effect: `${move} Its to-hit is already in Hit.`,
    });
  }
  if (o.heat && !o.sam) marks.push(heatMark());
  if (o.topAttack)
    marks.push({
      code: "top",
      label: "TOP",
      name: "Top attack",
      effect: "Hits the target's flank armor, whatever the angle.",
    });
  if (o.sam)
    marks.push({
      code: "sam",
      label: "SAM",
      name: "Surface-to-air missile",
      effect: "Anti-aircraft missile.",
    });
  if (o.oneShot)
    marks.push({
      code: "1shot",
      label: "1 SHOT",
      name: "One shot per pod",
      effect: "Each pod fires once per game.",
    });
  return marks;
}

/** Badge for a weapon's anti-infantry (AI) modifier, explained in its tooltip (14.3). */
export function aiMark(ai: number): EquipMark {
  const label = `AI ${ai > 0 ? `+${ai}` : ai < 0 ? `−${-ai}` : "±0"}`;
  const effect =
    ai > 0
      ? `+${ai} to your die roll vs infantry: they are easier to hit.`
      : ai < 0
        ? `−${-ai} to your die roll vs infantry: they are harder to hit.`
        : "No change to your die roll vs infantry.";
  return {
    code: "ai",
    label,
    tone: "inf",
    name: "Anti-infantry modifier",
    effect: `${effect} The green half of the Hit column is your to-hit vs infantry, already calculated.`,
  };
}

export function adjustedRof(base: number, quality: Quality): number {
  if (base <= 0) return base;
  return Math.max(1, base + quality.rof_mod);
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
    superb: "Sup",
  };
  return map[q.experience] ?? qualityLabel(q);
}
