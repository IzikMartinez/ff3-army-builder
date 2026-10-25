import { NATO_SP155, M114 } from "./common";
import type { ArmyListSpec, FormationSpec } from "../formations";

/* Canadian Army 1980s+, Appendix E p.314. US-built kit (M113s before 2001,
   M150, M125, artillery, OH-58) comes from the US catalog. */

const mechBattalion = (years: [number, number], company: string[]): FormationSpec => ({
  id: `mech-${years[0]}`,
  name: "Mechanized Battalion",
  years,
  groups: [
    { label: "Base", lines: ["2 recon Lynx", "2 M125 SP 81mm Mtr", "2 M113 TOW (M150)"] },
    { label: "4 Mech Infantry Companies", times: 4, lines: company },
  ],
});
const COMPANY_80 = ["3 Infantry + 3 APC"];
const COMPANY_94 = ["2 Infantry w/ATGM + 2 APC", "1 Infantry w/MAW+ATGM + 1 APC"];

const infantryBattalion = (armored: number): FormationSpec => ({
  id: `infantry-${armored}`,
  name: `Infantry Battalion (${armored} armored compan${armored > 1 ? "ies" : "y"})`,
  years: [1980, 2015],
  groups: [
    { label: "Base", lines: ["2 Cougar", "2 Jeep w/TOW", "2 81mm Mtr + 2 Jeep"] },
    { label: `${armored} Armored Infantry Compan${armored > 1 ? "ies" : "y"}`, times: armored, lines: ["3 Infantry + 3 Grizzly"] },
    {
      label: `${4 - armored} Motorized Infantry Companies`,
      times: 4 - armored,
      lines: ["3 Infantry + 3 Medium Truck"],
    },
  ],
});

export const CANADIAN_ARMY: ArmyListSpec = {
  id: "canadian-army",
  name: "Canadian Army",
  nation: "canada",
  fallback: ["us", "west-germany"],
  source: "Appendix E, Canadian Army 1980s+ (p.314)",
  roles: {
    // The Lynx card ends in 1995; the Coyote replaced it.
    Lynx: [{ options: ["Coyote", "Lynx"] }],
    SP155: NATO_SP155,
    M114,
    MBT: [
      {
        options: [
          "Leopard C1",
          "Leopard C1A1",
          "Leopard C2",
          "Leopard C2 uparmored",
          "Leopard 2A6",
        ],
      },
    ],
    APC: [{ options: ["M113, M113A1", "M113A2", "M113A3", "M113A3 uparmored"] }],
  },
  formations: [
    {
      id: "armored-regiment",
      name: "Armored Regiment",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["4 recon Lynx", "2 M113 TOW (M150)"] },
        { label: "3 Armored Squadrons", times: 3, lines: ["4 MBT"] },
      ],
    },
    mechBattalion([1980, 1993], COMPANY_80),
    mechBattalion([1994, 2015], COMPANY_94),
    {
      id: "light-armored",
      name: "Light Armored Regiment",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["2 Jeep w/TOW"] },
        {
          label: "3 Light Armored Companies",
          times: 3,
          lines: ["1 81mm Mtr + 1 Grizzly", "4 Cougar"],
        },
      ],
    },
    infantryBattalion(1),
    infantryBattalion(2),
  ],
  attachments: [
    { label: "Armored Squadron", lines: ["4 MBT"] },
    { label: "Mech Infantry Company", years: [1980, 1993], lines: COMPANY_80 },
    { label: "Mech Infantry Company", years: [1994, 2015], lines: COMPANY_94 },
    {
      label: "Air Defense Battery",
      years: [1980, 1989],
      lines: ["2 Blowpipe Team + 2 Light Truck || 2 Blowpipe Team + 2 APC"],
    },
    {
      label: "Air Defense Battery",
      years: [1990, 2002],
      lines: ["2 Javelin Team + 2 Light Truck || 2 Javelin Team + 2 APC"],
    },
    { label: "Mechanized Engineer Detachment", lines: ["2 Assault Pioneer + 1 APC + 1 Medium Truck"] },
    {
      label: "Armored Engineer Detachment",
      lines: ["2 Assault Pioneer + 1 Grizzly + 1 Medium Truck"],
    },
    { label: "Engineer Recon Platoon", lines: ["1 recon Lynx"] },
    { label: "Helicopter Recon Flight", years: [1980, 1996], lines: ["1 OH-58*"] },
    { label: "SP Artillery Regiment", years: [1980, 2005], lines: ["6 SP155"] },
    {
      label: "Towed Artillery Regiment (Mobile Command)",
      years: [1980, 1990],
      lines: ["2 M114 + 2 Medium Truck"],
    },
    {
      label: "Towed Artillery Regiment (M777)",
      years: [2005, 2015],
      lines: ["3 M777 155mm How + 3 Medium Truck || 3 M777 w/ Excalibur + 3 Medium Truck"],
    },
    {
      label: "Towed Artillery Regiment (105mm, Mobile Command)",
      lines: ["2 M101 105mm How + 2 Medium Truck"],
    },
  ],
};
