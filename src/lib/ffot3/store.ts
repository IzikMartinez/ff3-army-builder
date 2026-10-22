import { derived, get, writable } from "svelte/store";
import type { HeloPodPick, ListEntry, RangeSystem, ThemeMode, TowedPick } from "./types";
import { YEAR_MAX, YEAR_MIN } from "./combat";
import { DEFAULT_QUALITY, QUALITY_BY_ID, getUnit, unitStandBase } from "./catalog";
import { heloPicksEqual, isHelicopter } from "./helo";
import { isTowed, towedPicksEqual } from "./towed";

const LIST_KEY = "ffot3-force-list-v2";
const PREFS_KEY = "ffot3-force-prefs-v2";

function uid(): string {
  return crypto.randomUUID?.() ?? `e-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type ForceState = {
  listName: string;
  entries: ListEntry[];
  rangeSystem: RangeSystem;
  qualityId: string;
  bwMode: boolean;
  search: string;
  yearMin: number;
  yearMax: number;
  theme: ThemeMode;
};

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#efe6d4" : "#0c0d0a");
}

function normalizeEntry(e: Partial<ListEntry>): ListEntry {
  const unit = e.unitId ? getUnit(e.unitId) : undefined;
  const stripTowed = !unit || isHelicopter(unit) || isTowed(unit);
  return {
    id: e.id || uid(),
    unitId: e.unitId || "",
    quantity: Math.max(1, Number(e.quantity) || 1),
    quality: e.quality || DEFAULT_QUALITY.experience,
    missileId: e.missileId ?? null,
    heloPods: Array.isArray(e.heloPods) ? e.heloPods : [],
    towedLoad: stripTowed ? [] : Array.isArray(e.towedLoad) ? e.towedLoad : [],
  };
}

function loadState(): ForceState {
  const base: ForceState = {
    listName: "Unnamed Force",
    entries: [],
    rangeSystem: "imperial",
    qualityId: DEFAULT_QUALITY.experience,
    bwMode: false,
    search: "",
    yearMin: YEAR_MIN,
    yearMax: YEAR_MAX,
    theme: "dark",
  };
  if (typeof window === "undefined") return base;
  try {
    const listRaw = window.localStorage.getItem(LIST_KEY);
    if (listRaw) {
      const parsed = JSON.parse(listRaw) as { name?: string; entries?: Partial<ListEntry>[] };
      base.listName = parsed.name?.trim() || base.listName;
      base.entries = Array.isArray(parsed.entries) ? parsed.entries.map(normalizeEntry) : [];
    }
    const prefsRaw = window.localStorage.getItem(PREFS_KEY);
    if (prefsRaw) {
      const parsed = JSON.parse(prefsRaw) as {
        range?: RangeSystem;
        quality?: string;
        bw?: boolean;
        theme?: ThemeMode;
      };
      base.rangeSystem = parsed.range === "metric" ? "metric" : "imperial";
      base.qualityId = parsed.quality || base.qualityId;
      base.bwMode = Boolean(parsed.bw);
      base.theme = parsed.theme === "light" ? "light" : "dark";
    }
  } catch {
    /* ignore */
  }
  applyTheme(base.theme);
  return base;
}

function persist(state: ForceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LIST_KEY,
    JSON.stringify({ name: state.listName, entries: state.entries }),
  );
  window.localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({
      range: state.rangeSystem,
      quality: state.qualityId,
      bw: state.bwMode,
      theme: state.theme,
    }),
  );
}

function createForce() {
  const store = writable<ForceState>(loadState());

  function patch(partial: Partial<ForceState> | ((s: ForceState) => ForceState)) {
    store.update((s) => {
      const next = typeof partial === "function" ? partial(s) : { ...s, ...partial };
      persist(next);
      return next;
    });
  }

  return {
    subscribe: store.subscribe,
    setSearch(search: string) {
      store.update((s) => ({ ...s, search }));
    },
    setYearRange(min: number, max: number) {
      const lo = Math.min(min, max);
      const hi = Math.max(min, max);
      store.update((s) => ({
        ...s,
        yearMin: Math.max(YEAR_MIN, Math.min(YEAR_MAX, lo)),
        yearMax: Math.max(YEAR_MIN, Math.min(YEAR_MAX, hi)),
      }));
    },
    setRange(rangeSystem: RangeSystem) {
      patch({ rangeSystem });
    },
    setQuality(qualityId: string) {
      patch({ qualityId });
    },
    setBw(bwMode: boolean) {
      patch({ bwMode });
    },
    setTheme(theme: ThemeMode) {
      applyTheme(theme);
      patch({ theme });
    },
    toggleTheme() {
      const next: ThemeMode = get(store).theme === "dark" ? "light" : "dark";
      applyTheme(next);
      patch({ theme: next });
    },
    setName(listName: string) {
      patch({ listName });
    },
    addUnit(
      unitId: string,
      quality?: string,
      missileId?: string | null,
      heloPods?: HeloPodPick[] | null,
      towedLoad?: TowedPick[] | null,
    ) {
      patch((s) => {
        const unit = getUnit(unitId);
        const q = quality || s.qualityId;
        const msl = missileId ?? null;
        const pods = heloPods ?? [];
        const load = unit && !isHelicopter(unit) && !isTowed(unit) ? (towedLoad ?? []) : [];
        const existing = s.entries.find(
          (e) =>
            e.unitId === unitId &&
            e.quality === q &&
            (e.missileId ?? null) === msl &&
            heloPicksEqual(e.heloPods, pods) &&
            towedPicksEqual(e.towedLoad, load),
        );
        if (existing) {
          return {
            ...s,
            entries: s.entries.map((e) =>
              e.id === existing.id ? { ...e, quantity: e.quantity + 1 } : e,
            ),
          };
        }
        return {
          ...s,
          entries: [
            ...s.entries,
            {
              id: uid(),
              unitId,
              quantity: 1,
              quality: q,
              missileId: msl,
              heloPods: pods,
              towedLoad: load,
            },
          ],
        };
      });
    },
    setQuantity(id: string, quantity: number) {
      const next = Math.max(0, Math.round(quantity));
      patch((s) => ({
        ...s,
        entries: s.entries
          .map((e) => (e.id === id ? { ...e, quantity: next } : e))
          .filter((e) => e.quantity > 0),
      }));
    },
    setEntryQuality(id: string, quality: string) {
      patch((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === id ? { ...e, quality } : e)),
      }));
    },
    setEntryMissile(id: string, missileId: string | null) {
      patch((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === id ? { ...e, missileId } : e)),
      }));
    },
    setEntryHeloPods(id: string, heloPods: HeloPodPick[]) {
      patch((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === id ? { ...e, heloPods } : e)),
      }));
    },
    setEntryTowedLoad(id: string, towedLoad: TowedPick[]) {
      patch((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === id ? { ...e, towedLoad } : e)),
      }));
    },
    remove(id: string) {
      patch((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
    },
    clear() {
      patch({ entries: [] });
    },
  };
}

export const force = createForce();

export const standCount = derived(force, ($f) =>
  $f.entries.reduce((n, e) => n + e.quantity, 0),
);

export const totalPoints = derived(force, ($f) =>
  $f.entries.reduce((sum, entry) => {
    const unit = getUnit(entry.unitId);
    if (!unit) return sum;
    const quality = QUALITY_BY_ID[entry.quality] ?? DEFAULT_QUALITY;
    const base = unitStandBase(unit, entry.missileId, entry.heloPods, entry.towedLoad, $f.yearMin, $f.yearMax);
    return sum + Math.round(base * quality.point_mod * entry.quantity);
  }, 0),
);

export function currentForce(): ForceState {
  return get(force);
}
