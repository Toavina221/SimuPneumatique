// PneumaSim — Plan d'atelier (Blueprint Craft)
// Mode exercice : circuits incomplets à terminer, validation automatique.
// Style : bg #0d1219, orange #ff6a3d, monospace, cartouches ISO.

import { useCallback, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import SheetCanvas from "@/components/pneusim/SheetCanvas";
import IsoTooltip from "@/components/pneusim/IsoTooltip";
import { useCircuit } from "@/lib/pneusim/useCircuit";
import {
  EXERCISES,
  getExercise,
  type Exercise,
} from "@/lib/pneusim/exercises";

const LOGO_URL = "/manus-storage/pneumasim-logo_42e92c26.png";

// ── validation automatique ───────────────────────────────────────────
function internalBidirLinks(c: { type: string }): { a: string; b: string }[] {
  switch (c.type) {
    case "flowcontrol":
    case "filter":
    case "lubricator":
    case "checkvalve":
    case "timevalve":
      return [{ a: "IN", b: "OUT" }];
    case "valve32":
      return [
        { a: "P", b: "A" },
        { a: "A", b: "R" },
      ];
    case "valve52_mono":
    case "valve52_bi":
    case "valve32_bi":
      return [
        { a: "P", b: "A" },
        { a: "P", b: "B" },
        { a: "A", b: "R" },
        { a: "B", b: "S" },
      ];
    case "valve53_closed":
    case "valve53_open":
      return [
        { a: "P", b: "A" },
        { a: "P", b: "B" },
        { a: "P", b: "R" },
        { a: "P", b: "S" },
        { a: "A", b: "R" },
        { a: "B", b: "S" },
      ];
    case "valve22":
      return [{ a: "P", b: "A" }];
    case "shuttle":
      return [
        { a: "X", b: "A" },
        { a: "Y", b: "A" },
      ];
    case "dualpressure":
      return [{ a: "A", b: "X" }]; // non utilisé en validation mais sans risque
    case "quickexhaust":
      return [{ a: "IN", b: "A" }];
    default:
      return [];
  }
}

function connectedPneu(doc: Exercise["start"], aId: string, aPort: string, bId: string, bPort: string): boolean {
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    let p = parent.get(k) ?? k;
    if (p !== k) p = find(p);
    parent.set(k, p);
    return p;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  // fils pneumatiques
  doc.wires.forEach((w) => {
    if (w.kind !== "pneumatic") return;
    union(`${w.a}:${w.aPort}`, `${w.b}:${w.bPort}`);
  });
  // liens internes bidirectionnels (vannes, filtres, clapets…) — même principe
  // que la propagation de pression du moteur, hors états de commutation.
  doc.components.forEach((c) => {
    internalBidirLinks(c).forEach((l) => union(`${c.id}:${l.a}`, `${c.id}:${l.b}`));
  });
  return find(`${aId}:${aPort}`) === find(`${bId}:${bPort}`);
}

function connectedSignal(doc: Exercise["start"], aId: string, aPort: string, bId: string, bPort: string): boolean {
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    let p = parent.get(k) ?? k;
    if (p !== k) p = find(p);
    parent.set(k, p);
    return p;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  doc.wires.forEach((w) => {
    if (w.kind !== "signal") return;
    union(`${w.a}:${w.aPort}`, `${w.b}:${w.bPort}`);
  });
  return find(`${aId}:${aPort}`) === find(`${bId}:${bPort}`);
}

function validateExercise(doc: Exercise["start"], target: Exercise["target"]): {
  ok: boolean;
  missing: string[];
} {
  const num = (compId: string) => doc.components.find((c) => c.id === compId)?.num ?? compId;
  // fallback lisible si l'id ne correspond à aucun composant
  const missing = target.paths
    .filter(([aId, aPort, bId, bPort]) =>
      aPort === "OUT" || bPort === "OUT"
        ? !connectedSignal(doc, aId, aPort, bId, bPort)
        : !connectedPneu(doc, aId, aPort, bId, bPort)
    )
    .map(([aId, aPort, bId, bPort]) => `${num(aId)}:${aPort} → ${num(bId)}:${bPort}`);
  return { ok: missing.length === 0, missing };
}

// ───────────────────── page ─────────────────────
export default function ExercisePage() {
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [startKey, setStartKey] = useState(0);

  const ex = exerciseId ? (getExercise(exerciseId) as Exercise | undefined) : undefined;

  // le hook tourne sur le document de départ de l'exercice ; la clé `startKey`
  // recrée le hook à chaque ouverture pour repartir d'un circuit propre.
  const ctx = useCircuit(ex?.start);
  const {
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
  } = ctx;

  const open = useCallback(
    (e: Exercise) => {
      setExerciseId(e.id);
      setStartKey((k) => k + 1); // force la recréation du hook avec le nouveau doc
    },
    []
  );

  // ─── liste des exercices ───────────────────────────
  if (!ex) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0d1219", color: "#dfe8f2" }}>
        <header className="flex items-center gap-4 px-5 py-3 border-b border-[#26333f]" style={{ background: "#141c27" }}>
          <Link href="/" className="flex items-center gap-2 font-mono font-bold text-[14px] tracking-[1px] text-[#4aa8ff]">
            <img src={LOGO_URL} alt="" className="h-6 w-6" />
            PNEUMASIM
          </Link>
          <Link href="/editeur" className="text-[12px] text-[#8296ab] hover:text-[#dfe8f2] transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Retour à l'éditeur
          </Link>
          <div className="flex-1" />
          <span className="text-[11px] font-mono uppercase tracking-[1px] text-[#ff6a3d]">Atelier d'exercices</span>
        </header>
        <IsoTooltip />
        <main className="flex-1 max-w-4xl w-full mx-auto px-5 py-10">
          <p className="text-[11px] font-mono uppercase tracking-[2px] text-[#ff6a3d] mb-2">
            Exercices · ISO 1219
          </p>
          <h1 className="text-[28px] font-bold mb-2">Complétez le circuit, vérifiez en un clic.</h1>
          <p className="text-[14px] text-[#8296ab] mb-8 max-w-2xl leading-relaxed">
            Trois circuits incomplets, du raccordement de base au pilotage par capteur.
            Chargez un exercice, tracez les liaisons manquantes, puis demandez la
            validation : chaque connexion requise est contrôlée automatiquement.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {EXERCISES.map((e) => (
              <button
                key={e.id}
                onClick={() => open(e)}
                className="text-left bg-[#141c27] border border-[#2f3f4f] rounded-lg p-5 hover:border-[#ff6a3d] hover:bg-[#1a2432] transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] tracking-[1.5px] text-[#5d7189]">{e.num}</span>
                  <span className="font-mono text-[10.5px] text-[#ff6a3d] bg-[#ff6a3d]/10 px-1.5 py-0.5 rounded">
                    {e.missingCount} liaison{e.missingCount > 1 ? "s" : ""} à tracer
                  </span>
                </div>
                <h2 className="text-[16px] font-semibold mb-1.5">{e.label}</h2>
                <p className="text-[12.5px] leading-relaxed text-[#8296ab]">{e.description}</p>
              </button>
            ))}
          </div>
        </main>
        <footer className="border-t border-[#26333f] px-5 py-4 text-center text-[11px] text-[#5d7189] font-mono">
          PNEUMASIM · Conventions de schéma ISO 1219 · Feuille 1600 × 1000
        </footer>
      </div>
    );
  }

  // ─── atelier d'exercice ──────────────────────────
  // La clé `startKey` re-monte le hook useCircuit à chaque ouverture :
  // useState(initial) n'est réévalué qu'au montage, il faut donc que
  // le hook soit recréé avec le nouveau document de départ.
  return <ExerciseWorkbench key={startKey} ex={ex} />;
}

function ExerciseWorkbench(props: { ex: Exercise }) {
  const { ex } = props;
  const ctx = useCircuit(ex.start);
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
  } = ctx;

  // validation locale : le document validé est celui du hook local
  // (les ids c_X doivent correspondre à ceux du target de l'exercice).
  const [status, setStatus] = useState<"idle" | "fail" | "done">("idle");
  const [missing, setMissing] = useState<string[]>([]);
  const [hintOpen, setHintOpen] = useState(false);

  const localCheck = useCallback(() => {
    const res = validateExercise(doc, ex.target);
    setMissing(res.missing);
    setStatus(res.ok ? "done" : "fail");
    if (res.ok) toast.success("Circuit validé — exercice réussi !");
    else toast.error(`Il reste ${res.missing.length} liaison${res.missing.length > 1 ? "s" : ""} à tracer`);
  }, [doc, ex]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0d1219", color: "#dfe8f2" }}>
      <IsoTooltip />
      <header className="flex items-center gap-3 px-3 py-2 border-b border-[#26333f]" style={{ background: "#141c27" }}>
        <Link href="/exercice" className="text-[12px] text-[#8296ab] hover:text-[#dfe8f2] flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Exercices
        </Link>
        <span className="font-mono text-[11px] tracking-[1.5px] text-[#5d7189]">{ex.num}</span>
        <span className="text-[14px] font-semibold">{ex.label}</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setHintOpen((v) => !v)}
          className={`flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 text-[12px] transition-colors ${
            hintOpen
              ? "border-[#ffd23f] text-[#ffd23f] bg-[#ffd23f]/10"
              : "border-[#2f3f4f] text-[#8296ab] hover:border-[#ffd23f]"
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5" /> Indice
        </button>
        <button
          type="button"
          onClick={localCheck}
          className="bg-[#ff6a3d] border border-[#ff6a3d] text-white px-3 py-1.5 rounded-md text-[12.5px] font-semibold hover:bg-[#ff7d56] active:scale-[0.97] transition-colors flex items-center gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" /> Vérifier le circuit
        </button>
      </header>

      {hintOpen && (
        <div className="border-b border-[#26333f] bg-[#ffd23f]/[0.07] px-4 py-2.5 text-[13px] text-[#e8c66b] flex items-start gap-2">
          <Lightbulb className="h-4 w-4 flex-none mt-0.5" />
          <span>{ex.hint}</span>
        </div>
      )}

      {status === "done" && (
        <div className="border-b border-[#4ade80]/40 bg-[#4ade80]/[0.08] px-4 py-2.5 text-[13px] text-[#4ade80] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-none" />
          <span>
            Circuit validé — exercice réussi !{" "}
            <Link href="/exercice" className="underline hover:text-white">
              Retour à la liste
            </Link>
          </span>
        </div>
      )}
      {status === "fail" && (
        <div className="border-b border-[#ff5d5d]/40 bg-[#ff5d5d]/[0.08] px-4 py-2.5 text-[12.5px] text-[#ff8a8a] flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <XCircle className="h-4 w-4 flex-none" />
            Il manque encore {missing.length} liaison{missing.length > 1 ? "s" : ""} pour valider l'exercice.
          </span>
          <span className="font-mono text-[11px] text-[#ff6a3d] pl-6">
            {missing.slice(0, 4).map((m) => `• ${m}`).join("  ")}
            {missing.length > 4 ? ` +${missing.length - 4} autres` : ""}
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0">
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
          onOpenCompModal={() => {}}
          onOpenCartoucheModal={() => {}}
        />
      </div>
      <div className="border-t border-[#26333f] px-4 py-2 text-[11.5px] text-[#8296ab] bg-[#141c27]">
        {ex.description}
      </div>
    </div>
  );
}
