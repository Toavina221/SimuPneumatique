// PneumaSim — Plan d'atelier (Blueprint Craft)
// Modales de propriétés : composants (repère, temps de course, restriction,
// capteur) et cartouche de plan (titre, auteur, date, folio).
// Style : panneau ardoise, labels uppercase, bouton primary bleu acier.

import { useEffect, useRef, useState } from "react";
import { getDef } from "@/lib/pneusim/engine";
import type { Cartouche, Component } from "@/lib/pneusim/types";
import type { CircuitDoc } from "@/lib/pneusim/types";

interface CompModalProps {
  comp: Component;
  doc: CircuitDoc;
  onSave: (patch: Partial<Component>) => void;
  onClose: () => void;
}

export function CompPropertyModal({ comp, doc, onSave, onClose }: CompModalProps) {
  const def = getDef(comp.type);
  const [num, setNum] = useState(comp.num);
  const [strokeTime, setStrokeTime] = useState(String(comp.params.strokeTime ?? 2));
  const [restriction, setRestriction] = useState(Number(comp.params.restriction ?? 60));
  const [targetId, setTargetId] = useState(String(comp.params.targetId ?? ""));
  const [position, setPosition] = useState(String(comp.params.position ?? "extended"));

  const ok = () => {
    const patch: Partial<Component> = { num: num || comp.num };
    if (comp.type === "cylinder_double" || comp.type === "cylinder_single" || comp.type === "cylinder_prop") {
      patch.params = {
        ...comp.params,
        strokeTime: parseFloat(strokeTime) || 2,
      };
    } else if (comp.type === "flowcontrol") {
      patch.params = { ...comp.params, restriction };
    } else if (comp.type === "sensor") {
      patch.params = { ...comp.params, targetId, position };
    }
    onSave(patch);
    onClose();
  };

  return (
    <div className="min-w-[320px] max-w-[420px]">
      <h3 className="m-0 mb-3.5 text-[14px] text-[#4aa8ff] tracking-wide">{def?.label}</h3>
      <div className="mb-3 flex flex-col gap-1.5">
        <label className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px]">Repère</label>
        <input
          type="text"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-2 rounded-md text-[13px]"
        />
      </div>
      {(comp.type === "cylinder_double" || comp.type === "cylinder_single" || comp.type === "cylinder_prop") && (
        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px]">Temps de course complète (s)</label>
          <input
            type="number"
            min={0.2}
            max={20}
            step={0.1}
            value={strokeTime}
            onChange={(e) => setStrokeTime(e.target.value)}
            className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-2 rounded-md text-[13px]"
          />
        </div>
      )}
      {comp.type === "flowcontrol" && (
        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px]">
            Restriction — <span className="font-mono text-[#4aa8ff]">{restriction}%</span>
          </label>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={restriction}
            onChange={(e) => setRestriction(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      )}
      {comp.type === "sensor" && (
        <>
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px]">Vérin surveillé</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-2 rounded-md text-[13px]"
            >
              <option value="">— aucun —</option>
              {doc.components
                .filter((c) => c.type === "cylinder_double" || c.type === "cylinder_single" || c.type === "cylinder_prop")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.num}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3 flex flex-col gap-1.5">
            <label className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px]">Position détectée</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-2 rounded-md text-[13px]"
            >
              <option value="extended">Sorti (fin de course +)</option>
              <option value="retracted">Rentré (fin de course −)</option>
            </select>
          </div>
        </>
      )}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-3 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f]"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={ok}
          className="bg-gradient-to-b from-[#2c7fd6] to-[#1f63ac] border border-[#3a8fe0] text-white px-3 py-1.5 rounded-md text-[12.5px] font-semibold hover:from-[#3488e0] hover:to-[#256fb8]"
        >
          Valider
        </button>
      </div>
    </div>
  );
}

interface CartoucheModalProps {
  field: keyof Cartouche;
  cartouche: Cartouche;
  onSave: (field: keyof Cartouche, value: string) => void;
  onClose: () => void;
}

const FIELD_META: Record<keyof Cartouche, { label: string; type: string }> = {
  titre: { label: "Titre du schéma", type: "text" },
  auteur: { label: "Auteur", type: "text" },
  date: { label: "Date", type: "date" },
  folio: { label: "Folio (n° de page)", type: "text" },
};

export function CartoucheModal({ field, cartouche, onSave, onClose }: CartoucheModalProps) {
  const [value, setValue] = useState(cartouche[field]);
  const meta = FIELD_META[field];
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const ok = () => {
    onSave(field, value);
    onClose();
  };

  return (
    <div className="min-w-[320px] max-w-[420px]">
      <h3 className="m-0 mb-3.5 text-[14px] text-[#4aa8ff] tracking-wide">Modifier — {meta.label}</h3>
      <div className="mb-3 flex flex-col gap-1.5">
        <label className="text-[11px] text-[#8296ab] uppercase tracking-[0.5px]">{meta.label}</label>
        <input
          ref={inputRef}
          type={meta.type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ok();
          }}
          className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-2.5 py-2 rounded-md text-[13px]"
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-[#1a2432] border border-[#2f3f4f] text-[#dfe8f2] px-3 py-1.5 rounded-md text-[12.5px] hover:bg-[#20303f]"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={ok}
          className="bg-gradient-to-b from-[#2c7fd6] to-[#1f63ac] border border-[#3a8fe0] text-white px-3 py-1.5 rounded-md text-[12.5px] font-semibold hover:from-[#3488e0] hover:to-[#256fb8]"
        >
          Valider
        </button>
      </div>
    </div>
  );
}
