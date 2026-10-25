import type { ArmyListSpec } from "../formations";
import { SOVIET_AIRBORNE, SOVIET_ARMY, SOVIET_NAVAL_INFANTRY } from "./soviet";
import { US_ARMY_50 } from "./usArmy50";
import { US_ARMY_73 } from "./usArmy73";
import { US_MARINES } from "./usmc";
import { BRITISH_ARMY } from "./britain";
import { WEST_GERMAN_ARMY } from "./westGermany";
import { FRENCH_ARMY } from "./france";
import { CANADIAN_ARMY } from "./canada";
import { DUTCH_ARMY } from "./netherlands";
import { BELGIAN_ARMY } from "./belgium";
import { DANISH_ARMY } from "./denmark";
import { ITALIAN_ARMY } from "./italy";
import { PACT_ARMIES } from "./pact";
import { FANTASY_ARMIES } from "./fantasy";

/** Army lists available in the Order of battle panel. */
export const ARMY_LISTS: ArmyListSpec[] = [
  SOVIET_ARMY,
  SOVIET_AIRBORNE,
  SOVIET_NAVAL_INFANTRY,
  US_ARMY_73,
  US_ARMY_50,
  US_MARINES,
  BRITISH_ARMY,
  WEST_GERMAN_ARMY,
  FRENCH_ARMY,
  CANADIAN_ARMY,
  DUTCH_ARMY,
  BELGIAN_ARMY,
  DANISH_ARMY,
  ITALIAN_ARMY,
  ...PACT_ARMIES,
  ...FANTASY_ARMIES,
];

export function armyListsFor(nationId: string): ArmyListSpec[] {
  return ARMY_LISTS.filter((l) => l.nation === nationId);
}
