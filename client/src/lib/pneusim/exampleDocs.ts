// PneumaSim — Plan d'atelier (Blueprint Craft)
// Bibliothèque de circuits d'exemples chargeables depuis le menu dédié :
// 1. Temporisation : un vérin ne sort que 2 s après l'appui sur la vanne
//    (temporisateur ON retardé entre la commande et le vérin).
// 2. Mémoire bistable : deux capteurs de fin de course (A1 sorti / rentré)
//    commandent un distributeur 5/2 bistable — cycle automatique aller-retour.
// 3. Distributeur 5/3 : commande d'un vérin avec position intermédiaire arrêt.
import type { CircuitDoc } from "./types";

type Example = {
  id: string;
  label: string;
  description: string;
  doc(): CircuitDoc;
};

function mk(id: number, label: string, doc: CircuitDoc): Example {
  return { id: `ex${id}`, label, description: "", doc: () => doc };
}

/** Exemple 1 : démarrage lent — le vérin ne sort que 2 s après l'appui. */
export function makeTimerExample(): CircuitDoc {
  return {
    components: [
      { id: "t_P1", type: "source", x: 150, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
      { id: "t_V1", type: "valve32", x: 380, y: 300, rot: 0, num: "V1", params: {}, sim: { state: "rest" } },
      { id: "t_T1", type: "timevalve", x: 620, y: 300, rot: 0, num: "T1", params: { delay: 2.0 }, sim: { armed: false, elapsed: 0 } },
      { id: "t_A1", type: "cylinder_double", x: 860, y: 300, rot: 0, num: "A1", params: { strokeTime: 1.5 } as Record<string, string | number> as Record<string, string | number>, sim: { pos: 0 } },
    ],
    wires: [
      { id: "t_w1", kind: "pneumatic", a: "t_P1", aPort: "P", b: "t_V1", bPort: "P" },
      { id: "t_w2", kind: "signal", a: "t_V1", aPort: "A", b: "t_T1", bPort: "Y1" },
      { id: "t_w3", kind: "pneumatic", a: "t_T1", aPort: "OUT", b: "t_A1", bPort: "A" },
    ],
    cartouche: {
      titre: "Démarrage lent d'un vérin (temporisation 2 s)",
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
      { id: "b_A1", type: "cylinder_double", x: 660, y: 260, rot: 0, num: "A1", params: { strokeTime: 2.0 } as Record<string, string | number>, sim: { pos: 0 } },
      { id: "b_S1", type: "sensor", x: 660, y: 340, rot: 0, num: "S1", params: { targetId: "b_A1", position: "extended" } as Record<string, string | number>, sim: { active: false } },
      { id: "b_S2", type: "sensor", x: 880, y: 340, rot: 0, num: "S2", params: { targetId: "b_A1", position: "retracted" } as Record<string, string | number>, sim: { active: false } },
    ],
    wires: [
      { id: "b_w1", kind: "pneumatic", a: "b_P1", aPort: "P", b: "b_V1", bPort: "P" },
      { id: "b_w2", kind: "pneumatic", a: "b_V1", aPort: "A", b: "b_A1", bPort: "A" },
      { id: "b_w3", kind: "pneumatic", a: "b_V1", aPort: "B", b: "b_A1", bPort: "B" },
      { id: "b_w4", kind: "signal", a: "b_S1", aPort: "OUT", b: "b_V1", bPort: "Y2" },
      { id: "b_w5", kind: "signal", a: "b_S2", aPort: "OUT", b: "b_V1", bPort: "Y1" },
    ],
    cartouche: {
      titre: "Mémoire bistable avec capteurs de fin de course",
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
      { id: "v_A1", type: "cylinder_double", x: 700, y: 260, rot: 0, num: "A1", params: { strokeTime: 2.0 } as Record<string, string | number>, sim: { pos: 0 } },
    ],
    wires: [
      { id: "v_w1", kind: "pneumatic", a: "v_P1", aPort: "P", b: "v_V1", bPort: "P" },
      { id: "v_w2", kind: "pneumatic", a: "v_V1", aPort: "A", b: "v_A1", bPort: "A" },
      { id: "v_w3", kind: "pneumatic", a: "v_V1", aPort: "B", b: "v_A1", bPort: "B" },
    ],
    cartouche: {
      titre: "Arrêt intermédiaire d'un vérin (5/3 centres fermés)",
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
    description:
      "Bouton maintenu : le vérin sort. Relâchement : la vanne revient par ressort et le vérin rentre par échappement.",
    doc: () => {
      // import dynamique évité — réutiliser la construction inline
      return {
        components: [
          { id: "ex_P1", type: "source", x: 200, y: 300, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
          { id: "ex_V1", type: "valve52_mono", x: 440, y: 280, rot: 0, num: "V1", params: {}, sim: { state: "left" } },
          { id: "ex_A1", type: "cylinder_double", x: 720, y: 240, rot: 0, num: "A1", params: { strokeTime: 2.5 } as Record<string, string | number>, sim: { pos: 0 } },
        ],
        wires: [
          { id: "ex_w1", kind: "pneumatic", a: "ex_P1", aPort: "P", b: "ex_V1", bPort: "P" },
          { id: "ex_w2", kind: "pneumatic", a: "ex_V1", aPort: "A", b: "ex_A1", bPort: "A" },
          { id: "ex_w3", kind: "pneumatic", a: "ex_V1", aPort: "B", b: "ex_A1", bPort: "B" },
        ],
        cartouche: {
          titre: "Commande directe d'un vérin double effet",
          auteur: "PneumaSim",
          date: "2026-08-20",
          folio: "1/1",
        },
        counters: { c: 3, w: 3 },
      };
    },
  },
  {
    id: "temporisation",
    label: "Temporisation — démarrage lent du vérin",
    description:
      "Le vérin ne sort que 2 s après l'appui : un temporisateur ON retardé filtre la commande du distributeur 3/2.",
    doc: makeTimerExample,
  },
  {
    id: "bistable",
    label: "Mémoire bistable — capteurs de fin de course",
    description:
      "Deux capteurs (vérin rentré / sorti) pilotent un distributeur 5/2 bistable : cycle aller-retour automatique en mémoire.",
    doc: makeBistableExample,
  },
  {
    id: "arret_intermediaire",
    label: "Arrêt intermédiaire — distributeur 5/3",
    description:
      "Au relâchement, la 5/3 centre ses cases (P, A et B fermés) : le vérin reste figé en position intermédiaire.",
    doc: makeValve53Example,
  },
  {
    id: "sequence_ab",
    label: "Séquence automatique A+ B+ A- B-",
    description:
      "Cycle complexe synchronisé par 4 capteurs : le vérin A sort, déclenche B, qui sort et déclenche le retour de A, puis de B.",
    doc: () => ({
      components: [
        { id: "s_P1", type: "source", x: 100, y: 400, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
        { id: "s_V1", type: "valve52_bi", x: 300, y: 300, rot: 0, num: "V1", params: {}, sim: { state: "left" } },
        { id: "s_V2", type: "valve52_bi", x: 500, y: 300, rot: 0, num: "V2", params: {}, sim: { state: "left" } },
        { id: "s_A1", type: "cylinder_double", x: 300, y: 150, rot: 0, num: "A", params: { strokeTime: 1.5 } as Record<string, string | number>, sim: { pos: 0 } },
        { id: "s_B1", type: "cylinder_double", x: 500, y: 150, rot: 0, num: "B", params: { strokeTime: 1.5 } as Record<string, string | number>, sim: { pos: 0 } },
        { id: "s_S1", type: "sensor", x: 300, y: 220, rot: 0, num: "a0", params: { targetId: "s_A1", position: "retracted" } as Record<string, string | number>, sim: { active: false } },
        { id: "s_S2", type: "sensor", x: 420, y: 220, rot: 0, num: "a1", params: { targetId: "s_A1", position: "extended" } as Record<string, string | number>, sim: { active: false } },
        { id: "s_S3", type: "sensor", x: 500, y: 220, rot: 0, num: "b0", params: { targetId: "s_B1", position: "retracted" } as Record<string, string | number>, sim: { active: false } },
        { id: "s_S4", type: "sensor", x: 620, y: 220, rot: 0, num: "b1", params: { targetId: "s_B1", position: "extended" } as Record<string, string | number>, sim: { active: false } },
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
      cartouche: { titre: "Séquence A+ B+ A- B-", auteur: "PneumaSim", date: "2026-08-21", folio: "1/1" },
      counters: { c: 9, w: 10 },
    }),
  },
  {
    id: "vide_ventouse",
    label: "Manipulation par le vide (Venturi)",
    description:
      "Un générateur de vide Venturi aspire l'air pour activer une ventouse. Idéal pour la préhension de pièces légères.",
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
      cartouche: { titre: "Préhension par ventouse (Effet Venturi)", auteur: "PneumaSim", date: "2026-08-21", folio: "1/1" },
      counters: { c: 4, w: 3 },
    }),
  },
  {
    id: "regul_vitesse",
    label: "Régulation de vitesse bidirectionnelle",
    description:
      "Utilisation de régulateurs de débit unidirectionnels pour contrôler séparément la vitesse de sortie et de rentrée du vérin.",
    doc: () => ({
      components: [
        { id: "r_P1", type: "source", x: 150, y: 400, rot: 0, num: "P1", params: {}, sim: { enabled: true } },
        { id: "r_V1", type: "valve52_mono", x: 350, y: 350, rot: 0, num: "V1", params: {}, sim: { state: "left" } },
        { id: "r_F1", type: "flowcontrol", x: 350, y: 200, rot: 90, num: "F1", params: { restriction: 20 } as Record<string, string | number>, sim: {} },
        { id: "r_F2", type: "flowcontrol", x: 550, y: 200, rot: 90, num: "F2", params: { restriction: 50 } as Record<string, string | number>, sim: {} },
        { id: "r_A1", type: "cylinder_double", x: 450, y: 50, rot: 0, num: "A1", params: { strokeTime: 1.5 } as Record<string, string | number>, sim: { pos: 0 } },
      ],
      wires: [
        { id: "r_w1", kind: "pneumatic", a: "r_P1", aPort: "P", b: "r_V1", bPort: "P" },
        { id: "r_w2", kind: "pneumatic", a: "r_V1", aPort: "A", b: "r_F1", bPort: "IN" },
        { id: "r_w3", kind: "pneumatic", a: "r_F1", aPort: "OUT", b: "r_A1", bPort: "A" },
        { id: "r_w4", kind: "pneumatic", a: "r_V1", aPort: "B", b: "r_F2", bPort: "IN" },
        { id: "r_w5", kind: "pneumatic", a: "r_F2", aPort: "OUT", b: "r_A1", bPort: "B" },
      ],
      cartouche: { titre: "Contrôle de vitesse (Sortie 20%, Rentrée 50%)", auteur: "PneumaSim", date: "2026-08-21", folio: "1/1" },
      counters: { c: 5, w: 5 },
    }),
  },
];

export function getExample(id: string): Example | undefined {
  return EXAMPLES.find((e) => e.id === id);
}
