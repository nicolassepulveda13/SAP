// S8-Perfil: CU-005-001 — Dashboard de Rendimiento Personal (P16). Datos reales del miembro.
import Link from "next/link";
import { Dumbbell, Activity, Flame, Shield } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getDashboard } from "@/app/actions/perfil";

export default async function PerfilPage() {
  const d = await getDashboard();
  const m = d.miembro;

  return (
    <div>
      <PageLabel page="P16" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">
          DASHBOARD DE RENDIMIENTO
        </h1>
        <p className="text-sm text-[#9CA3AF]">
          Tu actividad en Silverback. Clan {d.clan?.nombre ?? "—"} · Rol {m.rol} · Rango {m.rango.replace("_", " ")}.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Stat label="SESIONES TOTALES" value={d.estadisticas.totalSesiones.toString()} icon={<Dumbbell size={20} />} />
        <Stat label="CER PROMEDIO" value={d.estadisticas.cerPromedio.toFixed(1)} icon={<Activity size={20} />} />
        <Stat label="CARGA SEMANAL" value={Number(d.estadisticas.cargaSemanal).toLocaleString("es-AR")} icon={<Flame size={20} />} />
        <Stat label="XP · COINS" value={`${m.xp.toLocaleString()} · ${m.coins.toLocaleString()}`} icon={<Shield size={20} />} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Tile href="/perfil/racha" label="Racha" descripcion="Tus días consecutivos" />
        <Tile href="/perfil/fatiga" label="Fatiga" descripcion="Carga biométrica semanal" />
        <Tile href="/perfil/trofeos" label="Trofeos" descripcion="Vitrina de logros" />
        <Tile href="/perfil/beneficios" label="Beneficios" descripcion="Partners y cupones" />
      </div>

      <div className="mt-6">
        <Tile href="/perfil/cuenta" label="Datos de Cuenta" descripcion="Nombre, email y contraseña" wide />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-3">
      <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center text-[#F97316] shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase">{label}</p>
        <p className="font-heading font-bold text-2xl text-white">{value}</p>
      </div>
    </div>
  );
}

function Tile({ href, label, descripcion, wide }: {
  href: string; label: string; descripcion: string; wide?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`bg-[#242424] border border-[#333] hover:border-[#F97316] rounded-xl p-5 transition-colors block ${wide ? "col-span-4" : ""}`}
    >
      <p className="font-heading font-bold text-lg text-white uppercase mb-1">{label}</p>
      <p className="text-xs text-[#9CA3AF]">{descripcion}</p>
    </Link>
  );
}
