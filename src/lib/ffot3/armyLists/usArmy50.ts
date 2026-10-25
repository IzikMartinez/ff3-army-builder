import type { ArmyListSpec, FormationSpec, GroupSpec } from "../formations";

/* U.S. Army 1950–1973, Appendix E pp.349–355. "0–1" items and optional
   transport are a "None" choice (count 0); "4–5 companies" use the lower
   figure with a note. Vietnam and National Guard variations are left to the
   picker and attachments. */

const f = (
  id: string,
  name: string,
  years: [number, number],
  groups: GroupSpec[],
  note?: string,
): FormationSpec => ({ id, name, years, groups, note });

const trucks = (n: number, who = "Infantry Rifle") =>
  `${n} ${who} || ${n} ${who} + ${n} Medium Truck`;
const AIR_INF = (who: string) => `1 ${who} + 1 UH-1 || 2 ${who} + 2 UH-1`;
const RECON_57 = [
  "2 recon Jeep w/HMG",
  "1 recon Mech Infantry + 1 M59",
  "1 recon M41 Walker Bulldog",
  "1 recon 107mm Mtr + 1 M59",
];

/** "Battalion / battery" artillery pairs with the same guns. */
const arty = (label: string, years: [number, number], guns: string, perBattalion = 3): GroupSpec[] => [
  { label: `${label} Battalion`, years, lines: [guns.replaceAll("{n}", String(perBattalion))] },
  { label: `${label} Battery`, years, lines: [guns.replaceAll("{n}", "1")] },
];

export const US_ARMY_50: ArmyListSpec = {
  id: "us-army-50",
  name: "U.S. Army 1950–1973",
  nation: "us",
  source: "Appendix E, U.S. Army 1950–1973 (pp.349–355)",
  roles: {
    APC: [
      { years: [1950, 1952], options: ["M39"] },
      { years: [1953, 1953], options: ["M39", "M75"] },
      { years: [1954, 1954], options: ["M75"] },
      { years: [1955, 1959], options: ["M75", "M59"] },
      { years: [1960, 1963], options: ["M59", "M113, M113A1"] },
      { years: [1964, 1973], options: ["M113, M113A1"] },
    ],
    M113: [{ options: ["M113, M113A1"] }],
    // Battalion heavy mortar, by period (the M84 card covers '57–'61).
    "SP 107mm Mtr": [
      { years: [1950, 1953], options: ["107mm Mtr + M39"] },
      { years: [1954, 1956], options: ["107mm Mtr + M59"] },
      { years: [1957, 1961], options: ["M84 SP 107mm Mtr"] },
      { years: [1962, 1973], options: ["M106 SP 107mm Mtr"] },
    ],
    // The Infantry Weapons card ends in '56; the HMG Team covers later years.
    "Infantry Weapons": [{ options: ["HMG Team", "Infantry Weapons"] }],
    "Gunship Helo": [
      { years: [1962, 1964], options: ["UH-1"] },
      { years: [1965, 1973], options: ["UH-1", "AH-1G HueyCobra", "AH-1F/G"] },
    ],
    "Light AT Vehicle": [
      { years: [1952, 1954], options: ["Jeep w/105mm RR"] },
      { years: [1955, 1955], options: ["Jeep w/105mm RR", "Jeep w/106mm RR"] },
      { years: [1956, 1959], options: ["Jeep w/106mm RR"] },
      { years: [1960, 1962], options: ["Jeep w/SS-11", "Jeep w/106mm RR"] },
      { years: [1963, 1964], options: ["Jeep w/SS-11", "Jeep w/ENTAC", "Jeep w/106mm RR"] },
      { years: [1965, 1969], options: ["Jeep w/ENTAC", "Jeep w/106mm RR"] },
      { years: [1970, 1972], options: ["Jeep w/ENTAC", "Jeep w/106mm RR", "Jeep w/TOW"] },
      { years: [1973, 1973], options: ["Jeep w/106mm RR", "Jeep w/TOW"] },
    ],
    // The M41 arrived in '52; the M24 Chaffee covers '50–'51.
    "Light Tank": [
      { years: [1950, 1951], options: ["M24 Chaffee"] },
      { years: [1952, 1967], options: ["M41 Walker Bulldog"] },
      { years: [1968, 1973], options: ["M41 Walker Bulldog", "M551 Sheridan", "M551A1 Sheridan"] },
    ],
    MBT: [
      { years: [1950, 1951], options: ["M4A3(76) Sherman", "M26", "M46"] },
      { years: [1952, 1953], options: ["M4A3(76) Sherman", "M26", "M46", "M47"] },
      { years: [1954, 1954], options: ["M46", "M47"] },
      { years: [1955, 1956], options: ["M47"] },
      // M103: at most one company.
      { years: [1957, 1958], options: ["M103, M103A1", "M47"] },
      { years: [1959, 1959], options: ["M103, M103A1", "M47", "M48 / M48A1"] },
      { years: [1960, 1963], options: ["M103, M103A1", "M48 / M48A1", "M60"] },
      { years: [1964, 1973], options: ["M48A3", "M60", "M60A1"] },
    ],
    // The book lists the OH-6 from '61; it entered service in '66, so the
    // OH-13 Sioux stands in for the early years.
    "Observation Helo": [
      { years: [1961, 1968], options: ["OH-13 Sioux", "OH-6"] },
      { years: [1969, 1973], options: ["OH-6", "OH-58"] },
    ],
    "Scout Vehicle": [
      { years: [1962, 1965], options: ["M114"] },
      { years: [1966, 1968], options: ["M114", "M113 ACAV"] },
      { years: [1969, 1973], options: ["M114", "M114A2 (M139)", "M113 ACAV"] },
    ],
    "SP AA Gun": [
      { years: [1950, 1954], options: ["M16 MGMC", "M19 GMC", "M42 Duster"] },
      { years: [1955, 1958], options: ["M16 MGMC", "M42 Duster"] },
      { years: [1959, 1962], options: ["M42 Duster"] },
      { years: [1963, 1973], options: ["M35 w/Quad AAG", "Chaparral (on M730)", "M163 Vulcan"] },
    ],
    "Towed AA Gun": [
      { years: [1950, 1962], options: ["M55 Quad AAG"] },
      { years: [1963, 1973], options: ["M55 Quad AAG", "Chaparral (Towed)", "M167 Vulcan"] },
    ],
    "Utility Helo": [
      { years: [1952, 1958], options: ["CH-37 Mohave"] },
      { years: [1959, 1967], options: ["CH-37 Mohave", "UH-1"] },
      { years: [1968, 1973], options: ["UH-1"] },
    ],
  },
  formations: [
    f("tank-50", "Tank Battalion", [1950, 1956], [
      { label: "Base", lines: ["1 SP 107mm Mtr || 0 SP 107mm Mtr", "1 recon Light Tank"] },
      { label: "3 Tank Companies", times: 3, lines: ["4 MBT"] },
    ]),
    f(
      "tank-57",
      "Tank Battalion, Pentomic",
      [1957, 1963],
      [
        { label: "Base", lines: ["1 SP 107mm Mtr", "2 recon Jeep w/HMG"] },
        { label: "3 Tank Companies", times: 3, lines: ["3 MBT"] },
      ],
      "Armored divisions had 3 tank companies; infantry divisions 4, later 5 (add Tank Company attachments).",
    ),
    f("tank-63", "Tank Battalion", [1963, 1973], [
      { label: "Base", lines: ["1 M106 SP 107mm Mtr", "1 M48 AVLB", "2 recon Scout Vehicle"] },
      { label: "3 Tank Companies", times: 3, lines: ["3 MBT"] },
    ]),
    f("mech-m75", "Mechanized Infantry Battalion [M75]", [1953, 1957], [
      { label: "Base", lines: ["2 recon Jeep w/HMG", "1 107mm Mtr + 1 M75"] },
      { label: "3 Mechanized Infantry Companies", times: 3, lines: ["3 Mech Infantry + 3 M75"] },
      { label: "Company AT jeeps ('56–'57)", times: 3, years: [1956, 1957], lines: ["1 Jeep w/106mm RR"] },
    ]),
    f("mech-m59", "Mechanized Infantry Battalion [M59]", [1954, 1957], [
      { label: "Base", lines: ["2 recon Jeep w/HMG", "1 SP 107mm Mtr"] },
      { label: "3 Mechanized Infantry Companies", times: 3, lines: ["3 Mech Infantry + 3 M59"] },
      { label: "Company AT jeeps ('56–'57)", times: 3, years: [1956, 1957], lines: ["1 Jeep w/106mm RR"] },
    ]),
    f(
      "mech-bg-57",
      "Mechanized Infantry Battle Group, Pentomic",
      [1957, 1963],
      [
        { label: "Base", lines: ["2 recon Jeep w/HMG", "1 SP 107mm Mtr"] },
        {
          label: "4 Mechanized Infantry Companies",
          times: 4,
          lines: ["4 Mech Infantry + 4 M59", "1 Light AT Vehicle", "1 81mm Mtr + 1 M59"],
        },
      ],
      "The book allows 4–5 companies; add a Mechanized Infantry Company attachment for the fifth.",
    ),
    f("mech-63", "Mechanized Infantry Battalion", [1963, 1973], [
      {
        label: "Base",
        lines: [
          "1 Light AT Vehicle",
          "2 M125 SP 81mm Mtr",
          "1 M106 SP 107mm Mtr",
          "2 recon Scout Vehicle",
        ],
      },
      { label: "3 Mechanized Infantry Companies", times: 3, lines: ["3 Mech Infantry + 3 M113"] },
    ]),
    f("infantry-50", "Infantry Battalion", [1950, 1957], [
      { label: "Base", lines: ["1 81mm Mtr + 1 Medium Truck", "1 Infantry Weapons + 1 Medium Truck"] },
      { label: "3 Infantry Companies", times: 3, lines: [trucks(3)] },
    ]),
    f(
      "infantry-bg-57",
      "Infantry Battle Group, Pentomic",
      [1957, 1963],
      [
        {
          label: "Base",
          lines: [
            "1 recon Jeep w/HMG",
            "1 recon M41 Walker Bulldog",
            "1 SP AA Gun",
            "2 Light AT Vehicle",
            "1 Infantry Engineer + 1 Medium Truck",
            "2 107mm Mtr + 1 Medium Truck",
          ],
        },
        {
          label: "4 Infantry Companies",
          times: 4,
          lines: [
            "4 Infantry Rifle",
            "1 81mm Mtr",
            "0 Medium Truck || 5 Medium Truck || 5 M59 || 5 UH-1",
          ],
        },
      ],
      "The book allows 4–5 companies and a 0–1 Tank Company (add them as attachments). Its base AA vehicle is the M16 MGMC.",
    ),
    f("infantry-63", "Infantry Battalion", [1963, 1973], [
      {
        label: "Base",
        lines: [
          "1 Light AT Vehicle",
          "1 107mm Mtr + 1 Medium Truck",
          "1 recon Jeep w/HMG",
          "1 recon Infantry Rifle + 1 Medium Truck",
        ],
      },
      { label: "3 Infantry Companies", times: 3, lines: [trucks(3)] },
    ], "From 1966 battalions in Vietnam added a fourth company (add an Infantry Company)."),
    f("airborne-50", "Airborne Infantry Battalion", [1950, 1957], [
      { label: "Base", lines: [trucks(1, "81mm Mtr"), trucks(1, "Infantry Weapons")] },
      { label: "3 Infantry Companies", times: 3, lines: [trucks(3)] },
    ]),
    f(
      "airborne-bg-57",
      "Airborne Battle Group, Pentomic",
      [1957, 1963],
      [
        {
          label: "Base",
          lines: [
            "2 recon Jeep w/HMG || 2 recon Jeep w/HMG + 1 CH-21B/C Shawnee",
            "3 Light AT Vehicle || 3 Light AT Vehicle + 3 CH-21B/C Shawnee",
            "1 Infantry Rifle || 1 Infantry Rifle + 1 Medium Truck || 1 Infantry Rifle + 1 Utility Helo",
            "1 Infantry Engineer || 1 Infantry Engineer + 1 Medium Truck || 1 Infantry Engineer + 1 Utility Helo",
            "2 107mm Mtr || 2 107mm Mtr + 1 Medium Truck || 2 107mm Mtr + 1 Utility Helo",
          ],
        },
        {
          label: "4 Infantry Companies",
          times: 4,
          lines: ["4 Infantry Rifle", "1 81mm Mtr", "0 Medium Truck || 5 Medium Truck || 5 Utility Helo"],
        },
      ],
      "The book allows 4–5 companies.",
    ),
    f("light-63", "Light Infantry / Airborne Battalion", [1963, 1973], [
      {
        label: "Base",
        lines: [trucks(3, "81mm Mtr"), "1 Light AT Vehicle", "1 recon Infantry Rifle || 1 recon Infantry Rifle + 1 Medium Truck"],
      },
      { label: "3 Infantry Companies", times: 3, lines: [trucks(3)] },
    ]),
    f("airmobile-63", "Airmobile Infantry Battalion", [1963, 1973], [
      {
        label: "Base",
        lines: [
          "3 81mm Mtr || 3 81mm Mtr + 3 UH-1",
          "1 Light AT Vehicle || 1 Light AT Vehicle + 1 CH-47",
          "1 recon Infantry Rifle || 1 recon Infantry Rifle + 1 UH-1",
        ],
      },
      {
        label: "3 Airmobile Infantry Companies",
        times: 3,
        lines: ["3 Infantry Rifle || 3 Infantry Rifle + 3 UH-1"],
      },
    ]),
    f("cav-50", "Armored Cavalry Squadron", [1950, 1956], [
      { label: "Base", lines: ["2 81mm Mtr + 2 Jeep w/LMG"] },
      {
        label: "3 Armored Cavalry Troops ('50–'54)",
        times: 3,
        years: [1950, 1954],
        lines: [
          "2 recon M8 Greyhound",
          "1 recon Mech Infantry + 1 Medium Truck || 1 recon Mech Infantry + 1 APC",
          "1 recon Light Tank",
        ],
      },
      {
        label: "3 Armored Cavalry Troops ('55–'56)",
        times: 3,
        years: [1955, 1956],
        lines: ["2 recon Jeep w/HMG", "1 recon Mech Infantry + 1 Medium Truck", "1 recon Light Tank"],
      },
      { label: "1 Tank Company", lines: ["3 MBT"] },
    ]),
    f("cav-armd-57", "Armored Cavalry Squadron (Armored Division / ACR), Pentomic", [1957, 1963], [
      { label: "3 Armored Cavalry Troops", times: 3, lines: RECON_57 },
      { label: "1 Aviation Company", lines: ["5 recon OH-13 Sioux", "1 recon H-19 Chickasaw"] },
      { label: "1 Engineer Company", lines: ["3 Infantry Engineer + 3 M59", "1 Bulldozer"] },
    ]),
    f("cav-inf-57", "Armored Cavalry Squadron (Infantry Division), Pentomic", [1957, 1963], [
      { label: "3 Cavalry Troops", times: 3, lines: RECON_57 },
    ]),
    f("cav-div-63", "Armored Cavalry Squadron (Divisions)", [1963, 1973], [
      { label: "Base", lines: ["2 M106 SP 107mm Mtr"] },
      {
        label: "3 Armored Cavalry Troops",
        times: 3,
        lines: ["2 recon Scout Vehicle", "2 Light Tank", "1 recon Mech Infantry + 1 M113"],
      },
      {
        label: "1 Air Cavalry Troop",
        lines: ["3 recon Observation Helo", "2 Gunship Helo", "1 Mech Infantry + 1 UH-1"],
      },
    ]),
    f("cav-acr-63", "Armored Cavalry Squadron (ACR)", [1963, 1973], [
      { label: "Base", lines: ["2 M106 SP 107mm Mtr"] },
      {
        label: "3 Armored Cavalry Troops",
        times: 3,
        lines: ["3 recon Scout Vehicle", "1 Light Tank | 1 MBT", "1 recon Mech Infantry + 1 M113"],
      },
      { label: "1 Tank Company", lines: ["3 MBT"] },
    ], "MBTs are M47 or M48A1. From 1968 a Scout Vehicle and the tank in each troop can become 2 M551s."),
    f("cav-vietnam-63", "Armored Cavalry Squadron (Vietnam ACR)", [1963, 1973], [
      { label: "Base", lines: ["2 M106 SP 107mm Mtr", "0 M132 Zippo || 1 M132 Zippo"] },
      {
        label: "3 Armored Cavalry Troops",
        times: 3,
        lines: [
          "4 recon M113 ACAV + 1 recon Mech Infantry + 1 M113 || 3 recon M113 ACAV + 2 recon Mech Infantry + 2 M113",
        ],
      },
      { label: "1 Tank Company", lines: ["3 MBT"] },
      { label: "1 ACR Artillery Battery", lines: ["1 M109 SP 155mm How"] },
    ]),
    f("cav-abn-63", "Armored Cavalry Squadron (Airborne Division)", [1963, 1973], [
      { label: "Base", lines: ["3 81mm Mtr + 3 Jeep w/LMG"] },
      {
        label: "3 Armored Cavalry Troops",
        times: 3,
        lines: ["2 recon Jeep w/HMG", "1 Light AT Vehicle", "1 recon Mech Infantry + 1 Light Truck"],
      },
      {
        label: "1 Air Cavalry Troop",
        lines: ["1 recon Observation Helo", "1 Gunship Helo", AIR_INF("Mech Infantry")],
      },
    ]),
    f("air-cav-63", "Air Cavalry Squadron (Airmobile Division)", [1963, 1973], [
      { label: "Base", lines: ["3 81mm Mtr || 3 81mm Mtr + 3 UH-1"] },
      {
        label: "1 Armored Cavalry Troop",
        lines: [
          "2 recon Jeep w/HMG + 2 CH-47",
          "1 Light AT Vehicle + 1 CH-47",
          "1 recon Infantry Rifle + 1 UH-1",
        ],
      },
      {
        label: "3 Air Cavalry Troops",
        times: 3,
        lines: ["1 recon Observation Helo", "1 Gunship Helo", AIR_INF("Infantry Rifle")],
      },
    ]),
  ],
  attachments: [
    { label: "Tank Company", lines: ["3 MBT"] },
    { label: "Light Tank Company", lines: ["3 Light Tank"] },
    { label: "Mechanized Infantry Company", years: [1950, 1955], lines: ["3 Mech Infantry + 3 APC"] },
    {
      label: "Mechanized Infantry Company",
      years: [1956, 1956],
      lines: ["3 Mech Infantry + 3 APC", "1 Jeep w/106mm RR"],
    },
    {
      label: "Mechanized Infantry Company",
      years: [1957, 1963],
      lines: ["4 Mech Infantry + 4 APC", "1 Light AT Vehicle", "1 81mm Mtr + 1 APC"],
    },
    { label: "Mechanized Infantry Company", years: [1964, 1973], lines: ["3 Mech Infantry + 3 APC"] },
    { label: "Infantry Company", years: [1950, 1956], lines: [trucks(3)] },
    { label: "Infantry Company", years: [1957, 1963], lines: [trucks(4), "1 81mm Mtr"] },
    { label: "Infantry Company", years: [1964, 1973], lines: [trucks(3)] },
    {
      label: "Air Cavalry Troop",
      years: [1963, 1973],
      lines: ["1 recon Observation Helo", "1 Gunship Helo", AIR_INF("Infantry Rifle")],
    },
    {
      label: "Armored Cavalry Troop",
      years: [1950, 1954],
      lines: [
        "2 recon M8 Greyhound",
        "1 recon Mech Infantry + 1 Medium Truck || 1 recon Mech Infantry + 1 APC",
        "1 recon Light Tank",
      ],
    },
    {
      label: "Armored Cavalry Troop",
      years: [1955, 1956],
      lines: ["2 recon Jeep w/HMG", "1 recon Mech Infantry + 1 Medium Truck", "1 recon Light Tank"],
    },
    { label: "Armored Cavalry Troop", years: [1957, 1963], lines: RECON_57 },
    {
      label: "Armored Cavalry Troop (Divisions)",
      years: [1963, 1973],
      lines: ["2 recon Scout Vehicle", "2 Light Tank", "1 recon Mech Infantry + 1 M113"],
    },
    {
      label: "Armored Cavalry Troop (ACR)",
      years: [1963, 1973],
      lines: ["3 recon Scout Vehicle", "1 Light Tank | 1 MBT", "1 recon Mech Infantry + 1 M113"],
    },
    {
      label: "Armored Cavalry Troop (Vietnam ACR)",
      years: [1963, 1973],
      lines: [
        "4 recon M113 ACAV + 1 recon Mech Infantry + 1 M113 || 3 recon M113 ACAV + 2 recon Mech Infantry + 2 M113",
      ],
    },
    {
      label: "Armored Cavalry Troop (Airborne Division)",
      years: [1963, 1973],
      lines: ["2 recon Jeep w/HMG", "1 Light AT Vehicle", "1 recon Mech Infantry + 1 Light Truck"],
    },
    {
      label: "Armored Cavalry Troop (Airmobile Division)",
      years: [1963, 1973],
      lines: [
        "2 recon Jeep w/HMG + 2 CH-47",
        "1 Light AT Vehicle + 1 CH-47",
        "1 recon Infantry Rifle + 1 UH-1",
      ],
    },
    {
      label: "Airmobile Infantry Company",
      years: [1963, 1973],
      lines: ["3 Infantry Rifle || 3 Infantry Rifle + 3 UH-1"],
    },
    { label: "Air Defense Platoon", lines: ["1 SP AA Gun || 1 Towed AA Gun + 1 Light Truck"] },
    { label: "Airborne Tank Company", years: [1953, 1969], lines: ["3 M56 Scorpion SP ATG"] },
    {
      label: "Airborne Tank Company (Vietnam)",
      years: [1965, 1971],
      lines: ["1 M56 Scorpion SP ATG", "2 Infantry Rifle + 2 M113"],
    },
    { label: "Airborne Tank Company (Sheridan)", years: [1969, 1971], lines: ["3 M551 Sheridan"] },
    { label: "Airborne Tank Company (Sheridan)", years: [1972, 1973], lines: ["3 M551A1 Sheridan"] },
    {
      label: "Aerial Rocket Artillery Company",
      years: [1963, 1973],
      lines: ["2 Observation Helo", "3 Gunship Helo"],
    },
    { label: "Assault Helicopter Company", years: [1965, 1973], lines: ["5 UH-1"] },
    {
      label: "Aviation General Support Company",
      years: [1961, 1973],
      lines: ["1 recon Observation Helo", "2 UH-1"],
    },
    {
      label: "Attack Helicopter Company",
      years: [1962, 1973],
      lines: ["2 recon Observation Helo", "4 Gunship Helo"],
    },
    { label: "Assault Support Helicopter Company", years: [1963, 1973], lines: ["3 CH-47"] },
    { label: "Heavy Helicopter Company", years: [1962, 1973], lines: ["2 CH-54 Tarhe"] },
    { label: "AVLB Platoon", years: [1958, 1973], lines: ["1 M48 AVLB"] },
    {
      label: "Engineer Company",
      lines: [
        "3 Infantry Engineer + 3 Medium Truck || 3 Infantry Engineer + 3 APC",
        "0 Bulldozer || 1 Bulldozer",
      ],
    },
    { label: "ACR Artillery Battery", years: [1950, 1956], lines: ["1 M37 HMC"] },
    { label: "ACR Artillery Battery", years: [1963, 1973], lines: ["1 M109 SP 155mm How"] },
    ...arty("Light Artillery", [1950, 1956], "{n} M101 105mm How + {n} Light Truck"),
    ...arty("Light Artillery", [1964, 1973], "{n} M102 105mm How + {n} Light Truck"),
    ...arty("Armored Light Artillery", [1950, 1953], "{n} M7 HMC Priest || {n} M37 HMC"),
    ...arty("Armored Light Artillery", [1954, 1954], "{n} M37 HMC"),
    ...arty("Armored Light Artillery", [1955, 1956], "{n} M52 SP 105mm How || {n} M37 HMC"),
    ...arty("Armored Light Artillery", [1963, 1967], "{n} M108 SP 105mm How"),
    ...arty("Field Artillery", [1950, 1956], "{n} M114 155mm How + {n} Light Truck"),
    ...arty("Field Artillery", [1964, 1973], "{n} M114 155mm How + {n} Light Truck"),
    ...arty("Armored Field Artillery", [1950, 1952], "{n} M40 GMC"),
    ...arty("Armored Field Artillery", [1953, 1956], "{n} M44 SP 155mm How"),
    ...arty("Armored Field Artillery", [1963, 1973], "{n} M109 SP 155mm How"),
    { label: "Pentomic Artillery Battalion", years: [1957, 1958], lines: ["5 M52 SP 105mm How"] },
    {
      label: "Pentomic Light Artillery Battery",
      years: [1957, 1963],
      lines: ["1 M52 SP 105mm How || 1 M101 105mm How + 1 Light Truck"],
    },
    {
      label: "Pentomic Medium Artillery Battery",
      years: [1957, 1963],
      lines: ["1 M44 SP 155mm How || 1 M114 155mm How + 1 Light Truck"],
    },
    {
      label: "Pentomic Heavy Artillery Battery",
      years: [1957, 1963],
      lines: ["1 M43 GMC || 1 M115 203mm How + 1 Medium Truck"],
    },
    ...arty("Heavy Artillery", [1950, 1956], "{n} M115 203mm How + {n} Medium Truck"),
    ...arty("Heavy Artillery", [1964, 1973], "{n} M115 203mm How + {n} Medium Truck"),
    ...arty("Armored Heavy Artillery", [1950, 1956], "{n} M43 GMC"),
    ...arty("Armored Heavy Artillery", [1963, 1973], "{n} M110 SP 203mm How"),
  ],
};
