import { M114 } from "./common";
import type { ArmyListSpec, FormationSpec, GroupSpec, RoleOption } from "../formations";

/* U.S. Army 1973+, Appendix E pp.355–360. Bracketed "[optional + …]"
   transport is a line choice; "1–2 Infantry Rifle stands + 1–2 Utility Helos"
   is a choice of 1 or 2. */

const M113: RoleOption[] = [{ options: ["M113, M113A1", "M113A2", "M113A3"] }];

/** The 155mm SP howitzer in service: M109 → A1-4 → A6 → A6 w/Excalibur. */
const SP155: RoleOption[] = [
  { years: [1963, 1973], options: ["M109 SP 155mm How"] },
  { years: [1974, 1992], options: ["M109A1-4 SP 155mm How"] },
  { years: [1993, 2006], options: ["M109A6 SP 155mm How"] },
  { years: [2007, 2015], options: ["M109A6 w/Excalibur"] },
];

const TROOP_RECON = "2 recon M113 ACAV || 2 recon M114";
const cavTroops = (withAir: boolean): GroupSpec[] => [
  {
    label: "3 Armored Cavalry Troops ('73–'75)",
    times: 3,
    years: [1973, 1975],
    lines: [TROOP_RECON, "2 M551A1 Sheridan", "1 Infantry Rifle + 1 M113"],
  },
  {
    label: "3 Armored Cavalry Troops ('76–'79)",
    times: 3,
    years: [1976, 1979],
    lines: [TROOP_RECON, "2 M551A1 Sheridan"],
  },
  {
    label: "3 Armored Cavalry Troops ('80–'83)",
    times: 3,
    years: [1980, 1983],
    lines: [TROOP_RECON, "2 MBT"],
  },
  ...(withAir
    ? [
        {
          label: "1 Air Cavalry Troop",
          lines: [
            "2 recon Observation Helo",
            "2 Attack Helo",
            "1 Infantry Rifle + 1 Utility Helo",
          ],
        },
      ]
    : [{ label: "1 Tank Company", lines: ["3 MBT"] }]),
];

const AIR_INF = "1 Infantry Rifle + 1 Utility Helo || 2 Infantry Rifle + 2 Utility Helo";
const LIGHT_CO = ["3 Infantry Rifle || 3 Infantry Rifle + 6 Light Vehicle"];
const STRYKER_ICV = "3 Mech Infantry + 3 M1126 Stryker ICV w/HMG | 3 M1126 Stryker ICV w/AGL";

const f = (
  id: string,
  name: string,
  years: [number, number],
  groups: GroupSpec[],
  note?: string,
): FormationSpec => ({ id, name, years, groups, note });

export const US_ARMY_73: ArmyListSpec = {
  id: "us-army-73",
  name: "U.S. Army 1973+",
  nation: "us",
  source: "Appendix E, U.S. Army 1973+ (pp.355–360)",
  roles: {
    M114,
    "Attack Helo": [
      { years: [1973, 1985], options: ["AH-1F/G"] },
      { years: [1986, 1999], options: ["AH-1F/G", "AH-64"] },
      { years: [2000, 2015], options: ["AH-64", "AH-64D"] },
    ],
    CFV: [
      { years: [1970, 1984], options: ["M113 ACAV"] },
      {
        years: [1985, 2015],
        options: ["M3, M3A1 CFV", "M3A2 CFV", "M3A2 CFV ODS", "M3A3 CFV"],
      },
    ],
    IFV: [
      {
        options: [
          "M113, M113A1",
          "M113A2",
          "M113A3",
          "M2, M2A1 Bradley",
          "M2A2 Bradley",
          "M2A2 Bradley ODS",
          "M2A3 Bradey",
        ],
      },
    ],
    "Light AT Vehicle": [
      { years: [1970, 1989], options: ["Jeep w/TOW"] },
      { years: [1990, 1993], options: ["M220 TOW HMMWV"] },
      { years: [1994, 1995], options: ["M220 TOW HMMWV", "M966 TOW HMMWV"] },
      { years: [1996, 2015], options: ["M220 TOW HMMWV", "M966 TOW HMMWV", "M1121 TOW HMMWV"] },
    ],
    "Light Vehicle": [
      { years: [1970, 1984], options: ["Jeep w/LMG"] },
      { years: [1985, 1993], options: ["M998 HMMWV LMG"] },
      { years: [1994, 1995], options: ["M998 HMMWV LMG", "M1025 HMMWV LMG"] },
      { years: [1996, 2015], options: ["M998 HMMWV LMG", "M1025 HMMWV LMG", "M1114 HMMWV LMG"] },
    ],
    MBT: [
      {
        options: [
          // Ordered so the default (last in service) is the common tank: the
          // M60A2 was a niche model, so it sits before the M60A1.
          "M48A5",
          "M551A1 Sheridan",
          "M60A2",
          "M60A1",
          "M60A3",
          "M1",
          "M1 IP",
          "M1A1",
          "M1A1HA / M1A1HC",
          "M1A1D",
          "M1A2",
          "M1A2 SEP",
          "M1A2 TUSK",
        ],
      },
    ],
    "Observation Helo": [
      { years: [1973, 1984], options: ["OH-6", "OH-58"] },
      { years: [1985, 2015], options: ["OH-58", "OH-58D"] },
    ],
    "SP Mortar": [
      { years: [1970, 1990], options: ["M106 SP 107mm Mtr"] },
      { years: [1991, 2015], options: ["M1064 SP 120mm Mtr"] },
    ],
    "Utility Helo": [
      { years: [1973, 1978], options: ["UH-1"] },
      { years: [1979, 2009], options: ["UH-1", "UH-60"] },
      { years: [2010, 2015], options: ["UH-60"] },
    ],
    "Transport Helo": [
      { years: [1973, 1977], options: ["UH-1"] },
      { years: [1978, 1980], options: ["UH-1", "UH-60"] },
      { years: [1981, 2015], options: ["UH-60"] },
    ],
    M113,
    AVLB: [{ options: ["M48 AVLB", "M60 AVLB", "M104 Wolverine AVLB"] }],
    "TOW Team": [{ options: ["TOW Team*"] }],
    SP155,
  },
  formations: [
    f("tank-73", "Tank Battalion", [1973, 1983], [
      {
        label: "Base",
        lines: ["1 M106 SP 107mm Mtr", "2 recon CFV", "1 Redeye Team + 1 Jeep"],
      },
      { label: "3 Tank Companies", times: 3, lines: ["3 MBT"] },
    ]),
    f("tank-83", "Tank Battalion", [1983, 2015], [
      { label: "Base", lines: ["1 recon CFV", "1 SP Mortar"] },
      { label: "4 Tank Companies", times: 4, lines: ["3 MBT"] },
    ]),
    f("mech-73", "Mechanized Infantry Battalion", [1973, 1983], [
      {
        label: "Base",
        lines: [
          "1 Jeep w/106mm RR || 1 M113 TOW (M150)",
          "2 M125 SP 81mm Mtr",
          "1 M106 SP 107mm Mtr",
          "1 Redeye Team + 1 Jeep",
          "2 recon CFV",
        ],
      },
      { label: "3 Mechanized Infantry Companies", times: 3, lines: ["3 Infantry Rifle + 3 M113"] },
      { label: "1 AT Company", lines: ["3 M113 TOW (M150) || 3 Jeep w/106mm RR"] },
    ]),
    f("mech-83", "Mechanized Infantry Battalion", [1983, 2015], [
      { label: "Base", lines: ["1 recon CFV", "1 SP Mortar"] },
      { label: "1 AT Company", lines: ["3 M901 ITV"] },
      { label: "4 Mech Infantry Companies", times: 4, lines: ["3 Mech Infantry + 3 IFV"] },
    ]),
    f("acr-sqn-73", "Armored Cavalry Squadron (ACR)", [1973, 1983], [
      { label: "Base", lines: ["1 M106 SP 107mm Mtr"] },
      ...cavTroops(false),
    ]),
    f("div-cav-73", "Armored Cavalry Squadron (Divisions)", [1973, 1983], [
      { label: "Base", lines: ["1 M106 SP 107mm Mtr"] },
      ...cavTroops(true),
    ]),
    f("abn-cav-73", "Armored Cavalry Squadron (Airborne Division)", [1973, 1983], [
      { label: "Base", lines: ["1 Redeye Team + 1 Jeep w/LMG", "1 81mm Mtr + 1 Jeep w/LMG"] },
      {
        label: "2 Armored Cavalry Troops",
        times: 2,
        lines: [
          "1 Jeep w/106mm RR",
          "2 recon Jeep w/HMG",
          "1 recon Infantry Rifle + 2 Jeep w/LMG",
        ],
      },
      {
        label: "1 Air Cavalry Troop",
        lines: ["1 recon Observation Helo", "1 Attack Helo", AIR_INF],
      },
    ]),
    f("air-cav-73", "Air Cavalry Squadron (Airmobile Division)", [1973, 1983], [
      { label: "Base", lines: ["1 81mm Mtr || 1 81mm Mtr + 1 Utility Helo", "1 Redeye Team"] },
      {
        label: "1 Armored Cavalry Troop",
        lines: [
          "1 Jeep w/106mm RR || 1 Jeep w/106mm RR + 1 CH-47",
          "2 recon Jeep w/HMG || 2 recon Jeep w/HMG + 2 CH-47",
          "1 recon Infantry Rifle || 1 recon Infantry Rifle + 1 Utility Helo",
        ],
      },
      {
        label: "3 Air Cavalry Troops",
        times: 3,
        lines: ["1 recon Observation Helo", "1 Attack Helo", AIR_INF],
      },
    ]),
    f("cav-sqn-83", "Armored Cavalry Squadron", [1983, 2015], [
      { label: "Base", lines: ["1 SP Mortar"] },
      { label: "3 Armored Cavalry Troops", times: 3, lines: ["3 recon CFV", "2 MBT"] },
      { label: "1 Tank Company", lines: ["3 MBT"] },
      { label: "1 ACR Artillery Battery", lines: ["2 SP155"] },
    ]),
    f(
      "div-cav-83",
      "Divisional Cavalry Squadron",
      [1983, 2015],
      [
        { label: "Base", lines: ["1 recon CFV", "2 recon M113"] },
        {
          label: "1 Attack Helicopter Company",
          lines: ["2 Attack Helo", "1 Observation Helo"],
        },
        { label: "2 Ground Troops", times: 2, lines: ["1 M125 SP 81mm Mtr", "4 recon CFV"] },
      ],
      "Only one divisional cavalry squadron is allowed.",
    ),
    f(
      "infantry-73",
      "Infantry Battalion",
      [1973, 1983],
      [
        {
          label: "Base",
          lines: [
            "1 107mm Mtr + 1 Jeep",
            "2 81mm Mtr + 2 Jeep",
            "2 Jeep w/TOW || 2 Jeep w/106mm RR",
            "1 Redeye Team + 1 Jeep",
          ],
        },
        {
          label: "3 Infantry Companies",
          times: 3,
          lines: [
            "3 Infantry Rifle || 3 Infantry Rifle + 6 Jeep || 3 Infantry Rifle + 3 Medium Truck",
          ],
        },
      ],
      "Can be made airmobile: each Jeep w/TOW or w/106mm RR in a CH-47, every other stand in a Utility Helo.",
    ),
    f("airborne-73", "Airborne Infantry Battalion", [1973, 1983], [
      {
        label: "Base",
        lines: [
          "1 recon Jeep w/HMG || 1 recon Jeep w/HMG + 1 CH-47",
          "1 107mm Mtr || 1 107mm Mtr + 1 Medium Truck || 1 107mm Mtr + 1 Jeep || 1 107mm Mtr + 1 Utility Helo",
          "1 Jeep w/TOW || 1 Jeep w/TOW + 1 CH-47",
          "2 81mm Mtr || 2 81mm Mtr + 1 Medium Truck || 2 81mm Mtr + 2 Jeep || 2 81mm Mtr + 1 Utility Helo",
        ],
      },
      {
        label: "3 Infantry Companies",
        times: 3,
        lines: [
          "3 Infantry Rifle || 3 Infantry Rifle + 3 Medium Truck || 3 Infantry Rifle + 6 Jeep || 3 Infantry Rifle + 3 Utility Helo",
        ],
      },
    ]),
    f(
      "airmobile-73",
      "Airmobile Infantry Battalion",
      [1973, 1983],
      [
        {
          label: "Base",
          lines: [
            "1 recon Jeep w/HMG",
            "1 107mm Mtr + 1 Medium Truck",
            "1 Jeep w/TOW",
            "2 81mm Mtr + 2 Jeep",
          ],
        },
        { label: "3 Infantry Companies", times: 3, lines: ["3 Infantry Rifle"] },
      ],
      "Trucks and jeeps may be swapped for helicopters to lift the whole battalion (add the Assault and Assault Support Helicopter Companies).",
    ),
    f("light-83", "Light / Airborne Infantry Battalion", [1983, 2015], [
      {
        label: "Base",
        lines: [
          "1 81mm Mtr + 1 Light Vehicle",
          "1 recon Infantry Rifle + 2 Light Vehicle",
          "1 Light AT Vehicle",
        ],
      },
      { label: "3 Light Infantry Companies", times: 3, lines: LIGHT_CO },
    ]),
    f("ibct-03", "Infantry BCT Infantry Battalion", [2003, 2015], [
      {
        label: "Base",
        lines: [
          "1 81mm Mtr + 1 Light Vehicle || 1 120mm Mtr + 1 Light Vehicle",
          "1 recon Infantry Rifle + 2 Light Vehicle",
          "2 Light AT Vehicle || 2 TOW Team + 2 Light Vehicle",
          "1 HMG Team + 1 Light Vehicle",
          "1 Mk 19 AGL + 1 Light Vehicle",
        ],
      },
      { label: "3 Light Infantry Companies", times: 3, lines: LIGHT_CO },
    ]),
    f("sbct-03", "Stryker BCT Infantry Battalion", [2003, 2006], [
      {
        label: "Base",
        lines: ["1 recon Light Vehicle", "2 M1129 Stryker SP Mtr", "1 M1134 Stryker AT"],
      },
      { label: "3 Stryker Infantry Companies", times: 3, lines: [STRYKER_ICV] },
    ]),
    f("sbct-07", "Stryker BCT Infantry Battalion", [2007, 2015], [
      {
        label: "Base",
        lines: ["1 recon Light Vehicle", "2 M1129 Stryker SP Mtr", "1 M1134 Stryker AT"],
      },
      {
        label: "3 Stryker Infantry Companies",
        times: 3,
        lines: ["1 M1128 Stryker MGS", STRYKER_ICV],
      },
    ]),
    f("sbct-cav-03", "Stryker BCT Cavalry Squadron", [2003, 2015], [
      { label: "Base", lines: ["1 M1129 Stryker SP Mtr"] },
      {
        label: "3 Stryker Cavalry Troops",
        times: 3,
        lines: ["3 recon M1127 Stryker RV w/HMG | 3 recon M1127 Stryker RV w/AGL"],
      },
    ]),
    f("hbct-cab-03", "Heavy BCT Combined Arms Battalion", [2003, 2015], [
      { label: "Base", lines: ["1 recon CFV", "1 M1064 SP 120mm Mtr"] },
      { label: "2 Mech Infantry Companies", times: 2, lines: ["3 Mech Infantry + 3 IFV"] },
      { label: "2 Tank Companies", times: 2, lines: ["3 MBT"] },
    ]),
    f("hbct-cav-03", "Heavy BCT Cavalry Squadron", [2003, 2015], [
      { label: "Base", lines: ["1 recon CFV", "1 M1064 SP 120mm Mtr"] },
      {
        label: "3 Cavalry Troops",
        times: 3,
        lines: ["1 recon CFV", "2 recon M1114 HMMWV HMG"],
      },
    ]),
  ],
  attachments: [
    { label: "Tank Company", lines: ["3 MBT"] },
    { label: "Mech Infantry Company", years: [1973, 1982], lines: ["3 Mech Infantry + 3 M113"] },
    { label: "Mech Infantry Company", years: [1983, 2015], lines: ["3 Mech Infantry + 3 IFV"] },
    { label: "Armored Cavalry Troop", lines: ["3 recon CFV", "2 MBT"] },
    { label: "Light Infantry Company", lines: LIGHT_CO },
    { label: "Stryker Infantry Company", years: [2003, 2006], lines: [STRYKER_ICV] },
    {
      label: "Stryker Infantry Company",
      years: [2007, 2015],
      lines: ["1 M1128 Stryker MGS", STRYKER_ICV],
    },
    {
      label: "Stryker Cavalry Troop",
      years: [2003, 2015],
      lines: ["3 recon M1127 Stryker RV w/HMG | 3 recon M1127 Stryker RV w/AGL"],
    },
    {
      label: "Air Defense Platoon",
      years: [1973, 1980],
      lines: ["1 M163 Vulcan || 1 Chaparral (on M730) || 1 M42 Duster"],
    },
    {
      label: "Air Defense Platoon",
      years: [1981, 1990],
      lines: ["1 M163 Vulcan || 1 Chaparral (on M730) || 1 Stinger Team + 1 Light Vehicle"],
    },
    {
      label: "Air Defense Platoon",
      years: [1991, 1997],
      lines: [
        "1 Avenger || 1 Stinger Team + 1 Light Vehicle || 1 M163 Vulcan || 1 Chaparral (on M730)",
      ],
    },
    {
      label: "Air Defense Platoon",
      years: [1998, 2015],
      lines: ["1 M6 Bradley Linebacker || 1 Avenger || 1 Stinger Team + 1 Light Vehicle"],
    },
    { label: "Attack Helicopter Company", lines: ["2 Attack Helo", "1 Observation Helo"] },
    { label: "Air Cavalry Troop", lines: ["1 Attack Helo", "2 Observation Helo"] },
    { label: "Transport Helicopter Company", lines: ["3 Transport Helo"] },
    { label: "Assault Helicopter Company", lines: ["5 Utility Helo"] },
    { label: "Assault Support Helicopter Company", lines: ["3 CH-47"] },
    {
      label: "Engineer Company",
      years: [1973, 2000],
      lines: ["3 Infantry Engineer + 3 M113", "1 M728 CEV", "1 AVLB"],
    },
    {
      label: "Engineer Company",
      years: [2001, 2015],
      lines: ["3 Infantry Engineer + 3 M113", "1 AVLB"],
    },
    { label: "ACR Artillery Battery", lines: ["2 SP155"] },
    {
      label: "Light/Airborne Light Artillery Battalion",
      years: [1973, 1989],
      lines: ["3 M102 105mm How + 3 Light Truck"],
    },
    {
      label: "Light/Airborne Light Artillery Battalion",
      years: [1990, 2002],
      lines: ["3 M119 105mm How + 3 Light Truck"],
    },
    {
      label: "Light/Airborne General Support Artillery Battalion",
      years: [1973, 1989],
      lines: ["3 M114 + 3 Light Truck"],
    },
    {
      label: "Light/Airborne General Support Artillery Battalion",
      years: [1990, 2002],
      lines: ["3 M198 155mm How + 3 Light Truck"],
    },
    {
      label: "Infantry BCT Artillery Battalion",
      years: [2003, 2015],
      lines: ["2 M119 105mm How + 2 Light Truck"],
    },
    {
      label: "Stryker BCT Artillery Battalion",
      years: [2003, 2004],
      lines: ["3 M198 155mm How + 3 Light Truck"],
    },
    {
      label: "Stryker BCT Artillery Battalion",
      years: [2005, 2015],
      lines: ["3 M777 w/ Excalibur + 3 Light Truck"],
    },
    { label: "Heavy BCT Artillery Battalion", years: [2003, 2015], lines: ["4 M109A6 w/Excalibur"] },
    { label: "Field Artillery Battalion", years: [1973, 1982], lines: ["3 SP155"] },
    { label: "Field Artillery Battalion", years: [1983, 2015], lines: ["6 SP155"] },
    { label: "Field Artillery Battery", years: [1973, 1982], lines: ["1 SP155"] },
    { label: "Field Artillery Battery", years: [1983, 2015], lines: ["2 SP155"] },
    { label: "Heavy Artillery Battalion", years: [1973, 1999], lines: ["3 M110 SP 203mm How"] },
    { label: "Heavy Artillery Battery", years: [1973, 1999], lines: ["1 M110 SP 203mm How"] },
    {
      label: "MLRS Battalion",
      years: [1984, 2015],
      lines: ["8 M270 MLRS || 8 M270 MLRS w/GMLRS"],
    },
    {
      label: "MLRS Battery",
      years: [1983, 2015],
      lines: ["2 M270 MLRS || 2 M270 MLRS w/GMLRS"],
    },
  ],
};
