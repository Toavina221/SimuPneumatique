// PneumaSim — Plan d'atelier (Blueprint Craft)
// Barre d'outils supérieure : brand avec pastille de puissance (orange →
// verte en simulation), contrôle simulation, vitesse, édition, zoom,
// sauvegarde/chargement, export SVG. Compact, monospace, état lisible.

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
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
  Download,
  Star,
  Activity,
  AlertTriangle,
  FileOutput,
  Save,
  Trash2,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { downloadJson, downloadSvg, readJsonFile } from "@/lib/pneusim/io";
import { COMP_DEFS } from "@/lib/pneusim/defs";
import { resetSim } from "@/lib/pneusim/engine";
import type { Cartouche, CircuitDoc, Component } from "@/lib/pneusim/types";

const LOGO_URL = "/manus-storage/pneumasim-logo_42e92c26.png";

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
  onToggleGraph: () => void;
  showGraph: boolean;
  onDiagnostic: () => void;
  onExportPdf?: () => void;
  isExporting?: boolean;
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
    // Silent fail for storage
  }
}

export default function Toolbar(props: Props) {
  const { lang, t } = useTranslation();
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
    onToggleGraph,
    showGraph,
    onDiagnostic,
    onExportPdf,
    isExporting,
  } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const commitSaveFavorite = () => {
    const saved = stripSim(onGetDoc());
    const cart = saved.cartouche?.titre || (lang === 'fr' ? "Sans titre" : "Untitled");
    const name = saveName.trim() || cart;
    const next = [...loadFavorites(), { name, date: new Date().toLocaleDateString(lang === 'fr' ? "fr-FR" : "en-US"), doc: saved }];
    setFavorites(next);
    saveFavorites(next);
    toast.success(lang === 'fr' ? `« ${name} » ajouté aux favoris` : `"${name}" added to favorites`);
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
        {t('toolbar_favorites')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] max-h-[340px] overflow-y-auto bg-[#141c27] border-[#2f3f4f] text-[#dfe8f2]">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.1em] text-[#5d7189]">
          {favorites.length === 0 
            ? (lang === 'fr' ? "Aucun schéma enregistré" : "No saved schematics") 
            : `${favorites.length} ${lang === 'fr' ? "schéma" : "schematic"}${favorites.length > 1 ? "s" : ""}`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {favorites.map((f, i) => (
          <DropdownMenuItem
            key={f.date + i}
            className="flex flex-col items-start gap-0.5 py-2 focus:bg-[#20303f]"
            onClick={() => {
              onLoadDoc(stripSim(f.doc));
              toast.success(lang === 'fr' ? `« ${f.name} » chargé` : `"${f.name}" loaded`);
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
                  toast(lang === 'fr' ? "Favori supprimé" : "Favorite deleted");
                }}
                className="text-[#5d7189] hover:text-[#ff5d5d] px-1"
                aria-label={lang === 'fr' ? `Supprimer ${f.name}` : `Delete ${f.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
            <span className="text-[10.5px] text-[#5d7189]">
              {f.date} · {f.doc.components.length} {lang === 'fr' ? "composants" : "components"}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="focus:bg-[#20303f]"
          onClick={() => {
            const saved = stripSim(onGetDoc());
            setSaveName(saved.cartouche?.titre || (lang === 'fr' ? "Sans titre" : "Untitled"));
            setSaveOpen(true);
          }}
        >
          <span className="text-[12px] font-semibold text-[#ff6a3d]">＋ {lang === 'fr' ? "Enregistrer le schéma actuel" : "Save current schematic"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap px-2.5 py-1.5 border-b border-[#26333f]" style={{ background: "#141c27" }}>
      <Link href="/">
        <div className="flex items-center gap-1.5 mr-2 font-mono font-bold text-[14px] tracking-[1px] text-[#4aa8ff] select-none cursor-pointer hover:text-[#ff6a3d] transition-colors active:scale-95 group">
          <img src={LOGO_URL} alt="PneumaSim" className="h-6 w-6" />
          <span>PNEUMASIM</span>
        </div>
      </Link>
      <button
        type="button"
        onClick={onStart}
        disabled={simRunning}
        className="bg-[#ff6a3d] border border-[#ff6a3d] text-white px-2.5 py-1.5 rounded-md text-[12.5px] font-semibold hover:bg-[#ff7d56] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-colors flex items-center gap-1.5"
      >
        <Play className="h-3.5 w-3.5" fill="white" /> {t('nav_simulator')}
      </button>
      <button
        type="button"
        onClick={onPause}
        disabled={!simRunning}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg> {lang === 'fr' ? "Pause" : "Pause"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
        >
        <RotateCcw className="h-3.5 w-3.5" /> {lang === 'fr' ? "Réinitialiser" : "Reset"}
      </button>
      <span className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px] ml-1">{lang === 'fr' ? "Vitesse" : "Speed"}</span>
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
        <RotateCw className="h-3.5 w-3.5" /> {lang === 'fr' ? "Pivoter" : "Rotate"}
      </button>
      <button
        type="button"
        onClick={() => {
          onDelete();
        }}
        disabled={!selected}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#ff5d5d] hover:text-[#ff5d5d] disabled:opacity-40 disabled:cursor-not-allowed"
        >
        <Trash2 className="h-3.5 w-3.5" /> {lang === 'fr' ? "Supprimer" : "Delete"}
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
        {lang === 'fr' ? "Ajuster" : "Fit"}
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
        onClick={onToggleGraph}
        className={`bg-[#1a2432] border border-[#2f3f4f] px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors flex items-center gap-1.5 active:scale-[0.97] ${
          showGraph ? "text-[#ff6a3d] border-[#ff6a3d] bg-[#ff6a3d]/10" : "text-[#dfe8f2] hover:bg-[#20303f] hover:border-[#2c6aa3]"
        }`}
      >
        <Activity className="h-3.5 w-3.5" /> {t('toolbar_oscillo')}
      </button>
      <button
        type="button"
        onClick={onDiagnostic}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#ff5d5d] hover:text-[#ff5d5d] flex items-center gap-1.5"
      >
        <AlertTriangle className="h-3.5 w-3.5" /> {t('toolbar_diagnostic')}
      </button>
      <span className="w-px h-[22px] bg-[#2f3f4f] mx-1" />
      <button
        type="button"
        onClick={() => {
          downloadJson(stripSim(onGetDoc()));
          toast.success(lang === 'fr' ? "Schéma enregistré (.json)" : "Schematic saved (.json)");
        }}
        className="bg-[#1a2432] flex items-center gap-1.5 border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3]"
      >
        <Save className="h-3.5 w-3.5" /> {t('toolbar_save')}
      </button>
      {favoriteMenu}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild />
        <DialogContent className="bg-[#141c27] border-[#2f3f4f] text-[#dfe8f2]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">{t('toolbar_save')}</DialogTitle>
            <DialogDescription className="text-[12px] text-[#5d7189]">
              {lang === 'fr' ? 'Le schéma actuel sera conservé dans ce navigateur.' : 'Current schematic will be kept in this browser.'}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder={lang === 'fr' ? 'Nom du schéma' : 'Schematic name'}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") commitSaveFavorite();
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaveOpen(false)}>
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={commitSaveFavorite}>
              {t('toolbar_save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f] hover:border-[#2c6aa3] flex items-center gap-1.5"
      >
        <FolderInput className="h-3.5 w-3.5" /> {t('toolbar_load')}
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
            toast.success(lang === 'fr' ? "Schéma chargé" : "Schematic loaded");
          } catch {
            toast.error(lang === 'fr' ? "Fichier invalide" : "Invalid file");
          }
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={isExporting}
        onClick={onExportPdf}
        className="bg-[#1a2432] flex items-center gap-1.5 border border-[#2f3f4f] text-[#ff6a3d] px-2.5 py-1.5 rounded-md text-[12.5px] hover:bg-[#ff6a3d]/10 hover:border-[#ff6a3d] disabled:opacity-50"
      >
        <FileOutput className="h-3.5 w-3.5" /> {isExporting ? (lang === 'fr' ? 'Export...' : 'Exporting...') : (lang === 'fr' ? 'Rapport PDF' : 'PDF Report')}
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

