// PneumaSim — Plan d'atelier (Blueprint Craft)
// Circuit d'exemple pré-chargé : commande d'un vérin double effet par un
// distributeur 5/2 monostable (bouton maintenu + retour par ressort).
// Un appui prolongé sur la vanne V1 fait sortir le vérin A1 ; au relâchement,
// la vanne revient à gauche (P↔B, A→R) et le vérin rentre.
import type { CircuitDoc } from "./types";

export function makeExampleDoc(): CircuitDoc {
  return {
    components: [
      {
        id: "ex_P1",
        type: "source",
        x: 200,
        y: 300,
        rot: 0,
        num: "P1",
        params: {},
        sim: { enabled: true },
      },
      {
        id: "ex_V1",
        type: "valve52_mono",
        x: 440,
        y: 280,
        rot: 0,
        num: "V1",
        params: {},
        sim: { state: "left" },
      },
      {
        id: "ex_A1",
        type: "cylinder_double",
        x: 720,
        y: 240,
        rot: 0,
        num: "A1",
        params: { strokeTime: 2.5 },
        sim: { pos: 0 },
      },
    ],
    wires: [
      {
        id: "ex_w1",
        kind: "pneumatic",
        a: "ex_P1",
        aPort: "P",
        b: "ex_V1",
        bPort: "P",
      },
      {
        id: "ex_w2",
        kind: "pneumatic",
        a: "ex_V1",
        aPort: "A",
        b: "ex_A1",
        bPort: "A",
      },
      {
        id: "ex_w3",
        kind: "pneumatic",
        a: "ex_V1",
        aPort: "B",
        b: "ex_A1",
        bPort: "B",
      },
    ],
    cartouche: {
      titre: "Commande directe d'un vérin double effet",
      auteur: "PneumaSim",
      date: "2026-08-20",
      folio: "1/1",
    },
    counters: { c: 3, w: 3 },
  };
}
