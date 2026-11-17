// S7-Evolucion: CU-004-001 — Visualizar Progreso de Evolución (P12), según la carpeta:
// avatar + insignia de nivel, barra de XP hacia el próximo rango, BRONCE — PLATA — ORO, atributos FUERZA / AGILIDAD /
// RESISTENCIA (RF-006) y botón RENDIMIENTO → Dashboard. FA-1 "MAX LEVEL" · FA-2 "999+ PTS" con estrella.
import Link from "next/link";
import { Dumbbell, Zap, Activity, Star, BarChart3 } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getProgreso } from "@/app/actions/evolucion";

const MAX_ESCALA = 999;

export default async function EvolucionPage() {
  const p = await getProgreso();
  const rango = p.miembro.rango;
  const siguiente = p.rangoSiguiente ?? null;
  const maxLevel = !siguiente;

  const minActual = p.rangos.find((r) => r.rango === rango)?.xpMinima ?? 0;
  const minSiguiente = p.rangos.find((r) => r.rango === siguiente)?.xpMinima ?? minActual;
  const porcentaje = maxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round(((p.miembro.xp - minActual) * 100) / Math.max(1, minSiguiente - minActual))));

  const atributos = [
    { nombre: "FUERZA", valor: p.atributos.fuerza, icono: <Dumbbell size={20} className="text-[#F97316]" /> },
    { nombre: "AGILIDAD", valor: p.atributos.agilidad, icono: <Zap size={20} className="text-[#F97316]" /> },
    { nombre: "RESISTENCIA", valor: p.atributos.resistencia, icono: <Activity size={20} className="text-[#F97316]" /> },
  ];

  return (
    <div>
      <PageLabel page="P12" />
      <div className="mb-6">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">PERFIL</h1>
        <p className="text-sm text-[#9CA3AF]">Cámara de desarrollo de atributos físicos y nivel de clan.</p>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-8 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full border-4 border-[#F97316] bg-[#1a1a1a] flex items-center justify-center mb-3">
            <span className="text-7xl">🦍</span>
          </div>
          <span data-testid="nivel" className="bg-[#F97316] text-white font-heading font-bold uppercase text-sm px-4 py-1 rounded mb-2">
            NIVEL {p.nivel}
          </span>
          <p className="font-heading font-bold text-xl text-white uppercase mb-6">{p.miembro.nombre}</p>

          <div className="w-full">
            <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
              <span>{maxLevel ? "XP" : `${p.miembro.xp.toLocaleString("es-AR")} / ${minSiguiente.toLocaleString("es-AR")} XP`}</span>
              <span data-testid="progreso-rango" className="text-[#F97316] font-bold">
                {maxLevel ? "MAX LEVEL" : `${porcentaje}% · faltan ${p.xpParaSiguienteRango.toLocaleString("es-AR")} XP`}
              </span>
            </div>
            <div className="h-2 bg-[#333] rounded-full mb-2">
              <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${porcentaje}%` }} />
            </div>
            <div className="flex justify-between text-xs font-heading font-bold uppercase">
              <span className="text-white">{rango}</span>
              <span className="text-[#9CA3AF]">{siguiente ?? "—"}</span>
            </div>
          </div>

          {/* Progresión completa de rangos */}
          <div data-testid="escalera-rangos" className="flex items-center gap-3 mt-6 text-xs font-heading font-bold uppercase">
            {p.rangos.map((r, i) => (
              <span key={r.rango} className="flex items-center gap-3">
                {i > 0 && <span className="text-[#555]">—</span>}
                <span className={r.rango === rango ? "text-[#F97316]" : "text-[#9CA3AF]"}>
                  {r.rango}
                  {r.rango === rango && " ◆"}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {atributos.map((a) => (
            <div key={a.nombre} data-testid={`atributo-${a.nombre}`} className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center shrink-0">{a.icono}</div>
              <div>
                <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase">{a.nombre}</p>
                <p className="font-heading font-bold text-2xl text-white flex items-center gap-1">
                  {a.valor > MAX_ESCALA ? (
                    <>
                      999+ PTS <Star size={16} className="text-[#F97316] fill-[#F97316]" />
                    </>
                  ) : (
                    `${a.valor.toLocaleString("es-AR")} PTS`
                  )}
                </p>
              </div>
            </div>
          ))}
          <Link
            href="/perfil"
            className="mt-auto bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider py-3 rounded flex items-center justify-center gap-2"
          >
            <BarChart3 size={16} /> RENDIMIENTO
          </Link>
        </div>
      </div>
    </div>
  );
}
