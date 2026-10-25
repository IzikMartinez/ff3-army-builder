import type { ArmyListSpec, RoleOption } from "../formations";
import { SOVIET_ARMY } from "./soviet";

/*
 * Warsaw Pact armies. The rulebook has no Appendix E list for them; they were
 * organised on the Soviet pattern, so each uses the Soviet Army formations with
 * its own Equipment Notes: export tanks instead of Soviet-only models, and
 * national IFVs/APCs. Anything a nation's catalog lacks (Hinds, AVLBs) falls
 * back to the Soviet card.
 */

/** Pact tank fleets: T-54/55, T-62, and export T-72M/M1 (no T-64/T-80). */
const PACT_MBT = ["T-54*", "T-55*", "T-62*", "T-72 / T-72M Export", "T-72M1 Export", "T-72M1M Export"];

const derived = (
  nation: string,
  name: string,
  roles: Record<string, RoleOption[]>,
  note: string,
  fallback: string[] = [],
): ArmyListSpec => ({
  ...SOVIET_ARMY,
  id: `${nation}-army`,
  name,
  nation,
  fallback: [...fallback, "soviets"],
  source: `Derived from Appendix E, Russian/Soviet/CIS Army 1970+ (Soviet-pattern organisation). ${note}`,
  roles: { ...SOVIET_ARMY.roles, MBT: [{ options: PACT_MBT }], ...roles },
});

export const PACT_ARMIES: ArmyListSpec[] = [
  derived(
    "east-germany",
    "NVA (Soviet pattern)",
    {
      IFV: [{ options: ["BMP-1*", "BMP-2"] }],
      APC: [{ options: ["BTR-60*", "BTR-70"] }],
    },
    "NVA Motorisierte Schützen and Panzer regiments followed the Soviet tables.",
  ),
  derived(
    "poland",
    "Polish Army (Soviet pattern)",
    {
      MBT: [{ options: [...PACT_MBT, "T-72M1 Wilk", "T-72M1Z w/ERAWA-1", "T-72M1Z w/ERAWA-2"] }],
      IFV: [{ options: ["BWP-1*", "BWP-2"] }],
      APC: [{ options: ["BTR-60*", "OT-64A SKOT", "OT-64B SKOT-2", "OT-64C SKOT-2A"] }],
    },
    "Polish mechanised regiments rode SKOTs and BWPs.",
    ["czechoslovakia"],
  ),
  derived(
    "czechoslovakia",
    "Czechoslovak Army (Soviet pattern)",
    {
      IFV: [{ options: ["BVP-1*", "BVP-2"] }],
      APC: [{ options: ["OT-62B", "OT-62C", "OT-64*"] }],
      "Light MRL": [{ options: ["BM-21 Grad MRL", "RM-70 MRL"] }],
    },
    "Czechoslovak regiments used OT-64 SKOTs, BVPs and RM-70s; DANA is an attachment.",
  ),
  derived(
    "hungary",
    "Hungarian Army (Soviet pattern)",
    {
      IFV: [{ options: ["BMP-1*", "BMP-2"] }],
      APC: [{ options: ["BTR-60*", "BTR-70"] }],
    },
    "The PSZH and FUG have no cards; BTRs stand in.",
  ),
  derived(
    "romania",
    "Romanian Army (Soviet pattern)",
    {
      IFV: [{ options: ["MLI-84*"] }],
      APC: [{ options: ["TAB-71*", "TAB-77"] }],
    },
    "Romanian regiments used TABs and MLI-84s; the TR-85 has no card.",
  ),
  derived(
    "bulgaria",
    "Bulgarian Army (Soviet pattern)",
    {
      IFV: [{ options: ["BMP-1*", "BMP-23*"] }],
      APC: [{ options: ["BTR-60*", "BTR-70"] }],
    },
    "Bulgarian regiments added the BMP-23.",
  ),
];

// Czechoslovakia: the DANA wheeled howitzer replaced the 2S1 in regimental artillery.
PACT_ARMIES.find((l) => l.nation === "czechoslovakia")!.attachments = [
  ...SOVIET_ARMY.attachments,
  { label: "DANA Artillery Battalion", years: [1981, 2015], lines: ["3 DANA (ShKH-77)"] },
];
