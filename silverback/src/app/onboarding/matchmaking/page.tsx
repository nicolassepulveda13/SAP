"use client";

import { useRouter } from "next/navigation";
import { Search, Users, Lock } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const clans = [
  { name: "IRON BACKS", members: 12, max: 20, full: false },
  { name: "APEX PREDATORS", members: 18, max: 20, full: false },
  { name: "STEEL TITANS", members: 20, max: 20, full: true },
];

export default function MatchmakingPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-lg">
      <PageLabel page="P3" />
      <h2 className="font-heading font-bold text-5xl text-[#F97316] uppercase tracking-wider mb-2">
        RADAR DE MANADAS
      </h2>
      <p className="text-[#9CA3AF] mb-6">Encuentra tu manada. Domina la arena.</p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Buscar Clanes..."
          className="w-full bg-[#242424] border border-[#444] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316]"
        />
      </div>

      <div className="space-y-2 mb-6">
        {clans.map((clan) => (
          <div key={clan.name} className="bg-[#242424] border border-[#333] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2e2e2e] flex items-center justify-center shrink-0">
              <span className="text-lg">🦍</span>
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-sm text-white uppercase">{clan.name}</p>
              {clan.full ? (
                <p className="text-xs text-[#F97316] flex items-center gap-1">
                  <Lock size={10} /> {clan.members}/{clan.max} LLENO
                </p>
              ) : (
                <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
                  <Users size={10} /> {clan.members}/{clan.max} Miembros
                </p>
              )}
            </div>
            <button
              onClick={() => !clan.full && router.push("/santuario")}
              disabled={clan.full}
              className={`px-4 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded transition-colors ${
                clan.full
                  ? "border border-[#555] text-[#555] cursor-not-allowed"
                  : "bg-[#F97316] hover:bg-[#EA6800] text-white"
              }`}
            >
              {clan.full ? "LLENO" : "UNIRSE"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/santuario")}
        className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-3 rounded transition-colors"
      >
        INICIAR VIAJE →
      </button>
    </div>
  );
}
