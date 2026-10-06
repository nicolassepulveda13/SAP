// S4-Arena: HistorialPage — Server Component (P11), CU-003-004: Consultar el Historial de Batallas
// S6-Batallas: arriba, estadísticas y batallas de semanas cerradas (GET /api/arena/batallas) — lo que pide el texto del CU.
// S6-Entrenamientos: abajo, sesiones del miembro con filtro por ejercicio (GET /api/arena/historial) — lo que pide la secuencia.
import { Swords, Calendar, Clock, Search } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getBatallas, getHistorial, type Batalla } from "@/app/actions/arena";

const ESTILO_RESULTADO: Record<Batalla["resultado"], { texto: string; borde: string; color: string }> = {
  VICTORIA: { texto: "VICTORIA", borde: "border-green-500/60", color: "text-green-400" },
  DERROTA: { texto: "DERROTA", borde: "border-red-500/60", color: "text-red-400" },
  SIN_RIVAL: { texto: "SIN RIVAL", borde: "border-[#333]", color: "text-[#9CA3AF]" },
};

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ ejercicio?: string }>;
}) {
  const { ejercicio } = await searchParams;
  const [historial, entrenamientos] = await Promise.all([getBatallas(), getHistorial(1, ejercicio)]);

  return (
    <div>
      <PageLabel page="P11" />
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-4">
          <Link href="/arena" className="text-[#9CA3AF] hover:text-white transition-colors mt-3">
            <ArrowLeft size={20} />
          </Link>
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
              Resultados de tu clan en cada Guerra Global cerrada y registro de tus sesiones.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas de batallas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">TOTAL DE ENFRENTAMIENTOS</p>
          <p className="font-heading font-bold text-4xl text-white">{historial?.totalEnfrentamientos ?? 0}</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">TASA DE VICTORIA</p>
          <p className="font-heading font-bold text-4xl text-green-400">{historial?.tasaVictoria ?? 0}%</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">RACHA ACTUAL</p>
          <p className="font-heading font-bold text-4xl text-[#F97316]">{historial?.rachaActual ?? 0}</p>
        </div>
      </div>

      <h2 className="font-heading font-bold text-lg text-white uppercase border-l-2 border-[#F97316] pl-3 mb-4">
        COMPROMISOS RECIENTES
      </h2>

      {!historial || historial.batallas.length === 0 ? (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-6 text-center text-sm text-[#9CA3AF] mb-10">
          Tu clan todavía no tiene guerras cerradas. Cada semana (lunes a domingo) se cierra una:
          entrená para que tu clan participe.
        </div>
      ) : (
        <div className="space-y-3 mb-10">
          {historial.batallas.map((b) => {
            const estilo = ESTILO_RESULTADO[b.resultado];
            return (
              <div key={b.guerraId} className={`bg-[#242424] border ${estilo.borde} rounded-xl p-4 flex items-center gap-4`}>
                <div className="flex-1">
                  <p className="font-heading font-bold text-white uppercase mb-1">
                    {b.rival ? `VS ${b.rival}` : "SIN RIVAL ASIGNADO"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span>{b.semana}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> cerró el {new Date(b.fechaFin).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-xs text-[#9CA3AF] uppercase">POSICIÓN</p>
                  <p className="font-heading font-bold text-white">#{b.nuestraPosicion}</p>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-xs text-[#9CA3AF] uppercase">CER</p>
                  <p className="font-heading font-bold text-white">
                    {b.nuestroCer.toLocaleString("es-AR")}
                    {b.rivalCer !== null && <span className="text-[#9CA3AF]"> / {b.rivalCer.toLocaleString("es-AR")}</span>}
                  </p>
                </div>
                <span className={`font-heading font-bold uppercase tracking-wider min-w-24 text-right ${estilo.color}`}>
                  {estilo.texto}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Sesiones de entrenamiento */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="font-heading font-bold text-lg text-white uppercase border-l-2 border-[#F97316] pl-3">
          MIS SESIONES
        </h2>
        <form className="flex items-center gap-2" action="/arena/historial">
          <div className="flex items-center gap-2 bg-[#242424] border border-[#333] rounded px-3 py-1.5">
            <Search size={14} className="text-[#9CA3AF]" />
            <input
              name="ejercicio"
              defaultValue={ejercicio ?? ""}
              placeholder="Filtrar por ejercicio..."
              className="bg-transparent text-sm text-white placeholder-[#555] outline-none w-44"
            />
          </div>
          <button type="submit" className="text-xs border border-[#555] hover:border-white text-white px-3 py-1.5 rounded uppercase font-heading font-bold">
            FILTRAR
          </button>
          {ejercicio && (
            <Link href="/arena/historial" className="text-xs text-[#9CA3AF] hover:text-white">
              limpiar
            </Link>
          )}
        </form>
      </div>

      {entrenamientos.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF]">
          {ejercicio ? (
            <p>No hay sesiones de “{ejercicio}”.</p>
          ) : (
            <>
              <p className="mb-2">No registraste ningún entrenamiento todavía.</p>
              <Link href="/arena/registrar" className="text-[#F97316] hover:underline text-sm uppercase font-heading font-bold tracking-wider">
                Registrar primero →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {entrenamientos.map((e) => (
            <div key={e.id} className="bg-[#242424] border border-[#333] rounded-xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 border border-[#333]">
                <Swords size={20} className="text-[#9CA3AF]" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-white uppercase mb-1">{e.ejercicio}</p>
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} /> {new Date(e.fechaHora).toLocaleDateString("es-AR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {new Date(e.fechaHora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <div className="text-center shrink-0">
                <p className="text-xs text-[#9CA3AF] uppercase">PESO</p>
                <p className="font-heading font-bold text-white">{e.pesoKg} kg</p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-xs text-[#9CA3AF] uppercase">REPS</p>
                <p className="font-heading font-bold text-white">{e.repeticiones}</p>
              </div>
              <div className="text-center shrink-0 min-w-20">
                <p className="text-xs text-[#9CA3AF] uppercase">CER</p>
                <p className="font-heading font-bold text-2xl text-[#F97316]">{e.puntajeCer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
