// PneumaSim — Plan d'atelier (Blueprint Craft)
// Utilitaires géométriques : position des ports après rotation,
// chemin orthogonal des liaisons, conversion écran→feuille.

import { getDef } from "./engine";
import type { Component, PortDef } from "./types";

export interface XY {
  x: number;
  y: number;
}

/** Position absolue d'un port (coordonnées feuille), rotation appliquée. */
export function wireEndpoint(c: Component, portId: string): XY | null {
  const def = getDef(c.type);
  if (!def) return null;
  const p = def.ports.find((pp: PortDef) => pp.id === portId);
  if (!p) return null;
  const rad = (c.rot * Math.PI) / 180;
  const cx = def.w / 2;
  const cy = def.h / 2;
  const dx = p.x - cx;
  const dy = p.y - cy;
  const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
  return { x: c.x + cx + rx, y: c.y + cy + ry };
}

/** Chemin orthogonal : horizontal → vertical → horizontal. */
export function lPath(x1: number, y1: number, x2: number, y2: number): string {
  const midx = (x1 + x2) / 2;
  return `M${x1},${y1} L${midx},${y1} L${midx},${y2} L${x2},${y2}`;
}

/** Conversion coordonnées client (souris) → coordonnées feuille SVG. */
export function screenToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): XY {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM()?.inverse();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm);
  return { x: p.x, y: p.y };
}

/** Bounding box d'un composant incluant le débord des ports. */
export function boundingBoxPadded(type: string): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const def = getDef(type);
  if (!def)
    return { minX: -4, minY: -4, maxX: 4, maxY: 4 };
  let minX = 0;
  let minY = 0;
  let maxX = def.w;
  let maxY = def.h;
  def.ports.forEach((p) => {
    minX = Math.min(minX, p.x - 6);
    maxX = Math.max(maxX, p.x + 6);
    minY = Math.min(minY, p.y - 6);
    maxY = Math.max(maxY, p.y + 6);
  });
  return { minX: minX - 4, minY: minY - 4, maxX: maxX + 4, maxY: maxY + 4 };
}

/** Vue cadrée sur la feuille (avec marge de 8 %). */
export function fitView(clientW: number, clientH: number, sheetW: number, sheetH: number) {
  const ratio = clientW / clientH;
  const sheetRatio = sheetW / sheetH;
  let w: number;
  let h: number;
  if (ratio > sheetRatio) {
    h = sheetH * 1.08;
    w = h * ratio;
  } else {
    w = sheetW * 1.08;
    h = w / ratio;
  }
  return { x: sheetW / 2 - w / 2, y: sheetH / 2 - h / 2, w, h };
}

export function zoomAt(
  view: { x: number; y: number; w: number; h: number },
  center: { x: number; y: number },
  factor: number
) {
  const nw = view.w * factor;
  const nh = view.h * factor;
  return {
    x: center.x - (center.x - view.x) * (nw / view.w),
    y: center.y - (center.y - view.y) * (nh / view.h),
    w: nw,
    h: nh,
  };
}
