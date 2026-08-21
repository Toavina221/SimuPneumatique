// PneumaSim — Plan d'atelier (Blueprint Craft)
// Bibliothèque de composants pneumatiques (normes ISO 1219).
// Chaque définition : label, catégorie, préfixe de repère, dimensions,
// ports, paramètres par défaut et état initial de simulation.
// Dessin SVG délégué au composant React (renderer), pas au modèle.

import type { CompDef } from "./types";

export const COMP_DEFS: Record<string, CompDef> = {
  source: {
    label: "Alimentation (compresseur)",
    doc: "Source d'air comprimé du circuit : elle maintient la pression d'alimentation sur le port P lorsque l'alimentation est activée.",
    cat: "Alimentation",
    prefix: "P",
    w: 60,
    h: 60,
    ports: [{ id: "P", x: 60, y: 30, kind: "pneu", dir: "out" }],
    defaultParams: {},
    initSim() {
      return { enabled: true };
    },
  },

  valve32: {
    label: "Distributeur 3/2 (bouton, R.p.)",
    doc: "3 orifices (P, A, R), 2 positions, monostable : un appui maintenu connecte P→A et le relâchement épuise A vers R (retour par ressort).",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 20, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 20, y: 0, kind: "pneu", dir: "io" },
      { id: "R", x: 46, y: 44, kind: "pneu", dir: "io" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "rest", manualHeld: false };
    },
  },

  valve52_mono: {
    label: "Distributeur 5/2 (monostable, R.p.)",
    doc: "5 orifices (P, A, B, R, S), 2 positions, monostable : le pilotage Y1 connecte P→A / B→S ; au relâchement, P→B / A→R (retour par ressort).",
    cat: "Distributeurs",
    prefix: "V",
    w: 80,
    h: 54,
    ports: [
      { id: "P", x: 40, y: 54, kind: "pneu", dir: "io" },
      { id: "R", x: 15, y: 54, kind: "pneu", dir: "io" },
      { id: "S", x: 65, y: 54, kind: "pneu", dir: "io" },
      { id: "A", x: 15, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 65, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 27, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "left" };
    },
  },

  valve52_bi: {
    label: "Distributeur 5/2 (bistable)",
    doc: "5 orifices (P, A, B, R, S), 2 positions, bistable : un impulsion sur Y1 bascule P→A et la position est mémorisée jusqu'à une impulsion sur Y2.",
    cat: "Distributeurs",
    prefix: "V",
    w: 80,
    h: 54,
    ports: [
      { id: "P", x: 40, y: 54, kind: "pneu", dir: "io" },
      { id: "R", x: 15, y: 54, kind: "pneu", dir: "io" },
      { id: "S", x: 65, y: 54, kind: "pneu", dir: "io" },
      { id: "A", x: 15, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 65, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 27, kind: "signal", dir: "in" },
      { id: "Y2", x: 88, y: 27, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "left", _y1prev: false, _y2prev: false };
    },
  },

  cylinder_double: {
    label: "Vérin double effet",
    doc: "Actionneur linéaire : l'air sous pression sur A fait sortir la tige, sur B la faire rentrer. Course affichée en pourcentage.",
    cat: "Vérins",
    prefix: "A",
    w: 150,
    h: 34,
    ports: [
      { id: "A", x: 10, y: 34, kind: "pneu", dir: "in" },
      { id: "B", x: 80, y: 34, kind: "pneu", dir: "in" },
    ],
    defaultParams: { strokeTime: 2.5 },
    initSim() {
      return { pos: 0 };
    },
  },

  cylinder_single: {
    label: "Vérin simple effet (rappel ressort)",
    doc: "Actionneur linéaire : l'air sur A fait sortir la tige, le ressort intégré la rappelle automatiquement lorsque la pression chute.",
    cat: "Vérins",
    prefix: "A",
    w: 150,
    h: 34,
    ports: [{ id: "A", x: 10, y: 34, kind: "pneu", dir: "in" }],
    defaultParams: { strokeTime: 2 },
    initSim() {
      return { pos: 0 };
    },
  },
  cylinder_prop: {
    label: "Vérin proportionnel (course ∝ pression)",
    doc: "Actionneur linéaire à pilotage proportionnel : la course de la tige suit la pression appliquée sur A. Plus la pression est maintenue longtemps, plus la tige sort ; le relâchement fait rentrer la tige. Idéal pour le positionnement partiel et les doses de débit.",
    cat: "Vérins",
    prefix: "A",
    w: 150,
    h: 34,
    ports: [{ id: "A", x: 10, y: 34, kind: "pneu", dir: "in" }],
    defaultParams: { strokeTime: 2 },
    initSim() {
      return { pos: 0, _pA: false };
    },
  },

  flowcontrol: {
    label: "Régulateur de débit unidir.",
    doc: "Limite le débit dans un seul sens (débit réglable) tout en laissant l'échappement libre : règle la vitesse du vérin dans un sens.",
    cat: "Régulation",
    prefix: "Q",
    w: 40,
    h: 24,
    ports: [
      { id: "IN", x: 0, y: 12, kind: "pneu", dir: "io" },
      { id: "OUT", x: 40, y: 12, kind: "pneu", dir: "io" },
    ],
    defaultParams: { restriction: 60 },
    initSim() {
      return {};
    },
  },

  checkvalve: {
    label: "Clapet anti-retour",
    doc: "Laisse passer l'air dans un seul sens : bloqué en sens inverse, il protège les circuits contre les retours d'air.",
    cat: "Régulation",
    prefix: "R",
    w: 36,
    h: 20,
    ports: [
      { id: "IN", x: 0, y: 10, kind: "pneu", dir: "in" },
      { id: "OUT", x: 36, y: 10, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  shuttle: {
    label: "Sélecteur de circuit (OU)",
    doc: "Vanne navette (OU) : la pression arrive sur X ou Y, elle ressort sur A. Combine deux sources de pilotage.",
    cat: "Logique",
    prefix: "L",
    w: 44,
    h: 34,
    ports: [
      { id: "X", x: 0, y: 7, kind: "pneu", dir: "in" },
      { id: "Y", x: 0, y: 27, kind: "pneu", dir: "in" },
      { id: "A", x: 44, y: 17, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  dualpressure: {
    label: "Sélecteur de pression (ET)",
    doc: "Vanne d'interdiction (ET) : un signal n'est présent sur A que si X ET Y sont pressurisés simultanément.",
    cat: "Logique",
    prefix: "L",
    w: 44,
    h: 34,
    ports: [
      { id: "X", x: 0, y: 7, kind: "pneu", dir: "in" },
      { id: "Y", x: 0, y: 27, kind: "pneu", dir: "in" },
      { id: "A", x: 44, y: 17, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  sensor: {
    label: "Capteur de position (fin de course)",
    doc: "Détecte la position d'un vérin (sorti ou rentré) et émet un signal de pilotage sur OUT : permet d'automatiser les cycles.",
    cat: "Capteurs & Contrôle",
    prefix: "S",
    w: 34,
    h: 34,
    ports: [{ id: "OUT", x: 17, y: 34, kind: "signal", dir: "out" }],
    defaultParams: { targetId: "", position: "extended" },
    initSim() {
      return { active: false };
    },
  },

  gauge: {
    label: "Manomètre",
    doc: "Instrument de mesure qui indique la pression d'air présente dans la conduite reliée à son orifice.",
    cat: "Accessoires",
    prefix: "M",
    w: 30,
    h: 30,
    ports: [{ id: "IN", x: 15, y: 30, kind: "pneu", dir: "in" }],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  silencer: {
    label: "Silencieux (échappement)",
    doc: "Étouffoir d'échappement : réduit le bruit et freine l'air rejeté à l'atmosphère par les vannes.",
    cat: "Accessoires",
    prefix: "E",
    w: 22,
    h: 22,
    ports: [{ id: "IN", x: 0, y: 11, kind: "pneu", dir: "in" }],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  valve32_bi: {
    label: "Distributeur 3/2 (bistable)",
    doc: "3 orifices (P, A, R), 2 positions, bistable : un impulsion de pilotage connecte P→A, la position est mémorisée jusqu'au prochain pilotage.",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 20, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 20, y: 0, kind: "pneu", dir: "io" },
      { id: "R", x: 46, y: 44, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 22, kind: "signal", dir: "in" },
      { id: "Y2", x: 68, y: 22, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "rest", _y1prev: false, _y2prev: false };
    },
  },

  valve53_closed: {
    label: "Distributeur 5/3 (centres fermés)",
    doc: "5 orifices, 3 positions : au relâchement des deux pilotages, P, A et B sont fermés — le vérin reste figé en position intermédiaire.",
    cat: "Distributeurs",
    prefix: "V",
    w: 80,
    h: 54,
    ports: [
      { id: "P", x: 40, y: 54, kind: "pneu", dir: "io" },
      { id: "R", x: 15, y: 54, kind: "pneu", dir: "io" },
      { id: "S", x: 65, y: 54, kind: "pneu", dir: "io" },
      { id: "A", x: 15, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 65, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 27, kind: "signal", dir: "in" },
      { id: "Y2", x: 88, y: 27, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "center", _y1prev: false, _y2prev: false };
    },
  },

  valve53_open: {
    label: "Distributeur 5/3 (centres ouverts)",
    doc: "5 orifices, 3 positions : au relâchement, P est connecté à A et B, et les deux s'épuisent — le vérin se met en roue libre.",
    cat: "Distributeurs",
    prefix: "V",
    w: 80,
    h: 54,
    ports: [
      { id: "P", x: 40, y: 54, kind: "pneu", dir: "io" },
      { id: "R", x: 15, y: 54, kind: "pneu", dir: "io" },
      { id: "S", x: 65, y: 54, kind: "pneu", dir: "io" },
      { id: "A", x: 15, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 65, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 27, kind: "signal", dir: "in" },
      { id: "Y2", x: 88, y: 27, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "center", _y1prev: false, _y2prev: false };
    },
  },

  valve22: {
    label: "Distributeur 2/2 (on/off)",
    doc: "2 orifices (P, A), 2 positions : commande tout-ou-rien, ouverture ou fermeture du passage de l'air.",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 12, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 12, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: 48, y: 44, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "closed", _y1prev: false };
    },
  },

  timevalve: {
    label: "Temporisateur (ON retardé)",
    doc: "Retarde le passage de l'air IN→OUT de la durée réglée (1,5 s par défaut) après réception du signal de pilotage Y1.",
    cat: "Distributeurs",
    prefix: "T",
    w: 60,
    h: 44,
    ports: [
      { id: "IN", x: 0, y: 22, kind: "pneu", dir: "in" },
      { id: "OUT", x: 60, y: 22, kind: "pneu", dir: "out" },
      { id: "Y1", x: 30, y: 44, kind: "signal", dir: "in" },
    ],
    defaultParams: { delay: 1.5 },
    initSim() {
      return { armed: false, elapsed: 0 };
    },
  },

  reservoir: {
    label: "Réservoir d'air",
    doc: "Stocke l'air comprimé : lisse les pics de consommation et constitue une réserve d'énergie pour les pics de demande.",
    cat: "Alimentation",
    prefix: "Z",
    w: 56,
    h: 44,
    ports: [{ id: "P", x: 28, y: 44, kind: "pneu", dir: "io" }],
    defaultParams: {},
    initSim() {
      return { pressurized: false };
    },
  },

  filter: {
    label: "Filtre (air comprimé)",
    doc: "Élimine les impuretés et l'humidité de l'air comprimé avant distribution : protège vannes et actionneurs.",
    cat: "Conditionnement",
    prefix: "F",
    w: 40,
    h: 40,
    ports: [
      { id: "IN", x: 0, y: 12, kind: "pneu", dir: "in" },
      { id: "OUT", x: 40, y: 12, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  lubricator: {
    label: "Lubrificateur",
    doc: "Injecte un fin brouillard d'huile dans l'air : lubrifie les pièces mobiles des vannes et vérins en aval.",
    cat: "Conditionnement",
    prefix: "L",
    w: 40,
    h: 40,
    ports: [
      { id: "IN", x: 0, y: 12, kind: "pneu", dir: "in" },
      { id: "OUT", x: 40, y: 12, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  quickexhaust: {
    label: "Échappement rapide",
    doc: "Permet à l'air du vérin de s'épuiser directement à la sortie (sans repasser par la vanne) : augmente la vitesse de rentrée.",
    cat: "Vannes",
    prefix: "V",
    w: 44,
    h: 34,
    ports: [
      { id: "IN", x: 0, y: 17, kind: "pneu", dir: "in" },
      { id: "A", x: 44, y: 17, kind: "pneu", dir: "io" },
      { id: "R", x: 22, y: 34, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  press_switch: {
    label: "Pressostat",
    doc: "Interrupteur de pression : émet un signal de pilotage quand la pression de la conduite dépasse le seuil réglé.",
    cat: "Capteurs & Contrôle",
    prefix: "P",
    w: 36,
    h: 36,
    ports: [
      { id: "IN", x: 18, y: 36, kind: "pneu", dir: "in" },
      { id: "OUT", x: 36, y: 18, kind: "signal", dir: "out" },
    ],
    defaultParams: { threshold: 4.5 },
    initSim() {
      return { active: false };
    },
  },

  motor: {
    label: "Moteur pneumatique",
    doc: "Actionneur rotatif : l'air comprimé en entrée le fait tourner ; indicateur RUN visible en simulation.",
    cat: "Actionneurs",
    prefix: "M",
    w: 56,
    h: 44,
    ports: [{ id: "IN", x: 0, y: 22, kind: "pneu", dir: "in" }],
    defaultParams: {},
    initSim() {
      return { running: false };
    },
  },

  vent: {
    label: "Mise à l'atmosphère",
    doc: "Point d'évacuation de l'air vers l'atmosphère : épuise les conduites reliées vers l'extérieur du circuit.",
    cat: "Accessoires",
    prefix: "X",
    w: 22,
    h: 22,
    ports: [{ id: "IN", x: 11, y: 0, kind: "pneu", dir: "in" }],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  frl: {
    label: "Unité FRL (Filtre-Régul-Lub)",
    doc: "Unité complète de conditionnement : filtre les impuretés, régule la pression de service et lubrifie l'air pour protéger les composants.",
    cat: "Conditionnement",
    prefix: "Z",
    w: 80,
    h: 40,
    ports: [
      { id: "IN", x: 0, y: 20, kind: "pneu", dir: "in" },
      { id: "OUT", x: 80, y: 20, kind: "pneu", dir: "out" },
    ],
    defaultParams: { pressure: 6 },
    initSim() {
      return {};
    },
  },

  dryer: {
    label: "Sécheur d'air",
    doc: "Élimine l'humidité résiduelle de l'air comprimé pour éviter la corrosion et le gel dans les conduites.",
    cat: "Conditionnement",
    prefix: "D",
    w: 40,
    h: 40,
    ports: [
      { id: "IN", x: 0, y: 20, kind: "pneu", dir: "in" },
      { id: "OUT", x: 40, y: 20, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  cylinder_rodless: {
    label: "Vérin sans tige",
    doc: "Actionneur linéaire compact : le chariot se déplace le long du corps du vérin. Idéal pour les courses longues et les espaces réduits.",
    cat: "Actionneurs",
    prefix: "A",
    w: 160,
    h: 30,
    ports: [
      { id: "A", x: 10, y: 30, kind: "pneu", dir: "in" },
      { id: "B", x: 150, y: 30, kind: "pneu", dir: "in" },
    ],
    defaultParams: { strokeTime: 3 },
    initSim() {
      return { pos: 0.5 };
    },
  },

  rotary_actuator: {
    label: "Actionneur rotatif",
    doc: "Transforme l'énergie pneumatique en mouvement de rotation (souvent 90° ou 180°). Utilisé pour le pivotement de charges.",
    cat: "Actionneurs",
    prefix: "M",
    w: 60,
    h: 60,
    ports: [
      { id: "A", x: 0, y: 45, kind: "pneu", dir: "in" },
      { id: "B", x: 60, y: 45, kind: "pneu", dir: "in" },
    ],
    defaultParams: { strokeTime: 1.5 },
    initSim() {
      return { pos: 0 };
    },
  },

  bellows: {
    label: "Soufflet pneumatique",
    doc: "Actionneur à simple effet : se gonfle sous pression pour exercer une force importante sur une course courte. Utilisé pour le levage ou l'amortissement.",
    cat: "Actionneurs",
    prefix: "A",
    w: 60,
    h: 50,
    ports: [{ id: "A", x: 30, y: 50, kind: "pneu", dir: "in" }],
    defaultParams: { strokeTime: 1 },
    initSim() {
      return { pos: 0 };
    },
  },

  valve42: {
    label: "Distributeur 4/2",
    doc: "4 orifices, 2 positions : permet d'inverser le sens de mouvement d'un vérin double effet avec un seul pilotage.",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 15, y: 44, kind: "pneu", dir: "io" },
      { id: "R", x: 45, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 15, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 45, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 22, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "left" };
    },
  },

  valve43_closed: {
    label: "Distributeur 4/3 (centre fermé)",
    doc: "4 orifices, 3 positions : en position centrale, tous les orifices sont fermés, bloquant l'actionneur.",
    cat: "Distributeurs",
    prefix: "V",
    w: 80,
    h: 44,
    ports: [
      { id: "P", x: 25, y: 44, kind: "pneu", dir: "io" },
      { id: "R", x: 55, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 25, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 55, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 22, kind: "signal", dir: "in" },
      { id: "Y2", x: 88, y: 22, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "center", _y1prev: false, _y2prev: false };
    },
  },

  valve_pedal: {
    label: "Vanne 3/2 à pédale",
    doc: "Distributeur 3/2 actionné par pédale au pied. Utilisé pour libérer les mains de l'opérateur.",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 20, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 20, y: 0, kind: "pneu", dir: "io" },
      { id: "R", x: 46, y: 44, kind: "pneu", dir: "io" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "rest", manualHeld: false };
    },
  },

  valve_roller: {
    label: "Vanne 3/2 à galet",
    doc: "Distributeur 3/2 actionné mécaniquement par le passage d'une came ou d'un vérin. Utilisé comme fin de course mécanique.",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 20, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 20, y: 0, kind: "pneu", dir: "io" },
      { id: "R", x: 46, y: 44, kind: "pneu", dir: "io" },
    ],
    defaultParams: { targetId: "", position: "extended" },
    initSim() {
      return { state: "rest", active: false };
    },
  },

  solenoid_valve: {
    label: "Électrovanne 3/2",
    doc: "Distributeur 3/2 actionné par un signal électrique (simulé ici par un signal de pilotage).",
    cat: "Distributeurs",
    prefix: "V",
    w: 60,
    h: 44,
    ports: [
      { id: "P", x: 20, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 20, y: 0, kind: "pneu", dir: "io" },
      { id: "R", x: 46, y: 44, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 22, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "rest", _y1prev: false };
    },
  },

  sequence_valve: {
    label: "Soupape de séquence",
    doc: "Ne laisse passer l'air vers OUT que lorsque la pression en IN dépasse un certain seuil. Utilisé pour déclencher des actions en cascade.",
    cat: "Régulation",
    prefix: "V",
    w: 50,
    h: 40,
    ports: [
      { id: "IN", x: 0, y: 20, kind: "pneu", dir: "in" },
      { id: "OUT", x: 50, y: 20, kind: "pneu", dir: "out" },
    ],
    defaultParams: { threshold: 4 },
    initSim() {
      return { open: false };
    },
  },

  vacuum_generator: {
    label: "Générateur de vide (Venturi)",
    doc: "Transforme le passage de l'air comprimé de P vers R en une aspiration (vide) sur le port V par effet Venturi.",
    cat: "Vannes",
    prefix: "V",
    w: 50,
    h: 40,
    ports: [
      { id: "P", x: 0, y: 10, kind: "pneu", dir: "in" },
      { id: "R", x: 50, y: 10, kind: "pneu", dir: "out" },
      { id: "V", x: 25, y: 40, kind: "pneu", dir: "io" },
    ],
    defaultParams: {},
    initSim() {
      return { vacuum: false };
    },
  },

  suction_cup: {
    label: "Ventouse",
    doc: "Utilise le vide pour saisir des pièces. S'active lorsqu'une dépression est présente sur le port V.",
    cat: "Actionneurs",
    prefix: "A",
    w: 40,
    h: 30,
    ports: [{ id: "V", x: 20, y: 0, kind: "pneu", dir: "in" }],
    defaultParams: {},
    initSim() {
      return { active: false };
    },
  },
};

export const COLLECTION_TREE = {
  label: "Collection Pneumatique",
  children: [
    {
      label: "Alimentation",
      children: [
        { label: "Source", items: ["source", "reservoir"] },
        { label: "Conditionnement", items: ["frl", "filter", "lubricator", "dryer"] },
      ],
    },
    {
      label: "Vannes",
      children: [
        { label: "Distributeurs", items: ["valve22", "valve32", "valve42", "valve43_closed", "valve52_mono", "valve52_bi", "valve53_closed", "valve53_open", "valve32_bi", "solenoid_valve", "valve_pedal", "valve_roller", "timevalve"] },
        { label: "Vannes logiques", items: ["shuttle", "dualpressure", "quickexhaust", "vacuum_generator"] },
        { label: "Vannes de régulation", items: ["flowcontrol", "checkvalve", "sequence_valve"] },
      ],
    },
    { label: "Actionneurs", children: [{ label: "linéaire & rotatif", items: ["cylinder_double", "cylinder_single", "cylinder_rodless", "cylinder_prop", "rotary_actuator", "motor", "bellows", "suction_cup"] }] },
    {
      label: "Capteurs",
      children: [{ label: "Position & pression", items: ["sensor", "press_switch"] }],
    },
    { label: "Accessoires", items: ["gauge", "silencer", "vent"] },
  ],
};

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
