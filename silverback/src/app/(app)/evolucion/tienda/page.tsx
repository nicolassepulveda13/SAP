"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const categories = ["TODOS", "SKINS", "AURAS", "ICONOS"];

const items = [
  {
    cat: "SKIN",
    name: "TITÁN DE CARBONO",
    desc: "Armadura exoesqueldtica diseñada para el levantamiento pesado.",
    price: 5000,
    emoji: "🦍",
  },
  {
    cat: "AURA",
    name: "FURIA NEÓN",
    desc: "Rastro visual naranja al completar series sin descanso.",
    price: 2500,
    emoji: "🌀",
  },
  {
    cat: "SKIN",
    name: "SEÑOR DE HIERRO",
    desc: "Apariencia blindada para guerreros de élite de la temporada 3.",
    price: 7500,
    emoji: "⚔️",
  },
  {
    cat: "ICONO",
    name: "CALAVERA SILVERBACK",
    desc: "Icono de perfil exclusivo para miembros con rango Overlord.",
    price: 1200,
    emoji: "💀",
  },
];

export default function TiendaPage() {
  const [cat, setCat] = useState("TODOS");

  const filtered = cat === "TODOS" ? items : items.filter((i) => i.cat === cat.slice(0, -1));

  return (
    <div>
      <PageLabel page="P15" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-5xl text-white uppercase">MARKETPLACE</h1>
          <p className="text-sm text-[#9CA3AF]">Equípate con las mejores skins, auras e iconos. Demuestra tu jerarquía en la arena.</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-5 py-3 shrink-0">
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">TU SALDO</p>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-[#F97316]" />
            <span className="font-heading font-bold text-xl text-white">12,450 SB</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`font-heading font-bold uppercase text-sm px-5 py-2.5 rounded transition-colors ${
              cat === c
                ? "bg-[#F97316] text-white"
                : "bg-[#242424] border border-[#333] text-[#9CA3AF] hover:border-white hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.name} className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden">
            <div className="h-56 bg-[#1a1a1a] flex items-center justify-center relative">
              <span className="text-7xl">{item.emoji}</span>
              <span className="absolute top-3 right-3 text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">
                {item.cat}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-heading font-bold text-lg text-white uppercase mb-1">{item.name}</h3>
              <p className="text-xs text-[#9CA3AF] mb-4">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-[#F97316] flex items-center gap-1">
                  <span className="text-sm">🪙</span> {item.price.toLocaleString()}
                </span>
                <button className="border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white font-heading font-bold uppercase text-xs px-5 py-2 rounded transition-colors">
                  COMPRAR
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
