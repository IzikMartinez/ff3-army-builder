// Validate the fantasy TOEs (src/data/*TOE.json) against the live catalog: every
// named card must exist for that nation and be in service in its year band, and
// every formation role must have equipment for every year the formation exists.
// Usage: npm run check:toe
const { createServer } = await import("vite");
const vite = await createServer({
  root: process.cwd(),
  logLevel: "error",
  server: { middlewareMode: true },
});
const c = await vite.ssrLoadModule("/src/lib/ffot3/catalog.ts");
const yr = (s) => {
  const n = parseInt(s, 10);
  return n <= 30 ? 2000 + n : 1900 + n;
};
let problems = 0;
const bad = (msg) => {
  problems++;
  console.log("  ✗ " + msg);
};
for (const file of ["ZapadoslaviaTOE", "YugoslaviaTOE"]) {
  const t = (await import(`${process.cwd()}/src/data/${file}.json`, { with: { type: "json" } }))
    .default;
  console.log(`\n== ${file}`);
  const span = new Map();
  for (const u of [
    ...c.unitsForNation(t.nation),
    ...c.TOWED_WEAPONS.filter((w) => w.nation === t.nation),
  ]) {
    const s = span.get(u.Name) ?? [9999, 0];
    span.set(u.Name, [Math.min(s[0], yr(u.era.start_era)), Math.max(s[1], yr(u.era.end_era))]);
  }
  const [P0, P1] = t.period;
  // equipment cards
  for (const [role, entries] of Object.entries(t.equipment))
    for (const e of entries) {
      const [a, b] = e.years;
      if (a < P0 || b > P1 || a > b) bad(`${role} ${a}-${b}: years outside period`);
      for (const card of e.cards) {
        const s = span.get(card);
        if (!s) bad(`${role} ${a}-${b}: no card "${card}"`);
        else if (s[0] > b || s[1] < a)
          bad(`${role} ${a}-${b}: "${card}" not in service (${s[0]}-${s[1]})`);
      }
      for (const g of e.only_for ?? []) if (!t.quality[g]) bad(`${role}: unknown group ${g}`);
    }
  // quality bands contiguous
  for (const [g, q] of Object.entries(t.quality)) {
    let y = P0;
    for (const b of q.bands) {
      if (b.years[0] !== y) bad(`quality ${g}: gap at ${y}`);
      y = b.years[1] + 1;
    }
    if (y !== P1 + 1) bad(`quality ${g}: ends ${y - 1}`);
  }
  // formations: roles defined and covered every year
  const noCard = new Set(t.roles_without_cards);
  const covered = (role, year, group) =>
    (t.equipment[role] ?? []).some(
      (e) =>
        e.years[0] <= year && year <= e.years[1] && (!e.only_for || e.only_for.includes(group)),
    );
  const rolesOf = (r) =>
    r
      .split(/ or /)
      .map((x) => x.trim())
      .map((x) => (x.endsWith(" stand") || noCard.has(x) ? x : x));
  const checkStands = (where, stands, years, group) => {
    for (const s of stands)
      for (const role of rolesOf(s.role)) {
        if (noCard.has(role)) continue;
        if (!t.equipment[role]) {
          bad(`${where}: role "${role}" undefined`);
          continue;
        }
        const [a, b] = s.years ?? years;
        const gaps = [];
        for (let y = Math.max(a, years[0]); y <= Math.min(b, years[1]); y++)
          if (!covered(role, y, group)) gaps.push(y);
        if (gaps.length)
          bad(
            `${where}: "${role}" has no equipment in ${gaps[0]}${gaps.length > 1 ? "-" + gaps.at(-1) : ""}`,
          );
      }
  };
  for (const f of t.formations) {
    if (!t.quality[f.quality]) bad(`${f.id}: unknown quality ${f.quality}`);
    for (const u of f.units) {
      if (u.battalion_1to1 && !t.battalions_1to1[u.battalion_1to1])
        bad(`${f.id}: unknown battalion ${u.battalion_1to1}`);
      checkStands(`${f.id} / ${u.name}`, u.stands, f.years, f.quality);
    }
  }
  // 1:1 battalions: check against each formation that uses them (its years and quality group).
  for (const [id, bn] of Object.entries(t.battalions_1to1)) {
    const users = t.formations.filter((f) => f.units.some((u) => u.battalion_1to1 === id));
    if (!users.length) bad(`1:1 ${id}: not used by any formation`);
    for (const f of users)
      for (const el of bn.elements)
        checkStands(`1:1 ${id} / ${el.name} (${f.id})`, el.stands, f.years, f.quality);
  }
  console.log(
    `  ${Object.keys(t.equipment).length} roles, ${t.formations.length} formations, ${Object.keys(t.battalions_1to1).length} 1:1 battalions`,
  );
}
console.log(`\n${problems} problem(s)`);
await vite.close();

process.exitCode = problems ? 1 : 0;
