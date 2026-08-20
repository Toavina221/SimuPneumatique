// PneumaSim — Plan d'atelier (Blueprint Craft)
// Import/export : sérialisation JSON du document et export SVG de la feuille.

import type { CircuitDoc } from "./types";
import { SHEET_W, SHEET_H } from "./useCircuit";

export interface SerializableDoc {
  components: {
    id: string;
    type: string;
    x: number;
    y: number;
    rot: number;
    num: string;
    params: Record<string, number | string>;
  }[];
  wires: CircuitDoc["wires"];
  cartouche: CircuitDoc["cartouche"];
  counters: Record<string, number>;
}

export function toSerializable(doc: CircuitDoc): SerializableDoc {
  return {
    components: doc.components.map((c) => ({
      id: c.id,
      type: c.type,
      x: c.x,
      y: c.y,
      rot: c.rot,
      num: c.num,
      params: { ...c.params },
    })),
    wires: doc.wires,
    cartouche: doc.cartouche,
    counters: doc.counters,
  };
}

export function downloadJson(doc: CircuitDoc): void {
  const blob = new Blob([JSON.stringify(toSerializable(doc), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.cartouche.titre || "schema"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSvg(svgEl: SVGSVGElement, titre: string): void {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("viewBox", `0 0 ${SHEET_W} ${SHEET_H}`);
  clone.setAttribute("width", String(SHEET_W));
  clone.setAttribute("height", String(SHEET_H));
  const css = Array.from(document.querySelectorAll("style"))
    .map((s) => s.textContent)
    .join("\n");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = css;
  clone.insertBefore(style, clone.firstChild);
  const src = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([src], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${titre || "schema"}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<SerializableDoc> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
