// PneumaSim — Plan d'atelier (Blueprint Craft)
// Rendu SVG des symboles de composants (norme ISO 1219).
// Couleurs : orange #ff6a3d = air sous pression ; gris acier = repos ;
// ambre #ffd23f = signal de pilotage actif. Rendu fidèle au prototype.

import { getDef } from "@/lib/pneusim/engine";
import type { Component } from "@/lib/pneusim/types";
import { getComp } from "./editorStore";

interface Props {
  comp: Component;
}

// palette (résolution JS des custom properties pour le rendu inline)
const COL = {
  pressurized: "#ff6a3d",
  unpressurized: "#4b5b6e",
  signalOn: "#ffd23f",
  signalOff: "#3d4a5a",
  panel2: "#1a2432",
  line: "#26333f",
  line2: "#2f3f4f",
  textDim: "#8296ab",
  textDim2: "#5d7189",
  accent: "#4aa8ff",
  rod: "#c7d3de",
};

export default function CompSymbol({ comp }: Props) {
  const def = getDef(comp.type);
  if (!def) return null;

  const pA = !!comp._pA;
  const pB = !!comp._pB;
  const pIN = !!comp._pIN;
  const sim = comp.sim as Record<string, unknown>;

  switch (comp.type) {
    case "source": {
      const on = !!sim.enabled;
      const col = on ? COL.pressurized : COL.unpressurized;
      return (
        <>
          <circle cx={30} cy={30} r={26} fill={COL.panel2} stroke={col} strokeWidth={2.4} />
          <path
            d="M 16 34 A 14 14 0 0 1 30 18"
            fill="none" stroke={col} strokeWidth={2.4}
          />
          <path
            d="M 44 26 A 14 14 0 0 1 30 42"
            fill="none" stroke={col} strokeWidth={2.4}
          />
          <circle cx={30} cy={30} r={4} fill={col} />
          <text x={30} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {on ? "ON" : "OFF"}
          </text>
        </>
      );
    }
    case "valve32": {
      const act = sim.state === "actuated";
      const boxFill = act ? "#2a3f2f" : COL.panel2;
      const flow =
        sim.state === "actuated" ? (
          <>
            <path d="M20,44 L20,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
            <path d="M40,44 l12,0 M46,38 l0,12" stroke={COL.textDim2} strokeWidth={2} />
          </>
        ) : (
          <>
            <path d="M20,0 L46,44" stroke={COL.accent} strokeWidth={2.2} fill="none" />
            <path d="M14,44 l12,0 M20,38 l0,12" stroke={COL.textDim2} strokeWidth={2} />
          </>
        );
      return (
        <>
          <rect x={4} y={2} width={52} height={40} rx={4} fill={boxFill} stroke={COL.line2} strokeWidth={1.4} />
          {flow}
          <path
            d="M -2,22 l4,-7 l4,14 l4,-14 l4,14 l4,-7"
            fill="none" stroke={COL.textDim} strokeWidth={1.6}
            transform="translate(-8,0)"
          />
          <path d="M62,14 a8,8 0 1 1 0,16" fill="none" stroke={COL.textDim} strokeWidth={1.6} />
          <line x1={70} y1={14} x2={70} y2={30} stroke={COL.textDim} strokeWidth={1.6} />
          <text x={20} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          <text x={20} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">P</text>
          <text x={46} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">R</text>
        </>
      );
    }
    case "valve52_mono":
    case "valve52_bi": {
      const right = sim.state === "right";
      const boxFill = right ? "#2a3f2f" : COL.panel2;
      const flow = right ? (
        <>
          <path d="M40,54 L15,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M65,0 L65,54" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M9,54 l12,0 M15,48 l0,6" stroke={COL.textDim2} strokeWidth={2} />
        </>
      ) : (
        <>
          <path d="M40,54 L65,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M15,0 L15,54" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M59,54 l12,0 M65,48 l0,6" stroke={COL.textDim2} strokeWidth={2} />
        </>
      );
      return (
        <>
          <rect x={4} y={2} width={72} height={50} rx={4} fill={boxFill} stroke={COL.line2} strokeWidth={1.4} />
          {flow}
          <rect x={-16} y={20} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={-16} y1={20} x2={-6} y2={34} stroke={COL.textDim} strokeWidth={1} />
          {comp.type === "valve52_bi" && (
            <>
              <rect x={82} y={20} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
              <line x1={82} y1={20} x2={92} y2={34} stroke={COL.textDim} strokeWidth={1} />
            </>
          )}
          {comp.type === "valve52_mono" && (
            <>
              <path d="M84,20 a7,7 0 1 1 0,14" fill="none" stroke={COL.textDim} strokeWidth={1.6} />
              <line x1={92} y1={20} x2={92} y2={34} stroke={COL.textDim} strokeWidth={1.6} />
            </>
          )}
          <text x={15} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          <text x={65} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">B</text>
          <text x={15} y={64} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">R</text>
          <text x={40} y={64} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">P</text>
          <text x={65} y={64} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">S</text>
          <text x={-11} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y1</text>
          {comp.type === "valve52_bi" && (
            <text x={91} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y2</text>
          )}
        </>
      );
    }
    case "cylinder_double":
    case "cylinder_single": {
      const pos = ((sim.pos as number) ?? 0) as number;
      const pistonX = 10 + pos * (80 - 8);
      const rodTip = 95 + pos * 55;
      return (
        <>
          <rect x={0} y={0} width={90} height={34} rx={2} fill={COL.panel2} stroke={COL.line2} strokeWidth={1.6} />
          <rect x={4} y={4} width={82} height={26} fill="none" stroke={COL.line} strokeWidth={1} />
          <rect
            x={pistonX} y={2} width={8} height={30}
            fill={pos > 0.5 ? COL.accent : "#3a4a5c"} stroke={COL.textDim} strokeWidth={1}
          />
          <line x1={pistonX + 8} y1={17} x2={rodTip} y2={17} stroke={COL.rod} strokeWidth={5} />
          <rect x={rodTip} y={8} width={6} height={18} fill={COL.rod} />
          {comp.type === "cylinder_single" && (
            <path
              d={`M${rodTip + 6},17 l5,-5 l5,10 l5,-10 l5,10 l5,-5`}
              fill="none" stroke={COL.textDim} strokeWidth={1.4}
            />
          )}
          <circle cx={10} cy={34} r={2.6} fill={pA ? COL.pressurized : COL.unpressurized} />
          {comp.type === "cylinder_double" && (
            <circle cx={80} cy={34} r={2.6} fill={pB ? COL.pressurized : COL.unpressurized} />
          )}
          <text x={10} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          {comp.type === "cylinder_double" && (
            <text x={80} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">B</text>
          )}
          <text x={45} y={-6} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {Math.round(pos * 100)}%
          </text>
        </>
      );
    }
    case "cylinder_prop": {
      // Vérin proportionnel : corps + piston à droite, tige dont l'extension
      // suit la pression A (course ∝ pression). Triangle « ∝ » sous le corps.
      const pos = ((sim.pos as number) ?? 0) as number;
      const rodTip = 95 + pos * 55;
      return (
        <>
          <rect x={0} y={0} width={90} height={34} rx={2} fill={COL.panel2} stroke={COL.line2} strokeWidth={1.6} />
          <rect x={4} y={4} width={82} height={26} fill="none" stroke={COL.line} strokeWidth={1} />
          <rect
            x={82} y={2} width={8} height={30}
            fill={pos > 0.5 ? COL.accent : "#3a4a5c"} stroke={COL.textDim} strokeWidth={1}
          />
          <line x1={90} y1={17} x2={rodTip} y2={17} stroke={COL.rod} strokeWidth={5} />
          <rect x={rodTip} y={8} width={6} height={18} fill={COL.rod} />
          {/* triangle proportionnel */}
          <path
            d="M10,40 L26,40 L18,50 Z"
            fill={COL.signalOff} stroke={COL.textDim2} strokeWidth={1.2}
          />
          <circle cx={10} cy={34} r={2.6} fill={pA ? COL.pressurized : COL.unpressurized} />
          <text x={10} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          <text x={45} y={-6} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {Math.round(pos * 100)}%
          </text>
        </>
      );
    }
    case "flowcontrol": {
      const r = (comp.params.restriction ?? 60) as number;
      return (
        <>
          <line x1={0} y1={12} x2={40} y2={12} stroke={COL.textDim} strokeWidth={2} />
          <path d="M8,4 L32,20" stroke={COL.textDim} strokeWidth={2} />
          <path d="M24,4 l8,0 l0,8" fill="none" stroke={COL.textDim} strokeWidth={1.6} />
          <text x={20} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {r}%
          </text>
        </>
      );
    }
    case "checkvalve":
      return (
        <>
          <line x1={0} y1={10} x2={36} y2={10} stroke={COL.textDim} strokeWidth={2} />
          <path d="M10,2 L10,18 L28,10 Z" fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.6} />
          <line x1={28} y1={2} x2={28} y2={18} stroke={COL.textDim} strokeWidth={1.6} />
        </>
      );
    case "shuttle":
      return (
        <>
          <path d="M0,0 L34,0 L44,17 L34,34 L0,34 Z" fill={COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          <circle cx={17} cy={17} r={7} fill="none" stroke={COL.textDim} strokeWidth={1.4} />
          <text x={10} y={52} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">OU</text>
        </>
      );
    case "dualpressure":
      return (
        <>
          <path d="M0,0 L34,0 L44,17 L34,34 L0,34 Z" fill={COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          <text x={17} y={21} textAnchor="middle" fontFamily="monospace" fontSize={11} fill={COL.textDim}>
            &amp;
          </text>
          <text x={10} y={52} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">ET</text>
        </>
      );
    case "sensor": {
      const on = !!sim.active;
      const col = on ? COL.signalOn : COL.textDim2;
      const target = getComp(comp.params.targetId as string);
      return (
        <>
          <circle cx={17} cy={15} r={13} fill={COL.panel2} stroke={col} strokeWidth={2.2} />
          <circle cx={17} cy={15} r={4.5} fill={col} />
          <text x={17} y={-3} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {target ? target.num : "?"}{" "}
            {comp.params.position === "extended" ? "sorti" : "rentré"}
          </text>
        </>
      );
    }
    case "gauge": {
      const ang = pIN ? -40 : -140;
      const rad = (ang * Math.PI) / 180;
      const nx = 15 + 11 * Math.cos(rad);
      const ny = 13 + 11 * Math.sin(rad);
      return (
        <>
          <circle cx={15} cy={13} r={13} fill={COL.panel2} stroke={COL.line2} strokeWidth={1.6} />
          <line x1={15} y1={13} x2={nx} y2={ny} stroke={pIN ? COL.pressurized : COL.textDim} strokeWidth={1.6} />
          <circle cx={15} cy={13} r={1.6} fill={COL.textDim} />
        </>
      );
    }
    case "silencer":
      return (
        <>
          <path d="M0,11 L10,11" stroke={COL.textDim} strokeWidth={2} />
          <path d="M10,2 L22,6 L22,16 L10,20 Z" fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={14} y1={6} x2={14} y2={16} stroke={COL.textDim} strokeWidth={1} />
          <line x1={18} y1={5} x2={18} y2={17} stroke={COL.textDim} strokeWidth={1} />
        </>
      );
    case "valve32_bi": {
      // 3/2 bistable : mémoire, piloté par impulsions Y1 (actionne) / Y2 (repos)
      const act = sim.state === "actuated";
      return (
        <>
          <rect x={4} y={2} width={52} height={40} rx={4} fill={act ? "#2a3f2f" : COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          {act ? (
            <>
              <path d="M20,44 L20,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
              <path d="M40,44 l12,0 M46,38 l0,12" stroke={COL.textDim2} strokeWidth={2} />
            </>
          ) : (
            <>
              <path d="M20,0 L46,44" stroke={COL.accent} strokeWidth={2.2} fill="none" />
              <path d="M14,44 l12,0 M20,38 l0,12" stroke={COL.textDim2} strokeWidth={2} />
            </>
          )}
          <rect x={-16} y={15} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={-16} y1={15} x2={-6} y2={29} stroke={COL.textDim} strokeWidth={1} />
          <rect x={62} y={15} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={62} y1={15} x2={72} y2={29} stroke={COL.textDim} strokeWidth={1} />
          <text x={-11} y={41} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y1</text>
          <text x={67} y={41} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y2</text>
          <text x={20} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          <text x={20} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">P</text>
          <text x={46} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">R</text>
        </>
      );
    }
    case "valve53_closed":
    case "valve53_open": {
      // 5/3 : 3 cases — gauche | centre | droite ; centres fermés ou ouverts
      const right = sim.state === "right";
      const left = sim.state === "left";
      const boxFill = right || left ? "#2a3f2f" : COL.panel2;
      const closed = comp.type === "valve53_closed";
      const flow = right ? (
        <>
          <path d="M40,54 L15,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M65,0 L65,54" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M9,54 l12,0 M15,48 l0,6" stroke={COL.textDim2} strokeWidth={2} />
          <rect x={28} y={12} width={24} height={30} fill="none" stroke={COL.textDim} strokeWidth={1.4} />
        </>
      ) : left ? (
        <>
          <path d="M40,54 L65,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M15,0 L15,54" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          <path d="M59,54 l12,0 M65,48 l0,6" stroke={COL.textDim2} strokeWidth={2} />
          <rect x={28} y={12} width={24} height={30} fill="none" stroke={COL.textDim} strokeWidth={1.4} />
        </>
      ) : closed ? (
        <>
          <path d="M22,18 L58,18" stroke={COL.textDim} strokeWidth={1.6} />
          <path d="M22,36 L58,36" stroke={COL.textDim} strokeWidth={1.6} />
        </>
      ) : (
        <>
          <path d="M15,0 L15,54" stroke={COL.textDim} strokeWidth={1.8} fill="none" />
          <path d="M65,0 L65,54" stroke={COL.textDim} strokeWidth={1.8} fill="none" />
          <path d="M40,54 L40,36 L33,36" stroke={COL.textDim} strokeWidth={1.8} fill="none" />
        </>
      );
      return (
        <>
          <rect x={4} y={2} width={72} height={50} rx={4} fill={boxFill} stroke={COL.line2} strokeWidth={1.4} />
          {flow}
          <rect x={-16} y={20} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={-16} y1={20} x2={-6} y2={34} stroke={COL.textDim} strokeWidth={1} />
          <rect x={82} y={20} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={82} y1={20} x2={92} y2={34} stroke={COL.textDim} strokeWidth={1} />
          <text x={15} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          <text x={65} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">B</text>
          <text x={15} y={64} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">R</text>
          <text x={40} y={64} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">P</text>
          <text x={65} y={64} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">S</text>
          <text x={-11} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y1</text>
          <text x={91} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y2</text>
        </>
      );
    }
    case "valve22": {
      const on = sim.state === "open";
      return (
        <>
          <rect x={4} y={2} width={52} height={40} rx={4} fill={on ? "#2a3f2f" : COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          {on ? (
            <path d="M12,44 L12,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
          ) : (
            <>
              <path d="M12,44 L12,26 M12,16 L12,0" stroke={COL.accent} strokeWidth={2.2} fill="none" />
              <line x1={6} y1={21} x2={18} y2={21} stroke={COL.textDim} strokeWidth={2} />
            </>
          )}
          <rect x={42} y={37} width={10} height={14} fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={42} y1={37} x2={52} y2={51} stroke={COL.textDim} strokeWidth={1} />
          <text x={12} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">A</text>
          <text x={12} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">P</text>
          <text x={47} y={62} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y1</text>
        </>
      );
    }
    case "timevalve": {
      const on = !!sim.armed;
      return (
        <>
          <rect x={4} y={2} width={52} height={40} rx={4} fill={on ? "#2a3f2f" : COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          <path d="M4,22 L14,22" stroke={COL.textDim} strokeWidth={2} />
          <path d="M46,22 L56,22" stroke={on ? COL.accent : COL.textDim} strokeWidth={2} />
          <circle cx={30} cy={22} r={16} fill="none" stroke={COL.textDim} strokeWidth={1.6} />
          <line x1={30} y1={22} x2={30} y2={12} stroke={on ? COL.signalOn : COL.textDim} strokeWidth={1.8} />
          <text x={30} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {(comp.params.delay as number) ?? 1.5}s
          </text>
          <text x={30} y={54} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Y1</text>
        </>
      );
    }
    case "reservoir":
      return (
        <>
          <ellipse cx={28} cy={22} rx={24} ry={16} fill={COL.panel2} stroke={pA ? COL.pressurized : COL.line2} strokeWidth={1.6} />
          <line x1={28} y1={6} x2={28} y2={38} stroke={COL.textDim} strokeWidth={1} />
          <path d="M8,22 q20,-8 40,0" fill="none" stroke={COL.textDim} strokeWidth={1} />
          <text x={28} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">Z·Réservoir</text>
        </>
      );
    case "filter":
      return (
        <>
          <rect x={4} y={4} width={32} height={16} rx={2} fill={COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          <line x1={0} y1={12} x2={4} y2={12} stroke={COL.textDim} strokeWidth={2} />
          <line x1={36} y1={12} x2={40} y2={12} stroke={COL.textDim} strokeWidth={2} />
          <path d="M10,20 L10,36 L26,20 Z" fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={18} y1={36} x2={18} y2={40} stroke={COL.textDim} strokeWidth={1.6} />
          <line x1={12} y1={12} x2={30} y2={12} stroke={pA ? COL.pressurized : COL.textDim} strokeWidth={1.2} />
        </>
      );
    case "lubricator":
      return (
        <>
          <rect x={4} y={4} width={32} height={16} rx={2} fill={COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          <line x1={0} y1={12} x2={4} y2={12} stroke={COL.textDim} strokeWidth={2} />
          <line x1={36} y1={12} x2={40} y2={12} stroke={COL.textDim} strokeWidth={2} />
          <path d="M10,20 L10,36 L26,36 L26,20" fill="none" stroke={COL.textDim} strokeWidth={1.4} />
          <line x1={18} y1={36} x2={18} y2={40} stroke={COL.textDim} strokeWidth={1.6} />
          <circle cx={18} cy={28} r={3} fill={COL.textDim} />
          <line x1={12} y1={12} x2={30} y2={12} stroke={pA ? COL.pressurized : COL.textDim} strokeWidth={1.2} />
        </>
      );
    case "quickexhaust":
      return (
        <>
          <path d="M0,0 L34,0 L44,17 L34,34 L0,34 Z" fill={COL.panel2} stroke={COL.line2} strokeWidth={1.4} />
          <circle cx={17} cy={17} r={6} fill="none" stroke={COL.textDim} strokeWidth={1.4} />
          <path d="M22,17 l10,-8" stroke={COL.textDim} strokeWidth={1.6} />
          <path d="M20,26 l8,-6" stroke={COL.textDim} strokeWidth={1.6} />
          <text x={22} y={46} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">R</text>
        </>
      );
    case "press_switch": {
      const on = !!sim.active;
      return (
        <>
          <circle cx={18} cy={16} r={14} fill={COL.panel2} stroke={on ? COL.signalOn : COL.line2} strokeWidth={2} />
          <path d="M8,16 l14,0 l6,-8" fill="none" stroke={on ? COL.signalOn : COL.textDim} strokeWidth={1.6} />
          <text x={18} y={-4} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {(comp.params.threshold as number) ?? 4.5} bar
          </text>
        </>
      );
    }
    case "motor": {
      const on = !!sim.running;
      return (
        <>
          <circle cx={28} cy={22} r={20} fill={COL.panel2} stroke={on ? COL.pressurized : COL.line2} strokeWidth={2} />
          <circle cx={28} cy={22} r={9} fill="none" stroke={on ? COL.accent : COL.textDim} strokeWidth={1.8} />
          <path d={on ? "M28,13 l6,-4 M28,31 l-6,4 M19,22 l-6,-3" : "M28,13 M28,31 M19,22"} stroke={on ? COL.accent : COL.textDim} strokeWidth={1.4} />
          <line x1={0} y1={22} x2={8} y2={22} stroke={COL.textDim} strokeWidth={2} />
          <path d="M14,22 A14,14 0 0 1 28,8" fill="none" stroke={on ? COL.pressurized : COL.textDim2} strokeWidth={1.4} />
          <text x={28} y={52} textAnchor="middle" fill={COL.textDim2} fontSize={8} fontFamily="monospace">
            {on ? "RUN" : "—"}
          </text>
        </>
      );
    }
    case "vent":
      return (
        <>
          <path d="M11,0 L11,12" stroke={COL.textDim} strokeWidth={2} />
          <path d="M3,12 L19,12 L19,20 L11,22 L3,20 Z" fill={COL.panel2} stroke={COL.textDim} strokeWidth={1.4} />
          <path d="M4,18 L1,21 M18,18 L21,21 M11,22 L11,24" stroke={COL.textDim} strokeWidth={1.2} />
        </>
      );
    default:
      return null;
  }
}
