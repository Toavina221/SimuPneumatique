// PneumaSim — Plan d'atelier (Blueprint Craft)
// Canevas SVG principal : grille, cadre, conduites pneumatiques/signaux,
// composants (rendu par CompSymbol), cartouche, tracé en cours et
// interactions (drag depuis palette, ports, déplacement, pan, zoom).

import { useCallback, useEffect, useRef, useState } from "react";
import { boundingBoxPadded, fitView, lPath, screenToSvg, wireEndpoint, zoomAt } from "@/lib/pneusim/geometry";
import { getDef } from "@/lib/pneusim/engine";
import { SHEET_W, SHEET_H } from "@/lib/pneusim/useCircuit";
import type { Cartouche, Component, Wire } from "@/lib/pneusim/types";
import CompSymbol from "./CompSymbol";
import { CartoucheLayer, FrameLayer, GridLayer } from "./SheetChrome";
import { syncComponentMap } from "./editorStore";

interface WireDraft {
  fromId: string;
  fromPort: string;
  fromKind: "pneu" | "signal";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  heldId?: string; // vanne actionnée manuellement pendant le tracé depuis son port
}

interface DragState {
  mode: "move" | "pan";
  id?: string;
  heldId?: string; // vanne actionnée manuellement pendant l'appui
  offsetX?: number;
  offsetY?: number;
  startClientX?: number;
  startClientY?: number;
  startView?: { x: number; y: number };
}

interface Props {
  doc: import("@/lib/pneusim/types").CircuitDoc;
  selected: string | null;
  setSelected: (id: string | null) => void;
  view: { x: number; y: number; w: number; h: number };
  setView: (v: { x: number; y: number; w: number; h: number }) => void;
  isPressurized: (key: string) => boolean;
  isSignalActive: (key: string) => boolean;
  addComponent: (type: string, x: number, y: number) => Component | null;
  updateComponent: (id: string, patch: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  addWire: (w: Omit<Wire, "id">) => void;
  onOpenCompModal: (id: string) => void;
  onOpenCartoucheModal: (field: keyof Cartouche) => void;
}

export default function SheetCanvas(props: Props) {
  const {
    doc,
    selected,
    setSelected,
    view,
    setView,
    isPressurized,
    isSignalActive,
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    onOpenCompModal,
    onOpenCartoucheModal,
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const wireDraftRef = useRef<WireDraft | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const heldValveRef = useRef<string | null>(null); // vanne en appui manuel (source de vérité)
  const viewRef = useRef(view);
  viewRef.current = view;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // synchroniser le store en lecture seule
  useEffect(() => {
    syncComponentMap(doc.components);
  }, [doc.components]);

  // vue cadrée au montage et au redimensionnement
  useEffect(() => {
    const fit = () => {
      if (!wrapRef.current) return;
      const { clientWidth, clientHeight } = wrapRef.current;
      if (clientWidth === 0) return;
      setView(fitView(clientWidth, clientHeight, SHEET_W, SHEET_H));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La viewBox reste FIXE (0 0 SHEET_W SHEET_H) : le pan/zoom est appliqué
  // via un transform scale+translate sur le groupe <g id="world">. Ainsi
  // document.elementFromPoint() et getScreenCTM restent toujours cohérents
  // pour le hit-testing (ports) et la conversion écran→feuille.
  const applyView = useCallback(
    (v: { x: number; y: number; w: number; h: number }) => {
      const g = worldRef.current;
      if (g) {
        const sx = SHEET_W / v.w;
        const sy = SHEET_H / v.h;
        g.setAttribute(
          "transform",
          `translate(${(SHEET_W - v.w) / 2 - v.x},${(SHEET_H - v.h) / 2 - v.y}) scale(${sx},${sy})`
        );
      }
      setView(v);
    },
    [setView]
  );

  useEffect(() => {
    applyView(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  /* ---------- Drag & drop depuis la palette ---------- */
  const doDropAt = useCallback(
    (clientX: number, clientY: number, type: string) => {
      const svg = svgRef.current;
      if (!svg || !type) return;
      const p = screenToSvg(svg, clientX, clientY);
      const comp = addComponent(type, p.x, p.y);
      if (comp) setSelected(comp.id);
    },
    [addComponent, setSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("text/plain");
      doDropAt(e.clientX, e.clientY, type);
    },
    [doDropAt]
  );

  // Garde-fou global : un drop peut tomber sur n'importe quel élément du
  // DOM (rect SVG, ligne de grille, etc.). Ce listener capture-level
  // garantit que la feuille accepte le dépôt même si l'élément sous le
  // curseur n'a pas de handler drag.
  useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      }
    };
    const onDrop = (e: DragEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        e.preventDefault();
        e.stopPropagation();
        doDropAt(e.clientX, e.clientY, e.dataTransfer ? e.dataTransfer.getData("text/plain") : "");
      }
    };
    window.addEventListener("dragover", onDragOver, true);
    window.addEventListener("drop", onDrop, true);
    return () => {
      window.removeEventListener("dragover", onDragOver, true);
      window.removeEventListener("drop", onDrop, true);
    };
  }, [doDropAt]);

  /* ---------- Pointer events ---------- */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const target = e.target as Element;
      const portEl = target.closest(".port");
      const compEl = target.closest(".comp");
      const ctField = target.closest(".ct-field");

      if (portEl) {
        const compId = (portEl.closest(".comp") as HTMLElement | null)?.dataset.id;
        const portId = (portEl as HTMLElement).dataset.port;
        const kind = (portEl as HTMLElement).dataset.kind as "pneu" | "signal";
        const comp = doc.components.find((c) => c.id === compId);
        const ep = comp ? wireEndpoint(comp, portId!) : null;
        if (comp && ep) {
          wireDraftRef.current = {
            fromId: compId!,
            fromPort: portId!,
            fromKind: kind,
            x1: ep.x,
            y1: ep.y,
            x2: ep.x,
            y2: ep.y,
          };
          // capture du pointeur : le pointerup arrive toujours sur le svg,
          // même si la souris sort de la cible ou dépasse la feuille.
          svg.setPointerCapture(e.pointerId);
        }
        // appui sur un port de vanne = actionnement manuel (compatible 3/2, 5/2)
        if (
          comp &&
          (comp.type === "valve32" || comp.type === "valve52_mono" || comp.type === "valve52_bi")
        ) {
          updateComponent(comp.id, { sim: { ...(comp.sim as Record<string, unknown>), manualHeld: true } });
          heldValveRef.current = comp.id;
          (window as unknown as Record<string, unknown>).__psCtx = {
            ...((window as unknown as Record<string, unknown>).__psCtx as Record<string, unknown>),
            heldValve: comp.id,
          };
        }
        return;
      }
      if (ctField) return; // géré par dblclick

      if (compEl) {
        const id = (compEl as HTMLElement).dataset.id!;
        const comp = doc.components.find((c) => c.id === id);
        if (!comp) return;
        setSelected(id);
        const p = screenToSvg(svg, e.clientX, e.clientY);
        dragRef.current = {
          mode: "move",
          id,
          offsetX: p.x - comp.x,
          offsetY: p.y - comp.y,
        };
        // appui maintenu = pilotage manuel des distributeurs
        if (comp.type === "valve32" || comp.type === "valve52_mono" || comp.type === "valve52_bi") {
          updateComponent(id, { sim: { ...(comp.sim as Record<string, unknown>), manualHeld: true } });
          heldValveRef.current = id;
          (window as unknown as Record<string, unknown>).__psCtx = {
            ...((window as unknown as Record<string, unknown>).__psCtx as Record<string, unknown>),
            heldValve: id,
          };
        }
        return;
      }

      // fond : pan + désélection
      setSelected(null);
      dragRef.current = {
        mode: "pan",
        startClientX: e.clientX,
        startClientY: e.clientY,
        startView: { x: viewRef.current.x, y: viewRef.current.y },
      };
    },
    [doc.components, setSelected, updateComponent]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const wd = wireDraftRef.current;
      if (wd) {
        const p = screenToSvg(svg, e.clientX, e.clientY);
        wd.x2 = p.x;
        wd.y2 = p.y;
        return;
      }
      const ds = dragRef.current;
      if (!ds) return;
      if (ds.mode === "move" && ds.id) {
        const p = screenToSvg(svg, e.clientX, e.clientY);
        updateComponent(ds.id, {
          x: Math.round((p.x - (ds.offsetX ?? 0)) / 5) * 5,
          y: Math.round((p.y - (ds.offsetY ?? 0)) / 5) * 5,
        });
      } else if (ds.mode === "pan" && ds.startView && ds.startClientX != null) {
        const v = viewRef.current;
        const scale = v.w / (wrapRef.current?.clientWidth ?? 1);
        const dx = (e.clientX - ds.startClientX!) * scale;
        const dy = (e.clientY - (ds.startClientY ?? 0)) * scale;
        applyView({ ...v, x: ds.startView.x - dx, y: ds.startView.y - dy });
      }
    },
    [updateComponent, applyView]
  );

  // Hit-test robuste d'un port près du point (écran).
  // elementFromPoint seul échoue quand un élément (rect du symbol d'un autre
  // composant posé au même endroit) recouvre le cercle du port. On scanne donc
  // tous les ports visibles dans un rayon de tolérance.
  const hitPortNear = useCallback(
    (cx: number, cy: number): { comp: Element; port: Element } | null => {
      // pile d'éléments sous le curseur (le port peut être recouvert)
      const stack = document.elementsFromPoint(cx, cy);
      for (const el of stack) {
        const pe = (el as Element).closest(".port");
        if (pe) return { comp: pe.closest(".comp")!, port: pe };
      }
      // rayon de tolérance : 14 px écran autour du curseur
      let best: { comp: Element; port: Element; d: number } | null = null;
      for (const pe of Array.from(document.querySelectorAll("circle.port"))) {
        const r = pe.getBoundingClientRect();
        const px = r.x + r.width / 2;
        const py = r.y + r.height / 2;
        if (r.width === 0) continue;
        const d = Math.hypot(cx - px, cy - py);
        if (d <= 14 && (!best || d < best.d)) {
          const comp = pe.closest(".comp");
          if (comp) best = { comp, port: pe, d };
        }
      }
      return best;
    },
    []
  );

  const finalizeWire = useCallback(
    (endClientX: number, endClientY: number) => {
      const wd = wireDraftRef.current;
      if (!wd) return;
      const hit = hitPortNear(endClientX, endClientY);
      if (hit) {
        const compEl = hit.comp;
        const portEl = hit.port;
        const toId = (compEl as HTMLElement).dataset.id;
        const toPort = (portEl as HTMLElement).dataset.port;
        const toKind = (portEl as HTMLElement).dataset.kind;
        if (toId && toId !== wd.fromId && toKind === wd.fromKind) {
          addWire({
            a: wd.fromId,
            aPort: wd.fromPort,
            b: toId,
            bPort: toPort!,
            kind: toKind === "signal" ? "signal" : "pneumatic",
          });
        }
      }
      // relâchement de la vanne en appui : géré par le garde-fou global
      // (document pointerup) qui couvre tous les chemins d'événement
      wireDraftRef.current = null;
      dragRef.current = null;
      (window as unknown as Record<string, unknown>).__psCtx = {
        ...((window as unknown as Record<string, unknown>).__psCtx as Record<string, unknown>),
        heldValve: null,
      };
    },
    [addWire, hitPortNear, doc.components, updateComponent]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      finalizeWire(e.clientX, e.clientY);
      // relâchement de la vanne géré par finalizeWire (couvre aussi la branche portEl)
      dragRef.current = null;
    },
    [finalizeWire]
  );

  // sécurité : au pointercancel/lostpointercapture, relâcher toute vanne en appui
  const releaseHeldValve = useCallback(() => {
    const id = heldValveRef.current;
    if (!id) return;
    const comp = doc.components.find((c) => c.id === id);
    if (comp) {
      updateComponent(id, { sim: { ...(comp.sim as Record<string, unknown>), manualHeld: false } });
    }
    heldValveRef.current = null;
    (window as unknown as Record<string, unknown>).__psCtx = {
      ...((window as unknown as Record<string, unknown>).__psCtx as Record<string, unknown>),
      heldValve: null,
    };
  }, [doc.components, updateComponent]);

  // Garde-fou natif : tout pointerup global relâche la vanne en appui.
  // Indépendant du routage d'événements React (capture, lostPointerCapture,
  // pointeurs capturés, dispatch synthétiques), il garantit qu'aucun appui
  // manuel ne reste verrouillé.
  useEffect(() => {
    const onGlobalUp = () => releaseHeldValve();
    // la capture est mise sur le svg, mais pointerup capturés arrivent
    // sur l'élément capteur (le svg) — en bubbling normal, on atteint
    // aussi le document.
    document.addEventListener("pointerup", onGlobalUp);
    return () => document.removeEventListener("pointerup", onGlobalUp);
  }, [releaseHeldValve]);

  const handlePointerCancel = useCallback(() => {
    releaseHeldValve();
    dragRef.current = null;
    wireDraftRef.current = null;
  }, [releaseHeldValve]);

  /* ---------- Zoom molette ---------- */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const p = screenToSvg(svg, e.clientX, e.clientY);
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      applyView(zoomAt(viewRef.current, p, factor));
    },
    [applyView]
  );

  /* ---------- Double clic : propriétés ---------- */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as Element;
      const compEl = target.closest(".comp");
      const ctField = target.closest(".ct-field");
      if (compEl) {
        onOpenCompModal((compEl as HTMLElement).dataset.id!);
      } else if (ctField) {
        onOpenCartoucheModal((ctField as HTMLElement).dataset.ct as keyof Cartouche);
      }
    },
    [onOpenCompModal, onOpenCartoucheModal]
  );

  /* ---------- Clavier (Delete / R / Esc) ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // modale : ne pas intercepter
      if (document.querySelector(".ps-modal-overlay")) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedRef.current) {
        removeComponent(selectedRef.current);
      } else if (e.key === "r" || e.key === "R") {
        const c = doc.components.find((cc) => cc.id === selectedRef.current);
        if (c) updateComponent(c.id, { rot: (c.rot + 90) % 360 });
      } else if (e.key === "Escape") {
        wireDraftRef.current = null;
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc.components, removeComponent, setSelected, updateComponent]);

  /* ---------- Tracé en cours (RAF) ---------- */
  const [draftState, setDraftState] = useState<WireDraft | null>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const wd = wireDraftRef.current;
      setDraftState(wd ? { ...wd } : null);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- Rendu ---------- */
  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "#0d1219" }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleDrop}
    >
      <svg
        ref={svgRef}
        id="ps-svg"
        className="block h-full w-full select-none"
        viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <rect x={0} y={0} width={SHEET_W} height={SHEET_H} fill="#121a24" />
        {/* monde : pan/zoom par transform, la viewBox reste fixe */}
        <g id="world" ref={worldRef}>
        <GridLayer />
        <FrameLayer />
        {/* conduites */}
        <g>
          {doc.wires.map((w) => {
            const compA = doc.components.find((c) => c.id === w.a);
            const compB = doc.components.find((c) => c.id === w.b);
            const A = compA ? wireEndpoint(compA, w.aPort) : null;
            const B = compB ? wireEndpoint(compB, w.bPort) : null;
            if (!A || !B) return null;
            const d = lPath(A.x, A.y, B.x, B.y);
            if (w.kind === "signal") {
              const active = isSignalActive(`${w.a}:${w.aPort}`) || isSignalActive(`${w.b}:${w.bPort}`);
              return (
                <path
                  key={w.id}
                  d={d}
                  fill="none"
                  stroke={active ? "#ffd23f" : "#3d4a5a"}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  style={{ transition: "stroke 150ms ease-out" }}
                />
              );
            }
            const press = isPressurized(`${w.a}:${w.aPort}`) || isPressurized(`${w.b}:${w.bPort}`);
            return (
              <path
                key={w.id}
                d={d}
                fill="none"
                stroke={press ? "#ff6a3d" : "#4b5b6e"}
                strokeWidth={2.6}
                strokeLinecap="round"
                style={{ transition: "stroke 150ms ease-out" }}
              />
            );
          })}
          {draftState && (
            <path
              d={lPath(draftState.x1, draftState.y1, draftState.x2, draftState.y2)}
              fill="none"
              stroke="#4aa8ff"
              strokeWidth={2}
              strokeDasharray="4 3"
              pointerEvents="none"
            />
          )}
        </g>
        {/* composants */}
        <g>
          {doc.components.map((comp) => {
            const def = getDef(comp.type);
            if (!def) return null;
            const bb = boundingBoxPadded(comp.type);
            return (
              <g
                key={comp.id}
                className={`comp ${selected === comp.id ? "selected" : ""}`}
                data-id={comp.id}
                data-tooltip-id="ps-tooltip"
                data-tooltip-title={`${comp.num || def.label.split(" ")[0]} · ${def.label}`}
                data-tooltip-doc={def.doc}
                transform={`translate(${comp.x},${comp.y}) rotate(${comp.rot},${def.w / 2},${def.h / 2})`}
                style={{ cursor: "move" }}
              >
                {selected === comp.id && (
                  <rect
                    x={bb.minX}
                    y={bb.minY}
                    width={bb.maxX - bb.minX}
                    height={bb.maxY - bb.minY}
                    fill="none"
                    stroke="#4aa8ff"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                  />
                )}
                <CompSymbol comp={comp} />
                {comp.fault && (
                  <g transform={`translate(${def.w - 10}, 0)`}>
                    <circle r="7" fill="#ff5d5d" stroke="#0d1219" strokeWidth="1" />
                    <text y="3.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">!</text>
                  </g>
                )}
                {def.ports.map((p) => (
                  <circle
                    key={p.id}
                    className={`port ${p.kind === "signal" ? "signal" : ""}`}
                    data-port={p.id}
                    data-kind={p.kind}
                    cx={p.x}
                    cy={p.y}
                    r={4.5}
                    fill={p.kind === "signal" ? "#3a3320" : "#1a2432"}
                    stroke={p.kind === "signal" ? "#3d4a5a" : "#8296ab"}
                    strokeWidth={1.4}
                    style={{ cursor: "crosshair" }}
                  />
                ))}
                <text
                  x={def.w / 2}
                  y={def.h + 16}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontFamily="monospace"
                  fill="#4aa8ff"
                  fontWeight={700}
                  pointerEvents="none"
                >
                  {comp.num}
                </text>
              </g>
            );
          })}
        </g>
        </g>
        <CartoucheLayer cartouche={doc.cartouche} onEdit={onOpenCartoucheModal} />
      </svg>
    </div>
  );
}
