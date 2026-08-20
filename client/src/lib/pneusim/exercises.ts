// PneumaSim — Mode exercice
// Circuits incomplets à terminer par l'élève, avec validation automatique.
// Chaque exercice fournit : un énoncé, un indice, un document de départ
// (composants + quelques conduites déjà tracées) et les critères de réussite :
// - `types` : types de composants obligatoires (repères de vérification)
// - `paths` : paires de ports qui doivent être reliées (conductivité)
// La validation utilise le même principe que le moteur : union des nœuds via
// les fils et les liens internes bidirectionnels des distributeurs.

import { getDef } from "./engine";
import type { CircuitDoc, Wire } from "./types";

function newId(prefix: string, i: number) {
  return `${prefix}_${i}`;
}

function makeBase(components: Array<{ type: string; x: number; y: number; num: string; params?: Record<string, number | string> }>): {
  comps: CircuitDoc["components"];
  by: (num: string) => string;
} {
  const comps = components.map((c, i) => ({
    id: newId("c", i),
    type: c.type,
    x: c.x,
    y: c.y,
    rot: 0,
    num: c.num,
    params: c.params ?? {},
    sim: getDef(c.type)?.initSim() ?? {},
  }));
  const by = (num: string) => comps.find((c) => c.num === num)!.id;
  return { comps, by };
}

export interface ExerciseTarget {
  /** conductivité pneu obligatoire : [composantA, portA, composantB, portB] */
  paths: Array<[string, string, string, string]>;
}

export interface Exercise {
  id: string;
  num: string;
  label: string;
  description: string;
  hint: string;
  /** nombre de fils manquants approximatif, affiché en indice */
  missingCount: number;
  start: CircuitDoc;
  target: ExerciseTarget;
}

export const EXERCISES: Exercise[] = [
  // ─── Exercice 1 : le capteur débranché ─────────────────────────────
  // Bistable : tout est en place sauf le fil signal S1 → Y2. Le vérin
  // sort mais ne revient jamais : l'élève doit terminer le cycle.
  (() => {
    const { comps, by } = makeBase([
      { type: "source", x: 60, y: 420, num: "P1" },
      { type: "valve52_bi", x: 360, y: 380, num: "V1" },
      { type: "cylinder_double", x: 700, y: 320, num: "A1" },
      { type: "sensor", x: 940, y: 300, num: "S1", params: { targetId: "", position: "extended" } },
      { type: "sensor", x: 700, y: 200, num: "S2", params: { targetId: "", position: "retracted" } },
    ]);
    // câbler les cibles des capteurs et les parties déjà faites
    comps[3].params.targetId = by("A1");
    comps[4].params.targetId = by("A1");
    const wires: Wire[] = [
      { id: "w1", a: by("P1"), aPort: "P", b: by("V1"), bPort: "P", kind: "pneumatic" },
      { id: "w2", a: by("V1"), aPort: "A", b: by("A1"), bPort: "A", kind: "pneumatic" },
      { id: "w3", a: by("V1"), aPort: "B", b: by("A1"), bPort: "B", kind: "pneumatic" },
      { id: "w4", a: by("S2"), aPort: "OUT", b: by("V1"), bPort: "Y1", kind: "signal" },
      // w5 (S1 → Y2) volontairement absent : c'est l'objectif de l'exercice
    ];
    return {
      id: "capteur-debranche",
      num: "E-1",
      label: "Le capteur débranché",
      description:
        "La mémoire bistable est presque complète : le vérin sort sous l'ordre de S2, mais il ne revient jamais. Il manque la liaison du capteur de sortie vers la deuxième entrée de pilotage. Trouvez-la et branchez-la.",
      hint: "Le capteur S1 surveille le vérin sorti. Pour le faire revenir, son signal doit atteindre l'entrée Y2 du distributeur V1 (signal de pilotage pointillé).",
      missingCount: 1,
      start: { components: comps, wires, cartouche: { titre: "Exercice 1 — Mémoire bistable incomplète", auteur: "", date: "", folio: "E-1" }, counters: {} },
      target: {
        // Cible = le câblage à tracer uniquement ; les chemins traversant les
        // vannes manœuvrées au clavier (P1→A1) ne sont pas exigés.
        paths: [[by("S1"), "OUT", by("V1"), "Y2"]],
      },
    };
  })(),

  // ─── Exercice 2 : l'alimentation coupée ─────────────────────────────
  // Temporisation : le distributeur, le temporisateur et le vérin sont
  // posés, mais le temporisateur ne reçoit pas l'air. Objectif :
  // relier P1 → temporisateur, puis le cycle complet.
  (() => {
    const { comps, by } = makeBase([
      { type: "source", x: 60, y: 420, num: "P1" },
      { type: "valve32", x: 360, y: 380, num: "V1" },
      { type: "timevalve", x: 300, y: 260, num: "T1", params: { delay: 1.5 } },
      { type: "cylinder_double", x: 700, y: 240, num: "A1" },
    ]);
    const wires: Wire[] = [
      { id: "w1", a: by("P1"), aPort: "P", b: by("V1"), bPort: "P", kind: "pneumatic" },
      { id: "w2", a: by("V1"), aPort: "A", b: by("A1"), bPort: "A", kind: "pneumatic" },
      { id: "w3", a: by("V1"), aPort: "B", b: by("A1"), bPort: "B", kind: "pneumatic" },
      { id: "w4", a: by("V1"), aPort: "A", b: by("T1"), bPort: "Y1", kind: "signal" },
      { id: "w5", a: by("T1"), aPort: "OUT", b: by("A1"), bPort: "B", kind: "pneumatic" },
      // P1 → T1:IN volontairement absent : le temporisateur n'est pas alimenté
    ];
    return {
      id: "alimentation-coupee",
      num: "E-2",
      label: "L'alimentation coupée",
      description:
        "Le démarrage lent est monté mais rien ne bouge : le temporisateur n'est relié à rien. Alimentez-le depuis la source, puis appuyez sur V1 au clavier : le vérin sortira après le délai réglé.",
      hint: "Le temporisateur T1 est un composant pneumatique : il a une entrée IN (air) et une sortie OUT (air). Reliez la source P1 à l'entrée IN : après le délai, OUT pressurise B du vérin. La sortie A de V1 (déjà branchée à A du vérin) pilote le signal Y1 de T1.",
      missingCount: 1,
      start: { components: comps, wires, cartouche: { titre: "Exercice 2 — Temporisation non alimentée", auteur: "", date: "", folio: "E-2" }, counters: {} },
      target: {
        // Cible = le câblage manquant uniquement.
        paths: [[by("P1"), "P", by("T1"), "IN"]],
      },
    };
  })(),

  // ─── Exercice 3 : le raccordement complet ───────────────────────────
  // Commande directe : les trois composants sont posés mais rien n'est
  // relié. Objectif : câbler P→V→A pour piloter le vérin.
  (() => {
    const { comps, by } = makeBase([
      { type: "source", x: 100, y: 400, num: "P1" },
      { type: "valve32", x: 360, y: 360, num: "V1" },
      { type: "cylinder_single", x: 720, y: 300, num: "A1" },
    ]);
    return {
      id: "raccordement-complet",
      num: "E-3",
      label: "Le raccordement complet",
      description:
        "La commande directe d'un vérin simple effet : source, distributeur 3/2 et vérin sont posés sur la feuille, mais aucun fil n'est tracé. Reliez le tout pour pouvoir actionner le vérin.",
      hint: "Deux conduites suffisent : la source P1 vers l'entrée P du distributeur, puis la sortie A du distributeur vers l'entrée A du vérin. Appuyez sur V1 au clavier pour tester.",
      missingCount: 2,
      start: { components: comps, wires: [], cartouche: { titre: "Exercice 3 — Raccordement direct", auteur: "", date: "", folio: "E-3" }, counters: {} },
      target: {
        paths: [
          [by("P1"), "P", by("V1"), "P"],
          [by("V1"), "A", by("A1"), "A"],
        ],
      },
    };
  })(),
];

export function getExercise(id: string) {
  return EXERCISES.find((e) => e.id === id);
}
