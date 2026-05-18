"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Flame, Zap, Check } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const archetypes = [
  {
    id: "volumen",
    icon: <Dumbbell size={20} className="text-[#F97316]" />,
    name: "VOLUMEN",
    subtitle: "EL GORILA",
    desc: "Acumulación de fuerza bruta y masa. Enfoque en movimientos compuestos pesados, sobrecarga progresiva y potencia sin concesiones.",
    selected: true,
  },
  {
    id: "definido",
    icon: <Flame size={20} className="text-[#F97316]" />,
    name: "DEFINIDO",
    subtitle: "LA PANTERA",
    desc: "Precisión estética y pérdida de grasa. Entrenamiento de intervalos de alta intensidad, hipertrofia dirigida y acondicionamiento metabólico disciplinado.",
    selected: false,
  },
  {
    id: "atletico",
    icon: <Zap size={20} className="text-[#F97316]" />,
    name: "ATLÉTICO",
    subtitle: "EL CHIMPANCÉ",
    desc: "Rendimiento funcional y agilidad. Mezcla de potencia explosiva, resistencia y movilidad para una dominancia atlética total.",
    selected: false,
  },
];

export default function ArchetypeSelectorPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("volumen");

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
                {arch.id === "volumen" ? "🦍" : arch.id === "definido" ? "🐆" : "🐒"}
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
          onClick={() => router.push("/onboarding/matchmaking")}
          className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest px-12 py-3 rounded transition-colors"
        >
          CONFIRMAR ARQUETIPO →
        </button>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#9CA3AF] hover:text-white uppercase tracking-wider font-heading transition-colors"
        >
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  );
}
