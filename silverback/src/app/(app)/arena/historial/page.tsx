import { Swords, Filter, FileBarChart, Calendar, Clock } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const stats = [
  { label: "TOTAL DE ENFRENTAMIENTOS", value: "142", icon: "🗂️", color: "text-white" },
  { label: "TASA DE VICTORIA", value: "68%", icon: "%", color: "text-[#22c55e]" },
];

const matches = [
  { name: "IRON GOLEM 88", date: "OCT 24, 2023", time: "14:30", duration: "04:12", intensity: 9, result: "VICTORIA" },
  { name: "APEX PREDATOR", date: "OCT 21, 2023", time: "09:15", duration: "12:45", intensity: 9, result: "DERROTA" },
  { name: "SHADOW STRIKER", date: "OCT 18, 2023", time: "18:00", duration: "02:30", intensity: 9, result: "VICTORIA" },
];

export default function HistorialPage() {
  return (
    <div>
      {/* Header */}
      <PageLabel page="P11" />
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-[#F97316] rounded-lg flex items-center justify-center shrink-0">
            <Swords size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-5xl text-[#F97316] uppercase leading-none">
              HISTORIAL
              <br />
              DE BATALLA
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-2 max-w-md">
              Un registro permanente de tu historial de combate en la Arena. Revisa enfrentamientos pasados, analiza el
              rendimiento de tus rivales y sigue tu ascenso al estatus de Silverback.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="border border-[#555] text-white font-heading font-bold uppercase text-xs px-4 py-2.5 rounded flex items-center gap-2 hover:border-white transition-colors">
            <Filter size={14} /> FILTRAR PARTIDAS
          </button>
          <button className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase text-xs px-4 py-2.5 rounded flex items-center gap-2 transition-colors">
            <FileBarChart size={14} /> INFORME COMPLETO
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">TOTAL DE ENFRENTAMIENTOS</p>
          <p className="font-heading font-bold text-4xl text-white">142</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">TASA DE VICTORIA</p>
          <p className="font-heading font-bold text-4xl text-[#22c55e]">68%</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5 relative overflow-hidden">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">RACHA ACTUAL</p>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-4xl text-[#F97316]">5</span>
            <span className="font-heading font-bold text-lg text-white uppercase">VICTORIAS CONSECUTIVAS</span>
          </div>
        </div>
      </div>

      {/* Recent matches */}
      <h2 className="font-heading font-bold text-lg text-white uppercase border-l-2 border-[#F97316] pl-3 mb-4">
        COMPROMISOS RECIENTES
      </h2>

      <div className="space-y-3 mb-6">
        {matches.map((m) => (
          <div key={m.name} className="bg-[#242424] border border-[#333] rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 border border-[#333]">
              <Swords size={20} className="text-[#9CA3AF]" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-white uppercase mb-1">{m.name}</p>
              <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                <span className="flex items-center gap-1"><Calendar size={10} /> {m.date}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {m.time}</span>
              </div>
            </div>
            <div className="text-center shrink-0">
              <p className="text-xs text-[#9CA3AF] uppercase">DURACIÓN</p>
              <p className="font-heading font-bold text-white">{m.duration}</p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-xs text-[#9CA3AF] uppercase">INTENSIDAD</p>
              <p className="font-heading font-bold text-[#F97316]">Nvl {m.intensity}</p>
            </div>
            <span
              className={`font-heading font-bold text-sm px-4 py-1.5 border-2 rounded uppercase shrink-0 ${
                m.result === "VICTORIA"
                  ? "border-[#22c55e] text-[#22c55e]"
                  : "border-[#ef4444] text-[#ef4444]"
              }`}
            >
              {m.result}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full border border-[#555] hover:border-white text-white font-heading font-bold uppercase tracking-widest py-3.5 rounded transition-colors">
        ACCEDER A REGISTROS ANTERIORES
      </button>
    </div>
  );
}
