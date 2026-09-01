import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Users, Trophy, Swords, Zap, MessageSquare } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { apiFetch } from "@/lib/api-client";
import { logout } from "@/app/actions/auth";

type DashboardData = {
  miembro: { id: string; nombre: string; rango: string; xp: number; coins: number; clanId: string | null };
  estadisticas: { totalSesiones: number; cargaSemanal: number; cerPromedio: number };
  clan: { id: string; nombre: string; puntosClan: number } | null;
};

export default async function ClanHubPage() {
  let data: DashboardData;
  try {
    data = await apiFetch<DashboardData>("/api/perfil/dashboard");
  } catch {
    redirect("/login");
  }

  const { miembro, estadisticas, clan } = data;

  const stats = [
    { icon: <Users size={20} />, value: clan ? "activo" : "—", label: "CLAN" },
    { icon: <Trophy size={20} />, value: miembro.rango, label: "RANGO" },
    { icon: <Swords size={20} />, value: String(estadisticas.totalSesiones), label: "SESIONES (7D)" },
    { icon: <Zap size={20} />, value: String(miembro.xp), label: "XP TOTAL" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <PageLabel page="P4" />
      <p className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-1">CLAN HUB // SANTUARIO</p>
      <h1 className="font-heading font-bold text-6xl text-white uppercase mb-8">
        {clan?.nombre ?? miembro.nombre}
      </h1>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-52 h-52 rounded-full border-4 border-[#333] bg-[#242424] flex items-center justify-center overflow-hidden">
          <span className="text-9xl">🦍</span>
        </div>
        <Link
          href="/perfil/racha"
          className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider px-6 py-2.5 rounded flex items-center gap-2 transition-colors"
        >
          <Flame size={16} /> {miembro.rango}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/arena"
          className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider py-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <Swords size={16} /> IR A LA ARENA
        </Link>
        <Link
          href="/santuario/tacticas"
          className="border border-[#555] hover:border-white text-white font-heading font-bold uppercase tracking-wider py-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <MessageSquare size={16} /> CHAT
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#242424] border border-[#333] rounded-xl p-4 flex flex-col items-center gap-2">
            <span className="text-[#9CA3AF]">{s.icon}</span>
            <span className="font-heading font-bold text-2xl text-white">{s.value}</span>
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wider text-center">{s.label}</span>
          </div>
        ))}
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="w-full border border-[#333] hover:border-[#555] text-[#9CA3AF] text-sm py-2 rounded transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
