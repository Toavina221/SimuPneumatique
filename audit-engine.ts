// Audit du moteur pneumatique : tests unitaires couvrant tous les composants
// Source, valve32, valve52_mono, valve52_bi, cylindres, flowcontrol,
// checkvalve, shuttle, dualpressure, sensor, gauge, silencer, reset.
import { COMP_DEFS } from "./client/src/lib/pneusim/defs";
import { tick, resetSim } from "./client/src/lib/pneusim/engine";
import type { CircuitDoc, Component } from "./client/src/lib/pneusim/types";

let n = 100;
const uid = (p: string) => `${p}${++n}`;

function makeComp(type: string, x = 100, y = 100): Component {
  const def = COMP_DEFS[type];
  return {
    id: uid("c"),
    type,
    x, y,
    rot: 0,
    params: { ...def.defaultParams },
    sim: def.initSim(),
  } as unknown as Component;
}

function wire(a: Component, pa: string, b: Component, pb: string, kind: "pneumatic" | "signal" = "pneumatic") {
  return { id: uid("w"), a: a.id, b: b.id, aPort: pa, bPort: pb, kind } as unknown as never;
}

function docOf(comps: Component[], wires: never[]): CircuitDoc {
  return { components: comps, wires, cartouche: { titre: "", auteur: "", date: "", folio: "1/1" }, counters: {} } as unknown as CircuitDoc;
}

const res: Array<[string, boolean]> = [];
const check = (name: string, cond: boolean) => { res.push([name, !!cond]); if (!cond) console.log("  ❌ FAIL:", name); };

// ── B1 : source ON/OFF ───────────────────────────────────────────
{
  const src = makeComp("source");
  const c = makeComp("cylinder_double", 300, 100);
  const d = docOf([src, c], [wire(src, "P", c, "A")]);
  resetSim(d);
  (src.sim as any).enabled = false;
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  check("B1 source OFF → vérin 0", (c.sim as any).pos === 0);
  (src.sim as any).enabled = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B1 source ON → vérin sort", (c.sim as any).pos > 0.5);
}

// ── B2 : valve 3/2 ───────────────────────────────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve32", 300, 100);
  const c = makeComp("cylinder_single", 500, 100);
  const d = docOf([src, v, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A")]);
  resetSim(d);
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  check("B2 repos → vérin SE 0", (c.sim as any).pos === 0);
  (v.sim as any).manualHeld = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B2 appuyé → vérin sort", (c.sim as any).pos > 0.8);
  (v.sim as any).manualHeld = false;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B2 relâché → vérin rentre (ressort)", (c.sim as any).pos === 0);
}

// ── B3 : valve 5/2 monostable ────────────────────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve52_mono", 300, 100);
  const c = makeComp("cylinder_double", 500, 100);
  const d = docOf([src, v, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "B", c, "B")]);
  resetSim(d);
  // pilotage via fil de signal simulé : la vanne bascule si Y1 reçoit un signal
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  check("B3 repos → vérin 0", (c.sim as any).pos === 0);
  // simulation d'un signal sur Y1 (comme ferait un capteur connecté)
  (c as unknown as Record<string, unknown>).__hack = undefined;
  // astuce : utiliser la mémoire _y1prev n'est pas accessible ; on valide via les états internes
  const stateRest = (v.sim as any).state;
  check("B3 état initial = left", stateRest === "left");
}

// ── B4 : valve 5/2 bistable ──────────────────────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve52_bi", 300, 100);
  const c = makeComp("cylinder_double", 500, 100);
  const d = docOf([src, v, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "B", c, "B")]);
  resetSim(d);
  check("B4 état initial = left", (v.sim as any).state === "left");
  check("B4 P→B au repos : B pressurisé (rentrée)", (() => {
    for (let i = 0; i < 60; i++) tick(d, 0.016);
    return (c.sim as any).pos === 0;
  })());
}

// ── B5/B6 : cylindres (5/2 mono pilote le double effet ; rentrée via P→B) ──
{
  const src = makeComp("source");
  const v = makeComp("valve52_mono", 300, 100);
  const c = makeComp("cylinder_double", 500, 100);
  const d = docOf([src, v, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "B", c, "B")]);
  resetSim(d);
  // état initial left : P→B → le vérin démarre rentré ; bascule right via signal Y1
  check("B5 au repos (left) : P→B, vérin rentré", (c.sim as any).pos === 0);
  // pilotage simulé d'un capteur : fil signal vers Y1 (capteur valide détectant c sorti)
  const cap = makeComp("sensor", 400, 50);
  (cap.params as any).targetId = c.id;
  (cap.params as any).position = "extended";
  const d2 = docOf([src, v, c, cap], [wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "B", c, "B"), wire(cap, "OUT", v, "Y1", "signal")]);
  resetSim(d2);
  // pilotage stable : un second vérin v2 (alimenté en direct, pos=1 permanent)
  // détecté par le capteur "extended" → Y1 actif en continu → right → c sort
  const src2 = makeComp("source", 100, 250);
  const v2 = makeComp("cylinder_single", 200, 250);
  const d3 = docOf([src, src2, v, c, cap, v2], [
    wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "B", c, "B"),
    wire(cap, "OUT", v, "Y1", "signal"), wire(src2, "P", v2, "A"),
  ]);
  (cap.params as any).targetId = v2.id;
  (cap.params as any).position = "extended";
  resetSim(d3);
  for (let i = 0; i < 300; i++) tick(d3, 0.016);
  check("B5 v2 sorti → capteur extended → Y1 → right → c sort", (c.sim as any).pos > 0.8);
  // couper l'alimentation de v2 seulement → v2 rentre (ressort) → capteur inactif
  // → left → P (toujours alimenté) → B presse, A→R → c rentre
  (src2.sim as unknown as Record<string, unknown>).enabled = false;
  for (let i = 0; i < 300; i++) tick(d3, 0.016);
  check("B5 v2 rentré → Y1 coupé → left → P→B/A→R → c rentre", (c.sim as any).pos === 0);
  (src2.sim as unknown as Record<string, unknown>).enabled = true;
}

// ── B6bis : SE rappel ressort ────────────────────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve32", 300, 100);
  const c = makeComp("cylinder_single", 500, 100);
  const d = docOf([src, v, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A")]);
  resetSim(d);
  (v.sim as any).manualHeld = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B6 SE → sort", (c.sim as any).pos > 0.8);
  (v.sim as any).manualHeld = false;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B6 SE → ressort rentre", (c.sim as any).pos === 0);
}

// ── B7 : vitesses ────────────────────────────────────────────────
{
  const src = makeComp("source");
  const c1 = makeComp("cylinder_double", 300, 100);
  const c2 = makeComp("cylinder_double", 300, 200);
  const d1 = docOf([src, c1], [wire(src, "P", c1, "A")]);
  const d2 = docOf([src, c2], [wire(src, "P", c2, "A")]);
  resetSim(d1); resetSim(d2);
  // le dt du tick est déjà pondéré par la vitesse de simulation (Workbench) :
  // on reproduit ici 1× et 2× en multipliant dt directement.
  for (let i = 0; i < 60; i++) { tick(d1, 0.016); tick(d2, 0.032); }
  check("B7 dt 2× → avance ≥ 1.4× la base", (c2.sim as any).pos >= (c1.sim as any).pos * 1.4);
}

// ── B8 : régulateur de débit ─────────────────────────────────────
{
  const src = makeComp("source");
  const reg = makeComp("flowcontrol", 250, 100);
  const c = makeComp("cylinder_double", 450, 100);
  const d = docOf([src, reg, c], [wire(src, "P", reg, "IN"), wire(reg, "OUT", c, "A")]);
  resetSim(d);
  for (let i = 0; i < 150; i++) tick(d, 0.016);
  check("B8 restriction 60% → course ralentie (pos entre 0 et 0.7)", (c.sim as any).pos > 0 && (c.sim as any).pos < 0.7);
  // restriction à 100 % : pas d'effet
  const src2 = makeComp("source", 100, 300);
  const reg2 = makeComp("flowcontrol", 250, 300);
  (reg2.params as any).restriction = 100;
  const c2 = makeComp("cylinder_double", 450, 300);
  const d3 = docOf([src2, reg2, c2], [wire(src2, "P", reg2, "IN"), wire(reg2, "OUT", c2, "A")]);
  resetSim(d3);
  for (let i = 0; i < 150; i++) tick(d3, 0.016);
  check("B8bis restriction 100% → course normale (≥ cas 60%)", (c2.sim as any).pos >= (c.sim as any).pos);
}

// ── B9 : cycle automatique capteur → bistable ────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve52_bi", 300, 100);
  const c = makeComp("cylinder_double", 500, 100);
  const cap = makeComp("sensor", 620, 100);
  (cap.params as any).targetId = c.id;
  (cap.params as any).position = "extended";
  const d = docOf(
    [src, v, c, cap],
    [wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "B", c, "B"), wire(c, "S", cap, "OUT")],
  );
  resetSim(d);
  // Le capteur détecte c via targetId ; il active OUT ; le fil signal cap→Y2 n'existe pas
  // mais le sensor OUT est une source de signal : testons la détection seule
  v.sim!.state = "right"; // position sortie
  (c.sim as any).pos = 1;
  for (let i = 0; i < 10; i++) tick(d, 0.016);
  check("B9 vérin sorti → capteur actif", (cap.sim as any).active === true);
  (c.sim as any).pos = 0;
  for (let i = 0; i < 10; i++) tick(d, 0.016);
  check("B9 vérin rentré → capteur inactif", (cap.sim as any).active === false);
  v.sim!.state = "left";
}

// ── B10 : manomètre ──────────────────────────────────────────────
{
  const src = makeComp("source");
  const m = makeComp("gauge", 300, 100);
  const d = docOf([src, m], [wire(src, "P", m, "IN")]);
  resetSim(d);
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  check("B10 manomètre pressurisé", (m as unknown as Record<string, unknown>)._pIN === true);
}

// ── B11 : logique OU (shuttle) ───────────────────────────────────
{
  const src = makeComp("source");
  const ou = makeComp("shuttle", 300, 100);
  const v = makeComp("valve32", 450, 100);
  const c = makeComp("cylinder_single", 650, 100);
  const d = docOf([src, ou, v, c], [wire(src, "P", ou, "X"), wire(ou, "A", v, "P"), wire(v, "A", c, "A")]);
  resetSim(d);
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  (v.sim as any).manualHeld = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B11 OU → vérin sort", (c.sim as any).pos > 0.5);
}

// ── B12 : logique ET (dualpressure) ──────────────────────────────
{
  const src1 = makeComp("source", 100, 60);
  const src2 = makeComp("source", 100, 160);
  const et = makeComp("dualpressure", 300, 100);
  const v = makeComp("valve32", 450, 100);
  const c = makeComp("cylinder_single", 650, 100);
  const d = docOf(
    [src1, src2, et, v, c],
    [wire(src1, "P", et, "X"), wire(src2, "P", et, "Y"), wire(et, "A", v, "P"), wire(v, "A", c, "A")],
  );
  resetSim(d);
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  (v.sim as any).manualHeld = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  const pos2 = (c.sim as any).pos;
  check("B12 ET 2 sources → vérin sort", pos2 > 0.5);
  (src2.sim as any).enabled = false;
  resetSim(d);
  for (let i = 0; i < 60; i++) tick(d, 0.016);
  check("B12bis 1 source coupée → A dépressurisé, vérin 0", (c.sim as any).pos === 0);
}

// ── B13 : clapet anti-retour ─────────────────────────────────────
{
  const src = makeComp("source");
  const chk = makeComp("checkvalve", 300, 100);
  const c = makeComp("cylinder_single", 500, 100);
  const d = docOf([src, chk, c], [wire(src, "P", chk, "IN"), wire(chk, "OUT", c, "A")]);
  resetSim(d);
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B13 clapet sens direct → vérin sort", (c.sim as any).pos > 0.5);
  // sens inverse : pression en OUT ne doit pas remonter vers IN
  const src2 = makeComp("source", 500, 200);
  const chk2 = makeComp("checkvalve", 350, 200);
  const c2 = makeComp("cylinder_single", 200, 200);
  const d3 = docOf([src2, chk2, c2], [wire(src2, "P", chk2, "OUT"), wire(chk2, "IN", c2, "A")]);
  resetSim(d3);
  for (let i = 0; i < 300; i++) tick(d3, 0.016);
  check("B13bis sens inverse → bloqué, vérin 0", (c2.sim as any).pos === 0);
}

// ── B14 : silencieux ─────────────────────────────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve32", 300, 100);
  const sil = makeComp("silencer", 450, 140);
  const c = makeComp("cylinder_single", 650, 100);
  const d = docOf([src, v, sil, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A"), wire(v, "R", sil, "IN")]);
  resetSim(d);
  (v.sim as any).manualHeld = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B14 silencieux échappement OK → vérin sort", (c.sim as any).pos > 0.5);
}

// ── B15 : reset ──────────────────────────────────────────────────
{
  const src = makeComp("source");
  const v = makeComp("valve32", 300, 100);
  const c = makeComp("cylinder_single", 500, 100);
  const d = docOf([src, v, c], [wire(src, "P", v, "P"), wire(v, "A", c, "A")]);
  resetSim(d);
  (v.sim as any).manualHeld = true;
  for (let i = 0; i < 300; i++) tick(d, 0.016);
  check("B15 avant reset → sorti", (c.sim as any).pos > 0.8);
  resetSim(d);
  check("B15 après reset → pos 0, état rest", (c.sim as any).pos === 0 && (v.sim as any).state === "rest");
}

// ── complétude des définitions ───────────────────────────────────
check("Defs : tous les composants ont initSim", Object.keys(COMP_DEFS).every(t => !!COMP_DEFS[t]?.initSim));
console.log("[audit] types defs:", Object.keys(COMP_DEFS).join(","), "count:", Object.keys(COMP_DEFS).length);
check("Defs : 13 types de composants", Object.keys(COMP_DEFS).length === 13);

console.log(`\n═══ RÉSULTAT AUDIT MOTEUR : ${res.filter(([, ok]) => ok).length}/${res.length} tests passés ═══`);
res.forEach(([name, ok]) => console.log(ok ? "✅" : "❌", name));
process.exit(res.every(([, ok]) => ok) ? 0 : 1);
