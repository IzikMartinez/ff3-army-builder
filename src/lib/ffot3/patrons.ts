import type { Vehicle } from "./types";

/**
 * Infantry, artillery and generic rows from the data spreadsheet (imported by
 * scripts/import-xlsx.py) only exist for some nations. Nations without their
 * own rows borrow a patron's, the same way units.json gives the minor Pact
 * armies Soviet vehicles:
 *
 * - Pact minors use Soviet infantry and artillery (plus their own native rows,
 *   e.g. Czech DANA / RM-70).
 * - NATO minors without artillery rows use US artillery; Italy adds US
 *   artillery to its own two rows.
 * - Norway, with no infantry rows, uses Denmark's.
 * - Generic rows (trucks, jeeps, generic APCs and artillery) go to every
 *   ground nation.
 *
 * The fantasy nations then inherit all of this from their source nations.
 */

type RawUnit = Omit<
  Vehicle,
  "id" | "kind" | "armorSoft" | "pods" | "podOptionKeys" | "maxMissilePods" | "maxKeyPods"
> &
  Partial<Vehicle>;

const PACT_MINORS = ["east-germany", "poland", "czechoslovakia", "hungary", "romania", "bulgaria"];

/** Real ground nations; the fantasy nations derive from these (fantasy.ts). */
const GROUND_NATIONS = [
  "us",
  "baor",
  "west-germany",
  "france",
  "canada",
  "netherlands",
  "belgium",
  "denmark",
  "italy",
  "norway",
  "soviets",
  ...PACT_MINORS,
];

const INFANTRY_PATRONS: Record<string, string> = {
  ...Object.fromEntries(PACT_MINORS.map((n) => [n, "soviets"])),
  norway: "denmark",
};

const ARTILLERY_PATRONS: Record<string, string> = {
  ...Object.fromEntries(PACT_MINORS.map((n) => [n, "soviets"])),
  ...Object.fromEntries(
    ["canada", "netherlands", "belgium", "denmark", "norway", "italy"].map((n) => [n, "us"]),
  ),
};

const key = (u: RawUnit) => [u.nation, u.Name, u.era.start_era, u.era.end_era].join("::");

/** Own rows, plus a patron's rows for each nation in `patrons`; duplicates dropped. */
function withPatrons(rows: RawUnit[], patrons: Record<string, string>): RawUnit[] {
  const out = rows.filter((u) => u.nation !== "generic");
  for (const [nation, patron] of Object.entries(patrons)) {
    for (const u of rows) if (u.nation === patron) out.push({ ...u, nation });
  }
  return out;
}

export function supportUnits(
  infantry: RawUnit[],
  artillery: RawUnit[],
  generic: RawUnit[],
): RawUnit[] {
  const genericRows = [...generic, ...artillery.filter((u) => u.nation === "generic")];
  const all = [
    ...withPatrons(infantry, INFANTRY_PATRONS),
    ...withPatrons(artillery, ARTILLERY_PATRONS),
    ...GROUND_NATIONS.flatMap((nation) => genericRows.map((u) => ({ ...u, nation }))),
  ];
  const seen = new Set<string>();
  return all.filter((u) => {
    const k = key(u);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
