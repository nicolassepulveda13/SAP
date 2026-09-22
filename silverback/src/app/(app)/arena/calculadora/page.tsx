// S4-CER: CalculadoraCERPage — Server Component, explicación visual del algoritmo CER (P10)
// Lee el arquetipo del dashboard para mostrar el modificador real del usuario
// CU-003-003: el puntaje real lo calcula el backend en RegistrarEntrenamiento → CerService
import { LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { PageLabel } from "@/components/ui/PageLabel";

const MODIFICADORES: Record<string, { valor: number; desc: string }> = {
  VOLUMEN: { valor: 1.1, desc: "El Gorila — fuerza bruta primero" },
  DEFINIDO: { valor: 1.05, desc: "La Pantera — precisión estética" },
  ATLETICO: { valor: 1.0, desc: "El Chimpancé — rendimiento funcional" },
};

export default async function CalculadoraCERPage() {
  let arquetipo = "ATLETICO";
  try {
    const d = await apiFetch<{ miembro: { arquetipo: string | null } }>("/api/perfil/dashboard");
    arquetipo = d.miembro.arquetipo ?? "ATLETICO";
  } catch { /* muestra modificador por defecto */ }

  const mod = MODIFICADORES[arquetipo] ?? MODIFICADORES.ATLETICO;

  return (
    <div className="relative flex items-center justify-center min-h-full">
      <div className="absolute top-0 left-0">
        <PageLabel page="P10" />
      </div>
      <div className="w-full max-w-lg bg-[#242424] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[#F97316]" />
            <span className="font-heading font-bold text-white uppercase tracking-wider">ALGORITMO CER</span>
          </div>
          <Link href="/arena/registrar" className="text-[#9CA3AF] hover:text-white transition-colors">
            <X size={18} />
          </Link>
        </div>

        <div className="p-6 space-y-6">
          {/* Fórmula */}
          <div className="bg-[#1a1a1a] rounded-xl p-5">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">FÓRMULA</p>
            <div className="flex items-center gap-3 text-white font-heading font-bold">
              <div className="flex-1 bg-[#2e2e2e] rounded-lg p-3 text-center">
                <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">PESO (KG)</p>
                <p className="text-lg">P</p>
              </div>
              <span className="text-[#9CA3AF]">×</span>
              <div className="flex-1 bg-[#2e2e2e] rounded-lg p-3 text-center">
                <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">REPETICIONES</p>
                <p className="text-lg">R</p>
              </div>
              <span className="text-[#9CA3AF]">×</span>
              <div className="flex-1 bg-[#2e2e2e] rounded-lg p-3 text-center border border-[#F97316]/40">
                <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">MODIFICADOR</p>
                <p className="text-lg text-[#F97316]">{mod.valor}</p>
              </div>
            </div>
          </div>

          {/* Tu arquetipo */}
          <div className="flex items-start gap-3 bg-[#1a1a1a] rounded-xl p-4">
            <X size={16} className="text-[#F97316] mt-0.5 shrink-0" />
            <div>
              <p className="font-heading font-bold text-white uppercase text-sm">{arquetipo}</p>
              <p className="text-xs text-[#9CA3AF]">{mod.desc}</p>
              <p className="text-xs text-[#F97316] mt-1 font-heading">Multiplicador: ×{mod.valor}</p>
            </div>
          </div>

          {/* Todos los modificadores */}
          <div className="border-t border-[#333] pt-4">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-3">TODOS LOS MODIFICADORES</p>
            <div className="space-y-2">
              {Object.entries(MODIFICADORES).map(([key, val]) => (
                <div key={key} className={`flex items-center justify-between px-3 py-2 rounded ${key === arquetipo ? "bg-[#F97316]/10 border border-[#F97316]/30" : "bg-[#1a1a1a]"}`}>
                  <span className={`font-heading font-bold text-sm uppercase ${key === arquetipo ? "text-[#F97316]" : "text-[#9CA3AF]"}`}>{key}</span>
                  <span className={`font-heading font-bold ${key === arquetipo ? "text-[#F97316]" : "text-white"}`}>×{val.valor}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/arena/registrar"
            className="block w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider py-3 rounded text-center transition-colors"
          >
            VOLVER A REGISTRAR
          </Link>
        </div>
      </div>
    </div>
  );
}
