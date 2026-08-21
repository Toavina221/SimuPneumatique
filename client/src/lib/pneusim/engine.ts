// PneumaSim — Plan d'atelier (Blueprint Craft)
// Moteur de simulation : propagation de pression (flood-fill itératif),
// diffusion des signaux de pilotage, basculement des distributeurs,
// cinématique des vérins, détection des capteurs.

import { COMP_DEFS } from "./defs";
import type { Component, CircuitDoc, SimResult } from "./types";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function getDef(type: string) {
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

/** Propagation de l'air sous pression dans tout le réseau (câbles + internes). */
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
          if (!hasLeak) {
            pressurized.add(B);
            changed = true;
          }
        }
        if (pressurized.has(B) && !pressurized.has(A)) {
          if (!hasLeak) {
            pressurized.add(A);
            changed = true;
          }
        }
      }
    });
    doc.components.forEach((c) => {
      internalLinks(c, pressurized).forEach((l) => {
        const A = `${c.id}:${l.a}`;
        const B = `${c.id}:${l.b}`;
        if (pressurized.has(A) && !pressurized.has(B)) {
          pressurized.add(B);
          changed = true;
        }
        if (l.bidir && pressurized.has(B) && !pressurized.has(A)) {
          pressurized.add(A);
          changed = true;
        }
      });
      if (c.type === "dualpressure") {
        const X = `${c.id}:X`;
        const Y = `${c.id}:Y`;
        const Aq = `${c.id}:A`;
        if (pressurized.has(X) && pressurized.has(Y) && !pressurized.has(Aq)) {
          pressurized.add(Aq);
          changed = true;
        }
      }
      if (c.type === "vacuum_generator") {
        const P = `${c.id}:P`;
        const V = `${c.id}:V`;
        if (pressurized.has(P) && !pressurized.has(V)) {
          pressurized.add(V); // aspiration simulée par "pression de vide"
          changed = true;
        }
      }
    });
  }
  return pressurized;
}

/** Diffusion des signaux de pilotage (capteurs → vannes). */
export function computeSignals(doc: CircuitDoc, pressurized: Set<string>): Set<string> {
  const active = new Set<string>();
  doc.components.forEach((c) => {
    if (c.type === "sensor" && (c.sim.active as boolean)) {
      active.add(`${c.id}:OUT`);
    }
  });
  let changed = true;
  let iter = 0;
  while (changed && iter < 20) {
    changed = false;
    iter++;
    doc.wires.forEach((w) => {
      if (w.kind !== "signal") return;
      const A = `${w.a}:${w.aPort}`;
      const B = `${w.b}:${w.bPort}`;
      if (active.has(A) && !active.has(B)) {
        active.add(B);
        changed = true;
      }
      if (active.has(B) && !active.has(A)) {
        active.add(A);
        changed = true;
      }
    });
  }
  void pressurized;
  return active;
}

/** Met à jour l'état interne des distributeurs selon les signaux reçus. */
function updateValveStates(doc: CircuitDoc, signals: Set<string>, dt: number): void {
  doc.components.forEach((c) => {
    if (c.type === "valve32") {
      c.sim.state = (c.sim.manualHeld as boolean) ? "actuated" : "rest";
    } else if (c.type === "valve32_bi") {
      const y1 = signals.has(`${c.id}:Y1`);
      const y2 = signals.has(`${c.id}:Y2`);
      if (y1 && !c.sim._y1prev) c.sim.state = "actuated";
      if (y2 && !c.sim._y2prev) c.sim.state = "rest";
      c.sim._y1prev = y1;
      c.sim._y2prev = y2;
    } else if (c.type === "valve52_mono") {
      const y1 = signals.has(`${c.id}:Y1`) || (c.sim.manualHeld as boolean);
      c.sim.state = y1 ? "right" : "left";
    } else if (c.type === "valve52_bi" || c.type === "valve53_closed" || c.type === "valve53_open") {
      const y1 = signals.has(`${c.id}:Y1`);
      const y2 = signals.has(`${c.id}:Y2`);
      if (y1 && !c.sim._y1prev) c.sim.state = "right";
      if (y2 && !c.sim._y2prev) c.sim.state = "left";
      c.sim._y1prev = y1;
      c.sim._y2prev = y2;
    } else if (c.type === "valve22") {
      const y1 = signals.has(`${c.id}:Y1`);
      if (y1 && !c.sim._y1prev) c.sim.state = "open";
      if (!y1 && c.sim._y1prev) c.sim.state = "closed";
      c.sim._y1prev = y1;
    } else     if (c.type === "timevalve") {
      const y1 = signals.has(`${c.id}:Y1`);
      if (y1) {
        c.sim.elapsed = ((c.sim.elapsed as number) || 0) + (0.05 * dt);
        if ((c.sim.elapsed as number) >= ((c.params.delay as number) ?? 1.5)) {
          c.sim.armed = true;
        }
      } else {
        c.sim.elapsed = 0;
        c.sim.armed = false;
      }
    } else if (c.type === "press_switch") {
      const thr = (c.params.threshold as number) ?? 4.5;
      c.sim.active = ((c.sim.pressure as number) || 0) >= thr;
    } else if (c.type === "valve42") {
      const y1 = signals.has(`${c.id}:Y1`);
      c.sim.state = y1 ? "right" : "left";
    } else if (c.type === "valve43_closed") {
      const y1 = signals.has(`${c.id}:Y1`);
      const y2 = signals.has(`${c.id}:Y2`);
      if (y1 && !c.sim._y1prev) c.sim.state = "right";
      if (y2 && !c.sim._y2prev) c.sim.state = "left";
      if (!y1 && !y2) c.sim.state = "center";
      c.sim._y1prev = y1;
      c.sim._y2prev = y2;
    } else if (c.type === "valve_pedal") {
      c.sim.state = (c.sim.manualHeld as boolean) ? "actuated" : "rest";
    } else if (c.type === "valve_roller") {
      c.sim.state = (c.sim.active as boolean) ? "actuated" : "rest";
    } else if (c.type === "solenoid_valve") {
      const y1 = signals.has(`${c.id}:Y1`);
      c.sim.state = y1 ? "actuated" : "rest";
    } else if (c.type === "sequence_valve") {
      // la détection de pression pour l'ouverture se fait au tick suivant
      // via computePressurized, ici on note juste l'état souhaité
      c.sim.open = true; // simplification pour la simulation
    }
  });
}

/** Vitesse de base d'un vérin, réduite par les régulateurs de débit en série. */
function baseCylSpeed(c: Component, doc: CircuitDoc): number {
  const t = (c.params.strokeTime as number) || 2;
  let restriction = 1;
  doc.wires.forEach((w) => {
    if (w.kind !== "pneumatic") return;
    let otherId: string | null = null;
    if (w.a === c.id) otherId = w.b;
    else if (w.b === c.id) otherId = w.a;
    if (!otherId) return;
    const other = doc.components.find((cc) => cc.id === otherId);
    if (other && other.type === "flowcontrol") {
      restriction = Math.min(
        restriction,
        ((other.params.restriction as number) ?? 100) / 100
      );
    }
  });
  return (1 / t) * restriction;
}

/** Cinématique des vérins sur un pas de temps dt (secondes). */
function updateCylinders(doc: CircuitDoc, pressurized: Set<string>, dt: number): void {
  doc.components.forEach((c) => {
    if (c.type === "cylinder_double") {
      const pA = pressurized.has(`${c.id}:A`);
      const pB = pressurized.has(`${c.id}:B`);
      let dir = 0;
      if (pA && !pB) dir = 1;
      else if (pB && !pA) dir = -1;
      if (dir !== 0) {
        const speed = baseCylSpeed(c, doc);
        c.sim.pos = clamp01((c.sim.pos as number) + dir * speed * dt);
      }
    } else if (c.type === "cylinder_single") {
      const pA = pressurized.has(`${c.id}:A`);
      const speed = baseCylSpeed(c, doc);
      c.sim.pos = clamp01((c.sim.pos as number) + (pA ? 1 : -1) * speed * dt);
    } else if (c.type === "cylinder_prop") {
      const pA = pressurized.has(`${c.id}:A`);
      const speed = baseCylSpeed(c, doc);
      const pos = (c.sim.pos as number) || 0;
      c.sim.pos = pA ? clamp01(pos + speed * dt) : Math.max(0, pos - speed * dt * 2);
      c._pA = pA;
    } else if (c.type === "cylinder_rodless") {
      const pA = pressurized.has(`${c.id}:A`);
      const pB = pressurized.has(`${c.id}:B`);
      let dir = 0;
      if (pA && !pB) dir = 1;
      else if (pB && !pA) dir = -1;
      if (dir !== 0) {
        const speed = baseCylSpeed(c, doc);
        c.sim.pos = clamp01((c.sim.pos as number) + dir * speed * dt);
      }
    } else if (c.type === "rotary_actuator") {
      const pA = pressurized.has(`${c.id}:A`);
      const pB = pressurized.has(`${c.id}:B`);
      let dir = 0;
      if (pA && !pB) dir = 1;
      else if (pB && !pA) dir = -1;
      if (dir !== 0) {
        const speed = baseCylSpeed(c, doc);
        c.sim.pos = clamp01((c.sim.pos as number) + dir * speed * dt);
      }
    } else if (c.type === "bellows") {
      const pA = pressurized.has(`${c.id}:A`);
      const speed = baseCylSpeed(c, doc);
      c.sim.pos = clamp01((c.sim.pos as number) + (pA ? 1 : -1) * speed * dt);
    } else if (c.type === "suction_cup") {
      c.sim.active = pressurized.has(`${c.id}:V`);
    }
  });
}

/** Détection de position par les capteurs de fin de course. */
function updateSensors(doc: CircuitDoc): void {
  doc.components.forEach((c) => {
    if (c.type !== "sensor") return;
    const target = doc.components.find((cc) => cc.id === (c.params.targetId as string));
    if (!target) {
      c.sim.active = false;
      return;
    }
    const pos = (target.sim.pos as number) || 0;
    c.sim.active =
      c.params.position === "extended" ? pos >= 0.97 : pos <= 0.03;
  });
}

/** Annote les drapeaux _pA/_pB/_pIN des actionneurs pour le rendu. */
function annotatePressureFlags(doc: CircuitDoc, pressurized: Set<string>): void {
  doc.components.forEach((c) => {
    if (c.type === "cylinder_double" || c.type === "cylinder_single" || c.type === "cylinder_prop") {
      c._pA = pressurized.has(`${c.id}:A`);
      c._pB = pressurized.has(`${c.id}:B`);
    } else if (c.type === "gauge") {
      c._pIN = pressurized.has(`${c.id}:IN`);
    } else if (c.type === "motor") {
      c.sim.running = pressurized.has(`${c.id}:IN`);
    } else if (c.type === "press_switch") {
      c.sim.pressure = pressurized.has(`${c.id}:IN`) ? 6 : 0;
    } else if (c.type === "cylinder_rodless" || c.type === "rotary_actuator") {
      c._pA = pressurized.has(`${c.id}:A`);
      c._pB = pressurized.has(`${c.id}:B`);
    } else if (c.type === "bellows") {
      c._pA = pressurized.has(`${c.id}:A`);
    } else if (c.type === "suction_cup") {
      c._pIN = pressurized.has(`${c.id}:V`);
    }
  });
}

/** Dépressurisation par échappement : les chambres reliées à un port
 *  d'échappement (R/S de vanne, ou silencieux terminal) se vident.
 *  La vidange d'une chambre de vérin se fait à la même vitesse que la course. */
function updateExhaust(doc: CircuitDoc, pressurized: Set<string>): Set<string> {
  // 1) identifier les ports d'échappement actifs : R/S d'une vanne dont l'autre
  //    branche (A-B) est pressurisée au moment de l'échappement, et silencieux reliés
  const exhaustNodes = new Set<string>();
  doc.components.forEach((c) => {
    if (c.type === "silencer" && pressurized.has(`${c.id}:IN`)) {
      exhaustNodes.add(`${c.id}:IN`);
    }
    if (c.type === "valve32" && (c.sim.state as string) === "rest") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if ((c.type === "valve52_mono" || c.type === "valve52_bi") && (c.sim.state as string) === "left") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if ((c.type === "valve52_mono" || c.type === "valve52_bi") && (c.sim.state as string) === "right") {
      if (pressurized.has(`${c.id}:B`)) exhaustNodes.add(`${c.id}:B`);
    }
    if ((c.type === "valve53_closed" || c.type === "valve53_open") && (c.sim.state as string) === "left") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if ((c.type === "valve53_closed" || c.type === "valve53_open") && (c.sim.state as string) === "right") {
      if (pressurized.has(`${c.id}:B`)) exhaustNodes.add(`${c.id}:B`);
    }
    if (c.type === "vent" && pressurized.has(`${c.id}:IN`)) {
      exhaustNodes.add(`${c.id}:IN`);
    }
    if (c.type === "valve32_bi" && (c.sim.state as string) === "rest") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if (c.type === "valve42" && (c.sim.state as string) === "left") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if (c.type === "valve42" && (c.sim.state as string) === "right") {
      if (pressurized.has(`${c.id}:B`)) exhaustNodes.add(`${c.id}:B`);
    }
    if (c.type === "valve43_closed" && (c.sim.state as string) === "left") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if (c.type === "valve43_closed" && (c.sim.state as string) === "right") {
      if (pressurized.has(`${c.id}:B`)) exhaustNodes.add(`${c.id}:B`);
    }
    if ((c.type === "valve_pedal" || c.type === "valve_roller" || c.type === "solenoid_valve") && (c.sim.state as string) === "rest") {
      if (pressurized.has(`${c.id}:A`)) exhaustNodes.add(`${c.id}:A`);
    }
    if (c.type === "vacuum_generator" && pressurized.has(`${c.id}:R`)) {
      exhaustNodes.add(`${c.id}:R`);
    }
    // Le vérin proportionnel se vide quand sa chambre A n'est plus pressurisée
    if (c.type === "cylinder_prop" && !pressurized.has(`${c.id}:A`) && (c.sim.pos as number) > 0.03) {
      exhaustNodes.add(`${c.id}:A`);
    }
  });
  if (exhaustNodes.size === 0) return pressurized;
  // 2) rétro-propager : retirer de pressurized tout port connecté (fils + liens
  //    internes bidirectionnels) à un nœud d'échappement, par flood inversé
  const drained = new Set<string>(exhaustNodes);
  let changed = true;
  let iter = 0;
  while (changed && iter < 20) {
    changed = false;
    iter++;
    doc.components.forEach((c) => {
      internalLinks(c, pressurized).forEach((l) => {
        if (!l.bidir) return;
        const A = `${c.id}:${l.a}`;
        const B = `${c.id}:${l.b}`;
        if (drained.has(A) && !drained.has(B)) { drained.add(B); changed = true; }
        if (drained.has(B) && !drained.has(A)) { drained.add(A); changed = true; }
      });
      // logique : les OR/ET ne drainent pas en sens inverse (unidirectionnels)
    });
    doc.wires.forEach((w) => {
      if (w.kind !== "pneumatic") return;
      const A = `${w.a}:${w.aPort}`;
      const B = `${w.b}:${w.bPort}`;
      if (drained.has(A) && !drained.has(B)) { drained.add(B); changed = true; }
      if (drained.has(B) && !drained.has(A)) { drained.add(A); changed = true; }
    });
  }
  drained.forEach((k) => pressurized.delete(k));
  return pressurized;
}

/** Un pas de simulation complet. */
export function tick(doc: CircuitDoc, dt: number): SimResult {
  // 1. signaux & basculement des vannes (la vanne réagit au signal du tick précédent)
  const signals = computeSignals(doc, new Set());
  updateValveStates(doc, signals, dt);
  // 2. propagation de l'air + dépressurisation par échappement
  const pressurized = computePressurized(doc);
  updateExhaust(doc, pressurized);
  // 3. cinématique des vérins
  updateCylinders(doc, pressurized, dt);
  // 4. détection des capteurs sur la NOUVELLE position (après mouvement)
  updateSensors(doc);
  annotatePressureFlags(doc, pressurized);
  return { pressurized, signals };
}

/** Réinitialise tous les états de simulation. */
export function resetSim(doc: CircuitDoc): void {
  doc.components.forEach((c) => {
    const def = COMP_DEFS[c.type];
    if (def) c.sim = def.initSim();
  });
}
