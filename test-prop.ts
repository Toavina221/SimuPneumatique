// Test du vérin proportionnel : course ∝ pression, retour au relâché
import { makeEmptyDoc } from "./client/src/lib/pneusim/useCircuit";
import { getDef, tick, computePressurized } from "./client/src/lib/pneusim/engine";

const doc = makeEmptyDoc("test-prop");

const src = {
  id: "c_1", type: "source", x: 0, y: 0, rot: 0, num: "P1",
  params: {}, sim: getDef("source").initSim(),
};
const valve = {
  id: "c_2", type: "valve32", x: 100, y: 0, rot: 0, num: "V1",
  params: {}, sim: getDef("valve32").initSim(),
};
const cyl = {
  id: "c_3", type: "cylinder_prop", x: 200, y: 0, rot: 0, num: "A1",
  params: { strokeTime: 2 }, sim: getDef("cylinder_prop").initSim(),
};
doc.components.push(src, valve, cyl);
doc.wires.push(
  { id: "w_1", a: "c_1", aPort: "P", b: "c_2", bPort: "P", kind: "pneumatic" },
  { id: "w_2", a: "c_2", aPort: "A", b: "c_3", bPort: "A", kind: "pneumatic" }
);

src.sim.enabled = true;

// 1) appui court (~0.4 s) → course partielle
valve.sim.manualHeld = true;
for (let i = 0; i < 24; i++) tick(doc, 1 / 60);
console.log("appui court 0.4s -> cyl pos:", (cyl.sim.pos as number).toFixed(3));
const mid = cyl.sim.pos as number;

// 2) maintien 3 s → course quasi complète
for (let i = 0; i < 180; i++) tick(doc, 1 / 60);
console.log("maintien 3s -> cyl pos:", (cyl.sim.pos as number).toFixed(3));

// 3) relâche → retour progressif à 0
valve.sim.manualHeld = false;
for (let i = 0; i < 300; i++) tick(doc, 1 / 60);
console.log("relâché 5s -> cyl pos:", (cyl.sim.pos as number).toFixed(3));

// vérif pression A : après relâché, A est drainé
const p = computePressurized(doc);
console.log("pressurized après relâché:", [...p].join(", ") || "(vide)");

// 4) re-appui court → position intermédiaire stable
valve.sim.manualHeld = true;
for (let i = 0; i < 60; i++) tick(doc, 1 / 60);
console.log("re-appui 1s -> cyl pos:", (cyl.sim.pos as number).toFixed(3));

// résultats attendus : 0.3-0.6 (partiel), ~1.0 (quasi complet), <0.05 (vidé), 0.5-0.8
console.log("mid range check:", mid > 0.15 && mid < 0.5 ? "OK" : "FAIL");
