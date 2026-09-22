// S4-Arena: ArenaPage (Guerra Global) — Server Component, hub del módulo Arena (P8)
// S4-GuerraGlobal: conecta a GET /api/arena/guerra; muestra participaciones reales del clan (CU-003-001)
// Si no hay guerra activa muestra fallback; el botón REGISTRAR lleva a la pantalla funcional (CU-003-002)
import Link from "next/link";
import { cookies } from "next/headers";
import { Dumbbell, Clock } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getGuerra } from "@/app/actions/arena";

function decodeJwtPayload(token: string): Record<string, string> | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export default async function ArenaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb_token")?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const clanId = payload?.clanId;

  const guerra = await getGuerra();

  const nuestro = clanId && guerra
    ? guerra.participaciones.find((p) => p.clanId === clanId)
    : null;
  const topRival = guerra?.participaciones.find((p) => p.clanId !== clanId);

  const diasRestantes = guerra
    ? Math.max(0, Math.ceil((new Date(guerra.fechaFin).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <PageLabel page="P8" />
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-6xl text-white uppercase mb-2">GUERRA GLOBAL</h1>
        <p className="text-sm text-[#9CA3AF] uppercase tracking-widest">
          {guerra ? guerra.semana : "SIN GUERRA ACTIVA"}
        </p>
      </div>

      {guerra ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Nuestro clan */}
            <div className="bg-[#242424] border border-[#F97316]/60 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-[#F97316] uppercase text-sm">NUESTRA MANADA</span>
                {nuestro && (
                  <span className="text-xs bg-[#2e2e2e] text-white px-2 py-0.5 rounded font-heading uppercase">
                    RANGO #{nuestro.posicion || "—"}
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="font-heading font-bold text-5xl text-white">
                  {nuestro ? nuestro.cerAcumulado.toLocaleString("es-AR") : "0"}
                </span>
                <span className="text-sm text-[#9CA3AF] ml-2">CER</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <Clock size={12} />
                <span>{diasRestantes} días restantes</span>
              </div>
            </div>

            {/* Rival */}
            <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-white uppercase text-sm">CLAN RIVAL</span>
                {topRival && (
                  <span className="text-xs bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">
                    RANGO #1
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="font-heading font-bold text-5xl text-white">
                  {topRival ? topRival.cerAcumulado.toLocaleString("es-AR") : "—"}
                </span>
                {topRival && <span className="text-sm text-[#9CA3AF] ml-2">CER</span>}
              </div>
              {!topRival && (
                <p className="text-xs text-[#9CA3AF]">No hay rivales aún esta semana.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center -mt-20 mb-8 relative z-10 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-[#181818] border-2 border-[#F97316] flex items-center justify-center">
              <span className="font-heading font-bold text-sm text-white">VS</span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#242424] border border-[#333] rounded-xl p-8 text-center mb-8">
          <p className="text-[#9CA3AF] mb-2">No hay ninguna Guerra Global activa esta semana.</p>
          <p className="text-xs text-[#555]">Registrá tu entrenamiento igual — el CER se acumulará cuando empiece la próxima guerra.</p>
        </div>
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
