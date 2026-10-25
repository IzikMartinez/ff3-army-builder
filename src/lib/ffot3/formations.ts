import type { Vehicle } from "./types";
import { parseEraYear } from "./combat";
import { defaultMissileId, unitStandBase, unitsForNation } from "./catalog";

/**
 * Appendix E army lists: real combat formations (regiments, battalions) that
 * can be added to the force in one go.
 *
 * Lines are written close to the book's wording:
 *   "3 Infantry | 3 Infantry w/ATGM + 3 IFV"
 * reads "3 Infantry stands or 3 Infantry w/ATGM stands, plus 3 IFV".
 *   `+`  joins the stands in a line (slots)
 *   `|`  separates alternatives within a slot
 *   `||` separates alternatives for the whole line
 * A count may be followed by "recon". Terms are looked up in the list's Equipment
 * Notes (`roles`); anything else is a catalog unit name.
 */

export type RoleOption = {
  /** Inclusive year range; omitted = always. */
  years?: [number, number];
  /**
   * Catalog unit names. "T-72*" matches every unit whose name starts with
   * "T-72" (export models excluded); "A + B" is a bundle fielded together.
   */
  options: string[];
};

/** A line, optionally only in some years (e.g. an SP SAM that arrives in 1968). */
export type LineSpec = string | { text: string; years?: [number, number] };

export type GroupSpec = {
  label: string;
  /** How many of these units the formation has (3 Tank Battalions = 3). */
  times?: number;
  lines: LineSpec[];
  /** Years this group (or attachment) exists; omitted = the formation's span. */
  years?: [number, number];
  note?: string;
};

export type FormationSpec = {
  id: string;
  name: string;
  years: [number, number];
  groups: GroupSpec[];
  note?: string;
};

export type ArmyListSpec = {
  id: string;
  name: string;
  nation: string;
  /**
   * Nations whose cards stand in when this nation's catalog lacks one (e.g.
   * Belgian Scorpions are BAOR cards). Searched in order, after the nation.
   */
  fallback?: string[];
  /** Book reference, e.g. "Appendix E, p.334". */
  source: string;
  roles: Record<string, RoleOption[]>;
  formations: FormationSpec[];
  attachments: GroupSpec[];
};

/* ---------------------------------------------------------------- parsing */

export type Item = { n: number; term: string; recon: boolean };
/** One slot: alternatives (e.g. Infantry | Infantry w/ATGM). */
export type Slot = Item[];
/** One line choice: slots fielded together. */
export type LineAlt = Slot[];
/** A line: alternatives for the whole line (usually just one). */
export type Line = { text: string; alts: LineAlt[] };

function parseItem(raw: string): Item {
  // Names can end in a bracket ("M113 TOW (M150)"), so nothing is stripped.
  const m = /^(\d+)\s+(recon\s+)?(.+?)\s*$/.exec(raw.trim());
  if (!m) throw new Error(`Bad army-list item: "${raw}"`);
  return { n: Number(m[1]), recon: Boolean(m[2]), term: m[3]!.trim() };
}

export function parseLine(text: string): Line {
  return {
    text,
    alts: text.split(" || ").map((alt) =>
      alt.split(" + ").map((slot) => slot.split(" | ").map(parseItem)),
    ),
  };
}

/* ------------------------------------------------------------- resolving */

/** A choice for a term: one unit, or a bundle fielded together. */
export type Candidate = { key: string; label: string; units: Vehicle[] };

function inService(u: Vehicle, year: number): boolean {
  return parseEraYear(u.era.start_era) <= year && year <= parseEraYear(u.era.end_era);
}

/** The variant of a named unit in service in `year` (newest era row if several). */
function unitNamed(pool: Vehicle[], name: string, year: number): Vehicle | undefined {
  const rows = pool.filter((u) => u.Name === name && inService(u, year));
  return rows.sort((a, b) => parseEraYear(b.era.start_era) - parseEraYear(a.era.start_era))[0];
}

function matchPattern(pool: Vehicle[], pattern: string, year: number): Vehicle[] {
  if (!pattern.endsWith("*")) {
    const u = unitNamed(pool, pattern, year);
    return u ? [u] : [];
  }
  const prefix = pattern.slice(0, -1);
  const names = [
    ...new Set(
      pool
        .filter((u) => u.Name.startsWith(prefix) && !/export/i.test(u.Name) && inService(u, year))
        .map((u) => u.Name),
    ),
  ];
  return names
    .map((n) => unitNamed(pool, n, year)!)
    .sort((a, b) => parseEraYear(a.era.start_era) - parseEraYear(b.era.start_era));
}

/** The nation's catalog, then its fallback nations' catalogs. */
export function poolsFor(list: ArmyListSpec): Vehicle[][] {
  return [list.nation, ...(list.fallback ?? [])].map((n) => unitsForNation(n));
}

function firstHit<T>(pools: Vehicle[][], f: (pool: Vehicle[]) => T | undefined): T | undefined {
  for (const pool of pools) {
    const hit = f(pool);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

/**
 * Candidates for a term in `year`, in the Equipment Notes' order (oldest family
 * first, oldest model first within a family). The last one is the default: the
 * newest family and model in service.
 */
export function candidatesFor(
  list: ArmyListSpec,
  term: string,
  year: number,
  pools: Vehicle[][] = poolsFor(list),
): Candidate[] {
  const defs = list.roles[term];
  const options = defs
    ? defs.filter((d) => !d.years || (d.years[0] <= year && year <= d.years[1])).flatMap((d) => d.options)
    : [term];
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const opt of options) {
    const parts = opt.split(" + ");
    if (parts.length > 1) {
      const units = parts.map((p) => firstHit(pools, (pool) => unitNamed(pool, p.trim(), year)));
      if (units.every(Boolean)) {
        const key = units.map((u) => u!.id).join("+");
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ key, label: parts.map((p) => p.trim()).join(" + "), units: units as Vehicle[] });
        }
      }
      continue;
    }
    const hits = firstHit(pools, (pool) => {
      const m = matchPattern(pool, opt.trim(), year);
      return m.length ? m : undefined;
    });
    for (const u of hits ?? []) {
      if (seen.has(u.id)) continue;
      seen.add(u.id);
      out.push({ key: u.id, label: u.Name, units: [u] });
    }
  }
  return out;
}

/* ------------------------------------------------------------ composition */

export type Choices = {
  /** Term → chosen candidate key. */
  roles: Record<string, string>;
  /** Line path "g.l" → line alternative index; "g.l.s" → slot alternative index. */
  alts: Record<string, number>;
  /** Attachment index → included. */
  attachments: Record<number, boolean>;
};

export type ResolvedItem = {
  item: Item;
  candidate: Candidate | null;
};

export type ResolvedLine = {
  path: string;
  line: Line;
  altIndex: number;
  slots: { path: string; options: Item[]; chosen: number; resolved: ResolvedItem }[];
};

export type ResolvedGroup = {
  label: string;
  times: number;
  note?: string;
  lines: ResolvedLine[];
};

export type Composition = {
  groups: ResolvedGroup[];
  attachments: (ResolvedGroup & { index: number; included: boolean })[];
  /** Terms used, with their candidates (for the equipment pickers). */
  terms: { term: string; candidates: Candidate[]; chosen: Candidate | null }[];
  /** Stands to add: unit id → count. */
  stands: { unit: Vehicle; count: number; missileId: string | null }[];
  /** Terms with no card in service this year. */
  missing: string[];
};

/** Default slot choice: the specialised alternative (w/ATGM, w/SAM…) when it resolves. */
function defaultSlot(options: Item[], resolves: (it: Item) => boolean): number {
  for (let i = options.length - 1; i > 0; i--) if (resolves(options[i]!)) return i;
  return 0;
}

export function compose(
  list: ArmyListSpec,
  formation: FormationSpec,
  year: number,
  choices: Choices,
): Composition {
  const pools = poolsFor(list);
  const termCands = new Map<string, Candidate[]>();
  const cands = (term: string) => {
    if (!termCands.has(term)) termCands.set(term, candidatesFor(list, term, year, pools));
    return termCands.get(term)!;
  };
  const chosenFor = (term: string): Candidate | null => {
    const list = cands(term);
    return list.find((c) => c.key === choices.roles[term]) ?? list[list.length - 1] ?? null;
  };
  const resolves = (it: Item) => cands(it.term).length > 0;
  const inSpan = (span?: [number, number]) => !span || (span[0] <= year && year <= span[1]);

  const resolveGroup = (g: GroupSpec, gi: string): ResolvedGroup => ({
    label: g.label,
    times: g.times ?? 1,
    note: g.note,
    lines: g.lines.flatMap((spec, li) => {
      if (typeof spec !== "string" && !inSpan(spec.years)) return [];
      const line = parseLine(typeof spec === "string" ? spec : spec.text);
      const path = `${gi}.${li}`;
      const altIndex = Math.min(choices.alts[path] ?? 0, line.alts.length - 1);
      const slots = line.alts[altIndex]!.map((options, si) => {
        const sp = `${path}.${si}`;
        const chosen = Math.min(choices.alts[sp] ?? defaultSlot(options, resolves), options.length - 1);
        const item = options[chosen]!;
        return { path: sp, options, chosen, resolved: { item, candidate: chosenFor(item.term) } };
      });
      return [{ path, line, altIndex, slots }];
    }),
  });

  const inYear = (g: GroupSpec) => inSpan(g.years);
  const groups = formation.groups
    .map((g, gi) => ({ g, gi }))
    .filter(({ g }) => inYear(g))
    .map(({ g, gi }) => resolveGroup(g, `f${gi}`));
  const attachments = list.attachments
    .map((g, ai) => ({ g, ai }))
    .filter(({ g }) => inYear(g))
    .map(({ g, ai }) => ({
      ...resolveGroup(g, `a${ai}`),
      index: ai,
      included: Boolean(choices.attachments[ai]),
    }));

  const counts = new Map<string, { unit: Vehicle; count: number }>();
  const missing = new Set<string>();
  const used = new Set<string>();
  for (const g of [...groups, ...attachments.filter((a) => a.included)]) {
    for (const l of g.lines) {
      for (const s of l.slots) {
        const { item, candidate } = s.resolved;
        if (item.n === 0) continue; // a "None" choice
        used.add(item.term);
        if (!candidate) {
          missing.add(item.term);
          continue;
        }
        for (const u of candidate.units) {
          const cur = counts.get(u.id) ?? { unit: u, count: 0 };
          cur.count += item.n * g.times;
          counts.set(u.id, cur);
        }
      }
    }
  }
  const stands = [...counts.values()].map(({ unit, count }) => ({
    unit,
    count,
    missileId: defaultMissileId(unit, year, year),
  }));
  const terms = [...used]
    .filter((t) => (termCands.get(t)?.length ?? 0) > 1)
    .map((term) => ({ term, candidates: termCands.get(term)!, chosen: chosenFor(term) }));
  return { groups, attachments, terms, stands, missing: [...missing] };
}

/** Base points for a composition's stands (before quality). */
export function compositionBasePoints(c: Composition): number {
  return c.stands.reduce((sum, s) => sum + unitStandBase(s.unit, s.missileId) * s.count, 0);
}

export function formationsForYear(list: ArmyListSpec, year: number): FormationSpec[] {
  return list.formations.filter((f) => f.years[0] <= year && year <= f.years[1]);
}
