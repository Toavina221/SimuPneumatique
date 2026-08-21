// PneumaSim — Plan d'atelier (Blueprint Craft)
// Page éditeur : toolbar + palette arborescente + feuille SVG + légende +
// modales de propriétés. Interactions directes, raccourcis clavier.

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Toolbar from "@/components/pneusim/Toolbar";
import Palette from "@/components/pneusim/Palette";
import SheetCanvas from "@/components/pneusim/SheetCanvas";
import PerformanceGraph from "@/components/pneusim/PerformanceGraph";
import { CompPropertyModal, CartoucheModal } from "@/components/pneusim/PropertyModal";
import IsoTooltip from "@/components/pneusim/IsoTooltip";
import { useCircuit } from "@/lib/pneusim/useCircuit";
import { exportToPdf } from "@/lib/pneusim/pdfExport";
import { EXAMPLES, getExample } from "@/lib/pneusim/exampleDocs";
import { zoomAt } from "@/lib/pneusim/geometry";
import type { Cartouche, Component } from "@/lib/pneusim/types";

/** Types de composants actionnables au clavier (pilotables manuellement). */
const VALVE_TYPES = [
  "valve22",
  "valve32",
  "valve32_bi",
  "valve42",
  "valve43_closed",
  "valve52_mono",
  "valve52_bi",
  "valve53_closed",
  "valve53_open",
  "solenoid_valve",
  "valve_pedal",
];

const LOGO_URL = "/manus-storage/pneumasim-logo_42e92c26.png";

export default function Workbench() {
  const { t } = useTranslation();
  const ctx = useCircuit();
  const {
    doc,
    selected,
    setSelected,
    view,
    setView,
    simRunning,
    simSpeed,
    setSimSpeed,
    statusTxt,
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    setCartouche,
    loadDoc,
    startSim,
    pauseSim,
    reset,
    isPressurized,
    isSignalActive,
  } = ctx;

  const [modal, setModal] = useState<
    | { kind: "comp"; id: string }
    | { kind: "cartouche"; field: keyof Cartouche }
    | null
  >(null);
  const [showGraph, setShowGraph] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  // ── Menu Exemples ──────────────────────────────────────────────
  const loadExample = useCallback(
    (id: string) => {
      const ex = getExample(id);
      if (!ex) return;
      pauseSim();
      setSelected(null as unknown as string);
      loadDoc(ex.doc());
      setTimeout(() => fitViewRef.current?.(), 50);
    },
    [loadDoc, pauseSim, setSelected]
  );

  // ── Pilotage clavier : touches 1-9 sur les vannes, espace = bascule ──
  const pressedValves = useRef<Set<string>>(new Set());
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // on ignore si un champ de saisie est actif (modale propriété ouverte)
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (modal) return;
      if (e.key === "r" || e.key === "R") return; // réservé au pivot (SheetCanvas)
      const valves = doc.components.filter((c) => VALVE_TYPES.includes(c.type));
      if (valves.length === 0) return;
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        if (idx >= valves.length) return;
        const v = valves[idx];
        if (pressedValves.current.has(v.id)) {
          pressedValves.current.delete(v.id);
          updateComponent(v.id, { sim: { manualHeld: false } });
        } else {
          pressedValves.current.add(v.id);
          updateComponent(v.id, { sim: { manualHeld: true } });
        }
      } else if (e.key === " ") {
        e.preventDefault();
        // bascule la vanne sélectionnée, sinon la première
        const target =
          (selected ? valves.find((v) => v.id === selected) : undefined) ?? valves[0];
        if (pressedValves.current.has(target.id)) {
          pressedValves.current.delete(target.id);
          updateComponent(target.id, { sim: { manualHeld: false } });
        } else {
          pressedValves.current.add(target.id);
          updateComponent(target.id, { sim: { manualHeld: true } });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, selected, updateComponent, modal]);

  // exposer le svg au toolbar pour l'export SVG
  useEffect(() => {
    svgRef.current = document.querySelector("#ps-svg") as SVGSVGElement | null;
  }, []);

  // feuille non vide dès l'ouverture : circuit d'exemple (commande de vérin)
  const exampleLoaded = useRef(false);
  const fitViewRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (exampleLoaded.current) return;
    exampleLoaded.current = true;
    const toLoad = localStorage.getItem("ps_load_example") || "directe";
    localStorage.removeItem("ps_load_example");
    loadExample(toLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleZoomIn = useCallback(() => {
    const c = { x: view.x + view.w / 2, y: view.y + view.h / 2 };
    setView(zoomAt(view, c, 0.85));
  }, [view, setView]);
  const handleZoomOut = useCallback(() => {
    const c = { x: view.x + view.w / 2, y: view.y + view.h / 2 };
    setView(zoomAt(view, c, 1.18));
  }, [view, setView]);
  const handleFitView = useCallback(() => {
    const wrap = document.getElementById("ps-canvas-wrap");
    if (!wrap) return;
    const ratio = wrap.clientWidth / wrap.clientHeight;
    const sheetRatio = 1600 / 1000;
    let w: number;
    let h: number;
    if (ratio > sheetRatio) {
      h = 1000 * 1.08;
      w = h * ratio;
    } else {
      w = 1600 * 1.08;
      h = w / ratio;
    }
    setView({ x: 800 - w / 2, y: 500 - h / 2, w, h });
  }, [setView]);
  // enregistrer handleFitView dans la ref utilisée au chargement initial
  fitViewRef.current = handleFitView;

  const { lang } = useTranslation();
  const handleExportPdf = async () => {
    if (!svgRef.current) return;
    
    setIsExporting(true);
    const isFr = lang === 'fr';
    toast.info(isFr ? "Génération du rapport PDF..." : "Generating PDF report...");
    
    try {
      await exportToPdf(svgRef.current, doc, showGraph ? graphRef.current : null);
      toast.success(isFr ? "Rapport PDF exporté" : "PDF report exported");
    } catch (err) {
      console.error(err);
      toast.error(isFr ? "Erreur lors de l'export PDF" : "Error during PDF export");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedComp = selected ? doc.components.find((c) => c.id === selected) : undefined;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0d1219", color: "#dfe8f2" }}>
      {/* Infobulle ISO 1219 — survol composants et palette (un seul tooltip global) */}
      <IsoTooltip />
        <Toolbar
          statusTxt={statusTxt}
          simRunning={simRunning}
          simSpeed={simSpeed}
          selected={selected}
          svgEl={svgRef.current}
          onStart={startSim}
          onPause={pauseSim}
          onReset={reset}
          onSetSpeed={setSimSpeed}
          onDelete={() => selected && removeComponent(selected)}
          onRotate={() => {
            if (!selected) return;
            const c = doc.components.find((cc) => cc.id === selected);
            if (c) updateComponent(c.id, { rot: (c.rot + 90) % 360 });
          }}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onLoadDoc={loadDoc}
          onGetDoc={() => doc}
          onGetComponents={() => doc.components}
          onSetView={setView}
          onOpenCartoucheModal={(f) => setModal({ kind: "cartouche", field: f })}
          onToggleGraph={() => setShowGraph(!showGraph)}
          showGraph={showGraph}
          onDiagnostic={() => {
            const comps = doc.components.filter(c => c.type !== "source");
            if (comps.length === 0) return;
            const target = comps[Math.floor(Math.random() * comps.length)];
            const fault = Math.random() > 0.5 ? "leak" : "block";
            updateComponent(target.id, { fault });
            toast.error(`Panne détectée : ${target.num || target.id} (${fault === "leak" ? "fuite" : "blocage"})`);
          }}
          onExportPdf={handleExportPdf}
          isExporting={isExporting}
        />
      <div className="flex-1 flex min-h-0">
        {/* palette */}
        <div
          className="w-[252px] flex-none overflow-y-auto border-r border-[#26333f]"
          style={{ background: "#141c27" }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#26333f]">
            <img src={LOGO_URL} alt="" className="h-5 w-5" />
            <span className="text-[11px] uppercase tracking-[0.8px] text-[#8296ab] font-bold">
              Composants
            </span>
          </div>
          <Palette />
          <div className="px-3 pb-3">
            <div className="px-3 pb-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full border border-dashed border-[#ff6a3d]/50 hover:border-[#ff6a3d] hover:bg-[#ff6a3d]/[0.06] rounded-md px-3 py-2 text-[11px] font-medium text-[#ff6a3d] transition-colors active:scale-[0.98] flex items-center justify-between gap-2">
                  <span>⟲ Charger un exemple</span>
                  <ChevronDown className="h-3 w-3 flex-none" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-[300px] max-h-[360px] overflow-y-auto">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.1em] text-[#5d7189]">
                    Circuits d'exemples
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {EXAMPLES.map((ex) => (
                    <DropdownMenuItem key={ex.id} onClick={() => loadExample(ex.id)} className="flex flex-col items-start gap-0.5 py-2">
                      <span className="text-[12px] font-medium text-[#dfe8f2]">{ex.label}</span>
                      <span className="text-[11px] leading-snug text-[#5d7189]">{ex.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Bannière publicitaire (bloc d'annonces AdSense — remplacer les IDs) */}
          <div className="px-3 pb-2 pt-4">
            <div
              id="ad-slot-workbench"
              className="border border-dashed border-[#26333f] rounded-md px-3 py-4 text-center font-mono text-[10px] text-[#5d7189]"
            >
              {/* AdSense : insérer ici le <ins class="adsbygoogle"> une fois votre ID AdSense configuré */}
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7281717868974793"
                data-ad-slot=""
                data-ad-format="fluid"
                data-ad-layout-key="-6+0+22-23"
              />
              Publicité
            </div>
          </div>

          <div className="px-3 py-4 border-t border-[#26333f]/30 text-center">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#5d7189] opacity-40">Auteur</span>
            <div className="text-[18px] font-normal text-[#ff6a3d] mt-0.5" style={{ fontFamily: "'Caveat', cursive" }}>Rovamampionina Toavina</div>
          </div>

          <div className="px-3 pb-4 pt-2">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-[11px] text-[#5d7189] hover:text-[#4aa8ff] transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Retour à l'accueil
              </Link>
              <div className="flex gap-3 text-[10px] text-[#5d7189] font-mono mt-1">
                <Link href="/mentions-legales" className="hover:text-[#ff6a3d] transition-colors">LÉGAL</Link>
                <Link href="/confidentialite" className="hover:text-[#ff6a3d] transition-colors">PRIVACY</Link>
              </div>
            </div>
          </div>
        </div>
        {/* feuille */}
        <div id="ps-canvas-wrap" className="flex-1 relative min-w-0">
          <SheetCanvas
            doc={doc}
            selected={selected}
            setSelected={setSelected}
            view={view}
            setView={setView}
            isPressurized={isPressurized}
            isSignalActive={isSignalActive}
            addComponent={addComponent}
            updateComponent={updateComponent}
            removeComponent={removeComponent}
            addWire={addWire}
            onOpenCompModal={(id) => setModal({ kind: "comp", id })}
            onOpenCartoucheModal={(f) => setModal({ kind: "cartouche", field: f })}
          />
          
          <PerformanceGraph 
            components={doc.components}
            pressurized={ctx.simResult.pressurized}
            isOpen={showGraph}
            onClose={() => setShowGraph(false)}
          />

          {/* légende */}
          <div
            className="absolute right-3 top-3 rounded-lg border border-[#26333f] px-3 py-2 text-[11px] flex flex-col gap-1.5 pointer-events-none"
            style={{ background: "rgba(20,28,39,0.9)", color: "#8296ab" }}
          >
            <div className="flex items-center gap-2">
              <div className="h-[3px] w-[18px] rounded-sm" style={{ background: "#ff6a3d" }} />
              Air sous pression
            </div>
            <div className="flex items-center gap-2">
              <div className="h-[3px] w-[18px] rounded-sm" style={{ background: "#4b5b6e" }} />
              Air / conduite au repos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[18px] border-t-2 border-dashed" style={{ borderColor: "#ffd23f" }} />
              Signal de pilotage actif
            </div>
          </div>
          {/* aide */}
          <div
            className="absolute left-3 bottom-2.5 max-w-[520px] rounded-md border border-[#2f3f4f] px-3 py-2 text-[11.5px] font-mono leading-relaxed pointer-events-none"
            style={{ background: "rgba(14,21,31,0.94)", color: "#c3d2e2" }}
          >
            {t('editor_help')}
          </div>
        </div>
      </div>

      {/* modale */}
      {modal && (
        <div
          className="ps-modal-overlay fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(6,10,15,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModal(null);
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <div
            className="rounded-xl border border-[#2f3f4f] px-5 py-4.5 min-w-[320px] max-w-[420px]"
            style={{ background: "#141c27", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            {modal.kind === "comp" && (() => {
              const mc = doc.components.find((c) => c.id === modal.id);
              if (!mc) return null;
              return (
              <CompPropertyModal
                comp={mc as Component}
                doc={doc}
                onSave={(patch) => updateComponent(mc.id, patch)}
                onClose={() => setModal(null)}
              />
              );
            })()}
            {modal.kind === "cartouche" && (
              <CartoucheModal
                field={modal.field}
                cartouche={doc.cartouche}
                onSave={setCartouche}
                onClose={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
