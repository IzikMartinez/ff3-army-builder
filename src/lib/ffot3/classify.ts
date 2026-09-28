import type { Vehicle } from "./types";
import { isCarrier, isTowed } from "./towed";

export type UnitClassId =
  | "light-tank"
  | "medium-tank"
  | "heavy-tank"
  | "mbt"
  | "ifv"
  | "apc"
  | "carrier"
  | "recon"
  | "armored-car"
  | "td"
  | "at-gun"
  | "towed"
  | "artillery"
  | "spa"
  | "spaa"
  | "sam"
  | "helicopter"
  | "engineer"
  | "utility"
  | "support";

export type WeaponKind = "mg" | "autocannon" | "gun" | "none";

export const UNIT_CLASSES: { id: UnitClassId; label: string }[] = [
  { id: "light-tank", label: "Light Tank" },
  { id: "medium-tank", label: "Medium Tank" },
  { id: "heavy-tank", label: "Heavy Tank" },
  { id: "mbt", label: "Main Battle Tank (MBT)" },
  { id: "ifv", label: "Infantry Fighting Vehicle (IFV)" },
  { id: "apc", label: "Personnel Carrier (APC)" },
  { id: "carrier", label: "Carriers" },
  { id: "recon", label: "Recon" },
  { id: "armored-car", label: "Armored Car" },
  { id: "td", label: "Tank Destroyer" },
  { id: "at-gun", label: "AT Gun" },
  { id: "towed", label: "Towed" },
  { id: "artillery", label: "Artillery" },
  { id: "spa", label: "Self-Propelled Artillery (SPA)" },
  { id: "spaa", label: "Self-Propelled AA (SPAA)" },
  { id: "sam", label: "SAM" },
  { id: "helicopter", label: "Helicopter" },
  { id: "engineer", label: "Engineer" },
  { id: "utility", label: "Soft-skin" },
  { id: "support", label: "Support" },
];

const CLASS_LABEL = Object.fromEntries(UNIT_CLASSES.map((c) => [c.id, c.label])) as Record<
  UnitClassId,
  string
>;

function has(name: string, pattern: RegExp): boolean {
  return pattern.test(name);
}

export function parseCaliber(gunName: string): number | null {
  const m = (gunName || "").match(/(\d+(?:\.\d+)?)\s*mm/i);
  return m ? Number.parseFloat(m[1]) : null;
}

export function isAutocannonName(name: string): boolean {
  const n = (name || "").trim();
  if (!n) return false;
  if (/\b(ags|agl|grenade)\b/i.test(n)) return false;
  const cal = parseCaliber(n);
  if (cal !== null) return cal >= 20 && cal <= 35;
  return /\b(20|23|25|30)\s*mm\b/i.test(n);
}

export function formatAutocannonName(raw: string): string {
  let s = (raw || "").trim();
  if (!s) return s;
  if (/\b(ags|agl|grenade)\b/i.test(s)) return s;
  s = s.replace(/\b((?:20|30)\s*mm)\s+Cannons?\b/gi, "$1 Autocannon");
  if (/\bautocannon\b/i.test(s)) return s;
  s = s.replace(
    /^(?:(\d+x))?(20|30)\s*mm(?:\s*\/L\d+)?(?:\s*R)?(?=\s|$)/i,
    (_full, nx: string | undefined, cal: string) => `${nx ?? ""}${cal}mm Autocannon`,
  );
  return s;
}

export function weaponKind(unit: Vehicle): WeaponKind {
  if (!unit.Gun_Rng || unit.Gun_Rng <= 0) return "none";
  const n = (unit.gun_name || "").toLowerCase();
  if (/\b(hmg|lmg|gpmg|coax)\b/.test(n)) return "mg";
  if (/\bmg\b/.test(n)) return "mg";
  const cal = parseCaliber(n);
  if (cal !== null && cal <= 15) return "mg";
  if (isAutocannonName(unit.gun_name || "")) return "autocannon";
  return "gun";
}

export function gunLabel(unit: Vehicle): string {
  const raw = (unit.gun_name || "").trim();
  if (!raw || raw === "-") return "";
  const stripped = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return formatAutocannonName(stripped);
}

export function weaponCaption(kind: WeaponKind): string {
  if (kind === "mg") return "Machine gun";
  if (kind === "autocannon") return "Autocannon";
  if (kind === "gun") return "Gun";
  return "";
}

export function classifyUnit(unit: Vehicle): UnitClassId {
  if (unit.kind === "helicopter" || (unit.move_type ?? []).includes("helicopter")) {
    return "helicopter";
  }
  const n = unit.Name.toLowerCase();
  const mv = unit.move_type ?? [];
  const towed = mv.includes("towed");
  const wheeled = mv.includes("wheeled");
  const cap = Number(unit.infantry_capacity) || 0;
  const cal = parseCaliber(unit.gun_name || "");
  const front = unit.armor?.[0] ?? 0;

  if (towed) return classifyTowed(n, cal);

  if (has(n, /\b(avlb|avre|arv|engineer|bridg|wolverine|biber|psb|minelayer)\b/)) {
    return "engineer";
  }
  if (has(n, /\b(fo veh|ambulance|smoke gen)\b/)) return "support";

  if (
    has(
      n,
      /\b(sam|roland|crotale|chaparral|avenger|shahine|rapier|tunguska|starstreak|sa-\d|adats)\b/,
    )
  ) {
    return "sam";
  }

  if (
    has(
      n,
      /\b(sp aa|aag|aa gun|zsu|gepard|vulcan|shilka|dca|linebacker|lav-ad|m163|m42|m247|mgmc|pantsir)\b/,
    )
  ) {
    return "spaa";
  }

  if (
    has(
      n,
      /\b(2s\d|m109|m108|m110|m107|paladin|gvozdika|acacia|abbot|priest|sph|sp how|dana|pzh|bandkanon|gct)\b/,
    )
  ) {
    return "spa";
  }

  if (
    has(
      n,
      /\b(tank destroyer|itv|jaguar|jpz|jgpz|m901|ontos|wiesel|hornet|fv438|striker|rakete|asu-85|asu-57|su-100|it-1|9p1|kanone|m1134|lav-at|lav-a2-at|vcac|pr-at|nm142|b-mil|freccia at|portee)\b/,
    )
  ) {
    return "td";
  }
  if (/\btow\b/.test(n) && cap === 0) return "td";

  if (
    has(
      n,
      /\b(bmp|bmd|bradley|marder|warrior|puma level|amx-10p|vbci|aifv|cv90|bvp|bwp|mli-|efv|bmpt)\b/,
    )
  ) {
    return "ifv";
  }

  if (
    has(
      n,
      /\b(scout|recce|recon|brdm|brm-|ferret|fox\b|lynx|luchs|fennek|vbl|ebr\b|aml-|scorpion|scimitar|coyote|sabre|spah|hs\.30)\b/,
    )
  ) {
    return "recon";
  }

  if (
    has(
      n,
      /\b(btr-|m113|fv-?432|fv-?430|amx vci|vab |apc|aav|lvtp|mt-?lb|tab-|ot-64|fuchs|boxer|grizzly|bison|panhard m3|m59 |m75 |halftrack|buffal|sparte?n|saracen|piranha|lav iii|stryker|aav-7)\b/,
    )
  ) {
    return "apc";
  }

  if (has(n, /\b(jeep|hmmwv|truck|kraka|unimog|uaz|gaz\b|humvee|land rover|shorland)\b/)) {
    return "utility";
  }

  if (
    has(
      n,
      /\b(pt-76|m41|m24|amx-13|t-92|sheridan|stingray|sk-105|type 62|type 63|m551|m3 stuart|lvt)\b/,
    )
  ) {
    return "light-tank";
  }
  if (has(n, /\b(is-2|is-3|is-4|t-10|m103|conqueror|arl 44)\b/)) return "heavy-tank";
  if (
    has(
      n,
      /\b(t-54|t-55|t-62|t-64|t-72|t-80|t-90|m1a|m60|leopard|chieftain|challenger|leclerc|merkava|amx-30|abrams)/,
    ) ||
    /^m1(\b| )/i.test(unit.Name)
  ) {
    return "mbt";
  }
  if (has(n, /\b(m47|m48|centurion|t-34)/)) return "medium-tank";

  if (wheeled && cap < 1 && (cal ?? 0) >= 20) return "armored-car";
  if (wheeled && cap < 1 && front <= 4) return "armored-car";

  if (cap >= 1 && (cal === null || cal <= 30) && front <= 6) return "apc";
  if (cap >= 0.5 && (cal ?? 0) >= 20) return "ifv";

  if (mv.includes("tracked") && cap === 0 && (cal ?? 0) >= 75) {
    if ((cal ?? 0) >= 105 && front >= 8) return "mbt";
    if (front >= 12) return "heavy-tank";
    if (front >= 6) return "medium-tank";
    return "light-tank";
  }

  if (cap >= 0.5) return "apc";
  return "utility";
}

function classifyTowed(n: string, cal: number | null): UnitClassId {
  if (has(n, /\b(at gun|pdr|2a45|mt-12|t-12|wombat|mobat|conbat|\bbat\b|pak|d-44|d-48|bs-3|rr\b)/)) {
    return "at-gun";
  }
  if (has(n, /\b(field gun|howitzer|mortar)\b/)) return "artillery";
  if ((cal ?? 0) >= 37 && !has(n, /\b(aa|aag|sam)\b/)) return "at-gun";
  return "artillery";
}

const SELF_PROPELLED = new Set<string>(["spa", "spaa", "sam"]);

export function matchesClass(unit: Vehicle, classId: string | null | undefined): boolean {
  if (!classId) return true;
  if (classId === "carrier") return isCarrier(unit);
  if (classId === "towed") return isTowed(unit);
  if (SELF_PROPELLED.has(classId) && isTowed(unit)) return false;
  return classifyUnit(unit) === classId;
}

export function classLabel(id: UnitClassId): string {
  return CLASS_LABEL[id];
}

export function availableClasses(units: Vehicle[]): { id: UnitClassId; label: string }[] {
  const present = new Set<UnitClassId>(units.map(classifyUnit));
  if (units.some(isCarrier)) present.add("carrier");
  if (units.some(isTowed)) present.add("towed");
  return UNIT_CLASSES.filter((c) => present.has(c.id));
}

export function availableGuns(units: Vehicle[]): string[] {
  const set = new Set<string>();
  for (const u of units) {
    const label = gunLabel(u);
    if (label) set.add(label);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
