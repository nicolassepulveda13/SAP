import Link from "next/link";
import { Dumbbell, Zap, Activity } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const attrs = [
  { label: "FUERZA", value: 185, icon: <Dumbbell size={20} className="text-[#F97316]" /> },
  { label: "AGILIDAD", value: 92, icon: <Zap size={20} className="text-[#F97316]" /> },
  { label: "RESISTENCIA", value: 140, icon: <Activity size={20} className="text-[#F97316]" /> },
];

export default function EvolucionPage() {
  return (
    <div>
      <PageLabel page="P12" />
      <div className="mb-6">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">PERFIL</h1>
        <p className="text-sm text-[#9CA3AF]">Cámara de desarrollo de atributos físicos y nivel de clan.</p>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-6">
        {/* Avatar card */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-8 flex flex-col items-center">
          <div className="w-48 h-48 rounded-full border-4 border-[#F97316] bg-[#1a1a1a] flex items-center justify-center mb-4 overflow-hidden">
            <span className="text-8xl">🦍</span>
          </div>
          <div className="w-full bg-[#F97316] text-center py-2 rounded mb-4">
            <span className="font-heading font-bold text-white uppercase text-sm">LVL 42</span>
          </div>
          <div className="w-full">
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
              <span>PROGRESO DE RANGO</span>
              <span className="text-[#F97316]">8,450 / 10,000 XP</span>
            </div>
            <div className="h-2 bg-[#333] rounded-full mb-2">
              <div className="h-full bg-[#F97316] rounded-full" style={{ width: "84.5%" }} />
            </div>
            <div className="flex justify-between text-xs text-[#9CA3AF]">
              <span>RANGO ACTUAL: <span className="text-white font-bold">PLATA</span></span>
              <span>PRÓXIMO: <span className="text-white font-bold">ORO</span></span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-[#9CA3AF] font-heading uppercase">BRONCE</span>
              <div className="flex-1 mx-2 h-px bg-[#F97316]" />
              <span className="text-[10px] text-white font-heading font-bold uppercase">PLATA ◆</span>
              <div className="flex-1 mx-2 h-px bg-[#555]" />
              <span className="text-[10px] text-[#9CA3AF] font-heading uppercase">ORO</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 w-56">
          {attrs.map((a) => (
            <div key={a.label} className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center shrink-0">
                {a.icon}
              </div>
              <div>
                <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase">{a.label}</p>
                <p className="font-heading font-bold text-2xl text-[#F97316]">
                  {a.value} <span className="text-sm text-[#9CA3AF]">PTS</span>
                </p>
              </div>
            </div>
          ))}

          <Link
            href="/perfil"
            className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center transition-colors mt-auto"
          >
            RENDIMIENTO
          </Link>
        </div>
      </div>
    </div>
  );
}
