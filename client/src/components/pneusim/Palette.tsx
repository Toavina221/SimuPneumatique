// PneumaSim — Plan d'atelier (Blueprint Craft)
// Palette gauche : arborescence de catégories de composants avec
// vignettes SVG, draggable vers la feuille de plan.
// Style : fond panneau ardoise, labels uppercase letterspaced,
// hover border acier, vignette mono.

import { useState } from "react";
import { COLLECTION_TREE } from "@/lib/pneusim/defs";
import { getDef } from "@/lib/pneusim/engine";
import CompSymbol from "./CompSymbol";
import type { Component } from "@/lib/pneusim/types";

interface TreeNode {
  label: string;
  items?: string[];
  children?: TreeNode[];
}

function FakeComp(type: string): Component {
  const def = getDef(type)!;
  return {
    id: "_",
    type,
    x: 0,
    y: 0,
    rot: 0,
    num: `${def.prefix}1`,
    params: { ...def.defaultParams },
    sim: def.initSim(),
  };
}

function TreeItem({ node }: { node: TreeNode }) {
  const [open, setOpen] = useState(true);

  if (node.items) {
    return (
      <div className="flex flex-col gap-0.5 py-1">
        {node.items.map((key) => {
          const def = getDef(key);
          if (!def) return null;
          const comp = FakeComp(key);
          return (
            <div
              key={key}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", key);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-grab border border-transparent hover:bg-[#1a2432] hover:border-[#2f3f4f] active:cursor-grabbing select-none"
              data-tooltip-id="ps-tooltip"
              data-tooltip-title={`${def.label} — ISO 1219`}
              data-tooltip-doc={def.doc}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border border-[#26333f] bg-[#111a26] group-hover:border-[#ff6a3d]/50">
                <svg width={34} height={34} viewBox={`-16 -16 ${def.w + 32} ${def.h + 32}`} style={{ overflow: "visible" }}>
                  <CompSymbol comp={comp} />
                </svg>
              </span>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[12px] font-medium text-[#dfe8f2] leading-snug">{def.label}</span>
                <span className="text-[10px] font-mono text-[#5d7189] mt-0.5">{def.prefix}·</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-1 py-1 rounded-sm text-[12px] text-[#8296ab] hover:bg-[#1a2432] hover:text-[#dfe8f2] transition-colors ${open ? "open" : ""}`}
      >
        <svg
          className="w-[10px] text-[9px] text-[#5d7189] inline-block transition-transform duration-100"
          viewBox="0 0 24 24" fill="currentColor" style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          <path d="M8 5l8 7-8 7z"/>
        </svg>
        <svg className="h-3.5 w-3.5 text-[#ff6a3d]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
        {node.label}
      </button>
      <div
        className={`ml-3.5 border-l border-dashed border-[#2f3f4f] pl-1.5 overflow-hidden transition-all ${open ? "block" : "hidden"}`}
      >
        {node.children?.map((ch, i) => (
          <TreeItem key={`${node.label}-${i}`} node={ch} />
        ))}
      </div>
    </div>
  );
}

export default function Palette() {
  return (
    <div className="h-full overflow-y-auto py-2 px-1.5 pb-10">
      <TreeItem node={COLLECTION_TREE} />
    </div>
  );
}
