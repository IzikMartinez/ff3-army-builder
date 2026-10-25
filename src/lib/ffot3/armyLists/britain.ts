import { NATO_SP155 } from "./common";
import type { ArmyListSpec, FormationSpec } from "../formations";

/* British Army 1980s+, Appendix E pp.312–313. Gazelle is a French card and the
   American-built artillery comes from the US catalog. The FH-70 has no card;
   the generic 155mm How stands in. */

const armouredRegiment = (years: [number, number], perSquadron: number): FormationSpec => ({
  id: `armoured-${years[0]}`,
  name: "Armoured Regiment",
  years,
  groups: [
    { label: "Base", lines: ["2 recon FV101 Scorpion", "1 FV438 Swingfire"] },
    { label: "4 Armoured Squadrons", times: 4, lines: [`${perSquadron} MBT`] },
  ],
});

export const BRITISH_ARMY: ArmyListSpec = {
  id: "british-army",
  name: "British Army",
  nation: "baor",
  fallback: ["us", "france", "canada"],
  source: "Appendix E, British Army 1980s+ (pp.312–313)",
  roles: {
    // The FV101 card ends in 1995; Scimitars take over its slots.
    "FV101 Scorpion": [{ options: ["FV107 Scimitar", "FV101 Scorpion"] }],
    "Javelin Team": [{ options: ["Blowpipe Team", "Javelin Team"] }],
    SP155: NATO_SP155,
    APC: [{ options: ["FV603 Saracen", "AT105 Saxon APC"] }],
    "Armoured Car": [{ options: ["FV701 Ferret Scout Car", "FV721 Fox"] }],
    IFV: [{ options: ["FV432 APC", "FV510 Warrior"] }],
    MBT: [{ options: ["Chieftain*", "Challenger 1*", "Challenger 2"] }],
    "Army Aviation": [{ options: ["Gazelle", "Lynx"] }],
    FH70: [{ options: ["155mm How"] }],
  },
  formations: [
    armouredRegiment([1980, 1990], 4),
    armouredRegiment([1990, 2015], 3),
    {
      id: "armoured-infantry",
      name: "Armoured Infantry Battalion",
      years: [1980, 2015],
      groups: [
        {
          label: "Base",
          lines: [
            "2 recon FV101 Scorpion",
            "2 FV-432 Mortar Carrier",
            "2 FV103 Spartan || 2 FV432 APC + 2 Milan Team",
          ],
        },
        { label: "3 Armoured Infantry Companies", times: 3, lines: ["3 IFV + 3 Infantry"] },
      ],
    },
    {
      id: "recce-baor-80",
      name: "Armoured Recce Regiment (BAOR)",
      years: [1980, 1985],
      groups: [
        { label: "2 Medium Recce Squadrons", times: 2, lines: ["4 recon FV101 Scorpion"] },
        { label: "1 Close Recce Squadron", lines: ["10 recon FV107 Scimitar"] },
      ],
    },
    {
      id: "recce-baor-85",
      name: "Armoured Recce Regiment (BAOR)",
      years: [1985, 2015],
      groups: [
        {
          label: "4 Medium Recce Squadrons",
          times: 4,
          lines: ["4 recon FV107 Scimitar", "1 recon FV102 Striker"],
        },
      ],
    },
    {
      id: "recce-uk-80",
      name: "Armoured Recce Regiment (UK)",
      years: [1980, 1985],
      groups: [
        {
          label: "2 Medium Recce Squadrons",
          times: 2,
          lines: ["2 recon FV107 Scimitar", "2 recon FV101 Scorpion"],
        },
        { label: "1 Close Recce Squadron", lines: ["5 recon FV721 Fox"] },
      ],
    },
    {
      id: "recce-uk-85",
      name: "Armoured Recce Regiment (UK)",
      years: [1985, 2015],
      groups: [
        {
          label: "3 Medium Recce Squadrons",
          times: 3,
          lines: ["2 recon FV107 Scimitar", "2 recon FV101 Scorpion"],
        },
        { label: "1 Guided Weapons Squadron", lines: ["3 FV102 Striker"] },
      ],
    },
    {
      id: "light-infantry",
      name: "Light Infantry Battalion",
      years: [1980, 2015],
      groups: [
        { label: "Base", lines: ["2 81mm Mtr + 2 Light Truck", "1 Milan Team + 1 Light Truck"] },
        { label: "3 Infantry Companies", times: 3, lines: ["3 Infantry"] },
      ],
    },
    {
      id: "motorised-infantry",
      name: "Motorised Infantry Battalion",
      years: [1980, 2015],
      groups: [
        { label: "4 Motorised Infantry Companies", times: 4, lines: ["3 Infantry + 3 APC"] },
        {
          label: "1 Heavy Weapons Company",
          lines: ["1 81mm Mtr + 1 Light Truck", "2 Milan Team + 2 Light Truck", "1 Armoured Car"],
        },
      ],
    },
    {
      id: "reserve-infantry",
      name: "Infantry Battalion (Reserve)",
      years: [1980, 2015],
      groups: [
        { label: "4 Reserve Infantry Companies", times: 4, lines: ["3 Infantry + 3 Light Truck"] },
        {
          label: "1 Heavy Weapons Company",
          lines: [
            "1 81mm Mtr + 1 Light Truck",
            "2 Milan Team + 2 Light Truck",
            "1 Assault Pioneer + 1 Medium Truck",
          ],
        },
      ],
    },
  ],
  attachments: [
    { label: "Armoured Squadron", years: [1980, 1990], lines: ["4 MBT"] },
    { label: "Armoured Squadron", years: [1990, 2015], lines: ["3 MBT"] },
    { label: "Armoured Infantry Company", lines: ["3 IFV + 3 Infantry"] },
    { label: "Medium Recce Squadron (BAOR)", years: [1980, 1985], lines: ["4 recon FV101 Scorpion"] },
    {
      label: "Medium Recce Squadron (BAOR)",
      years: [1985, 2015],
      lines: ["4 recon FV107 Scimitar", "1 recon FV102 Striker"],
    },
    { label: "Close Recce Troop (BAOR)", years: [1980, 1985], lines: ["2 recon FV107 Scimitar"] },
    {
      label: "Medium Recce Squadron (UK)",
      lines: ["2 recon FV107 Scimitar", "2 recon FV101 Scorpion"],
    },
    { label: "Reserve Infantry Company", lines: ["3 Infantry + 3 Light Truck"] },
    { label: "Army Air Corps Squadron", lines: ["2 Army Aviation"] },
    { label: "LLAD Battery", lines: ["2 Javelin Team + 2 FV103 Spartan"] },
    {
      label: "Rapier Battery",
      lines: ["2 Tracked Rapier SP SAM || 2 Towed Rapier SAM + 2 Medium Truck"],
    },
    { label: "SP Artillery Regiment", lines: ["6 Abbot"] },
    { label: "SP Field Artillery Battery", lines: ["3 SP155"] },
    { label: "Towed Artillery Regiment (FH-70)", lines: ["3 FH70 + 3 Medium Truck"] },
    { label: "Heavy Regiment", lines: ["4 M110 SP 203mm How || 4 M107 SP 175mm How"] },
    { label: "MLRS Battery", lines: ["2 M270 MLRS"] },
  ],
};
