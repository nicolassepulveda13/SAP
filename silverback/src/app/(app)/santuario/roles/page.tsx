import { Users, UserMinus } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { requireClan } from "@/lib/clan-context";
import { apiFetch } from "@/lib/api-client";
import { asignarRol, expulsarMiembro } from "@/app/actions/santuario";

type MiembroClan = { id: string; nombre: string; rol: string; rango: string; xp: number };

const ROLES = ["SILVERBACK", "BETA", "EXPLORADOR", "RECLUTA"] as const;

export default async function RolesPage() {
  const { data, clanId } = await requireClan();
  const miembros = await apiFetch<MiembroClan[]>(`/api/santuario/${clanId}/miembros`);
  const esLider = data.miembro.rol === "SILVERBACK";

  return (
    <div>
      <PageLabel page="P7" />
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-4xl text-[#F97316] uppercase tracking-wider mb-2">
            PANEL DE GESTIÓN TÁCTICA
          </h1>
          <p className="text-sm text-[#9CA3AF] max-w-lg">
            {esLider
              ? "Gestioná la jerarquía y el personal del clan. Los niveles de autoridad dictan el acceso a la arena."
              : "Solo el líder del clan (SILVERBACK) puede modificar roles o expulsar miembros."}
          </p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-6 py-4 flex items-center gap-3 shrink-0">
          <Users size={20} className="text-[#F97316]" />
          <div>
            <span className="font-heading font-bold text-2xl text-white">{miembros.length}</span>
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">MIEMBROS ACTIVOS</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {miembros.map((m) => (
          <div
            key={m.id}
            className="bg-[#242424] border border-[#333] rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-heading font-bold text-white uppercase">
                {m.nombre}
                {m.id === data.miembro.id && <span className="text-[#F97316] text-xs ml-2">(VOS)</span>}
              </p>
              <p className="text-xs text-[#9CA3AF]">Rango {m.rango} · {m.xp} XP</p>
            </div>
            {esLider && m.id !== data.miembro.id ? (
              <div className="flex items-center gap-2 shrink-0">
                <form action={asignarRol.bind(null, clanId, m.id)} className="flex items-center gap-2">
                  <select
                    name="rol"
                    defaultValue={m.rol}
                    className="bg-white text-[#333] text-xs rounded px-2 py-1.5 outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="text-xs border border-[#555] hover:border-white text-white px-2 py-1.5 rounded uppercase font-heading font-bold tracking-wider transition-colors"
                  >
                    GUARDAR
                  </button>
                </form>
                <form action={expulsarMiembro.bind(null, clanId, m.id)}>
                  <button
                    type="submit"
                    title="Expulsar del clan"
                    className="border border-red-500/50 text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                </form>
              </div>
            ) : (
              <span className="text-xs text-[#9CA3AF] uppercase font-heading font-bold">{m.rol}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
