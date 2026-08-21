// PneumaSim — Plan d'atelier (Blueprint Craft)
// Bibliothèque de composants pneumatiques (normes ISO 1219).

import type { CompDef } from "./types";

export const todayStr = new Date().toISOString().split("T")[0];

export const COMP_DEFS: Record<string, CompDef> = {
  source: {
    label: { fr: "Alimentation (compresseur)", en: "Power Supply (Compressor)" },
    doc: { 
      fr: "Source d'air comprimé du circuit : elle maintient la pression d'alimentation sur le port P lorsque l'alimentation est activée.",
      en: "Compressed air source of the circuit: it maintains supply pressure on port P when power is active."
    },
    cat: { fr: "Alimentation", en: "Power Supply" },
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
    label: { fr: "Distributeur 3/2 (bouton, R.p.)", en: "3/2 Way Valve (Button, Spring)" },
    doc: {
      fr: "3 orifices (P, A, R), 2 positions, monostable : un appui maintenu connecte P→A et le relâchement épuise A vers R (retour par ressort).",
      en: "3 ports (P, A, R), 2 positions, monostable: a maintained press connects P→A and release exhausts A to R (spring return)."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Distributeur 5/2 (monostable, R.p.)", en: "5/2 Way Valve (Monostable, Spring)" },
    doc: {
      fr: "5 orifices (P, A, B, R, S), 2 positions, monostable : le pilotage Y1 connecte P→A / B→S ; au relâchement, P→B / A→R (retour par ressort).",
      en: "5 ports (P, A, B, R, S), 2 positions, monostable: pilot Y1 connects P→A / B→S; upon release, P→B / A→R (spring return)."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Distributeur 5/2 (bistable)", en: "5/2 Way Valve (Bistable)" },
    doc: {
      fr: "5 orifices (P, A, B, R, S), 2 positions, bistable : un impulsion sur Y1 bascule P→A et la position est mémorisée jusqu'à une impulsion sur Y2.",
      en: "5 ports (P, A, B, R, S), 2 positions, bistable: a pulse on Y1 switches P→A and the position is memorized until a pulse on Y2."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Vérin double effet", en: "Double Acting Cylinder" },
    doc: {
      fr: "Actionneur linéaire : l'air sous pression sur A fait sortir la tige, sur B la faire rentrer. Course affichée en pourcentage.",
      en: "Linear actuator: pressurized air on A extends the rod, on B retracts it. Stroke displayed in percentage."
    },
    cat: { fr: "Vérins", en: "Cylinders" },
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
    label: { fr: "Vérin simple effet (rappel ressort)", en: "Single Acting Cylinder (Spring)" },
    doc: {
      fr: "Actionneur linéaire : l'air sur A fait sortir la tige, le ressort intégré la rappelle automatiquement lorsque la pression chute.",
      en: "Linear actuator: air on A extends the rod, the integrated spring automatically retracts it when pressure drops."
    },
    cat: { fr: "Vérins", en: "Cylinders" },
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
    label: { fr: "Vérin proportionnel (course ∝ pression)", en: "Proportional Cylinder (Stroke ∝ Pressure)" },
    doc: {
      fr: "Actionneur linéaire à pilotage proportionnel : la course de la tige suit la pression appliquée sur A. Plus la pression est maintenue longtemps, plus la tige sort ; le relâchement fait rentrer la tige. Idéal pour le positionnement partiel et les doses de débit.",
      en: "Proportional pilot linear actuator: the rod stroke follows the pressure applied to A. The longer pressure is maintained, the further the rod extends; release retracts the rod."
    },
    cat: { fr: "Vérins", en: "Cylinders" },
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
    label: { fr: "Régulateur de débit unidir.", en: "One-Way Flow Control Valve" },
    doc: {
      fr: "Limite le débit dans un seul sens (débit réglable) tout en laissant l'échappement libre : règle la vitesse du vérin dans un sens.",
      en: "Limits flow in one direction (adjustable flow) while leaving exhaust free: adjusts cylinder speed in one direction."
    },
    cat: { fr: "Régulation", en: "Regulation" },
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
    label: { fr: "Clapet anti-retour", en: "Check Valve" },
    doc: {
      fr: "Laisse passer l'air dans un seul sens : bloqué en sens inverse, il protège les circuits contre les retours d'air.",
      en: "Allows air to pass in one direction only: blocked in reverse, it protects circuits against backflow."
    },
    cat: { fr: "Régulation", en: "Regulation" },
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
    label: { fr: "Sélecteur de circuit (OU)", en: "Shuttle Valve (OR)" },
    doc: {
      fr: "Vanne navette (OU) : la pression arrive sur X ou Y, elle ressort sur A. Combine deux sources de pilotage.",
      en: "Shuttle valve (OR): pressure arrives on X or Y, it exits on A. Combines two pilot sources."
    },
    cat: { fr: "Logique", en: "Logic" },
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
    label: { fr: "Sélecteur de pression (ET)", en: "Dual Pressure Valve (AND)" },
    doc: {
      fr: "Vanne d'interdiction (ET) : un signal n'est présent sur A que si X ET Y sont pressurisés simultanément.",
      en: "Interlock valve (AND): a signal is present on A only if X AND Y are pressurized simultaneously."
    },
    cat: { fr: "Logique", en: "Logic" },
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
    label: { fr: "Capteur de position (fin de course)", en: "Position Sensor (Limit Switch)" },
    doc: {
      fr: "Détecte la position d'un vérin (sorti ou rentré) et émet un signal de pilotage sur OUT : permet d'automatiser les cycles.",
      en: "Detects the position of a cylinder (extended or retracted) and emits a pilot signal on OUT: automates cycles."
    },
    cat: { fr: "Capteurs & Contrôle", en: "Sensors & Control" },
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
    label: { fr: "Manomètre", en: "Pressure Gauge" },
    doc: {
      fr: "Instrument de mesure qui indique la pression d'air présente dans la conduite reliée à son orifice.",
      en: "Measurement instrument that indicates the air pressure present in the line connected to its port."
    },
    cat: { fr: "Accessoires", en: "Accessories" },
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
    label: { fr: "Silencieux (échappement)", en: "Silencer (Exhaust)" },
    doc: {
      fr: "Étouffoir d'échappement : réduit le bruit et freine l'air rejeté à l'atmosphère par les vannes.",
      en: "Exhaust muffler: reduces noise and slows down air rejected to the atmosphere by valves."
    },
    cat: { fr: "Accessoires", en: "Accessories" },
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
    label: { fr: "Distributeur 3/2 (bistable)", en: "3/2 Way Valve (Bistable)" },
    doc: {
      fr: "3 orifices (P, A, R), 2 positions, bistable : un impulsion de pilotage connecte P→A, la position est mémorisée jusqu'au prochain pilotage.",
      en: "3 ports (P, A, R), 2 positions, bistable: a pilot pulse connects P→A, the position is memorized until next pilot."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Distributeur 5/3 (centres fermés)", en: "5/3 Way Valve (Closed Center)" },
    doc: {
      fr: "5 orifices, 3 positions : au relâchement des deux pilotages, P, A et B sont fermés — le vérin reste figé en position intermédiaire.",
      en: "5 ports, 3 positions: upon release of both pilots, P, A, and B are closed — the cylinder remains frozen in intermediate position."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Distributeur 5/3 (centres ouverts)", en: "5/3 Way Valve (Open Center)" },
    doc: {
      fr: "5 orifices, 3 positions : au relâchement, P est connecté à A et B, et les deux s'épuisent — le vérin se met en roue libre.",
      en: "5 ports, 3 positions: upon release, P is connected to A and B, and both exhaust — the cylinder goes into free-wheel."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Distributeur 2/2 (on/off)", en: "2/2 Way Valve (On/Off)" },
    doc: {
      fr: "2 orifices (P, A), 2 positions : commande tout-ou-rien, ouverture ou fermeture du passage de l'air.",
      en: "2 ports (P, A), 2 positions: on-off control, opening or closing the air passage."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Temporisateur (ON retardé)", en: "Timer Valve (Delayed ON)" },
    doc: {
      fr: "Retarde le passage de l'air IN→OUT de la durée réglée (1,5 s par défaut) après réception du signal de pilotage Y1.",
      en: "Delays the air passage IN→OUT by the set duration (default 1.5s) after receiving pilot signal Y1."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Réservoir d'air", en: "Air Receiver" },
    doc: {
      fr: "Stocke l'air comprimé : lisse les pics de consommation et constitue une réserve d'énergie pour les pics de demande.",
      en: "Stores compressed air: smooths out consumption peaks and provides an energy reserve for demand spikes."
    },
    cat: { fr: "Alimentation", en: "Power Supply" },
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
    label: { fr: "Filtre (air comprimé)", en: "Filter (Compressed Air)" },
    doc: {
      fr: "Élimine les impuretés et l'humidité de l'air comprimé avant distribution : protège vannes et actionneurs.",
      en: "Removes impurities and moisture from compressed air before distribution: protects valves and actuators."
    },
    cat: { fr: "Conditionnement", en: "Conditioning" },
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
    label: { fr: "Lubrificateur", en: "Lubricator" },
    doc: {
      fr: "Injecte un fin brouillard d'huile dans l'air : lubrifie les pièces mobiles des vannes et vérins en aval.",
      en: "Injects a fine oil mist into the air: lubricates moving parts of downstream valves and cylinders."
    },
    cat: { fr: "Conditionnement", en: "Conditioning" },
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
    label: { fr: "Échappement rapide", en: "Quick Exhaust Valve" },
    doc: {
      fr: "Permet à l'air du vérin de s'épuiser directement à la sortie (sans repasser par la vanne) : augmente la vitesse de rentrée.",
      en: "Allows cylinder air to exhaust directly at the outlet (without going back through the valve): increases retraction speed."
    },
    cat: { fr: "Vannes", en: "Valves" },
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
    label: { fr: "Pressostat", en: "Pressure Switch" },
    doc: {
      fr: "Interrupteur de pression : émet un signal de pilotage quand la pression de la conduite dépasse le seuil réglé.",
      en: "Pressure-actuated switch: emits a pilot signal when line pressure exceeds the set threshold."
    },
    cat: { fr: "Capteurs & Contrôle", en: "Sensors & Control" },
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
    label: { fr: "Moteur pneumatique", en: "Pneumatic Motor" },
    doc: {
      fr: "Actionneur rotatif : l'air comprimé en entrée le fait tourner ; indicateur RUN visible en simulation.",
      en: "Rotary actuator: compressed air at the inlet makes it turn; RUN indicator visible in simulation."
    },
    cat: { fr: "Actionneurs", en: "Actuators" },
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
    label: { fr: "Mise à l'atmosphère", en: "Exhaust to Atmosphere" },
    doc: {
      fr: "Point d'évacuation de l'air vers l'atmosphère : épuise les conduites reliées vers l'extérieur du circuit.",
      en: "Air evacuation point to the atmosphere: exhausts connected lines to the outside of the circuit."
    },
    cat: { fr: "Accessoires", en: "Accessories" },
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
    label: { fr: "Unité FRL (Filtre-Régul-Lub)", en: "FRL Unit (Filter-Reg-Lub)" },
    doc: {
      fr: "Unité complète de conditionnement : filtre les impuretés, régule la pression de service et lubrifie l'air pour protéger les composants.",
      en: "Complete conditioning unit: filters impurities, regulates service pressure, and lubricates air to protect components."
    },
    cat: { fr: "Conditionnement", en: "Conditioning" },
    prefix: "Z",
    w: 80,
    h: 40,
    ports: [
      { id: "IN", x: 0, y: 20, kind: "pneu", dir: "in" },
      { id: "OUT", x: 80, y: 20, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  dryer: {
    label: { fr: "Sécheur d'air", en: "Air Dryer" },
    doc: {
      fr: "Élimine l'humidité résiduelle de l'air comprimé pour éviter la corrosion et le gel dans les conduites.",
      en: "Removes residual moisture from compressed air to prevent corrosion and freezing in lines."
    },
    cat: { fr: "Conditionnement", en: "Conditioning" },
    prefix: "F",
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
    label: { fr: "Vérin sans tige", en: "Rodless Cylinder" },
    doc: {
      fr: "Actionneur linéaire compact : le chariot se déplace le long du corps du vérin. Idéal pour les grandes courses.",
      en: "Compact linear actuator: the carriage moves along the cylinder body. Ideal for long strokes and small spaces."
    },
    cat: { fr: "Actionneurs", en: "Actuators" },
    prefix: "A",
    w: 150,
    h: 34,
    ports: [
      { id: "A", x: 10, y: 34, kind: "pneu", dir: "in" },
      { id: "B", x: 80, y: 34, kind: "pneu", dir: "in" },
    ],
    defaultParams: { strokeTime: 3 },
    initSim() {
      return { pos: 0 };
    },
  },

  rotary_actuator: {
    label: { fr: "Actionneur rotatif", en: "Rotary Actuator" },
    doc: {
      fr: "Transforme l'énergie pneumatique en mouvement de rotation (souvent 90° ou 180°). Utilisé pour pivoter des charges.",
      en: "Transforms pneumatic energy into rotary motion (often 90° or 180°). Used for pivoting loads."
    },
    cat: { fr: "Actionneurs", en: "Actuators" },
    prefix: "A",
    w: 60,
    h: 60,
    ports: [
      { id: "A", x: 10, y: 60, kind: "pneu", dir: "in" },
      { id: "B", x: 50, y: 60, kind: "pneu", dir: "in" },
    ],
    defaultParams: { strokeTime: 1.5 },
    initSim() {
      return { pos: 0 };
    },
  },

  bellows: {
    label: { fr: "Soufflet pneumatique", en: "Pneumatic Bellows" },
    doc: {
      fr: "Actionneur simple effet : se gonfle sous la pression pour exercer une force importante sur une course courte.",
      en: "Single acting actuator: inflates under pressure to exert significant force over a short stroke. Used for lifting or damping."
    },
    cat: { fr: "Actionneurs", en: "Actuators" },
    prefix: "A",
    w: 60,
    h: 60,
    ports: [{ id: "A", x: 30, y: 60, kind: "pneu", dir: "in" }],
    defaultParams: { strokeTime: 1 },
    initSim() {
      return { pos: 0 };
    },
  },

  valve42: {
    label: { fr: "Distributeur 4/2", en: "4/2 Way Valve" },
    doc: {
      fr: "4 orifices, 2 positions : permet d'inverser le sens de mouvement d'un vérin double effet avec un seul pilotage.",
      en: "4 ports, 2 positions: allows reversing the movement direction of a double acting cylinder with a single pilot."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
    prefix: "V",
    w: 70,
    h: 44,
    ports: [
      { id: "P", x: 20, y: 44, kind: "pneu", dir: "io" },
      { id: "R", x: 50, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 20, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 50, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 22, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "left" };
    },
  },

  valve43_closed: {
    label: { fr: "Distributeur 4/3 (centre fermé)", en: "4/3 Way Valve (Closed Center)" },
    doc: {
      fr: "4 orifices, 3 positions : en position centrale, tous les orifices sont fermés, bloquant l'actionneur.",
      en: "4 ports, 3 positions: in central position, all ports are closed, blocking the actuator."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
    prefix: "V",
    w: 80,
    h: 44,
    ports: [
      { id: "P", x: 30, y: 44, kind: "pneu", dir: "io" },
      { id: "R", x: 50, y: 44, kind: "pneu", dir: "io" },
      { id: "A", x: 30, y: 0, kind: "pneu", dir: "io" },
      { id: "B", x: 50, y: 0, kind: "pneu", dir: "io" },
      { id: "Y1", x: -8, y: 22, kind: "signal", dir: "in" },
      { id: "Y2", x: 88, y: 22, kind: "signal", dir: "in" },
    ],
    defaultParams: {},
    initSim() {
      return { state: "center", _y1prev: false, _y2prev: false };
    },
  },

  valve_pedal: {
    label: { fr: "Distributeur 3/2 à pédale", en: "3/2 Way Pedal Valve" },
    doc: {
      fr: "Vanne 3/2 actionnée par pédale au pied. Utilisée pour libérer les mains de l'opérateur.",
      en: "3/2 way valve actuated by foot pedal. Used to free the operator's hands."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Distributeur 3/2 à galet", en: "3/2 Way Roller Valve" },
    doc: {
      fr: "Vanne 3/2 actionnée mécaniquement par le passage d'une came ou d'un vérin. Utilisée comme fin de course mécanique.",
      en: "Mechanically actuated 3/2 way valve by the passage of a cam or cylinder. Used as a mechanical limit switch."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Électrovanne 3/2", en: "3/2 Way Solenoid Valve" },
    doc: {
      fr: "Vanne 3/2 actionnée par un signal électrique (simulé ici par un signal de pilotage).",
      en: "3/2 way valve actuated by an electrical signal (simulated here by a pilot signal)."
    },
    cat: { fr: "Distributeurs", en: "Directional Valves" },
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
    label: { fr: "Soupape de séquence", en: "Sequence Valve" },
    doc: {
      fr: "Ne laisse passer l'air vers OUT que lorsque la pression en IN dépasse un certain seuil. Utilisée pour déclencher des actions en cascade.",
      en: "Only allows air to pass to OUT when pressure at IN exceeds a certain threshold. Used to trigger cascade actions."
    },
    cat: { fr: "Régulation", en: "Regulation" },
    prefix: "V",
    w: 44,
    h: 44,
    ports: [
      { id: "IN", x: 0, y: 22, kind: "pneu", dir: "in" },
      { id: "OUT", x: 44, y: 22, kind: "pneu", dir: "out" },
      { id: "P", x: 22, y: 44, kind: "pneu", dir: "in" },
    ],
    defaultParams: { threshold: 4 },
    initSim() {
      return {};
    },
  },

  vacuum_generator: {
    label: { fr: "Générateur de vide (Venturi)", en: "Vacuum Generator (Venturi)" },
    doc: {
      fr: "Transforme un flux d'air comprimé de P vers R en une aspiration (vide) au port V par effet Venturi.",
      en: "Transforms compressed air flow from P to R into suction (vacuum) at port V by Venturi effect."
    },
    cat: { fr: "Vannes", en: "Valves" },
    prefix: "V",
    w: 44,
    h: 34,
    ports: [
      { id: "P", x: 0, y: 17, kind: "pneu", dir: "in" },
      { id: "R", x: 44, y: 17, kind: "pneu", dir: "out" },
      { id: "V", x: 22, y: 34, kind: "pneu", dir: "out" },
    ],
    defaultParams: {},
    initSim() {
      return {};
    },
  },

  suction_cup: {
    label: { fr: "Ventouse", en: "Suction Cup" },
    doc: {
      fr: "Utilise le vide pour saisir des pièces. S'active lorsqu'une dépression est présente sur le port V.",
      en: "Uses vacuum to grip parts. Activates when a depression is present on port V."
    },
    cat: { fr: "Actionneurs", en: "Actuators" },
    prefix: "A",
    w: 40,
    h: 40,
    ports: [{ id: "V", x: 20, y: 0, kind: "pneu", dir: "in" }],
    defaultParams: {},
    initSim() {
      return { active: false };
    },
  },
};

export const COLLECTION_TREE = {
  label: { fr: "Collection Pneumatique", en: "Pneumatic Collection" },
  children: [
    {
      label: { fr: "Alimentation", en: "Power Supply" },
      children: [
        { label: { fr: "Source", en: "Source" }, items: ["source", "reservoir"] },
        { label: { fr: "Conditionnement", en: "Conditioning" }, items: ["frl", "filter", "lubricator", "dryer"] },
      ],
    },
    {
      label: { fr: "Vannes", en: "Valves" },
      children: [
        { label: { fr: "Distributeurs", en: "Directional Valves" }, items: ["valve22", "valve32", "valve42", "valve43_closed", "valve52_mono", "valve52_bi", "valve53_closed", "valve53_open", "valve32_bi", "solenoid_valve", "valve_pedal", "valve_roller", "timevalve"] },
        { label: { fr: "Logique", en: "Logic Valves" }, items: ["shuttle", "dualpressure", "quickexhaust", "vacuum_generator"] },
        { label: { fr: "Régulation", en: "Regulation Valves" }, items: ["flowcontrol", "checkvalve", "sequence_valve"] },
      ],
    },
    { label: { fr: "Actionneurs", en: "Actuators" }, children: [{ label: { fr: "Linéaires & Rotatifs", en: "Linear & Rotary" }, items: ["cylinder_double", "cylinder_single", "cylinder_rodless", "cylinder_prop", "rotary_actuator", "motor", "bellows", "suction_cup"] }] },
    {
      label: { fr: "Capteurs", en: "Sensors" },
      children: [{ label: { fr: "Position & Pression", en: "Position & Pressure" }, items: ["sensor", "press_switch"] }],
    },
    { label: { fr: "Accessoires", en: "Accessories" }, items: ["gauge", "silencer", "vent"] },
  ],
};
