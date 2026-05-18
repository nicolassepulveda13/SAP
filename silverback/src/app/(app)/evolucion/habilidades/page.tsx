"use client";

import { useState } from "react";
import { Dumbbell, Activity, Flame, Lock, TrendingUp } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const nodes = [
  { id: "root", label: "FUERZA", icon: <Dumbbell size={16} />, level: null, unlocked: true, x: 50, y: 10, children: ["resist", "ataque"] },
  { id: "resist", label: "RESISTENCIA", icon: <Activity size={12} />, level: 3, unlocked: true, x: 25, y: 45, children: ["locked1"] },
  { id: "ataque", label: "ATAQUE", icon: <Dumbbell size={12} />, level: 1, unlocked: true, x: 75, y: 45, children: ["fuego"] },
  { id: "locked1", label: "BLOQUEADO", icon: <Lock size={12} />, level: null, unlocked: false, x: 25, y: 80, children: [] },
  { id: "fuego", label: "FUEGO", icon: <Flame size={12} />, level: null, unlocked: true, x: 75, y: 80, cost: 2000, children: [] },
];

export default function HabilidadesPage() {
  const [selected, setSelected] = useState("resist");

  return (
    <div className="grid grid-cols-[1fr_300px] gap-6 h-full">
      {/* Left: tree */}
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <PageLabel page="P13" />
            <h1 className="font-heading font-bold text-4xl text-white uppercase">SKILL TREE</h1>
            <p className="text-sm text-[#9CA3AF]">Desbloquea el potencial de tu clan.</p>
          </div>
          <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center">
              <span className="text-sm">🪙</span>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] uppercase">PUNTOS DE CLAN</p>
              <p className="font-heading font-bold text-xl text-[#F97316]">12,450</p>
            </div>
          </div>
        </div>

        {/* Tree diagram */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 relative" style={{ minHeight: 400 }}>
          {/* SVG lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <line x1="50%" y1="18%" x2="25%" y2="52%" stroke="#F97316" strokeWidth="2" />
            <line x1="50%" y1="18%" x2="75%" y2="52%" stroke="#F97316" strokeWidth="2" />
            <line x1="25%" y1="52%" x2="25%" y2="86%" stroke="#555" strokeWidth="2" />
            <line x1="75%" y1="52%" x2="75%" y2="86%" stroke="#555" strokeWidth="2" />
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => node.unlocked && setSelected(node.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 transition-all relative ${
                  node.id === selected
                    ? "bg-[#F97316] border-[#F97316]"
                    : node.unlocked
                    ? "bg-[#2e2e2e] border-[#F97316]"
                    : "bg-[#242424] border-[#444]"
                }`}
              >
                <span className={node.unlocked ? "text-white" : "text-[#555]"}>{node.icon}</span>
                {node.level && (
                  <span className="absolute -top-2 -right-2 text-[9px] bg-[#F97316] text-white px-1 rounded font-bold">
                    Lvl {node.level}
                  </span>
                )}
                {node.cost && (
                  <span className="absolute -top-2 -right-6 text-[9px] bg-[#333] text-[#9CA3AF] px-1 rounded">
                    {node.cost / 1000}k
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: detail panel */}
      <div className="space-y-4">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#F97316] rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-white uppercase">RESISTENCIA</p>
              <span className="text-xs bg-[#F97316] text-white px-2 py-0.5 rounded font-heading uppercase">NIVEL 3 / 5</span>
            </div>
          </div>
          <p className="text-sm text-[#9CA3AF] mb-4">
            Aumenta la capacidad cardiovascular del clan, permitiendo sesiones de entrenamiento más largas con menor penalización por fatiga.
          </p>
          <div className="space-y-1 text-xs mb-4">
            <div className="flex justify-between">
              <span className="text-[#9CA3AF] uppercase">EFECTO ACTUAL</span>
              <span className="text-[#F97316] font-bold">+15% Stamina</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9CA3AF] uppercase">PRÓXIMO NIVEL</span>
              <span className="text-white font-bold">+20% Stamina</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-[#9CA3AF] uppercase">COSTO MEJORA</span>
            <span className="font-heading font-bold text-white flex items-center gap-1">🪙 3,500</span>
          </div>
          <button className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider py-3 rounded flex items-center justify-center gap-2 transition-colors">
            <TrendingUp size={16} /> MEJORAR NODO
          </button>
        </div>

        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-3">ÚLTIMAS INVERSIONES</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white flex items-center gap-2"><Activity size={12} className="text-[#F97316]" /> Resistencia Lvl 3</span>
              <span className="text-[#ef4444]">-2,000 pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white flex items-center gap-2"><Dumbbell size={12} className="text-[#F97316]" /> Ataque Crítico Lvl 1</span>
              <span className="text-[#ef4444]">-1,500 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
