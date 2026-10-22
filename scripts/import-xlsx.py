"""Import infantry, artillery and generic rows from the FFT3 data spreadsheet.

Reads attachments/FFT3-VehicleArtyInf-Data-1950-v04.xlsx with the standard
library only and writes:

  src/data/infantry.json   Infantry 1950+ sheet
  src/data/artillery.json  Artillery 1950+ sheet (Generic rows: nation "generic")
  src/data/generic.json    Generic section of the Vehicles sheet (trucks, APCs…)

Rows keep the spreadsheet's nation (mapped to app ids). Nations without their
own rows get patron copies at load time (src/lib/ffot3/patrons.ts).

Usage: python3 scripts/import-xlsx.py
"""

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "attachments" / "FFT3-VehicleArtyInf-Data-1950-v04.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# Spreadsheet nation headers -> app nation ids. Unlisted nations are skipped.
NATIONS = {
    "Russia / Soviet Union / CIS": "soviets",
    "Soviets": "soviets",
    "United States": "us",
    "United Kingdom": "baor",
    "Germany": "west-germany",
    "Germany (West / United)": "west-germany",
    "France": "france",
    "Belgium": "belgium",
    "Canada": "canada",
    "Denmark": "denmark",
    "Italy": "italy",
    "Netherlands (Dutch)": "netherlands",
    "Netherlands": "netherlands",
    "Norway": "norway",
    "Czechoslovakia": "czechoslovakia",
    "Yugoslavia (former)": "yugoslavia",
    "Generic": "generic",
}

# B.13.3: point cost of one HE fire unit, 1950 onward.
MRL_FIRE_UNIT_PTS = {"light": 2, "medium": 4, "heavy": 23, "very heavy": 35}
MRL_CLASS = {
    "lt": "light", "light": "light",
    "med": "medium", "medium": "medium",
    "hvy": "heavy", "heavy": "heavy",
    "vry hvy": "very heavy", "very heavy": "very heavy",
}


def read_sheets():
    with zipfile.ZipFile(XLSX) as z:
        strings = [
            "".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t"))
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS)
        ]
        names = [s.get("name") for s in ET.fromstring(z.read("xl/workbook.xml")).find("m:sheets", NS)]
        sheets = {}
        for i, name in enumerate(names, start=1):
            rows = []
            for r in ET.fromstring(z.read(f"xl/worksheets/sheet{i}.xml")).iter(f"{{{NS['m']}}}row"):
                cells = {}
                for c in r.findall("m:c", NS):
                    v = c.find("m:v", NS)
                    if v is None:
                        continue
                    col = re.match(r"[A-Z]+", c.get("r")).group()
                    cells[col] = strings[int(v.text)] if c.get("t") == "s" else v.text
                rows.append(cells)
            sheets[name] = rows
        return sheets


def sections(rows, header_cell):
    """Yield (nation_header, row) for data rows; single-cell rows are nation headers."""
    nation = None
    for r in rows:
        if not r:
            continue
        if set(r) == {"A"}:
            nation = r["A"].strip()
            continue
        if r.get("A", "").strip() == header_cell:
            continue
        yield nation, r


def era(period):
    p = (period or "").replace("?", "").strip()
    a, _, b = p.partition("-")
    a = a.strip()
    b = b.strip() or a
    return {"start_era": a.zfill(2), "end_era": b.zfill(2)}


def num(v, default=0):
    s = (v or "").strip().replace("+", "")
    if s in ("", "-", "—"):
        return default
    if s == "½":
        return 0.5
    try:
        return float(s) if "." in s else int(s)
    except ValueError:
        return default


def move(v):
    s = (v or "").strip()
    m = re.match(r"([\d.]*)\s*([a-z]*)", s)
    value, flags = m.group(1) or "0", m.group(2)
    types = []
    if "ht" in flags:
        types.append("halftrack")
        flags = flags.replace("ht", "")
    for ch, name in (("t", "tracked"), ("w", "wheeled"), ("x", "towed")):
        if ch in flags:
            types.append(name)
    if "a" in flags:
        types.append("amphibious")
    return value, types or ["tracked"]


def armor(v):
    """'10 B 7' -> ([10, 7], soft=False, h-class letter 'B'); 's' -> soft."""
    s = (v or "").strip()
    if s in ("", "s"):
        return [0], True, None
    parts = s.split()
    vals = [0 if p == "s" else int(p) for p in parts if re.fullmatch(r"s|\d+", p)]
    letter = next((p for p in parts if re.fullmatch(r"[-A-F]", p)), None)
    return vals or [0], False, letter


def pen_list(v):
    s = (v or "").strip()
    return [p.strip() for p in s.split("/")] if s else ["-"]


def ind_range(v):
    s = (v or "").strip()
    if s in ("", "-"):
        return None
    a, _, b = s.partition("-")
    return [int(a), int(b)] if b else [0, int(a)]


def parse_mrl(notes):
    m = re.match(r"\s*([A-Za-z .]+?),\s*(\d+)\s*fire units?", notes or "")
    if not m:
        return None
    cls = MRL_CLASS.get(m.group(1).strip().lower())
    return {"class": cls, "fireUnits": int(m.group(2))} if cls else None


def vehicle_row(nation, r, name):
    move_value, move_type = move(r.get("D"))
    arm, soft, letter = armor(r.get("E"))
    notes = (r.get("R") or "").strip()
    mrl = parse_mrl(notes)
    points = r.get("C", "").strip()
    if points == "varies" and mrl:
        points = mrl["fireUnits"] * MRL_FIRE_UNIT_PTS[mrl["class"]]
    row = {
        "AI": num(r.get("I")),
        "Equip": "" if (r.get("O") or "-").strip() == "-" else r["O"].strip(),
        "Gun_Pen": pen_list(r.get("F")),
        "Gun_ROF": num(r.get("G")),
        "Gun_Rng": num(r.get("H")),
        "Name": name,
        "Points": num(str(points)),
        "era": era(r.get("B")),
        "gun_name": "" if mrl else notes,
        "move_type": move_type,
        "move_value": move_value,
        "nation": nation,
        "armor": arm,
        "armorSoft": soft,
        **({"armorH": letter} if letter else {}),
        "unlimited_missiles": (r.get("Q") or "").strip() == "u",
        "infantry_capacity": num(r.get("P")),
        "missiles": [],
        "missileRequired": False,
        "notes": notes if mrl else "",
    }
    rng = ind_range(r.get("M"))
    if rng:
        row["indirect"] = {"range": rng, "ammo": (r.get("N") or "").strip()}
        if mrl:
            row["indirect"]["mrl"] = mrl
    return row


def weapon(pen, rof, rng):
    pen = (pen or "").strip()
    if pen in ("", "-"):
        return None
    return {"pen": pen, "rof": (rof or "").strip(), "rng": (rng or "").strip()}


def infantry_row(nation, r, name):
    rof_raw = (r.get("F") or "").strip()
    rof = rof_raw.strip("()").replace(" ", "")
    ranged, _, cc = rof.partition("/")
    return {
        "kind": "infantry",
        "AI": num(r.get("E")),
        "Equip": "" if (r.get("Q") or "-").strip() == "-" else r["Q"].strip(),
        "Gun_Pen": ["-"],
        "Gun_ROF": num(ranged),
        "Gun_Rng": num(r.get("G")),
        "Name": name,
        "Points": num(r.get("C")),
        "era": era(r.get("B")),
        "gun_name": "",
        "move_type": ["leg"],
        "move_value": (r.get("D") or "0").strip(),
        "nation": nation,
        "armor": [0],
        "armorSoft": True,
        "unlimited_missiles": False,
        "infantry_capacity": 0,
        "missiles": [],
        "missileRequired": False,
        "notes": (r.get("S") or "").strip(),
        "infantry": {
            "rof": [num(ranged), num(cc)],
            "reducedOnMove": rof_raw.startswith("("),
            "size": num(r.get("R")),
            "law": weapon(r.get("H"), r.get("I"), r.get("J")),
            "maw": weapon(r.get("K"), r.get("L"), r.get("M")),
            "sam": weapon(r.get("N"), r.get("O"), r.get("P")),
        },
    }


def convert(rows, header_cell, make, keep_section=None):
    out, last_name, skipped = [], None, set()
    for header, r in sections(rows, header_cell):
        nation = NATIONS.get(header)
        if keep_section and header != keep_section:
            continue
        if not nation:
            skipped.add(header)
            continue
        raw = r.get("A") or ""
        name = raw.strip()
        if not name:
            name = last_name  # continuation row: same item, later period
        elif raw.startswith(" ") and name.startswith("[") and last_name:
            name = f"{last_name.split(' [')[0]} {name}"  # indented variant, e.g. "TOW Team [w/TOW-2A]"
        last_name = name
        out.append(make(nation, r, name))
    return out, skipped


def write(name, rows):
    path = ROOT / "src" / "data" / name
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{name}: {len(rows)} rows")


def main():
    sheets = read_sheets()
    infantry, skip_i = convert(sheets["Infantry 1950+"], "Infantry Stand Type", infantry_row)
    artillery, skip_a = convert(sheets["Artillery 1950+"], "Name", vehicle_row)
    generic, _ = convert(sheets["Vehicles,AT,AA 1950+"], "Name", vehicle_row, keep_section="Generic")
    write("infantry.json", infantry)
    write("artillery.json", artillery)
    write("generic.json", generic)
    print("skipped nations (not in app):", ", ".join(sorted(skip_i | skip_a)))


if __name__ == "__main__":
    main()
