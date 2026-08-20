// PneumaSim — Plan d'atelier (Blueprint Craft)
// Hook central : état du document (composants, liaisons, vue, sélection),
// actions d'édition et boucle de simulation via requestAnimationFrame.

import { useCallback, useEffect, useRef, useState } from "react";
import { COMP_DEFS, todayStr } from "./defs";
import { tick, resetSim, computePressurized, computeSignals } from "./engine";
import type { Cartouche, CircuitDoc, Component, SimResult, Wire } from "./types";

let UID = 1;
export function uid(prefix: string): string {
  return `${prefix}_${UID++}`;
}

const SHEET_W = 1600;
const SHEET_H = 1000;
export { SHEET_W, SHEET_H };

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EmptyDoc {
  components: [];
  wires: [];
  cartouche: Cartouche;
  counters: {};
}

export function makeEmptyDoc(titre = "Sans titre"): CircuitDoc {
  return {
    components: [],
    wires: [],
    cartouche: { titre, auteur: "", date: todayStr(), folio: "1/1" },
    counters: {},
  };
}

export function useCircuit(initial?: CircuitDoc) {
  const [doc, setDoc] = useState<CircuitDoc>(() => initial ?? makeEmptyDoc());
  const [selected, setSelected] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [view, setView] = useState<ViewBox>({ x: 0, y: 0, w: SHEET_W, h: SHEET_H });
  const [simResult, setSimResult] = useState<SimResult>({ pressurized: new Set(), signals: new Set() });
  const [, setFrame] = useState(0);
  const [statusTxt, setStatusTxt] = useState("Édition");

  const docRef = useRef(doc);
  docRef.current = doc;
  const simResultRef = useRef(simResult);
  simResultRef.current = simResult;

  // point d'inspection global (débogage)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__psCtx = {
      getDoc: () => docRef.current,
      getSimRunning: () => runningRef.current,
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__psCtx;
    };
  }, []);
  const runningRef = useRef(simRunning);
  runningRef.current = simRunning;
  const speedRef = useRef(simSpeed);
  speedRef.current = simSpeed;

  const nextNum = useCallback((prefix: string): string => {
    const n = (docRef.current.counters[prefix] || 0) + 1;
    setDoc((d) => ({ ...d, counters: { ...d.counters, [prefix]: n } }));
    return `${prefix}${n}`;
  }, []);

  const addComponent = useCallback(
    (type: string, x: number, y: number): Component | null => {
      const def = COMP_DEFS[type];
      if (!def) return null;
      const comp: Component = {
        id: uid("c"),
        type,
        x: x - def.w / 2,
        y: y - def.h / 2,
        rot: 0,
        num: nextNum(def.prefix),
        params: { ...def.defaultParams },
        sim: def.initSim(),
      };
      setDoc((d) => ({ ...d, components: [...d.components, comp] }));
      return comp;
    },
    [nextNum]
  );

  // NOTE : le moteur de simulation (engine.ts) mute en place docRef.current
  // à chaque tick. Pour ne pas écraser ces mutations, updateComponent mute
  // l'objet composant existant dans le tableau React (mêmes références que
  // docRef.current) et déclenche le re-render via setFrame.
  const updateComponent = useCallback((id: string, patch: Partial<Component>) => {
    const comps = docRef.current.components;
    const idx = comps.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const cur = comps[idx];
    if (patch.sim !== undefined) {
      Object.assign(cur.sim, patch.sim as Record<string, unknown>);
    }
    Object.assign(cur, patch);
    setFrame((f) => f + 1);
  }, []);

  const removeComponent = useCallback((id: string) => {
    const d = docRef.current;
    setDoc({
      ...d,
      components: d.components.filter((c) => c.id !== id),
      wires: d.wires.filter((w) => w.a !== id && w.b !== id),
    });
    setSelected((s) => (s === id ? null : s));
  }, []);

  const addWire = useCallback((w: Omit<Wire, "id">) => {
    const d = docRef.current;
    setDoc({ ...d, wires: [...d.wires, { ...w, id: uid("w") }] });
  }, []);

  const removeWire = useCallback((id: string) => {
    const d = docRef.current;
    setDoc({ ...d, wires: d.wires.filter((w) => w.id !== id) });
  }, []);

  const setCartouche = useCallback((field: keyof Cartouche, value: string) => {
    const d = docRef.current;
    setDoc({ ...d, cartouche: { ...d.cartouche, [field]: value } });
  }, []);

  const loadDoc = useCallback((data: CircuitDoc) => {
    UID += 1;
    const comps = data.components.map((c) => ({
      ...c,
      sim: COMP_DEFS[c.type]?.initSim() ?? {},
      params: { ...c.params },
    }));
    setDoc({
      components: comps,
      wires: data.wires ?? [],
      cartouche: data.cartouche ?? makeEmptyDoc().cartouche,
      counters: data.counters ?? {},
    });
    setSelected(null);
    setSimResult({ pressurized: new Set(), signals: new Set() });
  }, []);

  // Boucle de simulation (pas fixe de 50 ms)
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.1) * speedRef.current;
      last = t;
      if (runningRef.current) {
        const r = tick(docRef.current, dt);
        setSimResult(r);
        setFrame((f) => f + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const startSim = useCallback(() => {
    setSimRunning(true);
    setStatusTxt("Simulation en cours");
  }, []);

  const pauseSim = useCallback(() => {
    setSimRunning(false);
    setStatusTxt("Édition (pause)");
  }, []);

  const reset = useCallback(() => {
    resetSim(docRef.current);
    setSimRunning(false);
    setSimResult({ pressurized: new Set(), signals: new Set() });
    setStatusTxt("Édition");
  }, []);

  const isPressurized = useCallback(
    (key: string): boolean => simResult.pressurized.has(key),
    [simResult.pressurized]
  );
  const isSignalActive = useCallback(
    (key: string): boolean => simResult.signals.has(key),
    [simResult.signals]
  );

  return {
    doc,
    setDoc,
    selected,
    setSelected,
    simRunning,
    simSpeed,
    setSimSpeed,
    view,
    setView,
    simResult,
    statusTxt,
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    removeWire,
    setCartouche,
    loadDoc,
    nextNum,
    startSim,
    pauseSim,
    reset,
    isPressurized,
    isSignalActive,
  };
}
