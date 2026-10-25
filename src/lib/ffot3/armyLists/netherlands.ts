import { NATO_SP155 } from "./common";
import type { ArmyListSpec } from "../formations";

/* Dutch Army 1980s+, Appendix E p.316. Leopard 2s are West German cards; the
   M113 and US-built artillery American. The Armored Battalion's two company
   options are separate formations. */

export const DUTCH_ARMY: ArmyListSpec = {
  id: "dutch-army",
  name: "Dutch Army",
  nation: "netherlands",
  fallback: ["west-germany", "us"],
  source: "Appendix E, Dutch Army (Netherlands) 1980s+ (p.316)",
  roles: {
    SP155: NATO_SP155,
    APC: [{ options: ["M113, M113A1", "YPR-765"] }],
    "AT Vehicle": [{ options: ["YP-408 PW-AT", "YPR-765 PR-AT"] }],
    "New MBT": [{ options: ["Leopard 2A1-2A3", "Leopard 2A4", "Leopard 2A6"] }],
    "Old MBT": [{ options: ["Leopard 1", "Leopard 1-V"] }],
    "Towed 120mm Mortar": [{ options: ["120mm Mtr"] }],
  },
  formations: [
    {
      id: "mech-infantry",
      name: "Mechanized Infantry Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["1 AT Vehicle", "1 Towed 120mm Mortar + 1 APC"] },
        { label: "3 Mech Infantry Companies", times: 3, lines: ["3 Infantry + 3 APC"] },
      ],
    },
    {
      id: "armored-old",
      name: "Armored Battalion (Leopard 1)",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["1 recon Lynx"] },
        { label: "3 Armored Companies", times: 3, lines: ["3 Old MBT"] },
      ],
    },
    {
      id: "armored-new",
      name: "Armored Battalion (Leopard 2)",
      years: [1981, 2015],
      groups: [
        { label: "Base", lines: ["1 recon Lynx"] },
        { label: "3 Armored Companies", times: 3, lines: ["4 New MBT"] },
      ],
    },
    {
      id: "recon",
      name: "Recon Battalion",
      years: [1980, 2015],
      groups: [{ label: "3 Recon Companies", times: 3, lines: ["3 recon Lynx"] }],
    },
  ],
  attachments: [
    { label: "Mechanized Infantry Company", lines: ["3 Infantry + 3 APC"] },
    { label: "Armored Company", lines: ["3 Old MBT || 4 New MBT"] },
    { label: "Recon Company", lines: ["3 recon Lynx"] },
    { label: "Field Artillery Battalion", lines: ["3 SP155"] },
    { label: "Heavy Artillery Battalion", lines: ["3 M110 SP 203mm How || 3 M107 SP 175mm How"] },
    { label: "Heavy Artillery Battery", lines: ["1 M110 SP 203mm How"] },
    { label: "Towed Howitzer Battalion", lines: ["3 M198 155mm How + 3 Medium Truck"] },
    { label: "MLRS Battery", lines: ["1 M270 MLRS"] },
  ],
};
