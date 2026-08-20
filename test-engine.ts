// Test isolé du moteur de simulation PneumaSim : source → valve32 → vérin double effet
import { makeEmptyDoc } from "./client/src/lib/pneusim/useCircuit";
import { getDef } from "./client/src/lib/pneusim/engine";
import { tick, computePressurized, resetSim } from "./client/src/lib/pneusim/engine";

const doc = makeEmptyDoc("test");

// composants
const src = {
  id: "c_1",
  type: "source",
  x: 0, y: 0, rot: 0, num: "P1",
  params: {},
  sim: getDef("source").initSim(),
};
const valve = {
  id: "c_2",
  type: "valve32",
  x: 100, y: 0, rot: 0, num: "V1",
  params: {},
  sim: getDef("valve32").initSim(),
};
const cyl = {
  id: "c_3",
  type: "cylinder_double",
  x: 200, y: 0, rot: 0, num: "A1",
  params: {},
  sim: getDef("cylinder_double").initSim(),
};
doc.components.push(src, valve, cyl);
doc.wires.push(
  { id: "w_1", a: "c_1", aPort: "P", b: "c_2", bPort: "P", kind: "pneumatic" },
  { id: "w_2", a: "c_2", aPort: "A", b: "c_3", bPort: "A", kind: "pneumatic" }
);

// simulation
src.sim.enabled = true;
console.log("valve sim avant:", JSON.stringify(valve.sim));

// 1) appui : manualHeld = true
valve.sim.manualHeld = true;
for (let i = 0; i < 300; i++) {
  tick(doc, 1 / 60);
}
console.log("valve state sous pression:", valve.sim.state, "| cyl pos:", cyl.sim.pos, "| _pA:", cyl._pA);
let p = computePressurized(doc);
console.log("pressurized:", [...p].join(", "));

// 2) relâche : manualHeld = false
valve.sim.manualHeld = false;
for (let i = 0; i < 120; i++) {
  tick(doc, 1 / 60);
}
console.log("valve state relâché:", valve.sim.state, "| cyl pos:", cyl.sim.pos);

// 3) réinitialisation
resetSim(doc);
console.log("après reset cyl pos:", cyl.sim.pos, "| valve:", valve.sim.state);
