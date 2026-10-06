// S4-Arena: ArenaPage (Guerra Global) — Server Component, hub del módulo Arena (P8)
// S6-GuerraGlobal: GET /api/arena/guerra — la guerra de la semana se abre sola; muestra NUESTRA MANADA vs CLAN RIVAL,
// barras de progreso relativas al líder, cuenta regresiva y top 10 (CU-003-001).
// Rival = pareja consecutiva del ranking (1º vs 2º, 3º vs 4º…). Sin pareja → "SIN RIVAL ASIGNADO" (FA-1).
import Link from "next/link";
import { Dumbbell, Clock, Trophy } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getGuerra, type ClanEnGuerra } from "@/app/actions/arena";

function TarjetaClan({
  titulo, clan, destacada, vacio,
}: { titulo: string; clan: ClanEnGuerra | null; destacada: boolean; vacio: string }) {
  const color = destacada ? "#F97316" : "#9CA3AF";
  return (
    <div className={`bg-[#242424] border rounded-xl p-6 ${destacada ? "border-[#F97316]/60" : "border-[#333]"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading font-bold uppercase text-sm" style={{ color: destacada ? "#F97316" : "white" }}>
          {titulo}
        </span>
        {clan && (
          <span className="text-xs bg-[#2e2e2e] text-white px-2 py-0.5 rounded font-heading uppercase">
            RANGO #{clan.posicion}
          </span>
        )}
      </div>
      {clan ? (
        <>
          <p className="font-heading font-bold text-white uppercase truncate mb-1">{clan.nombre}</p>
          <div className="mb-4">
            <span className="font-heading font-bold text-5xl text-white">{clan.cer.toLocaleString("es-AR")}</span>
            <span className="text-sm text-[#9CA3AF] ml-2">CER</span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${clan.progreso}%`, backgroundColor: color }} />
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">{clan.progreso}% del líder</p>
        </>
      ) : (
        <>
          <span className="font-heading font-bold text-5xl text-[#555]">0</span>
          <div className="h-2 bg-[#1a1a1a] rounded-full mt-4" />
          <p className="text-xs text-[#9CA3AF] mt-2">{vacio}</p>
        </>
      )}
    </div>
  );
}

export default async function ArenaPage() {
  const guerra = await getGuerra();

  return (
    <div className="max-w-3xl mx-auto">
      <PageLabel page="P8" />
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-6xl text-white uppercase mb-2">GUERRA GLOBAL</h1>
        <p className="text-sm text-[#9CA3AF] uppercase tracking-widest">
          {guerra ? guerra.semana : "NO SE PUDO CARGAR LA GUERRA"}
        </p>
        {guerra && (
          <p className="text-xs text-[#9CA3AF] mt-2 flex items-center justify-center gap-1">
            <Clock size={12} />
            {guerra.diasRestantes === 0 ? "Cierra hoy" : `Cierra en ${guerra.diasRestantes} días`}
            {" · "}
            {new Date(guerra.fechaFin).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "numeric" })}
          </p>
        )}
      </div>

      {guerra && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <TarjetaClan
              titulo="NUESTRA MANADA"
              clan={guerra.nuestro ?? null}
              destacada
              vacio="Tu clan todavía no sumó CER esta semana. Registrá un entrenamiento para entrar a la guerra."
            />
            <TarjetaClan
              titulo="CLAN RIVAL"
              clan={guerra.rival ?? null}
              destacada={false}
              vacio="SIN RIVAL ASIGNADO"
            />
          </div>

          <div className="flex items-center justify-center -mt-24 mb-14 relative z-10 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-[#181818] border-2 border-[#F97316] flex items-center justify-center">
              <span className="font-heading font-bold text-sm text-white">VS</span>
            </div>
          </div>

          <div className="bg-[#242424] border border-[#333] rounded-xl p-5 mb-8">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Trophy size={12} /> RANKING DE LA SEMANA
              <span className="ml-auto normal-case tracking-normal">{guerra.totalClanes} clanes en guerra</span>
            </p>
            {guerra.ranking.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">Ningún clan sumó CER todavía. El primero en entrenar arranca arriba.</p>
            ) : (
              <ol className="space-y-1.5">
                {guerra.ranking.map((c) => {
                  const esNuestro = c.clanId === guerra.nuestro?.clanId;
                  return (
                    <li
                      key={c.clanId}
                      className={`flex items-center gap-3 px-3 py-2 rounded ${esNuestro ? "bg-[#F97316]/15 border border-[#F97316]/40" : ""}`}
                    >
                      <span className="font-heading font-bold text-[#9CA3AF] w-6">#{c.posicion}</span>
                      <span className={`flex-1 font-heading font-bold uppercase truncate ${esNuestro ? "text-[#F97316]" : "text-white"}`}>
                        {c.nombre}
                      </span>
                      <span className="font-heading font-bold text-white">{c.cer.toLocaleString("es-AR")}</span>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="text-[11px] text-[#555] mt-3">
              Las parejas se arman por posición (1º vs 2º, 3º vs 4º…). Al cierre gana el mejor posicionado de cada pareja.
            </p>
          </div>
        </>
      )}

      <Link
        href="/arena/registrar"
        className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-5 rounded-xl flex items-center justify-center gap-3 transition-colors text-lg"
      >
        <Dumbbell size={20} /> REGISTRAR ENTRENAMIENTO
      </Link>
    </div>
  );
}
