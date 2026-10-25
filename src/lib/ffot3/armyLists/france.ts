import type { ArmyListSpec, GroupSpec } from "../formations";

/* French Army 1980s+, Appendix E pp.320–322. The AMX-13 SS-11 and VBL Milan
   are the AMX-13 and VBL cards with their missile option. The M101 and M270
   come from the US catalog. */

const MECH_CO_80 = ["2 Infantry + 2 Infantry w/Milan + 4 AMX-10P"];
const MECH_CO_84 = ["3 Infantry + 1 Infantry w/Milan + 4 AMX-10P"];
const MOT_CO_80 = ["2 Infantry + 1 Infantry w/Milan + 3 VAB 6x6"];
const MOT_CO_84 = ["3 Infantry + 3 VAB 6x6"];

const motBase = (scoutAtgm: number, aa: number): GroupSpec => ({
  label: "Base",
  lines: [
    `${scoutAtgm} Scout ATGM`,
    "3 Scout Vehicle",
    "1 120mm Mtr + 1 VAB 6x6",
    "2 81mm Mtr + 2 VAB 6x6",
    `${aa} 20mm AA Gun + ${aa} Light Truck`,
  ],
});

export const FRENCH_ARMY: ArmyListSpec = {
  id: "french-army",
  name: "French Army",
  nation: "france",
  fallback: ["us"],
  source: "Appendix E, French Army 1980s+ (pp.320–322)",
  roles: {
    MBT: [
      { options: ["AMX-30"] },
      { years: [1981, 2015], options: ["AMX-30 B2*"] },
      { years: [1994, 2015], options: ["Leclerc"] },
    ],
    "Scout ATGM": [
      { years: [1980, 1984], options: ["Jeep w/Milan"] },
      { years: [1985, 2015], options: ["VBL"] },
    ],
    "Scout Vehicle": [
      { years: [1980, 1984], options: ["Jeep w/LMG"] },
      { years: [1985, 2015], options: ["VBL Reco 12.7"] },
    ],
  },
  formations: [
    {
      id: "mech-80",
      name: "Mechanized Infantry Regiment",
      years: [1980, 1984],
      groups: [
        { label: "Base", lines: ["1 120mm Mtr + 1 AMX-10P"] },
        { label: "2 Mech Infantry Companies", times: 2, lines: MECH_CO_80 },
        { label: "2 Armored Companies", times: 2, lines: ["2 MBT"] },
      ],
    },
    {
      id: "mech-84",
      name: "Mechanized Infantry Regiment",
      years: [1984, 2015],
      groups: [
        { label: "Base", lines: ["1 120mm Mtr + 1 AMX-10P"] },
        { label: "2 Mech Infantry Companies", times: 2, lines: MECH_CO_84 },
        { label: "1 Armored Company", lines: ["4 MBT"] },
      ],
    },
    {
      id: "armored-80",
      name: "Armored Regiment",
      years: [1980, 1984],
      groups: [
        { label: "4 Armored Squadrons", times: 4, lines: ["3 MBT"] },
        { label: "1 Mech Infantry Company", lines: ["4 Infantry + 4 AMX-10P"] },
      ],
    },
    {
      id: "armored-84",
      name: "Armored Regiment",
      years: [1984, 2015],
      groups: [
        { label: "4 Armored Squadrons", times: 4, lines: ["4 MBT"] },
        { label: "1 Mech Infantry Company", lines: MECH_CO_84 },
      ],
    },
    {
      id: "motorized-80",
      name: "Motorized Infantry Regiment",
      years: [1980, 1984],
      groups: [motBase(1, 1), { label: "4 Motorized Rifle Companies", times: 4, lines: MOT_CO_80 }],
    },
    {
      id: "motorized-84",
      name: "Motorized Infantry Regiment",
      years: [1984, 2015],
      groups: [
        motBase(3, 2),
        { label: "4 Motorized Infantry Companies", times: 4, lines: MOT_CO_84 },
      ],
    },
    {
      id: "light-amx13",
      name: "Light Armored Regiment (AMX-13)",
      years: [1980, 2015],
      groups: [
        {
          label: "3 Light Armored Squadrons",
          times: 3,
          lines: ["3 AMX-13 || 3 AMX-13 90mm", "1 AMX-13"],
        },
      ],
      note: "The fourth AMX-13 of each squadron is the SS-11 version: pick its missile on the card.",
    },
    {
      id: "light-amx10rc",
      name: "Light Armored Regiment (AMX-10RC)",
      years: [1982, 2015],
      groups: [
        { label: "3 Light Armored Squadrons", times: 3, lines: ["3 AMX-10RC", "1 VCAC Milan (VAB)"] },
      ],
    },
    {
      id: "light-erc90",
      name: "Light Armored Regiment (ERC-90)",
      years: [1980, 2015],
      groups: [{ label: "3 Light Armored Squadrons", times: 3, lines: ["3 ERC-90", "1 Scout ATGM"] }],
    },
    {
      id: "airborne",
      name: "Airborne or Marine Regiment",
      years: [1980, 2015],
      groups: [
        {
          label: "Base",
          lines: [
            "1 120mm Mtr + 1 Light Truck",
            "1 20mm AA Gun + 1 Light Truck",
            "2 81mm Mtr",
            "2 Milan Team",
          ],
        },
        { label: "4 Airborne Companies", times: 4, lines: ["4 Infantry"] },
      ],
    },
  ],
  attachments: [
    { label: "Armored Company", years: [1980, 1984], lines: ["3 MBT"] },
    { label: "Armored Company", years: [1984, 2015], lines: ["4 MBT"] },
    { label: "Mechanized Infantry Company", years: [1980, 1984], lines: MECH_CO_80 },
    { label: "Mechanized Infantry Company", years: [1984, 2015], lines: MECH_CO_84 },
    { label: "Motorized Infantry Company", years: [1980, 1984], lines: MOT_CO_80 },
    { label: "Motorized Infantry Company", years: [1984, 2015], lines: MOT_CO_84 },
    { label: "Recon Company (Armored Division)", lines: ["1 Scout ATGM", "3 Scout Vehicle"] },
    { label: "Recon Company (Infantry Division)", years: [1982, 2015], lines: ["3 AMX-10RC"] },
    { label: "Tank Destroyer Company", lines: ["3 VCAC HOT (VAB)"] },
    { label: "Attack Helicopter Company", lines: ["2 Gazelle || 2 Alouette III"] },
    { label: "AAA Battery", lines: ["3 AMX-13 DCA SP AA Gun"] },
    { label: "SAM Battery", lines: ["2 AMX-30 Roland SP SAM"] },
    {
      label: "Field Artillery Regiment",
      lines: ["4 Mk F3 SP 155mm Gun || 4 GCT SP 155mm Gun"],
    },
    { label: "Towed Artillery Regiment", lines: ["4 OB-155-50 BF + 4 Medium Truck"] },
    // The book prints "4 3 M101"; the trucks say 3.
    { label: "Airborne Artillery Regiment", lines: ["3 M101 105mm How + 3 Light Truck"] },
    { label: "MLRS Battery", years: [1985, 2015], lines: ["1 M270 MLRS || 2 M270 MLRS"] },
  ],
};
