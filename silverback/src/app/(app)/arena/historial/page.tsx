// S4-Arena: HistorialPage — Server Component, historial real de entrenamientos (P11)
// Conecta a GET /api/arena/historial — paginado, 20 por página, ordenado por fecha DESC
// CU-003-004: Consultar el Historial de Batallas
import { Swords, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { getHistorial } from "@/app/actions/arena";

export default async function HistorialPage() {
  const entrenamientos = await getHistorial(1);

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
              Registro permanente de tus sesiones de entrenamiento. Cada rep cuenta para la manada.
            </p>
          </div>
        </div>
      </div>

      {/* Stats resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">TOTAL (ÚLTIMAS 20)</p>
          <p className="font-heading font-bold text-4xl text-white">{entrenamientos.length}</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">CER ACUMULADO</p>
          <p className="font-heading font-bold text-4xl text-[#F97316]">
            {entrenamientos.reduce((s, e) => s + e.puntajeCer, 0).toFixed(0)}
          </p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">PROMEDIO CER</p>
          <p className="font-heading font-bold text-4xl text-white">
            {entrenamientos.length > 0
              ? (entrenamientos.reduce((s, e) => s + e.puntajeCer, 0) / entrenamientos.length).toFixed(1)
              : "—"}
          </p>
        </div>
      </div>

      <h2 className="font-heading font-bold text-lg text-white uppercase border-l-2 border-[#F97316] pl-3 mb-4">
        SESIONES RECIENTES
      </h2>

      {entrenamientos.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p className="mb-2">No registraste ningún entrenamiento todavía.</p>
          <Link href="/arena/registrar" className="text-[#F97316] hover:underline text-sm uppercase font-heading font-bold tracking-wider">
            Registrar primero →
          </Link>
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
