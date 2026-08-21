// PneumaSim — Plan d'atelier (Blueprint Craft)
// Bibliothèque de circuits d'exemples chargeables depuis le menu dédié
import type { CircuitDoc } from "./types";

export type Example = {
  id: string;
  label: string;
  label_en: string;
  description: string;
  description_en: string;
  doc(): CircuitDoc;
};

/** Exemple 1 : démarrage lent — le vérin ne sort que 2 s après l'appui. */
export function makeTimerExample(): CircuitDoc {
  return {
    components: [
      { id: "t_P1", type: "source", x: 150, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
      { id: "t_V1", type: "valve32", x: 380, y: 300, rot: 0, num: "V1", params: {}, sim: { state: "rest" } },
      { id: "t_T1", type: "timevalve", x: 620, y: 300, rot: 0, num: "T1", params: { delay: 2.0 }, sim: { armed: false, elapsed: 0 } },
      { id: "t_A1", type: "cylinder_double", x: 860, y: 300, rot: 0, num: "A1", params: { strokeTime: 1.5 } as any, sim: { pos: 0 } },
    ],
    wires: [
      { id: "t_w1", kind: "pneumatic", a: "t_P1", aPort: "P", b: "t_V1", bPort: "P" },
      { id: "t_w2", kind: "signal", a: "t_V1", aPort: "A", b: "t_T1", bPort: "Y1" },
      { id: "t_w3", kind: "pneumatic", a: "t_T1", aPort: "OUT", b: "t_A1", bPort: "A" },
    ],
    cartouche: {
      titre: "Démarrage lent d'un vérin (temporisation 2 s) / Slow start (2s delay)",
      auteur: "PneumaSim",
      date: "2026-08-20",
      folio: "1/1",
    },
    counters: { c: 4, w: 3 },
  };
}

/** Exemple 2 : mémoire bistable — capteurs de fin de course, cycle auto. */
export function makeBistableExample(): CircuitDoc {
  return {
    components: [
      { id: "b_P1", type: "source", x: 150, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
      { id: "b_V1", type: "valve52_bi", x: 390, y: 290, rot: 0, num: "V1", params: {}, sim: { state: "left", _y1prev: false, _y2prev: false } },
      { id: "b_A1", type: "cylinder_double", x: 660, y: 260, rot: 0, num: "A1", params: { strokeTime: 2.0 } as any, sim: { pos: 0 } },
      { id: "b_S1", type: "sensor", x: 660, y: 340, rot: 0, num: "S1", params: { targetId: "b_A1", position: "extended" } as any, sim: { active: false } },
      { id: "b_S2", type: "sensor", x: 880, y: 340, rot: 0, num: "S2", params: { targetId: "b_A1", position: "retracted" } as any, sim: { active: false } },
    ],
    wires: [
      { id: "b_w1", kind: "pneumatic", a: "b_P1", aPort: "P", b: "b_V1", bPort: "P" },
      { id: "b_w2", kind: "pneumatic", a: "b_V1", aPort: "A", b: "b_A1", bPort: "A" },
      { id: "b_w3", kind: "pneumatic", a: "b_V1", aPort: "B", b: "b_A1", bPort: "B" },
      { id: "b_w4", kind: "signal", a: "b_S1", aPort: "OUT", b: "b_V1", bPort: "Y2" },
      { id: "b_w5", kind: "signal", a: "b_S2", aPort: "OUT", b: "b_V1", bPort: "Y1" },
    ],
    cartouche: {
      titre: "Mémoire bistable avec capteurs / Bistable memory with sensors",
      auteur: "PneumaSim",
      date: "2026-08-20",
      folio: "1/1",
    },
    counters: { c: 5, w: 5 },
  };
}

/** Exemple 3 : distributeur 5/3 — arrêt du vérin en position intermédiaire. */
export function makeValve53Example(): CircuitDoc {
  return {
    components: [
      { id: "v_P1", type: "source", x: 150, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
      { id: "v_V1", type: "valve53_closed", x: 400, y: 290, rot: 0, num: "V1", params: {}, sim: { state: "left", _y1prev: false, _y2prev: false } },
      { id: "v_A1", type: "cylinder_double", x: 700, y: 260, rot: 0, num: "A1", params: { strokeTime: 2.0 } as any, sim: { pos: 0 } },
    ],
    wires: [
      { id: "v_w1", kind: "pneumatic", a: "v_P1", aPort: "P", b: "v_V1", bPort: "P" },
      { id: "v_w2", kind: "pneumatic", a: "v_V1", aPort: "A", b: "v_A1", bPort: "A" },
      { id: "v_w3", kind: "pneumatic", a: "v_V1", aPort: "B", b: "v_A1", bPort: "B" },
    ],
    cartouche: {
      titre: "Arrêt intermédiaire (5/3 centres fermés) / Intermediate stop (5/3 closed center)",
      auteur: "PneumaSim",
      date: "2026-08-20",
      folio: "1/1",
    },
    counters: { c: 3, w: 3 },
  };
}

export const EXAMPLES: Example[] = [
  {
    id: "directe",
    label: "Commande directe — vérin double effet (5/2)",
    label_en: "Direct Control — double-acting cylinder (5/2)",
    description: "Bouton maintenu : le vérin sort. Relâchement : la vanne revient par ressort et le vérin rentre par échappement.",
    description_en: "Button held: cylinder extends. Release: valve returns by spring and cylinder retracts by exhaust.",
    doc: () => ({
      components: [
        { id: "ex_P1", type: "source", x: 200, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
        { id: "ex_V1", type: "valve52_mono", x: 440, y: 280, rot: 0, num: "V1", params: {}, sim: { state: "left" } },
        { id: "ex_A1", type: "cylinder_double", x: 720, y: 240, rot: 0, num: "A1", params: { strokeTime: 2.5 } as any, sim: { pos: 0 } },
      ],
      wires: [
        { id: "ex_w1", kind: "pneumatic", a: "ex_P1", aPort: "P", b: "ex_V1", bPort: "P" },
        { id: "ex_w2", kind: "pneumatic", a: "ex_V1", aPort: "A", b: "ex_A1", bPort: "A" },
        { id: "ex_w3", kind: "pneumatic", a: "ex_V1", aPort: "B", b: "ex_A1", bPort: "B" },
      ],
      cartouche: { titre: "Commande directe / Direct control", auteur: "PneumaSim", date: "2026-08-20", folio: "1/1" },
      counters: { c: 3, w: 3 },
    }),
  },
  {
    id: "temporisation",
    label: "Temporisation — démarrage lent du vérin",
    label_en: "Delay — slow start of the cylinder",
    description: "Le vérin ne sort que 2 s après l'appui : un temporisateur ON retardé filtre la commande du distributeur 3/2.",
    description_en: "The cylinder only extends 2 s after pressing: an ON delay timer filters the 3/2 valve command.",
    doc: makeTimerExample,
  },
  {
    id: "bistable",
    label: "Mémoire bistable — capteurs de fin de course",
    label_en: "Bistable Memory — limit switch sensors",
    description: "Deux capteurs (vérin rentré / sorti) pilotent un distributeur 5/2 bistable : cycle aller-retour automatique en mémoire.",
    description_en: "Two sensors (cylinder retracted / extended) pilot a 5/2 bistable valve: automatic round-trip cycle in memory.",
    doc: makeBistableExample,
  },
  {
    id: "arret_intermediaire",
    label: "Arrêt intermédiaire — distributeur 5/3",
    label_en: "Intermediate Stop — 5/3 valve",
    description: "Au relâchement, la 5/3 centre ses cases (P, A et B fermés) : le vérin reste figé en position intermédiaire.",
    description_en: "On release, the 5/3 centers its cases (P, A and B closed): the cylinder remains frozen in intermediate position.",
    doc: makeValve53Example,
  },
  {
    id: "sequence_ab",
    label: "Séquence automatique A+ B+ A- B-",
    label_en: "Automatic Sequence A+ B+ A- B-",
    description: "Cycle complexe synchronisé par 4 capteurs : le vérin A sort, déclenche B, qui sort et déclenche le retour de A, puis de B.",
    description_en: "Complex cycle synchronized by 4 sensors: cylinder A extends, triggers B, which extends and triggers the return of A, then B.",
    doc: () => ({
      components: [
        { id: "s_P1", type: "source", x: 100, y: 400, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
        { id: "s_V1", type: "valve52_bi", x: 300, y: 300, rot: 0, num: "V1", params: {}, sim: { state: "left" } },
        { id: "s_V2", type: "valve52_bi", x: 500, y: 300, rot: 0, num: "V2", params: {}, sim: { state: "left" } },
        { id: "s_A1", type: "cylinder_double", x: 300, y: 150, rot: 0, num: "A", params: { strokeTime: 1.5 } as any, sim: { pos: 0 } },
        { id: "s_B1", type: "cylinder_double", x: 500, y: 150, rot: 0, num: "B", params: { strokeTime: 1.5 } as any, sim: { pos: 0 } },
        { id: "s_S1", type: "sensor", x: 300, y: 220, rot: 0, num: "a0", params: { targetId: "s_A1", position: "retracted" } as any, sim: { active: false } },
        { id: "s_S2", type: "sensor", x: 420, y: 220, rot: 0, num: "a1", params: { targetId: "s_A1", position: "extended" } as any, sim: { active: false } },
        { id: "s_S3", type: "sensor", x: 500, y: 220, rot: 0, num: "b0", params: { targetId: "s_B1", position: "retracted" } as any, sim: { active: false } },
        { id: "s_S4", type: "sensor", x: 620, y: 220, rot: 0, num: "b1", params: { targetId: "s_B1", position: "extended" } as any, sim: { active: false } },
      ],
      wires: [
        { id: "s_w1", kind: "pneumatic", a: "s_P1", aPort: "P", b: "s_V1", bPort: "P" },
        { id: "s_w2", kind: "pneumatic", a: "s_P1", aPort: "P", b: "s_V2", bPort: "P" },
        { id: "s_w3", kind: "pneumatic", a: "s_V1", aPort: "A", b: "s_A1", bPort: "A" },
        { id: "s_w4", kind: "pneumatic", a: "s_V1", aPort: "B", b: "s_A1", bPort: "B" },
        { id: "s_w5", kind: "pneumatic", a: "s_V2", aPort: "A", b: "s_B1", bPort: "A" },
        { id: "s_w6", kind: "pneumatic", a: "s_V2", aPort: "B", b: "s_B1", bPort: "B" },
        { id: "s_w7", kind: "signal", a: "s_S1", aPort: "OUT", b: "s_V1", bPort: "Y1" },
        { id: "s_w8", kind: "signal", a: "s_S2", aPort: "OUT", b: "s_V2", bPort: "Y1" },
        { id: "s_w9", kind: "signal", a: "s_S4", aPort: "OUT", b: "s_V1", bPort: "Y2" },
        { id: "s_w10", kind: "signal", a: "s_S3", aPort: "OUT", b: "s_V2", bPort: "Y2" },
      ],
      cartouche: { titre: "Séquence A+ B+ A- B- / Sequence A+ B+ A- B-", auteur: "PneumaSim", date: "2026-08-21", folio: "1/1" },
      counters: { c: 9, w: 10 },
    }),
  },
  {
    id: "vide_ventouse",
    label: "Manipulation par le vide (Venturi)",
    label_en: "Vacuum Handling (Venturi)",
    description: "Un générateur de vide Venturi aspire l'air pour activer une ventouse. Idéal pour la préhension de pièces légères.",
    description_en: "A Venturi vacuum generator sucks air to activate a suction cup. Ideal for gripping light parts.",
    doc: () => ({
      components: [
        { id: "v_P1", type: "source", x: 150, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
        { id: "v_V1", type: "valve32", x: 350, y: 300, rot: 0, num: "V1", params: {}, sim: { state: "rest" } },
        { id: "v_G1", type: "vacuum_generator", x: 550, y: 300, rot: 0, num: "G1", params: {}, sim: { vacuum: false } },
        { id: "v_C1", type: "suction_cup", x: 550, y: 420, rot: 0, num: "C1", params: {}, sim: { active: false } },
      ],
      wires: [
        { id: "v_w1", kind: "pneumatic", a: "v_P1", aPort: "P", b: "v_V1", bPort: "P" },
        { id: "v_w2", kind: "pneumatic", a: "v_V1", aPort: "A", b: "v_G1", bPort: "P" },
        { id: "v_w3", kind: "pneumatic", a: "v_G1", aPort: "V", b: "v_C1", bPort: "V" },
      ],
      cartouche: { titre: "Préhension par ventouse / Suction cup (Venturi)", auteur: "PneumaSim", date: "2026-08-21", folio: "1/1" },
      counters: { c: 4, w: 3 },
    }),
  },
  {
    id: "regul_vitesse",
    label: "Régulation de vitesse bidirectionnelle",
    label_en: "Bidirectional Speed Control",
    description: "Utilisation de régulateurs de débit unidirectionnels pour contrôler séparément la vitesse de sortie et de rentrée du vérin.",
    description_en: "Use of unidirectional flow regulators to separately control the extension and retraction speed of the cylinder.",
    doc: () => ({
      components: [
        { id: "r_P1", type: "source", x: 150, y: 400, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
        { id: "r_V1", type: "valve52_mono", x: 350, y: 350, rot: 0, num: "V1", params: {}, sim: { state: "left" } },
        { id: "r_F1", type: "flowcontrol", x: 350, y: 200, rot: 90, num: "F1", params: { restriction: 20 } as any, sim: {} },
        { id: "r_F2", type: "flowcontrol", x: 550, y: 200, rot: 90, num: "F2", params: { restriction: 50 } as any, sim: {} },
        { id: "r_A1", type: "cylinder_double", x: 450, y: 50, rot: 0, num: "A1", params: { strokeTime: 1.5 } as any, sim: { pos: 0 } },
      ],
      wires: [
        { id: "r_w1", kind: "pneumatic", a: "r_P1", aPort: "P", b: "r_V1", bPort: "P" },
        { id: "r_w2", kind: "pneumatic", a: "r_V1", aPort: "A", b: "r_F1", bPort: "IN" },
        { id: "r_w3", kind: "pneumatic", a: "r_F1", aPort: "OUT", b: "r_A1", bPort: "A" },
        { id: "r_w4", kind: "pneumatic", a: "r_V1", aPort: "B", b: "r_F2", bPort: "IN" },
        { id: "r_w5", kind: "pneumatic", a: "r_F2", aPort: "OUT", b: "r_A1", bPort: "B" },
      ],
      cartouche: { titre: "Contrôle de vitesse / Speed control (20%/50%)", auteur: "PneumaSim", date: "2026-08-21", folio: "1/1" },
      counters: { c: 5, w: 5 },
    }),
  },
];

export function getExample(id: string): Example | undefined {
  return EXAMPLES.find((e) => e.id === id);
}
