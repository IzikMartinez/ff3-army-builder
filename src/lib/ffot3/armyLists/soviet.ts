import type { ArmyListSpec, GroupSpec, RoleOption } from "../formations";

/*
 * Russian/Soviet/CIS army lists, Appendix E pp.334–342. "+" years run to 2015.
 * Line syntax: see formations.ts.
 */

const SP_SAM: RoleOption[] = [{ options: ["SA-9 SP SAM", "SA-13 SP SAM"] }];
const SP_AA: RoleOption[] = [{ options: ["ZSU-23/4 SP AAG", "2S6M Tunguska SP SAM"] }];

/** Infantry cards come in readiness categories; options run 3 → 1 so Category 1 is the default. */
const cat = (kind: string): RoleOption[] => [
  { options: [3, 2, 1].map((n) => `Category ${n} ${kind}`) },
];

const ENGINEER_COMPANY: GroupSpec = {
  label: "1 Engineer Company",
  lines: ["2 Engineer + 2 Medium Truck", "1 AVLB", "1 GMZ Armored Minelayer"],
};

const BMP_BATTALION = [
  "1 Mortar Unit",
  "3 Infantry + 3 IFV",
  "3 Infantry | 3 Infantry w/ATGM + 3 IFV",
  "3 Infantry | 3 Infantry w/SAM + 3 IFV",
];

const btrBattalion = (withAgl: boolean) => [
  "1 Mortar Unit",
  "1 Missile Team + 1 Recoilless Gun + 1 APC",
  ...(withAgl ? ["1 AGS-17 AGL + 1 APC"] : []),
  "3 Infantry + 3 APC",
  "3 Infantry | 3 Infantry w/ATGM + 3 APC",
  "3 Infantry | 3 Infantry w/SAM + 3 APC",
];

const SP_ARTY_BN: GroupSpec = {
  label: "1 Regimental 122mm SP Artillery Battalion",
  lines: ["3 2S1 SP 122mm Gun"],
};
const TOWED_ARTY_BN: GroupSpec = {
  label: "1 Regimental 122mm Towed Artillery Battalion",
  lines: ["3 D-30 122mm FG + 3 Light Truck"],
};

const tankRegiment = (id: string, name: string, years: [number, number], recon: string[]) => ({
  id,
  name,
  years,
  groups: [
    { label: "Base", lines: ["1 SP SAM", "1 SP AA Gun", ...recon] },
    { label: "3 Tank Battalions", times: 3, lines: ["6 MBT"] },
    ENGINEER_COMPANY,
  ],
});

const bmpRegiment = (
  id: string,
  name: string,
  years: [number, number],
  base: string[],
): ArmyListSpec["formations"][number] => ({
  id,
  name,
  years,
  groups: [
    { label: "Base", lines: base },
    { label: "AT Missile Battery", lines: ["2 AT Vehicle"] },
    { label: "3 BMP Motor Rifle Battalions", times: 3, lines: BMP_BATTALION },
    { label: "1 Tank Battalion (MR)", lines: ["9 MBT"] },
    ENGINEER_COMPANY,
    SP_ARTY_BN,
  ],
});

const btrRegiment = (
  id: string,
  name: string,
  years: [number, number],
  base: string[],
  withAgl: boolean,
  artillery: GroupSpec,
): ArmyListSpec["formations"][number] => ({
  id,
  name,
  years,
  groups: [
    { label: "Base", lines: base },
    { label: "AT Missile Battery", lines: ["2 AT Vehicle"] },
    { label: "3 BTR Motor Rifle Battalions", times: 3, lines: btrBattalion(withAgl) },
    { label: "1 Tank Battalion (MR)", lines: ["9 MBT"] },
    ENGINEER_COMPANY,
    artillery,
  ],
});

const AIR_DEFENCE = ["1 SP SAM", "1 SP AA Gun"];

export const SOVIET_ARMY: ArmyListSpec = {
  id: "soviet-army",
  name: "Soviet Army",
  nation: "soviets",
  source: "Appendix E, Russian/Soviet/CIS Army 1970+ (pp.334–339)",
  roles: {
    MBT: [{ options: ["T-55*", "T-62*", "T-64*", "T-72*", "T-80*", "T-90*"] }],
    IFV: [{ options: ["BMP-1*", "BMP-2*", "BMP-3*"] }],
    APC: [{ options: ["BTR-60*", "BTR-70", "BTR-80*"] }],
    "SP SAM": SP_SAM,
    "SP AA Gun": SP_AA,
    // The book defines Mortar Unit from '80; earlier formations use the M-43,
    // as the Regimental 120mm Mortar Battery does ('70-'81).
    "Mortar Unit": [
      { years: [1970, 1981], options: ["M-43 120mm Mtr + Light Truck"] },
      {
        years: [1982, 1989],
        options: ["M-43 120mm Mtr + Light Truck", "2B11/2S12 120mm Mtr + Light Truck"],
      },
      {
        years: [1990, 2015],
        options: ["2B11/2S12 120mm Mtr + Light Truck", "2S23 SP 120mm GMtr"],
      },
    ],
    "Regimental Mortar": [
      { years: [1970, 1980], options: ["M-43 120mm Mtr + Light Truck"] },
      { years: [1981, 2015], options: ["2B11/2S12 120mm Mtr + Light Truck"] },
    ],
    "AT Vehicle": [{ options: ["BRDM-2 (ATGM)"] }],
    "AT Gun": [{ options: ["T-12 AT Gun", "MT-12 AT Gun", "2A45M AT Gun"] }],
    AVLB: [
      { years: [1970, 1987], options: ["MTU-12 AVLB", "MTU-55 AVLB", "MTU-20 AVLB"] },
      { years: [1988, 2015], options: ["MTU-55 AVLB", "MTU-20 AVLB", "MTU-72 AVLB"] },
    ],
    "Light MRL": [{ options: ["BM-21 Grad MRL", "BM-21 Prima MRL"] }],
    "Recoilless Gun": [{ options: ["B-10 82mm RR", "B-11 107mm RR", "SPG-9 Rocket Gun"] }],
    Hind: [{ options: ["Mi-24*"] }],
    Infantry: cat("Infantry"),
    "Infantry w/ATGM": cat("Infantry w/ATGM"),
    "Infantry w/SAM": cat("Infantry w/SAM"),
    "Missile Team": cat("Missile Team"),
    "SAM Team": [{ options: [3, 2, 1].map((n) => `Category ${n} SAM Team*`) }],
    Engineer: cat("Combat Engineer"),
  },
  formations: [
    tankRegiment("tank-70", "Tank Regiment", [1970, 1975], [
      "2 recon BRDM-2",
      "1 recon PT-76B",
    ]),
    tankRegiment("tank-75", "Tank Regiment", [1975, 1980], [
      "1 recon BRDM-2",
      "1 recon PT-76B",
    ]),
    {
      id: "tank-cat1-80",
      name: "Tank Regiment [Category I]",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: [...AIR_DEFENCE, "1 recon BRDM-2", "1 recon IFV"] },
        { label: "3 Tank Battalions", times: 3, lines: ["6 MBT"] },
        { label: "1 Motor Rifle Battalion", lines: BMP_BATTALION },
        ENGINEER_COMPANY,
      ],
    },
    {
      id: "tank-cat2-80",
      name: "Tank Regiment [Category II]",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: [...AIR_DEFENCE, "1 recon BRDM-2", "1 recon IFV"] },
        { label: "3 Tank Battalions", times: 3, lines: ["6 MBT"] },
        {
          label: "1 Motor Rifle Company",
          lines: [
            "1 Infantry + 1 IFV",
            "1 Infantry | 1 Infantry w/ATGM + 1 IFV",
            "1 Infantry | 1 Infantry w/SAM + 1 IFV",
          ],
        },
        ENGINEER_COMPANY,
      ],
    },
    bmpRegiment("bmp-70", "BMP Motor Rifle Regiment", [1970, 1975], [
      ...AIR_DEFENCE,
      "2 recon BRDM-2",
      "1 recon PT-76B",
    ]),
    bmpRegiment("bmp-75", "BMP Motor Rifle Regiment", [1975, 1980], [
      ...AIR_DEFENCE,
      "1 recon BRDM-2",
      "1 recon PT-76B",
    ]),
    bmpRegiment("bmp-80", "BMP Motor Rifle Regiment", [1980, 1985], [
      ...AIR_DEFENCE,
      "1 recon BRDM-2",
      "1 recon IFV",
    ]),
    bmpRegiment("bmp-85", "BMP Motor Rifle Regiment", [1985, 2015], [
      "1 Vasilek 82mm Mtr + 1 APC",
      "1 AGS-17 AGL + 1 IFV",
      ...AIR_DEFENCE,
      "1 recon BRDM-2",
      "1 recon IFV",
    ]),
    btrRegiment(
      "btr-70",
      "BTR Motor Rifle Regiment",
      [1970, 1975],
      [...AIR_DEFENCE, "2 recon BRDM-2", "1 recon PT-76B"],
      true,
      {
        label: "1 Regimental 122mm Towed Artillery Battery or 120mm Mortar Battery",
        // The book lists 3 Light Trucks for the single gun; one tows it.
        lines: ["1 D-30 122mm FG + 1 Light Truck || 1 Regimental Mortar"],
      },
    ),
    btrRegiment(
      "btr-75",
      "BTR Motor Rifle Regiment",
      [1975, 1980],
      [...AIR_DEFENCE, "1 recon BRDM-2", "1 recon PT-76B"],
      true,
      TOWED_ARTY_BN,
    ),
    btrRegiment(
      "btr-80",
      "BTR Motor Rifle Regiment",
      [1980, 1985],
      [...AIR_DEFENCE, "1 recon BRDM-2", "1 recon IFV"],
      true,
      TOWED_ARTY_BN,
    ),
    btrRegiment(
      "btr-85",
      "BTR Motor Rifle Regiment",
      [1985, 2015],
      ["1 Vasilek 82mm Mtr + 1 APC", ...AIR_DEFENCE, "1 recon BRDM-2", "1 recon IFV"],
      false,
      TOWED_ARTY_BN,
    ),
  ],
  attachments: [
    { label: "Tank Battalion (Tank Division)", lines: ["6 MBT"] },
    { label: "Tank Battalion (Motor Rifle Division)", lines: ["9 MBT"] },
    { label: "Independent Tank Battalion", lines: ["9 MBT"] },
    { label: "Motor Rifle Battalion (BMP)", years: [1980, 2015], lines: BMP_BATTALION },
    { label: "Motor Rifle Battalion (BTR)", years: [1980, 1985], lines: btrBattalion(true) },
    { label: "Motor Rifle Battalion (BTR)", years: [1985, 2015], lines: btrBattalion(false) },
    { label: "Recon Battalion", years: [1970, 1975], lines: ["2 recon PT-76B", "3 recon BRDM-2"] },
    { label: "Recon Battalion", years: [1975, 1980], lines: ["2 recon PT-76B", "2 recon BRDM-2"] },
    {
      label: "Recon Battalion",
      years: [1980, 1985],
      lines: ["2 recon IFV || 2 recon PT-76B", "2 recon BRDM-2"],
    },
    {
      label: "Recon Battalion",
      years: [1985, 2015],
      lines: ["4 recon IFV", "1 recon BRDM-2"],
      note: "The book also lists a recon infantry stand; its carrier is cut off in the text.",
    },
    {
      label: "Antitank Battalion",
      lines: [
        "2 AT Gun + 2 MTLB, MT-LBV, MT-LBT + 2 AT Vehicle || 2 AT Gun + 2 Light Truck + 2 AT Vehicle || 4 AT Gun + 4 MTLB, MT-LBV, MT-LBT || 4 AT Gun + 4 Light Truck",
      ],
    },
    { label: "Attack Helicopter Company", lines: ["2 Hind"] },
    {
      label: "SAM Regiment (SA-8)",
      years: [1980, 2015],
      lines: ["5 SA-8 SP SAM", "5 SAM Team + 5 Light Truck"],
    },
    {
      label: "SAM Regiment (SA-15)",
      years: [1990, 2015],
      lines: ["4 SA-15 SP SAM", "4 SAM Team + 4 Light Truck"],
    },
    {
      label: "SAM Battery (SA-8)",
      years: [1980, 2015],
      lines: ["1 SA-8 SP SAM", "1 SAM Team + 1 Light Truck"],
    },
    {
      label: "SAM Battery (SA-15)",
      years: [1990, 2015],
      lines: ["1 SA-15 SP SAM", "1 SAM Team + 1 Light Truck"],
    },
    { label: "Fuel-air Explosive MRL Battery", years: [1981, 2015], lines: ["2 TOS-1 MRL"] },
    ENGINEER_COMPANY,
    SP_ARTY_BN,
    TOWED_ARTY_BN,
    { label: "Regimental 120mm Mortar Battery", lines: ["1 Regimental Mortar"] },
    {
      label: "152mm SP Artillery Battalion",
      lines: ["3 2S3 SP 152mm How || 3 2S5 SP 152mm Gun"],
    },
    {
      label: "152mm Towed Artillery Battalion (Divisional)",
      lines: ["3 D-20 152mm How + 3 Medium Truck"],
    },
    {
      label: "152mm Towed Artillery Battalion (Army)",
      lines: ["3 2A36 152mm FG + 3 Medium Truck"],
    },
    { label: "Rocket Launcher Battalion (Divisional)", lines: ["3 Light MRL"] },
    { label: "Rocket Launcher Battery (Army)", lines: ["1 Uragan MRL"] },
  ],
};

export const SOVIET_AIRBORNE: ArmyListSpec = {
  id: "soviet-vdv",
  name: "Soviet Airborne (VDV)",
  nation: "soviets",
  source: "Appendix E, Russian/Soviet/CIS Airborne Forces 1970s+ (pp.340–341)",
  roles: {
    "AB IFV": [{ options: ["BMD-1*", "BMD-2", "BMD-3"] }],
    "AT Vehicle": [
      { years: [1970, 1980], options: ["BRDM-1 (ATGM)", "BRDM-2 (ATGM)"] },
      { years: [1981, 2015], options: ["BRDM-2 (ATGM)"] },
    ],
    "AA Unit": [
      { years: [1980, 1990], options: ["ZU-23/2 AAG + Medium Truck"] },
      { years: [1991, 2015], options: ["ZU-23/2 AAG + Medium Truck", "ZSU-23/4 SP AAG"] },
    ],
    // Elite: Category 1 only.
    Infantry: [{ options: ["Category 1 Infantry"] }],
    "Missile Team": [{ options: ["Category 1 Missile Team"] }],
    "SAM Team": [{ options: ["Category 1 SAM Team*"] }],
    Hind: [{ options: ["Mi-24*"] }],
    Hip: [{ options: ["Mi-8*"] }],
  },
  formations: [
    {
      id: "air-assault-81",
      name: "Air Assault Brigade",
      years: [1981, 2015],
      groups: [
        { label: "Base", lines: ["1 recon AB IFV", "1 recon BRDM-2", "1 2S9 SP 120mm GMtr"] },
        { label: "2 Air Assault Battalions", times: 2, lines: ["9 Infantry + 9 AB IFV"] },
        { label: "2 Light Parachute Battalions", times: 2, lines: ["6 Infantry", "1 Missile Team"] },
        { label: "1 Airborne Light AT Battery", lines: ["2 Missile Team"] },
        { label: "1 Airborne Artillery Battery", lines: ["1 D-30 122mm FG + 1 Light Truck"] },
      ],
    },
    {
      id: "airborne-70",
      name: "Airborne Regiment",
      years: [1970, 1980],
      groups: [
        {
          label: "Base",
          lines: [
            "1 ZU-23/2 AAG + 1 Light Truck || 1 SAM Team + 1 Light Truck",
            "1 D-30 122mm FG + 1 Light Truck || 1 M-43 120mm Mtr + 1 Light Truck",
          ],
        },
        {
          label: "3 Airborne Battalions",
          times: 3,
          lines: ["1 82mm Mtr", "1 SPG-9 Rocket Gun", "2 ASU-57", "9 Infantry"],
        },
        { label: "Airborne AT Battery", lines: ["2 AT Vehicle"] },
      ],
    },
    {
      id: "airborne-81",
      name: "Airborne Regiment",
      years: [1981, 2015],
      groups: [
        { label: "Base", lines: ["1 2S9 SP 120mm GMtr"] },
        { label: "3 Airborne Battalions", times: 3, lines: ["9 Infantry + 9 AB IFV"] },
        { label: "Airborne AT Battery", lines: ["2 AT Vehicle"] },
      ],
    },
  ],
  attachments: [
    { label: "Airborne AA Battery", years: [1980, 2015], lines: ["2 SAM Team", "1 AA Unit"] },
    { label: "Airborne Assault Gun Battalion", lines: ["3 ASU-85 || 6 ASU-85"] },
    { label: "Airborne Divisional Recon Company", years: [1970, 1979], lines: ["4 recon BRDM-2"] },
    {
      label: "Airborne Divisional Recon Company",
      years: [1980, 2015],
      lines: ["2 recon BRDM-2", "3 recon Infantry + 3 Light Truck"],
    },
    { label: "Attack Helicopter Company", lines: ["2 Hind"] },
    { label: "Transport Helicopter Company", lines: ["2 Hip"] },
    { label: "Airborne Artillery Battery", lines: ["1 D-30 122mm FG + 1 Light Truck"] },
    { label: "Airborne Artillery Battalion", lines: ["3 D-30 122mm FG + 3 Light Truck"] },
    { label: "MRL Battery", lines: ["1 RPU-14 MRL + 1 Light Truck"] },
  ],
};

const naval = (id: string, name: string, tankBns: number, infBns: number, rockets: boolean) => ({
  id,
  name,
  years: [1970, 2015] as [number, number],
  note:
    infBns === 4 ? "The book allows 4 or 5 Naval Infantry Battalions; this uses 4." : undefined,
  groups: [
    { label: "Base", lines: ["1 recon PT-76B", "1 recon BRDM-2", "1 Naval Mortar Battery"] },
    {
      label: `${tankBns} Tank Battalion${tankBns > 1 ? "s" : ""}`,
      times: tankBns,
      lines: ["6 PT-76B", "3 PT-76B | 3 Naval MBT"],
    },
    {
      label: `${infBns} Naval Infantry Battalions`,
      times: infBns,
      lines: ["1 82mm Mtr + 1 Light Truck", "1 Missile Team + 1 APC", "9 Infantry + 9 APC"],
    },
    { label: "1 Naval Infantry AT Company", lines: ["2 AT Vehicle"] },
    { label: "1 Naval Infantry Artillery Battalion", lines: ["3 2S1 SP 122mm Gun"] },
    ...(rockets
      ? [
          {
            label: "1 Naval Infantry Rocket Launcher Battalion",
            lines: ["3 BM-21 Grad MRL || 3 BM-21 Prima MRL"],
          },
        ]
      : []),
  ],
});

export const SOVIET_NAVAL_INFANTRY: ArmyListSpec = {
  id: "soviet-naval",
  name: "Soviet Naval Infantry",
  nation: "soviets",
  source: "Appendix E, Russian/Soviet/CIS Naval Infantry Forces 1970s+ (pp.341–342)",
  roles: {
    "AT Vehicle": [{ options: ["BRDM-2 (ATGM)"] }],
    // The Naval Infantry never got the BTR-80.
    APC: [{ options: ["BTR-60*", "BTR-70"] }],
    "Naval MBT": [{ options: ["T-55AD", "T-72*"] }],
    // The book's "+ 1 APC" for the mortar is shown as a BTR-60PB.
    "Naval Mortar Battery": [
      { years: [1961, 1989], options: ["M-43 120mm Mtr + BTR-60PB"] },
      { years: [1990, 2015], options: ["2S23 SP 120mm GMtr"] },
    ],
    "SP SAM": SP_SAM,
    Infantry: cat("Infantry"),
    "Missile Team": cat("Missile Team"),
  },
  formations: [
    naval("naval-regiment", "Naval Infantry Regiment", 1, 3, false),
    naval("naval-brigade", "Naval Infantry Brigade", 2, 4, true),
  ],
  attachments: [
    { label: "Naval Infantry AA Battery", lines: ["1 ZSU-23/4 SP AAG", "1 SP SAM"] },
  ],
};
