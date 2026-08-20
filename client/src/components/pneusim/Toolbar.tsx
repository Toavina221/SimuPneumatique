// PneumaSim — Plan d'atelier (Blueprint Craft)
// Barre d'outils supérieure : brand avec pastille de puissance (orange →
// verte en simulation), contrôle simulation, vitesse, édition, zoom,
// sauvegarde/chargement, export SVG. Compact, monospace, état lisible.

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderInput,
  Image,
  Minus,
  Plus,
  Play,
  RotateCw,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { downloadJson, downloadSvg, readJsonFile } from "@/lib/pneusim/io";
import { COMP_DEFS } from "@/lib/pneusim/defs";
import { resetSim } from "@/lib/pneusim/engine";
import type { Cartouche, CircuitDoc, Component } from "@/lib/pneusim/types";

const LOGO_URL = "/pneumasim-logo.png";

interface Props {
  statusTxt: string;
  simRunning: boolean;
  simSpeed: number;
  selected: string | null;
  svgEl: SVGSVGElement | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetSpeed: (s: number) => void;
  onDelete: () => void;
  onRotate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onLoadDoc: (doc: CircuitDoc) => void;
  onGetDoc: () => CircuitDoc;
  onGetComponents: () => Component[];
  onSetView: (v: { x: number; y: number; w: number; h: number }) => void;
  onOpenCartoucheModal: (field: keyof Cartouche) => void;
}

interface Favorite {
  name: string;
  date: string;
  doc: CircuitDoc;
}
const FAV_KEY = "pneumasim-favorites-v1";

function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Favorite[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveFavorites(list: Favorite[]) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(list));
  } catch {
    toast.error("Stockage local indisponible");
  }
}

export default function Toolbar(props: Props) {
  const {
    statusTxt,
    simRunning,
    simSpeed,
    selected,
    svgEl,
    onStart,
    onPause,
    onReset,
    onSetSpeed,
    onDelete,
    onRotate,
    onZoomIn,
    onZoomOut,
    onFitView,
    onLoadDoc,
    onGetDoc,
    onOpenCartoucheModal,
  } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const commitSaveFavorite = () => {
    const saved = stripSim(onGetDoc());
    const cart = saved.cartouche?.titre || "Sans titre";
    const name = saveName.trim() || cart;
    const next = [...loadFavorites(), { name, date: new Date().toLocaleDateString("fr-FR"), doc: saved }];
    setFavorites(next);
    saveFavorites(next);
    toast.success(`« ${name} » ajouté aux favoris`);
    setSaveOpen(false);
    setSaveName("");
  };

  // rafraîchir la liste quand un favori est ajouté depuis le même onglet
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY) setFavorites(loadFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stripSim = (doc: CircuitDoc): CircuitDoc => ({
    ...doc,
    components: doc.components.map((c) => ({ ...c, sim: COMP_DEFS[c.type]?.initSim() ?? {} })),
    wires: doc.wires.map((w) => ({ ...w })),
  });

  const favoriteMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#ff6a3d] flex items-center gap-1.5 active:scale-[0.97] transition-colors">
        <svg className="h-3.5 w-3.5 text-[#ff6a3d]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Mes favoris
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] max-h-[340px] overflow-y-auto bg-[#141c27] border-[#2f3f4f] text-[#dfe8f2]">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.1em] text-[#5d7189]">
          {favorites.length === 0 ? "Aucun schéma enregistré" : `${favorites.length} schéma${favorites.length > 1 ? "s" : ""}`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {favorites.map((f, i) => (
          <DropdownMenuItem
            key={f.date + i}
            className="flex flex-col items-start gap-0.5 py-2 focus:bg-[#20303f]"
            onClick={() => {
              onLoadDoc(stripSim(f.doc));
              toast.success(`« ${f.name} » chargé`);
            }}
          >
            <span className="text-[12px] font-medium w-full flex items-center justify-between">
              {f.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = loadFavorites().filter((_, j) => j !== i);
                  setFavorites(next);
                  saveFavorites(next);
                  toast("Favori supprimé");
                }}
                className="text-[#5d7189] hover:text-[#ff5d5d] px-1"
                aria-label={`Supprimer ${f.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
            <span className="text-[10.5px] text-[#5d7189]">
              {f.date} · {f.doc.components.length} composants
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="focus:bg-[#20303f]"
          onClick={() => {
            const saved = stripSim(onGetDoc());
            setSaveName(saved.cartouche?.titre || "Sans titre");
            setSaveOpen(true);
          }}
        >
          <span className="text-[12px] font-semibold text-[#ff6a3d]">＋ Enregistrer le schéma actuel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap px-2.5 py-1.5 border-b border-[#26333f]" style={{ background: "#141c27" }}>
      <div className="flex items-center gap-1.5 mr-2 font-mono font-bold text-[14px] tracking-[1px] text-[#4aa8ff] select-none">
        <img src={LOGO_URL} alt="PneumaSim" className="h-6 w-6" />
        <span>PNEUMASIM</span>
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={simRunning}
        className="bg-[#ff6a3d] border border-[#ff6a3d] text-white px-2.5 py-1.5 rounded-md text-[12.5px] font-semibold hover:bg-[#ff7d56] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-colors flex items-center gap-1.5"
      >
        <Play className="h-3.5 w-3.5" fill="white" /> Simuler
      </button>
      <button
        type="button"
        onClick={onPause}
        disabled={!simRunning}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> Pause
      </button>
      <button
        type="button"
        onClick={onReset}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
        >
        <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
      </button>
      <span className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px] ml-1">Vitesse</span>
      <select
        value={simSpeed}
        onChange={(e) => onSetSpeed(parseFloat(e.target.value))}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] rounded-md px-1.5 py-1 text-[12px]"
      >
        <option value={0.5}>0.5×</option>
        <option value={1}>1×</option>
        <option value={2}>2×</option>
        <option value={4}>4×</option>
      </select>
      <span className="w-px h-[22px] bg-[#2f3f4f] mx-1" />
      <button
        type="button"
        onClick={onRotate}
        disabled={!selected}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3] disabled:opacity-40 disabled:cursor-not-allowed"
        >
        <RotateCw className="h-3.5 w-3.5" /> Pivoter
      </button>
      <button
        type="button"
        onClick={() => {
          onDelete();
        }}
        disabled={!selected}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#ff5d5d] hover:text-[#ff5d5d] disabled:opacity-40 disabled:cursor-not-allowed"
        >
        <Trash2 className="h-3.5 w-3.5" /> Supprimer
      </button>
      <span className="w-px h-[22px] bg-[#2f3f4f] mx-1" />
      <button
        type="button"
        onClick={onZoomOut}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
        >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onFitView}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
      >
        Ajuster
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
        >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <span className="w-px h-[22px] bg-[#2f3f4f] mx-1" />
      <button
        type="button"
        onClick={() => {
          downloadJson(stripSim(onGetDoc()));
          toast.success("Schéma enregistré (.json)");
        }}
        className="bg-[#1a2432] flex items-center gap-1.5 border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
      >
        <Save className="h-3.5 w-3.5" /> Enregistrer
      </button>
      {favoriteMenu}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild />
        <DialogContent className="bg-[#141c27] border-[#2f3f4f] text-[#dfe8f2]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Enregistrer aux favoris</DialogTitle>
            <DialogDescription className="text-[12px] text-[#5d7189]">
              Le schéma actuel sera conservé dans ce navigateur.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Nom du schéma"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSaveFavorite();
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaveOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={commitSaveFavorite}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3] flex items-center gap-1.5"
      >
        <FolderInput className="h-3.5 w-3.5" /> Charger
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const data = await readJsonFile(file);
            if (!data.components || !Array.isArray(data.components)) throw new Error("structure invalide");
            onLoadDoc({
              components: data.components.map((c) => ({
                ...c,
                rot: (c as { rot?: number }).rot ?? 0,
                sim: COMP_DEFS[c.type]?.initSim() ?? {},
                params: { ...c.params },
              })),
              wires: data.wires ?? [],
              cartouche: data.cartouche ?? onGetDoc().cartouche,
              counters: data.counters ?? {},
            });
            resetSim({ components: [], wires: [] } as unknown as CircuitDoc);
            toast.success("Schéma chargé");
          } catch {
            toast.error("Fichier invalide");
          }
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (!svgEl) return;
          downloadSvg(svgEl, onGetDoc().cartouche.titre);
          toast.success("Feuille exportée (.svg)");
        }}
        className="bg-[#1a2432] flex items-center gap-1.5 border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
      >
        <Image className="h-3.5 w-3.5" /> Export SVG
      </button>
      <div className="flex-1" />
      <span className="text-[11px] font-mono mr-2" style={{ color: simRunning ? "#4ade80" : "#8296ab" }}>
        {statusTxt}
      </span>
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: simRunning ? "#4ade80" : "#ff6a3d",
          boxShadow: simRunning ? "0 0 6px #4ade80" : "0 0 6px #ff6a3d",
        }}
      />
    </div>
  );
}

