import { Flag, TrendingUp } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const cerBars = [
  { label: "CAPACIDAD", value: 85 },
  { label: "EFICIENCIA", value: 92 },
  { label: "RECUPERACIÓN", value: 78 },
];

export default function PerfilPage() {
  return (
    <div>
      <PageLabel page="P16" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl text-white uppercase">DASHBOARD DE RENDIMIENTO</h1>
        <p className="text-sm text-[#9CA3AF]">Análisis comparativo contra el promedio del clan. Sector Delta.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Índice de dominancia */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-8 flex flex-col justify-between min-h-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-white uppercase">ÍNDICE DE DOMINANCIA</h2>
            <Flag size={18} className="text-[#F97316]" />
          </div>
          <div>
            <div className="flex items-end gap-1 mb-3">
              <span className="font-heading font-bold text-8xl text-[#F97316] leading-none">94</span>
              <span className="font-heading font-bold text-3xl text-[#F97316] mb-2">%</span>
            </div>
            <span className="bg-[#2e2e2e] text-white font-heading font-bold uppercase text-xs px-3 py-1.5 rounded">
              TOP 5% CLAN
            </span>
          </div>
        </div>

        {/* Perfil táctico (radar simulado) */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-white uppercase">PERFIL TÁCTICO</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#F97316] rounded-sm inline-block" /> USUARIO</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#555] rounded-sm inline-block" /> PROMEDIO CLAN</span>
            </div>
          </div>
          {/* Radar polygon SVG */}
          <div className="flex items-center justify-center h-40">
            <svg viewBox="0 0 200 200" className="w-40 h-40">
              <polygon points="100,20 170,65 155,150 45,150 30,65" fill="#F97316" fillOpacity="0.3" stroke="#F97316" strokeWidth="2" />
              <polygon points="100,35 155,72 143,138 57,138 45,72" fill="#555" fillOpacity="0.15" stroke="#555" strokeWidth="1" strokeDasharray="4" />
              <text x="100" y="14" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="sans-serif">FUERZA BRUTA</text>
              <text x="178" y="68" textAnchor="start" fill="#9CA3AF" fontSize="9" fontFamily="sans-serif">RESISTENCIA</text>
              <text x="170" y="158" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="sans-serif">AGILIDAD</text>
              <text x="22" y="68" textAnchor="end" fill="#9CA3AF" fontSize="9" fontFamily="sans-serif">TÉCNICA</text>
            </svg>
          </div>
        </div>

        {/* Volumen total */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-white uppercase">VOLUMEN TOTAL (KG)</h2>
            <span className="text-[#F97316]">⚔️</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#9CA3AF] uppercase">TU RENDIMIENTO</span>
                <span className="text-[#F97316] font-bold">12,450 KG</span>
              </div>
              <div className="h-2 bg-[#333] rounded-full">
                <div className="h-full bg-[#F97316] rounded-full" style={{ width: "80%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#9CA3AF] uppercase">PROMEDIO CLAN</span>
                <span className="text-[#9CA3AF] font-bold">9,200 KG</span>
              </div>
              <div className="h-2 bg-[#333] rounded-full">
                <div className="h-full bg-[#555] rounded-full" style={{ width: "59%" }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-[#9CA3AF]">
            <TrendingUp size={14} className="text-[#F97316]" />
            <span>Operando <span className="text-[#F97316] font-bold">+35%</span> por encima del volumen base del clan.</span>
          </div>
        </div>

        {/* CER score */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-lg text-white uppercase flex items-center gap-2">
              PUNTAJE C.E.R. <span className="text-[#9CA3AF] font-normal text-sm">ⓘ</span>
            </h2>
            <span className="bg-[#F97316] text-white font-heading font-bold uppercase text-xs px-3 py-1 rounded">RANGO S</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {cerBars.map((bar) => (
              <div key={bar.label} className="text-center">
                <p className="text-xs text-[#9CA3AF] uppercase mb-2">{bar.value}/100</p>
                <div className="h-24 bg-[#333] rounded-md relative flex items-end overflow-hidden">
                  <div
                    className="w-full bg-[#F97316] rounded-md transition-all"
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <p className="text-xs text-[#9CA3AF] uppercase mt-2">{bar.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
