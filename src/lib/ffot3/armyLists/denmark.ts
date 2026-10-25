import { NATO_SP155, M114 } from "./common";
import type { ArmyListSpec } from "../formations";

/* Danish Army 1980s+, Appendix E p.315. Leopards are West German cards; the
   M113 and Hughes 500 American. The optional Reserve Motorized Infantry Company
   is an attachment. */

export const DANISH_ARMY: ArmyListSpec = {
  id: "danish-army",
  name: "Danish Army",
  nation: "denmark",
  fallback: ["west-germany", "us"],
  source: "Appendix E, Danish Army 1980s+ (p.315)",
  roles: {
    SP155: NATO_SP155,
    M114,
    APC: [{ options: ["M113, M113A1", "M113A2"] }],
    MBT: [
      { options: ["Centurion Mk 5*", "M41 (Denmark)"] },
      { years: [1980, 1991], options: ["Leopard 1A3*"] },
      { years: [1992, 2015], options: ["Leopard 1A5"] },
      { years: [1998, 2015], options: ["Leopard 2*"] },
    ],
    "Towed 120mm Mortar": [{ options: ["120mm Mtr"] }],
    "SAM Team": [
      { years: [1968, 1980], options: ["Redeye Team"] },
      { years: [1981, 2015], options: ["Stinger Team"] },
    ],
  },
  formations: [
    {
      id: "tank-bn",
      name: "Tank Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["2 Jeep w/TOW || 2 Jeep w/106mm RR", "1 recon APC"] },
        { label: "2 Tank Companies", times: 2, lines: ["2 MBT"] },
        { label: "1 Mechanized Infantry Company", lines: ["3 Infantry + 3 APC"] },
      ],
    },
    {
      id: "mech-bn",
      name: "Mechanized Battalion",
      years: [1980, 2015],
      groups: [
        {
          label: "Base",
          lines: ["2 Jeep w/TOW", "1 recon APC + 1 Towed 120mm Mortar", "1 M106 SP 107mm Mtr"],
        },
        { label: "1 Tank Company", lines: ["2 MBT"] },
        { label: "2 Mechanized Infantry Companies", times: 2, lines: ["3 Infantry + 3 APC"] },
      ],
    },
    {
      id: "motorized-bn",
      name: "Motorized Battalion",
      years: [1980, 2015],
      groups: [
        {
          label: "Base",
          lines: [
            "2 Jeep w/106mm RR",
            "1 recon APC + 1 Towed 120mm Mortar",
            "1 81mm Mtr + 1 Medium Truck",
          ],
        },
        { label: "3 Motorized Infantry Companies", times: 3, lines: ["3 Infantry + 3 Medium Truck"] },
      ],
    },
  ],
  attachments: [
    { label: "Tank Company", lines: ["2 MBT"] },
    { label: "Mechanized Infantry Company", lines: ["3 Infantry + 3 APC"] },
    { label: "Reserve Motorized Infantry Company", lines: ["3 Infantry + 3 Medium Truck"] },
    { label: "Attack Helicopter Company", lines: ["3 Hughes 500 Defender"] },
    {
      label: "Air Defence Battery",
      lines: ["2 SAM Team + 2 Jeep || 1 SAM Team + 1 Jeep + 1 Towed 40mm AA Gun + 1 Medium Truck"],
    },
    { label: "Medium Howitzer Battalion", lines: ["3 M114"] },
    {
      label: "Artillery Battalion",
      lines: ["2 SP155", "1 M114 + 1 Medium Truck"],
    },
    { label: "Light Howitzer Battery", lines: ["1 M101 105mm How + 1 Light Truck"] },
  ],
};
