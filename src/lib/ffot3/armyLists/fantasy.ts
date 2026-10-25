import zapadoslaviaToe from "@/data/ZapadoslaviaTOE.json";
import yugoslaviaToe from "@/data/YugoslaviaTOE.json";
import type { ArmyListSpec, FormationSpec, GroupSpec, RoleOption } from "../formations";

/*
 * Fantasy nations: the TOE files (src/data/*TOE.json) stay the source of truth
 * and are read here into army lists, one per quality group (line, Gwardia,
 * Sokol…), since each group has its own equipment ("only_for" overrides).
 */

type Span = [number, number];
type ToeStand = { count: number; role: string; years?: Span; note?: string };
type ToeUnit = { name: string; count?: number; stands: ToeStand[] };
type ToeFormation = {
  id: string;
  name: string;
  years: Span;
  quality: string;
  units: ToeUnit[];
  notes?: string[];
};
type ToeEquipment = { years: Span; cards: string[]; only_for?: string[] };
type Toe = {
  nation: string;
  name: string;
  quality: Record<string, { label: string }>;
  formations: ToeFormation[];
  equipment: Record<string, ToeEquipment[]>;
};

const cat = (kind: string): RoleOption[] => [
  { options: [3, 2, 1].map((n) => `Category ${n} ${kind}`) },
];

/** Roles the TOEs leave to the catalog's generic cards ("roles_without_cards"). */
const GENERIC_ROLES: Record<string, RoleOption[]> = {
  "Infantry stand": cat("Infantry"),
  "Infantry w/ATGM stand": cat("Infantry w/ATGM"),
  "Infantry w/SAM stand": cat("Infantry w/SAM"),
  "Missile Team": cat("Missile Team"),
  "SAM Team": [{ options: [3, 2, 1].map((n) => `Category ${n} SAM Team*`) }],
  "Engineer stand": cat("Combat Engineer"),
  "Mortar Unit": [
    { years: [1950, 1980], options: ["M-43 120mm Mtr + Light Truck"] },
    {
      years: [1981, 1990],
      options: ["M-43 120mm Mtr + Light Truck", "2B11/2S12 120mm Mtr + Light Truck"],
    },
  ],
  // No native bridge layers: Soviet MTU cards (fallback nation).
  AVLB: [{ options: ["MTU-12 AVLB", "MTU-55 AVLB", "MTU-20 AVLB"] }],
};

/** Year ranges of `span` not covered by any of `cuts`. */
function subtract(span: Span, cuts: Span[]): Span[] {
  let pieces: Span[] = [span];
  for (const [a, b] of cuts) {
    pieces = pieces.flatMap(([x, y]): Span[] => {
      if (b < x || a > y) return [[x, y]];
      const out: Span[] = [];
      if (x < a) out.push([x, a - 1]);
      if (b < y) out.push([b + 1, y]);
      return out;
    });
  }
  return pieces;
}

/** Equipment Notes for one quality group: its own entries replace the general ones in their years. */
function rolesFor(toe: Toe, group: string): Record<string, RoleOption[]> {
  const roles: Record<string, RoleOption[]> = { ...GENERIC_ROLES };
  for (const [role, entries] of Object.entries(toe.equipment)) {
    const own = entries.filter((e) => e.only_for?.includes(group));
    const general = entries.filter((e) => !e.only_for);
    roles[role] = [
      ...general.flatMap((e) =>
        subtract(
          e.years,
          own.map((o) => o.years),
        ).map((years) => ({ years, options: [...e.cards].reverse() })),
      ),
      ...own.map((e) => ({ years: e.years, options: [...e.cards].reverse() })),
    ];
  }
  return roles;
}

/** "Infantry stand or Infantry w/ATGM stand" → "3 Infantry stand | 3 Infantry w/ATGM stand". */
function standLine(s: ToeStand): GroupSpec["lines"][number] {
  const recon = s.note === "recon" ? "recon " : "";
  const text = s.role
    .split(" or ")
    .map((r) => `${s.count} ${recon}${r.trim()}`)
    .join(" | ");
  return s.years ? { text, years: s.years } : text;
}

function toFormation(f: ToeFormation): FormationSpec {
  return {
    id: f.id,
    name: f.name,
    years: f.years,
    groups: f.units.map((u) => ({
      label: u.count && u.count > 1 ? `${u.count} ${u.name}s` : u.name,
      times: u.count ?? 1,
      lines: u.stands.map(standLine),
    })),
    note: f.notes?.join(" "),
  };
}

function listsFrom(toe: Toe): ArmyListSpec[] {
  const groups = [...new Set(toe.formations.map((f) => f.quality))];
  return groups.map((g) => ({
    id: `${toe.nation}-${g}`,
    name: `${toe.name}: ${toe.quality[g]?.label ?? g}`,
    nation: toe.nation,
    fallback: ["soviets"],
    source: `${toe.name} TOE (src/data), alternate-history order of battle`,
    roles: rolesFor(toe, g),
    formations: toe.formations.filter((f) => f.quality === g).map(toFormation),
    attachments: [],
  }));
}

export const FANTASY_ARMIES: ArmyListSpec[] = [
  ...listsFrom(zapadoslaviaToe as unknown as Toe),
  ...listsFrom(yugoslaviaToe as unknown as Toe),
];
