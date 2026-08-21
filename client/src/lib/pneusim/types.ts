// PneumaSim — Plan d'atelier (Blueprint Craft)
// Types du domaine : composants, ports, liaisons, cartouche de plan.
// Fidélité aux conventions ISO 1219 : orange = air sous pression,
// ambre pointillé = signal de pilotage.

export type PortKind = "pneu" | "signal";
export type PortDir = "in" | "out" | "io";

export interface PortDef {
  id: string;
  x: number;
  y: number;
  kind: PortKind;
  dir: PortDir;
}

export interface LocalizedString {
  fr: string;
  en: string;
}

export interface CompDef {
  label: string | LocalizedString;
  doc: string | LocalizedString;
  cat: string | LocalizedString;
  prefix: string;
  w: number;
  h: number;
  ports: PortDef[];
  defaultParams: Record<string, number | string>;
  initSim(): Record<string, unknown>;
}

export interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  rot: number;
  num: string;
  params: Record<string, number | string>;
  sim: Record<string, unknown>;
  fault?: "leak" | "block" | null;
  // drapeaux pressurisés annotés à chaque tick pour le rendu
  _pA?: boolean;
  _pB?: boolean;
  _pIN?: boolean;
}

export interface Wire {
  id: string;
  a: string; // id composant
  aPort: string;
  b: string;
  bPort: string;
  kind: "pneumatic" | "signal";
}

export interface Cartouche {
  titre: string;
  auteur: string;
  date: string;
  folio: string;
}

export interface CircuitDoc {
  components: Component[];
  wires: Wire[];
  cartouche: Cartouche;
  counters: Record<string, number>;
}

export interface SimResult {
  pressurized: Set<string>; // clé "compId:portId"
  signals: Set<string>;
}
