import { NATO_SP155, M114 } from "./common";
import type { ArmyListSpec, FormationSpec } from "../formations";

/* Italian Army 1980s+, Appendix E pp.329–330. Leopard 1s are West German
   cards; the M47, M60A1 and M113 American. "[optional + 3 Light Trucks]" is a
   line choice: on foot, or trucked. The FH-70 uses the generic 155mm How. */

const MECH_CO = ["1 M125 SP 81mm Mtr", "1 Jeep w/106mm RR", "3 Infantry + 3 APC"];
const MOT_CO = ["1 M125 SP 81mm Mtr", "1 Jeep w/106mm RR", "3 Infantry + 3 Light Truck"];
const LIGHT_CO = ["3 Infantry || 3 Infantry + 3 Light Truck", "1 Jeep w/106mm RR || 1 Jeep w/TOW"];
const RR_OR_TOW = "2 Jeep w/106mm RR || 2 Jeep w/TOW";

const lightBattalion = (id: string, name: string, company: string): FormationSpec => ({
  id,
  name,
  years: [1980, 2015],
  groups: [
    { label: "Base", lines: ["1 120mm Mtr + 1 Light Truck", RR_OR_TOW] },
    { label: `3 ${company} Companies`, times: 3, lines: LIGHT_CO },
  ],
});

export const ITALIAN_ARMY: ArmyListSpec = {
  id: "italian-army",
  name: "Italian Army",
  nation: "italy",
  fallback: ["west-germany", "us"],
  source: "Appendix E, Italian Army 1980s+ (pp.329–330)",
  roles: {
    SP155: NATO_SP155,
    M114,
    APC: [{ options: ["M113, M113A1", "VCC-1 (aka OTOBREDA)", "VCC-80", "Puma APC w/MG"] }],
    "Cavalry Tank": [
      { years: [1980, 1992], options: ["Leopard 1*"] },
      { years: [1991, 2015], options: ["Centauro B1*"] },
    ],
    MBT: [{ options: ["M47", "M60A1", "Leopard 1*", "C1 Ariete*"] }],
    FH70: [{ options: ["155mm How"] }],
  },
  formations: [
    {
      id: "armored",
      name: "Armored Battalion",
      years: [1980, 2015],
      groups: [{ label: "3 Tank Companies", times: 3, lines: ["3 MBT"] }],
    },
    {
      id: "mech",
      name: "Mechanized Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["2 M106 SP 107mm Mtr", RR_OR_TOW] },
        { label: "3 Mechanized Infantry Companies", times: 3, lines: MECH_CO },
      ],
    },
    {
      id: "motorized",
      name: "Motorized Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["1 120mm Mtr + 1 Light Truck", "2 Jeep w/106mm RR"] },
        { label: "3 Motorized Infantry Companies", times: 3, lines: MOT_CO },
      ],
    },
    lightBattalion("parachute", "Parachute Battalion", "Parachute"),
    lightBattalion("alpini", "Alpini Battalion", "Alpini"),
    {
      id: "cavalry",
      name: "Armored Cavalry Regiment",
      years: [1980, 2015],
      groups: [
        {
          label: "3 Armored Cavalry Companies",
          times: 3,
          lines: ["2 recon Cavalry Tank", "2 recon Jeep w/LMG"],
        },
      ],
    },
  ],
  attachments: [
    { label: "Armored Company", lines: ["3 MBT"] },
    { label: "Mechanized Infantry Company", lines: MECH_CO },
    { label: "Motorized Infantry Company", lines: MOT_CO },
    { label: "Parachute Company", lines: LIGHT_CO },
    { label: "Alpini Company", lines: LIGHT_CO },
    { label: "Armored Cavalry Company", lines: ["2 recon Cavalry Tank", "2 recon Jeep w/LMG"] },
    { label: "Field Artillery Battalion (Armored/Mech)", lines: ["3 SP155"] },
    {
      label: "Field Artillery Battalion (Motorized)",
      lines: ["3 M114 + 3 Medium Truck || 3 FH70 + 3 Medium Truck"],
    },
    {
      label: "Field Artillery Battalion (Alpini/Para)",
      lines: ["3 M56 105mm Pack How + 3 Light Truck"],
    },
    {
      label: "Field Artillery Battery (Alpini)",
      lines: ["1 M114 + 1 Medium Truck || 1 FH70 + 1 Medium Truck"],
    },
    { label: "Heavy Artillery Battalion", lines: ["3 M110 SP 203mm How"] },
    { label: "MRL Battery", lines: ["1 M270 MLRS"] },
  ],
};
