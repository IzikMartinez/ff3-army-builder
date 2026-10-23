import type { Vehicle } from "./types";
import { formatEra, parseEraYear } from "./combat";

/**
 * Cards with the same name in one nation (usually one vehicle across several
 * era rows) are shown as a single catalog card with a variant picker.
 */

/**
 * Marks of one family share a card: "Chieftain Mk 9" and "Chieftain Mk 10" are
 * variants of "Chieftain"; "Mi-24D" and "Mi-35M" of the Hind. Specialist
 * versions (AVRE, AVLB…) aren't marks and keep their own cards.
 */
const FAMILIES: [RegExp, (m: RegExpExecArray) => string][] = [
  [/^(Centurion|Chieftain|Vickers MBT) Mk\s/, (m) => m[1]!],
  [/^Mi-(24|35)/, () => "Mi-24 / Mi-35 Hind"],
  [/^Mi-(8|17)(?!\d)/, () => "Mi-8 / Mi-17 Hip"],
  [/^Mi-28/, () => "Mi-28 Havoc"],
  [/^AH-1[A-Z]/, () => "AH-1 Cobra"],
  [/^(AH-64|Apache)/, () => "AH-64 Apache"],
  [/^UH-1/, () => "UH-1 Huey"],
  [/^OH-58/, () => "OH-58 Kiowa"],
];

/** The card a unit belongs to: its family, or its own name. */
export function cardName(u: Vehicle): string {
  for (const [re, name] of FAMILIES) {
    const m = re.exec(u.Name);
    if (m) return name(m);
  }
  return u.Name;
}

/** Group units into cards (same name or mark family), keeping first-seen order; variants sorted by era. */
export function groupByName(units: Vehicle[]): Vehicle[][] {
  const groups = new Map<string, Vehicle[]>();
  for (const u of units) {
    const key = `${u.nation}::${cardName(u)}`;
    groups.set(key, [...(groups.get(key) ?? []), u]);
  }
  const start = (u: Vehicle) => parseEraYear(u.era.start_era);
  return [...groups.values()].map((g) => {
    // Within a mark family keep each mark's eras together, marks in order of
    // first appearance; plain cards just sort by era.
    const firstSeen = new Map<string, number>();
    for (const u of g) firstSeen.set(u.Name, Math.min(firstSeen.get(u.Name) ?? Infinity, start(u)));
    return g.sort(
      (a, b) =>
        firstSeen.get(a.Name)! - firstSeen.get(b.Name)! ||
        a.Name.localeCompare(b.Name, undefined, { numeric: true }) ||
        start(a) - start(b) ||
        parseEraYear(a.era.end_era) - parseEraYear(b.era.end_era),
    );
  });
}

/** Years of [min, max] during which a variant is in service. */
function yearsInBand(u: Vehicle, min: number, max: number): number {
  const from = Math.max(parseEraYear(u.era.start_era), min);
  const to = Math.min(parseEraYear(u.era.end_era), max);
  return Math.max(0, to - from + 1);
}

/**
 * With a decade selected, keep only variants in service for at least half of
 * it. If none qualify, keep the best-covering variant(s) so the card stays.
 */
export function variantsForBand(variants: Vehicle[], min: number, max: number): Vehicle[] {
  const need = Math.ceil((max - min + 1) / 2);
  const years = variants.map((v) => yearsInBand(v, min, max));
  const majority = variants.filter((_, i) => years[i]! >= need);
  if (majority.length) return majority;
  const best = Math.max(...years);
  return variants.filter((_, i) => years[i] === best);
}

/** Stats that can differ between variants, with a short label for the picker. */
const FIELDS: { label: string; value: (u: Vehicle) => string }[] = [
  { label: "Arm", value: (u) => (u.armorSoft ? "soft" : u.armor.join("/")) },
  { label: "Mv", value: (u) => u.move_value },
  { label: "Gun", value: (u) => u.gun_name },
  { label: "Pen", value: (u) => u.Gun_Pen.join("/") },
  { label: "ROF", value: (u) => String(u.infantry ? u.infantry.rof.join("/") : u.Gun_ROF) },
  { label: "Rng", value: (u) => String(u.Gun_Rng) },
  { label: "AI", value: (u) => String(u.AI) },
  { label: "LAW", value: (u) => u.infantry?.law?.pen ?? "–" },
  { label: "MAW", value: (u) => u.infantry?.maw?.pen ?? "–" },
  { label: "SAM", value: (u) => u.infantry?.sam?.pen ?? "–" },
  { label: "Msl", value: (u) => u.missiles.map((m) => m.key).join("/") || "–" },
  { label: "Ind", value: (u) => (u.indirect ? u.indirect.range.join("–") : "–") },
  { label: "Ammo", value: (u) => u.indirect?.ammo ?? "–" },
  { label: "Eq", value: (u) => u.Equip || "–" },
  { label: "Cap", value: (u) => String(u.infantry_capacity) },
];

export type VariantOption = {
  id: string;
  /** The variant's own designation when a card spans several (e.g. "Mk 9"). */
  mark: string | null;
  era: string;
  points: number;
  /** Only the stats that differ between this name's variants. */
  diffs: string[];
};

export function variantOptions(variants: Vehicle[]): VariantOption[] {
  const marks = new Set(variants.map((v) => v.Name)).size > 1;
  // With marks, the era options are shown per mark, so only list what changes
  // between the eras of the same mark.
  const differingFor = (v: Vehicle) => {
    const peers = marks ? variants.filter((p) => p.Name === v.Name) : variants;
    return FIELDS.filter((f) => new Set(peers.map(f.value)).size > 1);
  };
  return variants.map((v) => ({
    id: v.id,
    mark: marks
      ? v.Name.startsWith(cardName(v))
        ? v.Name.slice(cardName(v).length).trim() || v.Name
        : v.Name
      : null,
    era:
      v.era.start_era === v.era.end_era
        ? String(parseEraYear(v.era.start_era))
        : formatEra(v.era.start_era, v.era.end_era),
    points: v.Points,
    diffs: differingFor(v).map((f) => `${f.label} ${f.value(v)}`),
  }));
}
