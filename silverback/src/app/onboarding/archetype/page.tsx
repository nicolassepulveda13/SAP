// S2-Onboarding: ArchetypeSelectorPage — Paso 2/3 del onboarding (P2)
// Usa useTransition + saveStep2(arquetipo) directamente (no via form) porque la elección es un click, no un submit
// saveStep2 agrega el arquetipo al draft cookie y redirige a /onboarding/matchmaking
"use client";

import { useState, useTransition } from "react";
import { Dumbbell, Flame, Zap, Check } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { saveStep2 } from "@/app/actions/onboarding";

const archetypes = [
  {
    id: "VOLUMEN",
    icon: <Dumbbell size={20} className="text-[#F97316]" />,
    name: "VOLUMEN",
    subtitle: "EL GORILA",
    desc: "Acumulación de fuerza bruta y masa. Enfoque en movimientos compuestos pesados, sobrecarga progresiva y potencia sin concesiones.",
  },
  {
    id: "DEFINIDO",
    icon: <Flame size={20} className="text-[#F97316]" />,
    name: "DEFINIDO",
    subtitle: "LA PANTERA",
    desc: "Precisión estética y pérdida de grasa. Entrenamiento de intervalos de alta intensidad, hipertrofia dirigida y acondicionamiento metabólico disciplinado.",
  },
  {
    id: "ATLETICO",
    icon: <Zap size={20} className="text-[#F97316]" />,
    name: "ATLÉTICO",
    subtitle: "EL CHIMPANCÉ",
    desc: "Rendimiento funcional y agilidad. Mezcla de potencia explosiva, resistencia y movilidad para una dominancia atlética total.",
  },
];

export default function ArchetypeSelectorPage() {
  const [selected, setSelected] = useState("VOLUMEN");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await saveStep2(selected);
    });
  }

  return (
    <div className="w-full max-w-4xl">
      <PageLabel page="P2" />
      <h2 className="font-heading font-bold text-5xl text-white uppercase tracking-wider text-center mb-3">
        ELIGE TU ARQUETIPO
      </h2>
      <p className="text-[#9CA3AF] text-center mb-10 max-w-md mx-auto">
        Selecciona tu protocolo operativo. Esto define tu camino de progresión y enfoque de entrenamiento.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {archetypes.map((arch) => (
          <button
            key={arch.id}
            onClick={() => setSelected(arch.id)}
            className={`relative bg-[#242424] rounded-xl overflow-hidden border-2 transition-all text-left ${
              selected === arch.id ? "border-[#F97316]" : "border-[#333] hover:border-[#555]"
            }`}
          >
            {selected === arch.id && (
              <div className="absolute top-3 right-3 w-7 h-7 bg-[#F97316] rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
            <div className="h-48 bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-6xl opacity-60">
                {arch.id === "VOLUMEN" ? "🦍" : arch.id === "DEFINIDO" ? "🐆" : "🐒"}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {arch.icon}
                <span className="font-heading font-bold text-lg text-white uppercase">{arch.name}</span>
              </div>
              <span className="inline-block text-xs text-[#9CA3AF] border border-[#444] px-2 py-0.5 rounded mb-2 uppercase tracking-wider">
                {arch.subtitle}
              </span>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">{arch.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-widest px-12 py-3 rounded transition-colors"
        >
          {isPending ? "GUARDANDO..." : "CONFIRMAR ARQUETIPO →"}
        </button>
        <a
          href="/onboarding/biometrics"
          className="text-sm text-[#9CA3AF] hover:text-white uppercase tracking-wider font-heading transition-colors"
        >
          VOLVER AL INICIO
        </a>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#F97316] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
      </div>
    </div>
  );
}
