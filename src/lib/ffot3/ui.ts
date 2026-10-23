export const STAT_HEAD =
  "stat-head mb-1 flex min-h-8 items-center justify-center bg-stat-head px-2 py-1 text-center font-display tracking-wide text-stat-head-ink bw:bg-black bw:text-white";

export const GUN_HEAD =
  "gun-head bg-ink text-center font-display text-[11px] tracking-wider text-paper bw:bg-black bw:text-white";

export const CELL_RANGE =
  "cell-range gun-cell rounded-l-md bg-range py-1 text-center font-display text-sm tabular-nums text-range-ink bw:border bw:border-black bw:bg-white bw:text-black";

export const CELL_VALUE =
  "gun-cell rounded-xs bg-cell py-1 text-center font-display text-sm tabular-nums text-cell-ink ring-1 ring-cell-line ring-inset bw:ring-0 bw:border bw:border-black bw:bg-white bw:text-black";

/** Ammo colour code (13.6.1): white = AP / HE vs normal armor, orange = HEAT vs armor + h-class bonus. */
export const AMMO_HINT = {
  ap: "AP: +2 Pen at close range, −2 at long range (already worked in). Compare with the target's white (AP / HE) armor.",
  heat: "HEAT: same Pen at every range. Compare with the target's orange (HEAT) armor, which includes its h-class bonus.",
  he: "HE shell: same Pen at every range. Compare with the target's white (AP / HE) armor.",
} as const;

export const AMMO_HEAD = "rounded-xs py-1 bw:bg-black bw:text-white";

/** AP / HE value: plain white, matching the target's white AP / HE armor. */
export const CELL_AP = CELL_VALUE;

/** HEAT value: amber fill, usually spanning all range bands (it ignores range). */
export const CELL_HEAT =
  "pen-heat gun-cell flex items-center justify-center rounded-xs bg-ammo-heat py-1 text-center font-display text-sm tabular-nums text-ammo-heat-ink bw:border bw:border-black bw:bg-white bw:text-black";

/**
 * Cell style for a Pen value: "12h" (HEAT/HEAP/HESH) amber, "7he" or a plain
 * number grey. Guided anti-tank missiles are HEAT even when stored as numbers.
 */
export function penCell(
  pen: string | number | null | undefined,
  opts: { missile?: boolean } = {},
): string {
  const s = String(pen ?? "")
    .trim()
    .toLowerCase();
  if (!s || s === "-" || s === "—") return CELL_VALUE;
  if (/he$/.test(s)) return CELL_AP;
  if (/h/.test(s) || opts.missile) return CELL_HEAT;
  return CELL_AP;
}

/** Hit cell split in two: vs vehicles (paper) | vs infantry (green, AI applied). */
export const CELL_HIT_SPLIT =
  "gun-cell flex overflow-hidden rounded-xs font-display text-sm tabular-nums ring-1 ring-cell-line ring-inset bw:ring-0 bw:border bw:border-black";
export const HIT_HALF_VEH = "flex-1 bg-cell py-1 text-center text-cell-ink bw:bg-white bw:text-black";
export const HIT_HALF_INF =
  "hit-inf flex-1 bg-vs-inf py-1 text-center text-vs-inf-ink bw:border-l bw:border-black bw:bg-white bw:text-black bw:italic";

export const STEP_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-line bg-ink font-display text-xl leading-none text-paper disabled:cursor-default disabled:opacity-35 bw:border-black bw:bg-white bw:text-black";

export const NATION_SURFACE: Record<string, string> = {
  us: "bg-nation-us text-on-nation",
  baor: "bg-nation-baor text-on-nation",
  "west-germany": "bg-nation-west-germany text-on-nation",
  france: "bg-nation-france text-on-nation",
  canada: "bg-nation-canada text-on-nation",
  netherlands: "bg-nation-netherlands text-on-nation",
  belgium: "bg-nation-belgium text-on-nation",
  denmark: "bg-nation-denmark text-on-nation",
  italy: "bg-nation-italy text-on-nation",
  norway: "bg-nation-norway text-on-nation",
  soviets: "bg-nation-soviets text-on-nation",
  "east-germany": "bg-nation-east-germany text-on-nation",
  // Near-white fill: an inset rule keeps it visible on light cards.
  poland: "bg-nation-poland text-on-nation-dark ring-1 ring-inset ring-line-2",
  czechoslovakia: "bg-nation-czechoslovakia text-on-nation",
  hungary: "bg-nation-hungary text-on-nation",
  romania: "bg-nation-romania text-on-nation-dark",
  bulgaria: "bg-nation-bulgaria text-on-nation",
  japan: "bg-nation-japan text-on-nation",
  "south-africa": "bg-nation-south-africa text-on-nation",
};

export const NATION_QUALITY: Record<string, string> = {
  us: "border-on-nation/40 bg-on-nation text-nation-us",
  baor: "border-on-nation/40 bg-on-nation text-nation-baor",
  "west-germany": "border-on-nation/40 bg-on-nation text-nation-west-germany",
  france: "border-on-nation/40 bg-on-nation text-nation-france",
  canada: "border-on-nation/40 bg-on-nation text-nation-canada",
  netherlands: "border-on-nation/40 bg-on-nation text-nation-netherlands",
  belgium: "border-on-nation/40 bg-on-nation text-nation-belgium",
  denmark: "border-on-nation/40 bg-on-nation text-nation-denmark",
  italy: "border-on-nation/40 bg-on-nation text-nation-italy",
  norway: "border-on-nation/40 bg-on-nation text-nation-norway",
  soviets: "border-on-nation/40 bg-on-nation text-nation-soviets",
  "east-germany": "border-on-nation/40 bg-on-nation text-nation-east-germany",
  poland: "border-on-nation-dark/40 bg-on-nation-dark text-nation-poland",
  czechoslovakia: "border-on-nation/40 bg-on-nation text-nation-czechoslovakia",
  hungary: "border-on-nation/40 bg-on-nation text-nation-hungary",
  romania: "border-on-nation-dark/40 bg-on-nation-dark text-nation-romania",
  bulgaria: "border-on-nation/40 bg-on-nation text-nation-bulgaria",
  japan: "border-on-nation/40 bg-on-nation text-nation-japan",
  "south-africa": "border-on-nation/40 bg-on-nation text-nation-south-africa",
};

export function nationSurface(id: string): string {
  return NATION_SURFACE[id] ?? "bg-olive text-on-nation";
}

export function qualityBtnClass(id: string, bw: boolean): string {
  const base =
    "flex h-9 min-w-18 items-center justify-center rounded-sm px-2.5 font-display text-[0.95rem] tracking-[0.14em] uppercase shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)] transition-[transform,filter] duration-150";
  if (bw) return `${base} border border-black bg-white text-black`;
  return `${base} border ${NATION_QUALITY[id] ?? "border-on-nation/40 bg-on-nation text-olive"}`;
}
