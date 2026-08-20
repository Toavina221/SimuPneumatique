// PneumaSim — Plan d'atelier (Blueprint Craft)
// Infobulle ISO 1219 : un seul tooltip global (id ps-tooltip) qui se positionne
// au survol de tout élément portant data-tooltip-id="ps-tooltip".
// Contenu : titre (repère + libellé) + description de fonctionnement.

import { useEffect, useRef, useState } from "react";

type Tip = { title: string; doc: string; x: number; y: number } | null;

export default function IsoTooltip() {
  const [tip, setTip] = useState<Tip>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const findHost = (el: EventTarget | null): Element | null => {
      let cur = el as Element | null;
      while (cur && cur !== document.documentElement) {
        if (cur instanceof Element && cur.getAttribute("data-tooltip-id") === "ps-tooltip") {
          return cur;
        }
        cur = cur.parentElement;
      }
      return null;
    };
    const onOver = (e: MouseEvent) => {
      const host = findHost(e.target);
      if (!host) return;
      const title = host.getAttribute("data-tooltip-title") || "";
      const doc = host.getAttribute("data-tooltip-doc") || "";
      setTip({ title, doc, x: e.clientX, y: e.clientY });
    };
    const onMove = (e: MouseEvent) => {
      if (tip) setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null));
    };
    const onOut = (e: MouseEvent) => {
      const host = findHost(e.target);
      if (!host) return;
      setTip(null);
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onOut);
    };
  }, [tip]);

  if (!tip) return null;
  return (
    <div
      ref={ref}
      className="ps-tooltip fixed z-[999] pointer-events-none rounded-md border border-[#2f3f4f] px-3 py-2 max-w-[280px] shadow-lg"
      style={{
        left: tip.x + 14,
        top: tip.y + 14,
        background: "rgba(10,15,22,0.97)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="text-[11px] font-bold font-mono uppercase tracking-[0.08em] text-[#ff6a3d]">
        {tip.title}
      </div>
      <div className="mt-1 text-[11.5px] leading-relaxed text-[#c3d2e2]">{tip.doc}</div>
    </div>
  );
}
