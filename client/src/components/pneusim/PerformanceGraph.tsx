// PneumaSim — Plan d'atelier (Blueprint Craft)
// Composant Oscilloscope : affiche l'évolution temporelle de la pression et des positions.

import { useEffect, useRef, useState } from "react";
import { Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Component } from "@/lib/pneusim/types";

interface PerformanceGraphProps {
  components: Component[];
  pressurized: Set<string>;
  isOpen: boolean;
  onClose: () => void;
}

export default function PerformanceGraph({ components, pressurized, isOpen, onClose }: PerformanceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<Record<string, number[]>>({});
  const [monitored, setMonitored] = useState<string[]>([]);

  // Mise à jour de l'historique
  useEffect(() => {
    const actionneurs = components.filter(c => 
      ["cylinder_double", "cylinder_single", "cylinder_rodless", "cylinder_prop", "rotary_actuator", "bellows"].includes(c.type)
    );
    
    // On garde les 100 derniers points
    const maxPoints = 150;
    
    actionneurs.forEach(c => {
      if (!historyRef.current[c.id]) historyRef.current[c.id] = [];
      const pos = (c.sim.pos as number) || 0;
      historyRef.current[c.id].push(pos);
      if (historyRef.current[c.id].length > maxPoints) historyRef.current[c.id].shift();
    });

    // Pression source (id: source)
    const source = components.find(c => c.type === "source");
    if (source) {
      if (!historyRef.current["source"]) historyRef.current["source"] = [];
      const p = pressurized.has(`${source.id}:P`) ? 1 : 0;
      historyRef.current["source"].push(p);
      if (historyRef.current["source"].length > maxPoints) historyRef.current["source"].shift();
    }

    if (monitored.length === 0 && actionneurs.length > 0) {
      setMonitored([actionneurs[0].id]);
    }
  }, [components, pressurized, monitored]);

  // Rendu Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grille
      ctx.strokeStyle = "#26333f";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = 20 + i * (canvas.height - 40) / 4;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
      }

      // Dessin des courbes
      monitored.forEach((id, idx) => {
        const data = historyRef.current[id];
        if (!data || data.length < 2) return;

        ctx.strokeStyle = idx === 0 ? "#ff6a3d" : "#4aa8ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((val, i) => {
          const x = 40 + i * (canvas.width - 60) / 149;
          const y = (canvas.height - 20) - val * (canvas.height - 40);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      // Labels
      ctx.fillStyle = "#8296ab";
      ctx.font = "10px monospace";
      ctx.fillText("1.0", 10, 25);
      ctx.fillText("0.5", 10, canvas.height / 2 + 5);
      ctx.fillText("0.0", 10, canvas.height - 15);
    };

    const anim = requestAnimationFrame(render);
    return () => cancelAnimationFrame(anim);
  }, [isOpen, monitored]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-4 bottom-20 w-[320px] rounded-xl border border-[#2f3f4f] overflow-hidden z-40"
      style={{ background: "rgba(20, 28, 39, 0.95)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#26333f] bg-[#1a2431]">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-[#ff6a3d]" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Oscilloscope Temps Réel</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-[#5d7189]" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={120} 
          className="w-full bg-[#0d1219] rounded border border-[#26333f]"
        />
        
        <div className="mt-3 flex flex-wrap gap-2">
          {components.filter(c => ["cylinder_double", "cylinder_single", "motor", "cylinder_prop"].includes(c.type)).map(c => (
            <button
              key={c.id}
              onClick={() => setMonitored(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id].slice(-2))}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                monitored.includes(c.id) 
                  ? "bg-[#ff6a3d]/20 border-[#ff6a3d] text-[#ff6a3d]" 
                  : "bg-[#26333f] border-transparent text-[#8296ab] hover:border-[#5d7189]"
              }`}
            >
              {c.num || c.id}
            </button>
          ))}
        </div>
        
        <p className="mt-3 text-[9px] text-[#5d7189] leading-tight italic">
          Affiche la position (0-1) des actionneurs sélectionnés. L'axe X représente le temps (env. 5s glissantes).
        </p>
      </div>
    </div>
  );
}
