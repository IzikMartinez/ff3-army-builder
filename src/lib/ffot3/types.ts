/** Table scale: 1:5 uses the printed inch values; 1:1 multiplies them by 2.5. */
export type Scale = "1:5" | "1:1";
export type Alliance = "nato" | "warpac" | "warpac-alt" | "other";
export type HeaderInk = "light" | "dark";
export type ThemeMode = "dark" | "light";
export type UnitKind = "ground" | "helicopter" | "infantry";

export type Era = {
  start_era: string;
  end_era: string;
};

export type MissileLoadout = {
  id: string;
  key: string;
  label: string;
  points: number;
  era: Era;
  unlimited: boolean;
  pen: number;
  rof: number;
  range: [number, number];
  generation: number;
  topAttack: boolean;
  sam: boolean;
};

export type EquipMark = {
  code: string;
  name: string;
  effect: string;
};

/** Indirect / area fire (artillery, mortars, MRLs). */
export type IndirectFire = {
  /** Min and max range in inches; guns and mortars have a min of 0. */
  range: [number, number];
  /** Ammo codes: h HE, s smoke, c chemical, i ICM, l laser-guided, g GPS-guided, m mines. */
  ammo: string;
  /** Multiple rocket launchers: size class and fire units per stand (B.13.3). */
  mrl?: { class: "light" | "medium" | "heavy" | "very heavy"; fireUnits: number };
};

/** One infantry anti-tank or SAM weapon line (LAW, MAW or SAM). */
export type InfantryWeapon = { pen: string; rof: string; rng: string };

export type InfantryStats = {
  /** Anti-infantry ROF: [ranged, close combat]. */
  rof: [number, number];
  /** ROF in parentheses on the chart: −1 ROF if the stand moved. */
  reducedOnMove: boolean;
  /** Transport space the stand takes up. */
  size: number;
  law: InfantryWeapon | null;
  maw: InfantryWeapon | null;
  sam: InfantryWeapon | null;
};

export type HeloPodPick = {
  key: string;
  variantId: string;
  count: number;
};

export type TowedPick = {
  id: string;
  count: number;
  /** Missile chosen when the weapon was picked; null/absent = weapon's default. */
  missileId?: string | null;
};

export type Vehicle = {
  id: string;
  kind: UnitKind;
  AI: number;
  Equip: string;
  Gun_Pen: string[];
  Gun_ROF: number;
  Gun_Rng: number;
  Name: string;
  Points: number;
  era: Era;
  gun_name: string;
  move_type: string[];
  move_value: string;
  nation: string;
  armor: number[];
  armorSoft: boolean;
  unlimited_missiles: boolean;
  infantry_capacity: number;
  missiles: MissileLoadout[];
  missileRequired: boolean;
  notes: string;
  pods: number;
  podOptionKeys: string[];
  maxMissilePods: number | null;
  maxKeyPods: Record<string, number>;
  indirect?: IndirectFire;
  infantry?: InfantryStats;
};

export type Missile = {
  missile_name: string;
  display_name?: string;
  missile_range: [number, number];
  missile_penetration: number;
  missile_rof: number;
  missile_generation: number;
  top_attack: boolean;
  sam: boolean;
};

export type Quality = {
  experience: string;
  quality: number;
  hit_mod: number;
  rof_mod: number;
  point_mod: number;
};

export type NationDef = {
  id: string;
  name: string;
  short: string;
  alliance: Alliance;
  subtitle: string;
  headerInk: HeaderInk;
};

export type ListEntry = {
  id: string;
  unitId: string;
  quantity: number;
  quality: string;
  missileId: string | null;
  heloPods: HeloPodPick[];
  towedLoad: TowedPick[];
  /** Transport helicopter bought as a dedicated transport (17.10): double cost. */
  dedicated: boolean;
};

export type GunBand = {
  band: "Close" | "Effect" | "Long";
  range: number;
  hitBase: number;
  penMod: number;
};

export type MoveTable = {
  normal: number;
  rough: number;
  bad: number;
  road: number;
};
