import { M114 } from "./common";
import type { ArmyListSpec, FormationSpec, GroupSpec } from "../formations";

/* U.S. Marine Corps 1950–2015, Appendix E pp.360–363. Marine formations are a
   base plus 3–5 combat attachments: the Marine Amphibious Units come with their
   minimum three Rifle Companies, and the rest of the menu (tanks, AT, recon,
   helicopters, amtracs, artillery) is in the attachments. "1–4" counts are a
   choice. */

const RIFLE_50 = ["3 Marine Rifle", "1 Marine MMG Team"];
const RIFLE_63 = ["3 Marine Rifle"];
const choice = (term: string, ns: number[]) => ns.map((n) => `${n} ${term}`).join(" || ");

const mau = (
  id: string,
  years: [number, number],
  base: string[],
  rifle: string[],
): FormationSpec => ({
  id,
  name: "Marine Amphibious Unit (Infantry Bn)",
  years,
  groups: [
    { label: "Base", lines: base },
    { label: "3 Rifle Companies", times: 3, lines: rifle },
  ],
  note: "Add 0–2 more combat attachments (max 1 Tank Company), 0–2 support attachments and 0–2 artillery groups.",
});

const tankTf = (id: string, years: [number, number], base: string[]): FormationSpec => ({
  id,
  name: "Marine Tank Battalion Task Force",
  years,
  groups: [
    { label: "Base", lines: base },
    { label: "2 Tank Companies", times: 2, lines: ["3 MBT"] },
  ],
  note: "Add 1–3 combat attachments (max 1 more Tank Company), 0–2 support attachments and 0–2 artillery groups.",
});

const tiers = (label: string, rows: [[number, number], string][]): GroupSpec[] =>
  rows.map(([years, line]) => ({ label, years, lines: [line] }));

export const US_MARINES: ArmyListSpec = {
  id: "usmc",
  name: "U.S. Marine Corps",
  nation: "us",
  source: "Appendix E, U.S. Marine Corps 1950–2015 (pp.360–363)",
  roles: {
    M114,
    "Amphibious Tractor": [
      { years: [1950, 1955], options: ["LVT-3C"] },
      { years: [1956, 1960], options: ["LVT-3C", "LVTP-5"] },
      { years: [1961, 1970], options: ["LVTP-5"] },
      { years: [1971, 1978], options: ["LVTP-5", "AAV-7A1 (LVTP-7)"] },
      { years: [1979, 2015], options: ["AAV-7A1 (LVTP-7)"] },
    ],
    // The book starts at '55; the M20/75mm RR jeep covers the early years.
    "Light AT Vehicle": [
      { years: [1950, 1954], options: ["Jeep w/75mm RR"] },
      { years: [1955, 1974], options: ["Jeep w/106mm RR"] },
      { years: [1975, 1989], options: ["Jeep w/TOW"] },
      { years: [1990, 1993], options: ["M220 TOW HMMWV"] },
      { years: [1994, 1995], options: ["M220 TOW HMMWV", "M966 TOW HMMWV"] },
      { years: [1996, 2015], options: ["M220 TOW HMMWV", "M966 TOW HMMWV", "M1121 TOW HMMWV"] },
    ],
    "Light Vehicle": [
      { years: [1950, 1989], options: ["Jeep w/LMG"] },
      { years: [1990, 1993], options: ["M998 HMMWV LMG"] },
      { years: [1994, 1995], options: ["M998 HMMWV LMG", "M1025 HMMWV LMG"] },
      { years: [1996, 2015], options: ["M998 HMMWV LMG", "M1025 HMMWV LMG", "M1114 HMMWV LMG"] },
    ],
    // M103: at most one company. The M48A5 card starts in '76, so the M48A3
    // covers '70–'75.
    MBT: [
      { years: [1950, 1951], options: ["M46"] },
      { years: [1952, 1953], options: ["M46", "M47"] },
      { years: [1954, 1956], options: ["M47"] },
      { years: [1957, 1958], options: ["M103A2 (USMC only)", "M47"] },
      { years: [1959, 1963], options: ["M103A2 (USMC only)", "M48 / M48A1"] },
      { years: [1964, 1969], options: ["M103A2 (USMC only)", "M48A3"] },
      { years: [1970, 1975], options: ["M103A2 (USMC only)", "M48A3", "M48A5"] },
      { years: [1976, 1985], options: ["M48A5"] },
      { years: [1986, 1990], options: ["M60A3"] },
      { years: [1991, 2015], options: ["M1A1HA / M1A1HC"] },
    ],
    "Medium AT Vehicle": [
      { years: [1985, 2007], options: ["LAV-AT"] },
      { years: [2008, 2015], options: ["LAV-A2-AT"] },
    ],
    "Medium Helo": [
      { years: [1952, 1955], options: ["CH-21B/C Shawnee"] },
      { years: [1956, 1963], options: ["CH-21B/C Shawnee", "CH-37 Mohave"] },
      { years: [1964, 1967], options: ["CH-21B/C Shawnee", "CH-37 Mohave", "CH-46 Sea Knight"] },
      { years: [1968, 1969], options: ["CH-37 Mohave", "CH-46 Sea Knight"] },
      { years: [1970, 2015], options: ["CH-46 Sea Knight"] },
    ],
    "SP Mortar": [
      { years: [1985, 2007], options: ["LAV-M"] },
      { years: [2008, 2015], options: ["LAV-A2-M"] },
    ],
    // Marine HMG card from '85; the generic HMG Team before.
    "Marine HMG": [{ options: ["HMG Team", "Marine HMG"] }],
    Ontos: [{ options: ["M50 Ontos", "M50A1 Ontos"] }],
    "TOW Team": [{ options: ["TOW Team*"] }],
    "Attack Helo": [
      { years: [1971, 2010], options: ["AH-1W"] },
      { years: [2011, 2015], options: ["AH-1W", "AH-1Z"] },
    ],
  },
  formations: [
    mau("mau-50", [1950, 1962], ["1 81mm Mtr"], RIFLE_50),
    mau("mau-63", [1963, 1980], ["2 81mm Mtr", "2 Jeep w/106mm RR", "1 Marine Rifle", "1 Marine HMG"], RIFLE_63),
    mau(
      "mau-81",
      [1981, 1982],
      ["2 81mm Mtr", "2 Jeep w/106mm RR || 2 Light AT Vehicle", "1 Marine Rifle", "1 Marine HMG"],
      RIFLE_63,
    ),
    mau(
      "mau-83",
      [1983, 2015],
      [
        "2 81mm Mtr",
        "2 Light AT Vehicle || 2 TOW Team + 2 Light Vehicle",
        "1 Marine HMG",
        "1 Mk 19 AGL",
        "0 Amphibious Tractor || 3 Amphibious Tractor || 6 Light Vehicle",
      ],
      RIFLE_63,
    ),
    {
      id: "lai-85",
      name: "Light Armored Infantry Battalion",
      years: [1985, 2015],
      groups: [
        { label: "Base", lines: ["1 SP Mortar", "4 Medium AT Vehicle"] },
        { label: "3 Light Armored Infantry Companies", times: 3, lines: ["2 Marine Rifle + 2 LAV-25"] },
      ],
    },
    {
      id: "lar-85",
      name: "Light Armored Recon Battalion",
      years: [1985, 2015],
      groups: [
        { label: "Base", lines: ["6 Light AT Vehicle"] },
        {
          label: "3 Light Armored Recon Companies",
          times: 3,
          lines: ["3 recon LAV-25", "1 Medium AT Vehicle"],
        },
      ],
      note: "Only one of these units is available.",
    },
    tankTf("tank-60", [1960, 1969], ["2 M67 Zippo", "4 Ontos"]),
    tankTf("tank-70", [1970, 1973], ["2 M67 Zippo", "3 Jeep w/106mm RR"]),
    tankTf("tank-74", [1974, 1980], ["3 Jeep w/106mm RR"]),
    tankTf("tank-80", [1980, 1988], ["3 Jeep w/TOW"]),
    tankTf("tank-88", [1988, 2015], ["6 Light AT Vehicle"]),
  ],
  attachments: [
    // Combat attachments
    { label: "Rifle Company", years: [1950, 1962], lines: RIFLE_50 },
    { label: "Rifle Company", years: [1963, 2015], lines: RIFLE_63 },
    { label: "Tank Platoon (½)", lines: ["1 MBT"] },
    { label: "Tank Company", lines: ["3 MBT"] },
    { label: "Light Armored Infantry Company", years: [1985, 2015], lines: ["2 Marine Rifle + 2 LAV-25"] },
    ...tiers("AT Platoon (½)", [
      [[1950, 1956], "1 Light AT Vehicle"],
      [[1957, 1969], "1 Ontos || 1 Light AT Vehicle"],
      [[1970, 2015], "1 Light AT Vehicle"],
    ]),
    ...tiers("AT Company", [
      [[1950, 1956], "3 Light AT Vehicle"],
      [[1957, 1969], "3 Ontos || 3 Light AT Vehicle"],
      [[1970, 2015], "3 Light AT Vehicle"],
    ]),
    { label: "Recon Platoon (½)", lines: ["1 recon Marine Rifle"] },
    { label: "Recon Company", lines: ["3 recon Marine Rifle"] },
    {
      label: "Light Armored Recon Company",
      years: [1985, 2015],
      lines: ["3 recon LAV-25", "1 Medium AT Vehicle"],
    },
    { label: "Attack Helicopter Squadron", years: [1971, 2015], lines: [choice("Attack Helo", [1, 2, 3, 4])] },
    { label: "Heavy Helicopter Squadron", years: [1964, 2015], lines: [choice("CH-53", [1, 2, 3, 4])] },
    { label: "Medium Helicopter Squadron", years: [1952, 2015], lines: [choice("Medium Helo", [1, 2, 3])] },
    ...tiers("AA Platoon", [
      [[1968, 1980], "1 Redeye Team + 1 Light Vehicle"],
      [[1981, 1997], "1 Stinger Team + 1 Light Vehicle"],
      [[1998, 2015], "1 LAV-AD || 1 Stinger Team + 1 Light Vehicle"],
    ]),
    // Support attachments
    { label: "Engineering Platoon", lines: ["1 Marine Engineer", "0 Bulldozer || 1 Bulldozer"] },
    {
      label: "Engineering Company",
      lines: ["3 Marine Engineer", "0 Bulldozer || 1 Bulldozer || 2 Bulldozer"],
    },
    { label: "Amtrac Unit", lines: [choice("Amphibious Tractor", [3, 6, 10])] },
    // Artillery support groups
    ...tiers("Light Artillery Battalion", [
      [[1950, 1989], "3 M101 105mm How + 3 Light Truck"],
      [[1990, 2015], "3 M119 105mm How + 3 Light Truck"],
    ]),
    ...tiers("Light Artillery Battery", [
      [[1950, 1989], "1 M101 105mm How + 1 Light Truck"],
      [[1990, 2015], "1 M119 105mm How + 1 Light Truck"],
    ]),
    ...tiers("Direct Support Artillery Battalion", [
      [[1950, 1982], "3 M114 + 3 Light Truck"],
      [[1983, 2004], "6 M198 155mm How + 6 Light Truck"],
      [[2005, 2006], "6 M777 155mm How + 6 Light Truck"],
      [[2007, 2015], "6 M777 w/ Excalibur + 6 Light Truck"],
    ]),
    ...tiers("Direct Support Artillery Battery", [
      [[1950, 1982], "1 M114 + 1 Light Truck"],
      [[1983, 2004], "2 M198 155mm How + 2 Light Truck"],
      [[2005, 2006], "2 M777 155mm How + 2 Light Truck"],
      [[2007, 2015], "2 M777 w/ Excalibur + 2 Light Truck"],
    ]),
    ...tiers("General Support Artillery Battalion", [
      [[1963, 1973], "3 M109 SP 155mm How"],
      [[1974, 1983], "3 M109A1-4 SP 155mm How"],
      [[1984, 1992], "6 M109A1-4 SP 155mm How"],
      [[1993, 2006], "6 M109A6 SP 155mm How"],
      [[2007, 2015], "6 M109A6 w/Excalibur"],
    ]),
    ...tiers("General Support Artillery Battery", [
      [[1963, 1973], "1 M109 SP 155mm How"],
      [[1974, 1983], "1 M109A1-4 SP 155mm How"],
      [[1984, 1992], "2 M109A1-4 SP 155mm How"],
      [[1993, 2006], "2 M109A6 SP 155mm How"],
      [[2007, 2015], "2 M109A6 w/Excalibur"],
    ]),
    ...tiers("General Support Heavy Artillery Battery", [
      [[1950, 1977], "1 M115 203mm How + 1 Medium Truck"],
      [[1978, 1999], "1 M110 SP 203mm How"],
    ]),
    {
      label: "General Support Rocket Battery",
      years: [2005, 2015],
      lines: ["1 HIMARS || 1 HIMARS w/GMLRS"],
    },
    ...tiers("Towed Mortar Battery", [
      [[1950, 1961], "1 107mm Mtr"],
      [[1962, 1970], "1 M98 Howtar || 1 107mm Mtr"],
      [[1971, 1990], "1 107mm Mtr"],
      [[1991, 2015], "1 107mm Mtr || 1 120mm Mtr"],
    ]),
  ],
};
