export const STAT_HEAD =
  "mb-1 flex min-h-8 items-center justify-center bg-stat-head px-2 py-1 text-center font-display tracking-wide text-paper bw:bg-black bw:text-white";

export const GUN_HEAD =
  "bg-ink text-center font-display text-[11px] tracking-wider text-paper bw:bg-black bw:text-white";

export const CELL_RANGE =
  "gun-cell rounded-l-md bg-neutral-700 py-1 text-center font-display text-sm tabular-nums text-paper bw:border bw:border-black bw:bg-white bw:text-black";

export const CELL_VALUE =
  "gun-cell rounded-xs bg-paper py-1 text-center font-display text-sm tabular-nums text-ink bw:border bw:border-black bw:bg-white bw:text-black";

export const STEP_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-line bg-ink font-display text-xl leading-none text-paper disabled:cursor-default disabled:opacity-35 bw:border-black bw:bg-white bw:text-black";

export const NATION_SURFACE: Record<string, string> = {
  us: "bg-nation-us text-paper",
  baor: "bg-nation-baor text-paper",
  "west-germany": "bg-nation-west-germany text-paper",
  france: "bg-nation-france text-paper",
  canada: "bg-nation-canada text-paper",
  netherlands: "bg-nation-netherlands text-paper",
  belgium: "bg-nation-belgium text-paper",
  denmark: "bg-nation-denmark text-paper",
  italy: "bg-nation-italy text-paper",
  norway: "bg-nation-norway text-paper",
  soviets: "bg-nation-soviets text-paper",
  "east-germany": "bg-nation-east-germany text-paper",
  poland: "bg-nation-poland text-ink",
  czechoslovakia: "bg-nation-czechoslovakia text-paper",
  hungary: "bg-nation-hungary text-paper",
  romania: "bg-nation-romania text-ink",
  bulgaria: "bg-nation-bulgaria text-paper",
  japan: "bg-nation-japan text-paper",
  "south-africa": "bg-nation-south-africa text-paper",
};

export const NATION_QUALITY: Record<string, string> = {
  us: "border-paper/40 bg-paper text-nation-us",
  baor: "border-paper/40 bg-paper text-nation-baor",
  "west-germany": "border-paper/40 bg-paper text-nation-west-germany",
  france: "border-paper/40 bg-paper text-nation-france",
  canada: "border-paper/40 bg-paper text-nation-canada",
  netherlands: "border-paper/40 bg-paper text-nation-netherlands",
  belgium: "border-paper/40 bg-paper text-nation-belgium",
  denmark: "border-paper/40 bg-paper text-nation-denmark",
  italy: "border-paper/40 bg-paper text-nation-italy",
  norway: "border-paper/40 bg-paper text-nation-norway",
  soviets: "border-paper/40 bg-paper text-nation-soviets",
  "east-germany": "border-paper/40 bg-paper text-nation-east-germany",
  poland: "border-ink/40 bg-ink text-nation-poland",
  czechoslovakia: "border-paper/40 bg-paper text-nation-czechoslovakia",
  hungary: "border-paper/40 bg-paper text-nation-hungary",
  romania: "border-ink/40 bg-ink text-nation-romania",
  bulgaria: "border-paper/40 bg-paper text-nation-bulgaria",
  japan: "border-paper/40 bg-paper text-nation-japan",
  "south-africa": "border-paper/40 bg-paper text-nation-south-africa",
};

export function nationSurface(id: string): string {
  return NATION_SURFACE[id] ?? "bg-olive text-paper";
}

export function qualityBtnClass(id: string, bw: boolean): string {
  const base =
    "flex h-9 min-w-18 items-center justify-center rounded-sm px-2.5 font-display text-[0.95rem] tracking-[0.14em] uppercase shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)] transition-[transform,filter] duration-150";
  if (bw) return `${base} border border-black bg-white text-black`;
  return `${base} border ${NATION_QUALITY[id] ?? "border-paper/40 bg-paper text-olive"}`;
}
