// PneumaSim — Plan d'atelier (Blueprint Craft)
// Moteur de simulation : propagation de pression (flood-fill itératif),
// diffusion des signaux de pilotage, basculement des distributeurs,
// cinématique des vérins, détection des capteurs.

import { COMP_DEFS } from "./defs";
import type { Component, CircuitDoc, SimResult, CompDef } from "./types";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function getDef(type: string): CompDef | undefined {
  return COMP_DEFS[type];
}

function internalLinks(
  c: Component,
  pressurized: Set<string>
): { a: string; b: string; bidir: boolean }[] {
  const st = c.sim.state as string;
  switch (c.type) {
    case "valve32":
      return st === "actuated" ? [{ a: "P", b: "A", bidir: true }] : [{ a: "A", b: "R", bidir: true }];
    case "valve52_mono":
    case "valve52_bi":
      return st === "right"
        ? [
            { a: "P", b: "A", bidir: true },
            { a: "B", b: "S", bidir: true },
          ]
        : [
            { a: "P", b: "B", bidir: true },
            { a: "A", b: "R", bidir: true },
          ];
    case "flowcontrol":
      return [{ a: "IN", b: "OUT", bidir: true }];
    case "checkvalve":
      return [{ a: "IN", b: "OUT", bidir: false }];
    case "shuttle":
      return [
        { a: "X", b: "A", bidir: false },
        { a: "Y", b: "A", bidir: false },
      ];
    case "valve32_bi":
      return st === "actuated" ? [{ a: "P", b: "A", bidir: true }] : [{ a: "A", b: "R", bidir: true }];
    case "valve53_closed":
      return st === "right"
        ? [
            { a: "P", b: "A", bidir: true },
            { a: "B", b: "S", bidir: true },
          ]
        : st === "left"
          ? [
              { a: "P", b: "B", bidir: true },
              { a: "A", b: "R", bidir: true },
            ]
          : [];
    case "valve53_open":
      return st === "right"
        ? [
            { a: "P", b: "A", bidir: true },
            { a: "B", b: "S", bidir: true },
          ]
        : st === "left"
          ? [
              { a: "P", b: "B", bidir: true },
              { a: "A", b: "R", bidir: true },
            ]
          : [
              { a: "P", b: "R", bidir: false },
              { a: "A", b: "S", bidir: false },
              { a: "B", b: "S", bidir: false },
            ];
    case "valve22":
      return st === "open" ? [{ a: "P", b: "A", bidir: true }] : [];
    case "timevalve":
      return (c.sim.armed as boolean) ? [{ a: "IN", b: "OUT", bidir: true }] : [];
    case "frl":
    case "filter":
    case "lubricator":
    case "dryer":
      return [{ a: "IN", b: "OUT", bidir: true }];
    case "quickexhaust": {
      const pIN = pressurized.has(`${c.id}:IN`);
      return pIN ? [{ a: "IN", b: "A", bidir: true }] : [{ a: "A", b: "R", bidir: true }];
    }
    case "valve42":
      return st === "right"
        ? [
            { a: "P", b: "A", bidir: true },
            { a: "B", b: "R", bidir: true },
          ]
        : [
            { a: "P", b: "B", bidir: true },
            { a: "A", b: "R", bidir: true },
          ];
    case "valve43_closed":
      return st === "right"
        ? [
            { a: "P", b: "A", bidir: true },
            { a: "B", b: "R", bidir: true },
          ]
        : st === "left"
          ? [
              { a: "P", b: "B", bidir: true },
              { a: "A", b: "R", bidir: true },
            ]
          : [];
    case "valve_pedal":
    case "valve_roller":
    case "solenoid_valve":
      return st === "actuated" ? [{ a: "P", b: "A", bidir: true }] : [{ a: "A", b: "R", bidir: true }];
    case "sequence_valve":
      return (c.sim.open as boolean) ? [{ a: "IN", b: "OUT", bidir: true }] : [];
    case "vacuum_generator":
      return [{ a: "P", b: "R", bidir: false }];
    default:
      return [];
  }
}

export function computePressurized(doc: CircuitDoc): Set<string> {
  const pressurized = new Set<string>();
  doc.components.forEach((c) => {
    if (c.type === "source" && (c.sim.enabled as boolean)) {
      if (c.fault !== "block") pressurized.add(`${c.id}:P`);
    }
  });
  let changed = true;
  let iter = 0;
  while (changed && iter < 40) {
    changed = false;
    iter++;
    doc.wires.forEach((w) => {
      if (w.kind !== "pneumatic") return;
      const A = `${w.a}:${w.aPort}`;
      const B = `${w.b}:${w.bPort}`;
      const compA = doc.components.find(c => c.id === w.a);
      const compB = doc.components.find(c => c.id === w.b);
      const hasLeak = compA?.fault === "leak" || compB?.fault === "leak";
      const hasBlock = compA?.fault === "block" || compB?.fault === "block";
      if (!hasBlock) {
        if (pressurized.has(A) && !pressurized.has(B)) {
          if (!hasLeak) { pressurized.add(B); changed = true; }
        }
        if (pressurized.has(B) && !pressurized.has(A)) {
          if (!hasLeak) { pressurized.add(A); changed = true; }
        }
      }
    });
    doc.components.forEach((c) => {
      internalLinks(c, pressurized).forEach((l) => {
        const A = `${c.id}:${l.a}`;
        const B = `${c.id}:${l.b}`;
        if (pressurized.has(A) && !pressurized.has(B)) { pressurized.add(B); changed = true; }
        if (l.bidir && pressurized.has(B) && !pressurized.has(A)) { pressurized.add(A); changed = true; }
      });
      if (c.type === "dualpressure") {
        const X = `${c.id}:X`; const Y = `${c.id}:Y`; const Aq = `${c.id}:A`;
        if (pressurized.has(X) && pressurized.has(Y) && !pressurized.has(Aq)) { pressurized.add(Aq); changed = true; }
      }
      if (c.type === "vacuum_generator") {
        const P = `${c.id}:P`; const V = `${c.id}:V`;
        if (pressurized.has(P) && !pressurized.has(V)) { pressurized.add(V); changed = true; }
      }
    });
  }
  return pressurized;
}

export function computeSignals(doc: CircuitDoc, pressurized: Set<string>): Set<string> {
  const active = new Set<string>();
  doc.components.forEach((c) => {
    if (c.type === "sensor" && (c.sim.active as boolean)) active.add(`${c.id}:OUT`);
  });
  let changed = true;
  let iter = 0;
  while (changed && iter < 20) {
    changed = false;
    iter++;
    doc.wires.forEach((w) => {
      if (w.kind !== "signal") return;
      const A = `${w.a}:${w.aPort}`; const B = `${w.b}:${w.bPort}`;
      if (active.has(A) && !active.has(B)) { active.add(B); changed = true; }
      if (active.has(B) && !active.has(A)) { active.add(A); changed = true; }
    });
  }
  return active;
}

function updateValveStates(doc: CircuitDoc, signals: Set<string>, dt: number): void {
  doc.components.forEach((c) => {
    if (c.type === "valve32") c.sim.state = (c.sim.manualHeld as boolean) ? "actuated" : "rest";
    else if (c.type === "valve32_bi") {
      const y1 = signals.has(`${c.id}:Y1`); const y2 = signals.has(`${c.id}:Y2`);
      if (y1 && !c.sim._y1prev) c.sim.state = "actuated";
      if (y2 && !c.sim._y2prev) c.sim.state = "rest";
      c.sim._y1prev = y1; c.sim._y2prev = y2;
    } else if (c.type === "valve52_mono") {
      const y1 = signals.has(`${c.id}:Y1`) || (c.sim.manualHeld as boolean);
      c.sim.state = y1 ? "right" : "left";
    } else if (c.type === "valve52_bi" || c.type === "valve53_closed" || c.type === "valve53_open") {
      const y1 = signals.has(`${c.id}:Y1`); const y2 = signals.has(`${c.id}:Y2`);
      if (y1 && !c.sim._y1prev) c.sim.state = "right";
      if (y2 && !c.sim._y2prev) c.sim.state = "left";
      c.sim._y1prev = y1; c.sim._y2prev = y2;
    } else if (c.type === "valve22") {
      const y1 = signals.has(`${c.id}:Y1`);
      if (y1 && !c.sim._y1prev) c.sim.state = "open";
      if (!y1 && c.sim._y1prev) c.sim.state = "closed";
      c.sim._y1prev = y1;
    } else if (c.type === "timevalve") {
      const y1 = signals.has(`${c.id}:Y1`);
      if (y1) {
        c.sim.elapsed = ((c.sim.elapsed as number) || 0) + (0.05 * dt);
        if ((c.sim.elapsed as number) >= ((c.params.delay as number) ?? 1.5)) c.sim.armed = true;
      } else { c.sim.elapsed = 0; c.sim.armed = false; }
    } else if (c.type === "press_switch") {
      const thr = (c.params.threshold as number) ?? 4.5;
      c.sim.active = ((c.sim.pressure as number) || 0) >= thr;
    } else if (c.type === "valve42") {
      const y1 = signals.has(`${c.id}:Y1`); c.sim.state = y1 ? "right" : "left";
    } else if (c.type === "valve43_closed") {
      const y1 = signals.has(`${c.id}:Y1`); const y2 = signals.has(`${c.id}:Y2`);
      if (y1 && !c.sim._y1prev) c.sim.state = "right";
      if (y2 && !c.sim._y2prev) c.sim.state = "left";
      if (!y1 && !y2) c.sim.state = "center";
      c.sim._y1prev = y1; c.sim._y2prev = y2;
    } else if (c.type === "valve_pedal") c.sim.state = (c.sim.manualHeld as boolean) ? "actuated" : "rest";
    else if (c.type === "valve_roller") c.sim.state = (c.sim.active as boolean) ? "actuated" : "rest";
    else if (c.type === "solenoid_valve") {
      const y1 = signals.has(`${c.id}:Y1`); c.sim.state = y1 ? "actuated" : "rest";
    } else if (c.type === "sequence_valve") c.sim.open = true;
  });
}

function updateCylinders(doc: CircuitDoc, pressurized: Set<string>, dt: number): void {
  doc.components.forEach((c) => {
    const t = (c.params.strokeTime as number) || 2;
    const speed = 1 / t;
    if (c.type === "cylinder_double" || c.type === "cylinder_rodless" || c.type === "rotary_actuator") {
      const pA = pressurized.has(`${c.id}:A`); const pB = pressurized.has(`${c.id}:B`);
      let dir = 0; if (pA && !pB) dir = 1; else if (pB && !pA) dir = -1;
      if (dir !== 0) c.sim.pos = clamp01((c.sim.pos as number) + dir * speed * dt);
    } else if (c.type === "cylinder_single" || c.type === "bellows") {
      const pA = pressurized.has(`${c.id}:A`);
      c.sim.pos = clamp01((c.sim.pos as number) + (pA ? 1 : -1) * speed * dt);
    } else if (c.type === "cylinder_prop") {
      const pA = pressurized.has(`${c.id}:A`);
      const pos = (c.sim.pos as number) || 0;
      c.sim.pos = pA ? clamp01(pos + speed * dt) : Math.max(0, pos - speed * dt * 2);
    } else if (c.type === "suction_cup") c.sim.active = pressurized.has(`${c.id}:V`);
  });
}

function updateSensors(doc: CircuitDoc): void {
  doc.components.forEach((c) => {
    if (c.type !== "sensor") return;
    const target = doc.components.find((cc) => cc.id === (c.params.targetId as string));
    if (!target) { c.sim.active = false; return; }
    const pos = (target.sim.pos as number) || 0;
    c.sim.active = c.params.position === "extended" ? pos >= 0.97 : pos <= 0.03;
  });
}

function annotatePressureFlags(doc: CircuitDoc, pressurized: Set<string>): void {
  doc.components.forEach((c) => {
    if (c.type.startsWith("cylinder")) { c._pA = pressurized.has(`${c.id}:A`); c._pB = pressurized.has(`${c.id}:B`); }
    else if (c.type === "gauge") c._pIN = pressurized.has(`${c.id}:IN`);
    else if (c.type === "motor") c.sim.running = pressurized.has(`${c.id}:IN`);
    else if (c.type === "press_switch") c.sim.pressure = pressurized.has(`${c.id}:IN`) ? 6 : 0;
  });
}

export function tick(doc: CircuitDoc, dt: number): SimResult {
  updateValveStates(doc, new Set(), dt);
  const pressurized = computePressurized(doc);
  const signals = computeSignals(doc, pressurized);
  updateValveStates(doc, signals, dt);
  updateCylinders(doc, pressurized, dt);
  updateSensors(doc);
  annotatePressureFlags(doc, pressurized);
  return { pressurized, signals };
}

export function resetSim(doc: CircuitDoc): void {
  doc.components.forEach((c) => {
    const def = COMP_DEFS[c.type];
    if (def) c.sim = def.initSim();
  });
}
