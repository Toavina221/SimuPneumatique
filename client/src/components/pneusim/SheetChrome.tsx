// PneumaSim — Plan d'atelier (Blueprint Craft)
// Habillage de la feuille de plan : grille millimétrée, cadre avec zones
// de repérage alphanumériques (bandes 1..N, A..Z) et cartouche ISO
// éditables (titre, auteur, date, folio).

import { SHEET_W, SHEET_H } from "@/lib/pneusim/useCircuit";
import type { Cartouche } from "@/lib/pneusim/types";

const ZONE = 100;

function escXml(str: string): string {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function GridLayer() {
  const lines: React.JSX.Element[] = [];
  for (let x = 0; x <= SHEET_W; x += 25) {
    lines.push(
      <line
        key={`v${x}`}
        x1={x} y1={0} x2={x} y2={SHEET_H}
        stroke={x % 100 === 0 ? "#22303f" : "#1c2735"}
        strokeWidth={1}
      />
    );
  }
  for (let y = 0; y <= SHEET_H; y += 25) {
    lines.push(
      <line
        key={`h${y}`}
        x1={0} y1={y} x2={SHEET_W} y2={y}
        stroke={y % 100 === 0 ? "#22303f" : "#1c2735"}
        strokeWidth={1}
      />
    );
  }
  return <g>{lines}</g>;
}

export function FrameLayer() {
  const cols = Math.round(SHEET_W / ZONE);
  const rows = Math.round(SHEET_H / ZONE);
  const band = 22;
  const ticks: React.JSX.Element[] = [];
  for (let i = 0; i < cols; i++) {
    const cx = i * ZONE + ZONE / 2;
    ticks.push(
      <text key={`cl${i}`} x={cx} y={band / 2 + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="#8296ab">
        {i + 1}
      </text>
    );
    ticks.push(
      <text key={`clb${i}`} x={cx} y={SHEET_H - band / 2 + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="#8296ab">
        {i + 1}
      </text>
    );
    if (i > 0) {
      ticks.push(<line key={`ct${i}`} x1={i * ZONE} y1={0} x2={i * ZONE} y2={band} stroke="#2f3f4f" strokeWidth={1} />);
      ticks.push(
        <line key={`ctb${i}`} x1={i * ZONE} y1={SHEET_H - band} x2={i * ZONE} y2={SHEET_H} stroke="#2f3f4f" strokeWidth={1} />
      );
    }
  }
  for (let j = 0; j < rows; j++) {
    const cy = j * ZONE + ZONE / 2;
    const letter = String.fromCharCode(65 + j);
    ticks.push(
      <text key={`rl${j}`} x={band / 2} y={cy + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="#8296ab">
        {letter}
      </text>
    );
    ticks.push(
      <text key={`rr${j}`} x={SHEET_W - band / 2} y={cy + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" fill="#8296ab">
        {letter}
      </text>
    );
    if (j > 0) {
      ticks.push(<line key={`rt${j}`} x1={0} y1={j * ZONE} x2={band} y2={j * ZONE} stroke="#2f3f4f" strokeWidth={1} />);
      ticks.push(
        <line key={`rtr${j}`} x1={SHEET_W - band} y1={j * ZONE} x2={SHEET_W} y2={j * ZONE} stroke="#2f3f4f" strokeWidth={1} />
      );
    }
  }
  return (
    <g>
      <rect x={0} y={0} width={SHEET_W} height={SHEET_H} fill="none" stroke="#2f3f4f" strokeWidth={2} />
      <rect x={0} y={0} width={SHEET_W} height={band} fill="#1a2432" stroke="#2f3f4f" />
      <rect x={0} y={SHEET_H - band} width={SHEET_W} height={band} fill="#1a2432" stroke="#2f3f4f" />
      <rect x={0} y={0} width={band} height={SHEET_H} fill="#1a2432" stroke="#2f3f4f" />
      <rect x={SHEET_W - band} y={0} width={band} height={SHEET_H} fill="#1a2432" stroke="#2f3f4f" />
      {ticks}
    </g>
  );
}

interface CartoucheProps {
  cartouche: Cartouche;
  onEdit: (field: keyof Cartouche) => void;
}

export function CartoucheLayer({ cartouche, onEdit }: CartoucheProps) {
  const band = 22;
  const rowH = 34;
  const h = rowH * 2;
  const fullW = SHEET_W - band * 2;
  const leftW = Math.round(fullW * 0.78);
  const x = band;
  const y = SHEET_H - band - h;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={fullW} height={h} fill="#141c27" stroke="#2f3f4f" strokeWidth={1.2} />
      <line x1={0} y1={rowH} x2={fullW} y2={rowH} stroke="#2f3f4f" strokeWidth={1} />
      <line x1={leftW} y1={0} x2={leftW} y2={h} stroke="#2f3f4f" strokeWidth={1} />
      <g
        className="ct-field cursor-pointer"
        data-ct="auteur"
        onDoubleClick={() => onEdit("auteur")}
      >
        <rect x={0} y={0} width={leftW} height={rowH} fill="transparent" />
        <text x={10} y={13} fontSize={7} fill="#5d7189" letterSpacing={0.5} fontFamily="monospace">AUTEUR</text>
        <text x={90} y={23} fontSize={11} fill="#dfe8f2" fontFamily="monospace">{escXml(cartouche.auteur || "—")}</text>
      </g>
      <g
        className="ct-field cursor-pointer"
        data-ct="date"
        onDoubleClick={() => onEdit("date")}
      >
        <rect x={0} y={rowH} width={leftW} height={rowH} fill="transparent" />
        <text x={10} y={rowH + 13} fontSize={7} fill="#5d7189" letterSpacing={0.5} fontFamily="monospace">DATE</text>
        <text x={90} y={rowH + 23} fontSize={11} fill="#dfe8f2" fontFamily="monospace">{escXml(cartouche.date)}</text>
      </g>
      <g
        className="ct-field cursor-pointer"
        data-ct="titre"
        onDoubleClick={() => onEdit("titre")}
      >
        <rect x={leftW} y={0} width={fullW - leftW} height={rowH} fill="transparent" />
        <text x={leftW + 8} y={13} fontSize={7} fill="#5d7189" letterSpacing={0.5} fontFamily="monospace">TITRE</text>
        <text x={leftW + 8} y={23} fontSize={14} fill="#4aa8ff" fontWeight={700} fontFamily="monospace">
          {escXml(cartouche.titre)}
        </text>
      </g>
      <g
        className="ct-field cursor-pointer"
        data-ct="folio"
        onDoubleClick={() => onEdit("folio")}
      >
        <rect x={leftW} y={rowH} width={fullW - leftW} height={rowH} fill="transparent" />
        <text x={leftW + 8} y={rowH + 13} fontSize={7} fill="#5d7189" letterSpacing={0.5} fontFamily="monospace">FOLIO</text>
        <text x={leftW + 8} y={rowH + 23} fontSize={11} fill="#dfe8f2" fontFamily="monospace">{escXml(cartouche.folio)}</text>
      </g>
    </g>
  );
}
