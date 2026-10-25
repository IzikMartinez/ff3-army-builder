import { NATO_SP155 } from "./common";
import type { ArmyListSpec } from "../formations";

/* German (West/United) Army 1980s+, Appendix E pp.322–323. The Kraka PzAbw is
   one card with Milan and TOW options. M113s, M109 and M110 are US cards; the
   FH-70 has no card, so the generic 155mm How stands in. */

const PZGREN_COMPANY = ["3 Infantry + 3 IFV"];

export const WEST_GERMAN_ARMY: ArmyListSpec = {
  id: "west-german-army",
  name: "Bundeswehr",
  nation: "west-germany",
  fallback: ["us"],
  source: "Appendix E, German (West/United) Army 1980s+ (pp.322–323)",
  roles: {
    SP155: NATO_SP155,
    "AA Vehicle": [{ options: ["Roland SP SAM", "Gepard SP AA Gun"] }],
    APC: [{ options: ["M113, M113A1", "M113A2"] }],
    "AT Vehicle": [{ options: ["Jaguar-1", "Jaguar-2"] }],
    IFV: [{ options: ["Marder*"] }],
    MBT: [{ options: ["M48A2G2", "Leopard 1*", "Leopard 2*"] }],
    "SAM Team": [
      { years: [1968, 1980], options: ["Redeye Team"] },
      { years: [1981, 2015], options: ["Stinger Team"] },
    ],
    FH70: [{ options: ["155mm How"] }],
  },
  formations: [
    {
      id: "panzer",
      name: "Panzer Battalion",
      years: [1980, 2015],
      groups: [{ label: "3 Panzer Companies", times: 3, lines: ["3 MBT"] }],
    },
    {
      id: "mixed-panzer",
      name: "Mixed Panzer Battalion",
      years: [1980, 2015],
      groups: [
        { label: "2 Panzer Companies", times: 2, lines: ["3 MBT"] },
        { label: "1 Panzer Grenadier Company", lines: PZGREN_COMPANY },
      ],
    },
    {
      id: "panzergrenadier",
      name: "Panzer Grenadier Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["1 Panzermörser SP 120mm Mtr"] },
        { label: "3 Panzer Grenadier Companies", times: 3, lines: PZGREN_COMPANY },
      ],
    },
    {
      id: "aufklarung",
      name: "Panzer Reconnaissance Battalion",
      years: [1980, 2015],
      groups: [
        { label: "2 Heavy Recon Companies", times: 2, lines: ["2 MBT", "1 recon Luchs"] },
        { label: "1 Light Recon Company", lines: ["3 recon Luchs"] },
        { label: "1 Recon Infantry Company", lines: ["3 Infantry + 3 TPZ-1 Fuchs"] },
      ],
    },
    {
      id: "fallschirmjager",
      name: "Airborne (Fallschirmjäger) Battalion",
      years: [1980, 1989],
      groups: [
        { label: "2 Airborne Companies", times: 2, lines: ["3 Infantry", "1 Kraka PzAbw"] },
        {
          label: "2 Heavy Airborne Companies",
          times: 2,
          lines: ["1 Kraka PzAbw", "2 Kraka w/20mm"],
        },
      ],
      note: "Kraka PzAbw: Milan in the airborne companies, TOW in the heavy companies (pick on the card).",
    },
    {
      id: "jager",
      name: "Light Infantry (Jäger) Battalion",
      years: [1980, 2015],
      groups: [
        { label: "3 Jäger Companies", times: 3, lines: ["3 Infantry + 3 APC"] },
        {
          label: "1 Jäger Weapons Company",
          lines: ["2 JgPz Kanone", "1 120mm Mtr + 1 Medium Truck", "4 Milan Team + 2 APC"],
        },
      ],
    },
  ],
  attachments: [
    { label: "Airborne Mortar Platoon", years: [1980, 1989], lines: ["1 Kraka SP 120mm Mtr"] },
    { label: "Airborne AT Platoon", years: [1980, 1989], lines: ["1 Kraka PzAbw"] },
    { label: "Attack Helicopter Company", lines: ["3 BO105"] },
    { label: "Air Defence Battery", lines: ["1 AA Vehicle || 2 SAM Team + 2 TPZ-1 Fuchs"] },
    { label: "Pioneer Platoon", lines: ["1 Pioneer + 1 TPZ-1 Fuchs"] },
    { label: "Antitank (Panzerjäger) Company", lines: ["3 AT Vehicle"] },
    { label: "Brigade SP Howitzer Battalion", lines: ["3 SP155"] },
    { label: "Division Artillery Battalion (FH-70)", lines: ["3 FH70 + 3 Medium Truck"] },
    { label: "Heavy Howitzer Battery", lines: ["1 M110 SP 203mm How"] },
    { label: "Rocket Artillery Battery", lines: ["2 LARS / LARS II MRL"] },
  ],
};
