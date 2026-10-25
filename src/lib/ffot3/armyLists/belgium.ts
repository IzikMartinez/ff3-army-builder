import { NATO_SP155 } from "./common";
import type { ArmyListSpec } from "../formations";

/* Belgian Army 1980s+, Appendix E p.311. CVR(T)s are BAOR cards, the JgPz
   Kanone and Gepard West German, the M113 and Vulcan American. */

const RECON_COMPANY = [
  "2 recon FV101 Scorpion",
  "2 recon FV107 Scimitar",
  "1 recon FV103 Spartan",
  "1 recon Infantry",
  "1 recon FV102 Striker",
];

export const BELGIAN_ARMY: ArmyListSpec = {
  id: "belgian-army",
  name: "Belgian Army",
  nation: "belgium",
  fallback: ["baor", "west-germany", "us", "france"],
  source: "Appendix E, Belgian Army 1980s+ (p.311)",
  roles: {
    // The FV101 card ends in 1995; Scimitars take over its slots.
    "FV101 Scorpion": [{ options: ["FV107 Scimitar", "FV101 Scorpion"] }],
    SP155: NATO_SP155,
    APC: [{ options: ["AMX VCI", "M113, M113A1", "AIFV-B"] }],
    MBT: [{ options: ["M47", "Leopard 1 BE upgraded", "Leopard 1 BE modernized"] }],
  },
  formations: [
    {
      id: "recon-bn",
      name: "Recon Battalion",
      years: [1980, 2015],
      groups: [{ label: "3 Recon Companies", times: 3, lines: RECON_COMPANY }],
    },
    {
      id: "mech-bn",
      name: "Mech Battalion",
      years: [1980, 2015],
      groups: [
        {
          label: "Base",
          lines: [
            "1 recon FV101 Scorpion",
            "1 recon FV107 Scimitar",
            "1 M106 SP 107mm Mtr",
            "1 Milan Team + 1 Jeep",
          ],
        },
        { label: "3 Mech Companies", times: 3, lines: ["4 APC + 4 Infantry"] },
      ],
    },
    {
      id: "tank-bn",
      name: "Tank Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["1 recon FV101 Scorpion", "1 recon FV107 Scimitar"] },
        { label: "3 Tank Companies", times: 3, lines: ["3 MBT"] },
      ],
    },
  ],
  attachments: [
    { label: "Recon Company", lines: RECON_COMPANY },
    { label: "Tank Company", lines: ["3 MBT"] },
    { label: "Mech Company", lines: ["4 APC + 4 Infantry"] },
    { label: "AT Gun Company", lines: ["3 JgPz Kanone"] },
    { label: "AT Missile Company", lines: ["3 Milan Team + 3 Jeep"] },
    {
      label: "AA Platoon",
      lines: ["1 M167 Vulcan + 1 Light Truck || 1 Gepard SP AA Gun"],
    },
    { label: "Brigade Field Artillery Battalion", lines: ["3 M108 SP 105mm How"] },
    { label: "Corps Artillery Battalion", lines: ["3 SP155"] },
    { label: "Corps Heavy Artillery Battalion", lines: ["3 M110 SP 203mm How"] },
    { label: "Corps Heavy Artillery Battery", lines: ["1 M110 SP 203mm How"] },
  ],
};
