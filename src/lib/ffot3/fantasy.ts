import type { MissileLoadout, Vehicle } from "./types";
import yugoNativeJson from "@/data/yugoslavia-native.json";
import { parseEraYear } from "./combat";

/**
 * Alternate-history Pact nations, derived from real nations' cards:
 *
 * - Zapadoslavia: the western Slavs (Poland + Czechoslovakia) as one Soviet-
 *   organised state. Soviet export kit plus native Polish/Czech designs; no
 *   Soviet-only first-line equipment. The Czech licence BVP-2 arrives in '87.
 * - Yugoslavia: South Slav state that includes Bulgaria (Bulgarian cards).
 *   Native Yugoslav designs (M-84, M-80A, M-60P, BOV) have no FFT3 stats; they
 *   are derived with the rulebook's Appendix B formulas (yugoslavia-native.json).
 *
 * Both lists end in 1990 with the real Pact.
 */

type RawUnit = Omit<
  Vehicle,
  "id" | "kind" | "armorSoft" | "pods" | "podOptionKeys" | "maxMissilePods" | "maxKeyPods"
> &
  Partial<Vehicle>;

const END_YEAR = 1990;
const END_CODE = "90";

/**
 * Soviet-only equipment never issued to the fantasy nations. The real Polish,
 * Czech and Bulgarian lists in units.json are largely cloned from the Soviet
 * list, so this also strips variants those armies never fielded.
 */
const SOVIET_ONLY: RegExp[] = [
  /^T-64/,
  /^T-80/,
  /^BMP-3(?!\d)/, // not the Bulgarian BMP-30
  /2S6|Tunguska/,
  /^T-62/, // never in Polish/Czech/Bulgarian service
  /^T-72(A|B|B1|BM|S Export)$/, // Soviet-only (T-72S: export, but not to the Pact)
  /^T-55AD/, // Drozd active protection
  /^T-55MV/, // Kontakt-1 ERA
  /^T-55M-1/, // gun-launched missile variant
  /^B[MVW]P-1P?D$/, // Afghanistan-era BMP-1D/1PD
];
const sovietOnly = (u: RawUnit) => SOVIET_ONLY.some((re) => re.test(u.Name));
/** BMP-2 family: Zapad gets only the Czech BVP-2, from '87 (see zapadExtras). */
const BMP2_FAMILY = /^(BMP-2|BVP-2|BWP-2)$/;
const BVP2_FROM = "87";

function clampEra<T extends { era: { start_era: string; end_era: string } }>(item: T): T | null {
  if (parseEraYear(item.era.start_era) > END_YEAR) return null;
  if (parseEraYear(item.era.end_era) <= END_YEAR) return item;
  return { ...item, era: { ...item.era, end_era: END_CODE } };
}

function clampUnit(u: RawUnit, nation: string): RawUnit | null {
  const clamped = clampEra(u);
  if (!clamped) return null;
  const missiles = (u.missiles ?? [])
    .map((m) => clampEra<MissileLoadout>(m))
    .filter((m): m is MissileLoadout => m !== null);
  return { ...clamped, nation, missiles };
}

/** Czech and Polish names for the same licence-built vehicle, merged into one card. */
const ZAPAD_NAMES: Record<string, string> = {
  "T-72M1 Wilk": "T-72M1 Export",
  "BVP-1": "BVP-1 / BWP-1",
  "BWP-1": "BVP-1 / BWP-1",
  "BVP-1P": "BVP-1P / BWP-1P",
  "BWP-1P": "BVP-1P / BWP-1P",
};

function derive(
  raw: RawUnit[],
  sources: string[],
  nation: string,
  keep: (u: RawUnit) => boolean,
  names: Record<string, string> = {},
): RawUnit[] {
  const seen = new Set<string>();
  const out: RawUnit[] = [];
  for (const src of sources) {
    for (const u of raw) {
      if (u.nation !== src || !keep(u)) continue;
      const c = clampUnit({ ...u, Name: names[u.Name] ?? u.Name }, nation);
      if (!c) continue;
      // Polish and Czech lists share most Soviet export cards; keep one copy.
      const key = [c.Name, c.era.start_era, c.era.end_era].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

/**
 * Issue another nation's vehicle to a fantasy nation, starting no earlier than
 * `from` (two-digit era code). Loadouts that ended before then are dropped.
 */
function issue(
  raw: RawUnit[],
  source: string,
  name: string,
  nation: string,
  from?: string,
): RawUnit[] {
  const fromYear = from ? parseEraYear(from) : 0;
  return raw
    .filter((u) => u.nation === source && u.Name === name)
    .filter((u) => parseEraYear(u.era.end_era) >= fromYear)
    .map((u) => {
      const start = from && parseEraYear(u.era.start_era) < fromYear ? from : u.era.start_era;
      const restart = <T extends { era: RawUnit["era"] }>(x: T): T => ({
        ...x,
        era: { ...x.era, start_era: start },
      });
      return clampUnit(
        {
          ...restart(u),
          missiles: (u.missiles ?? [])
            .filter((m) => parseEraYear(m.era.end_era) >= fromYear)
            .map(restart),
        },
        nation,
      );
    })
    .filter((u): u is RawUnit => u !== null);
}

/**
 * Zapad extras: the Czech licence BVP-2 from '87, and Soviet-supplied airborne
 * kit for the Sokol division (one BMD regiment from '75).
 */
function zapadExtras(raw: RawUnit[]): RawUnit[] {
  return [
    ...issue(raw, "czechoslovakia", "BVP-2", "zapadoslavia", BVP2_FROM),
    ...issue(raw, "soviets", "ASU-57", "zapadoslavia"),
    ...issue(raw, "soviets", "BMD-1", "zapadoslavia", "75"),
    ...issue(raw, "soviets", "BMD-1P", "zapadoslavia", "75"),
    ...issue(raw, "soviets", "BTR-D", "zapadoslavia", "75"),
  ];
}

export function fantasyUnits(raw: RawUnit[]): RawUnit[] {
  const zapad = derive(
    raw,
    ["czechoslovakia", "poland"],
    "zapadoslavia",
    (u) => !sovietOnly(u) && !BMP2_FAMILY.test(u.Name),
    ZAPAD_NAMES,
  );
  const yugo = derive(raw, ["bulgaria"], "yugoslavia", (u) => !sovietOnly(u));
  return [...zapad, ...zapadExtras(raw), ...yugo, ...(yugoNativeJson as RawUnit[])];
}
