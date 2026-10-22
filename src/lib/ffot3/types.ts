export type RangeSystem = "imperial" | "metric";
export type Alliance = "nato" | "warpac" | "warpac-alt" | "other";
export type HeaderInk = "light" | "dark";
export type ThemeMode = "dark" | "light";
export type UnitKind = "ground" | "helicopter";

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

export type HeloPodPick = {
  key: string;
  variantId: string;
  count: number;
};

export type TowedPick = {
  id: string;
  count: number;
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
