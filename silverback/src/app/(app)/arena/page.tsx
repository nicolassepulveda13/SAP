import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

export default function ArenaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageLabel page="P8" />
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-6xl text-white uppercase mb-2">GUERRA GLOBAL</h1>
        <p className="text-sm text-[#9CA3AF] uppercase tracking-widest">SEMANA 4: EL CRISOL DE HIERRO</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Our clan */}
        <div className="bg-[#242424] border border-[#F97316]/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-bold text-[#F97316] uppercase text-sm">NUESTRA MANADA</span>
            <span className="text-xs bg-[#2e2e2e] text-white px-2 py-0.5 rounded font-heading uppercase">RANGO #1</span>
          </div>
          <div className="mb-4">
            <span className="font-heading font-bold text-5xl text-white">84,200</span>
            <span className="text-sm text-[#9CA3AF] ml-2">PTS</span>
          </div>
          <div className="h-2 bg-[#333] rounded-full mb-1">
            <div className="h-full bg-[#F97316] rounded-full flex items-center justify-end pr-1" style={{ width: "85%" }}>
              <span className="text-[9px] text-white font-bold">85%</span>
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] text-right">OBJETIVO: 100K</p>
        </div>

        {/* Rival clan */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-bold text-white uppercase text-sm">CLAN RIVAL</span>
            <span className="text-xs bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">RANGO #2</span>
          </div>
          <div className="mb-4">
            <span className="font-heading font-bold text-5xl text-white">72,150</span>
            <span className="text-sm text-[#9CA3AF] ml-2">PTS</span>
          </div>
          <div className="h-2 bg-[#333] rounded-full mb-1">
            <div className="h-full bg-[#9CA3AF] rounded-full flex items-center justify-end pr-1" style={{ width: "72%" }}>
              <span className="text-[9px] text-white font-bold">72%</span>
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] text-right">OBJETIVO: 100K</p>
        </div>
      </div>

      {/* VS badge */}
      <div className="flex items-center justify-center -mt-20 mb-8 relative z-10 pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-[#181818] border-2 border-[#F97316] flex items-center justify-center">
          <span className="font-heading font-bold text-sm text-white">VS</span>
        </div>
      </div>

      <Link
        href="/arena/registrar"
        className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-5 rounded-xl flex items-center justify-center gap-3 transition-colors text-lg"
      >
        <Dumbbell size={20} /> REGISTRAR ENTRENAMIENTO
      </Link>
    </div>
  );
}
