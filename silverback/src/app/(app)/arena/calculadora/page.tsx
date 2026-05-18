"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, X, RefreshCw } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

export default function CalculadoraCERPage() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center min-h-full">
      <div className="absolute top-0 left-0">
        <PageLabel page="P10" />
      </div>
      <div className="w-full max-w-lg bg-[#242424] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[#F97316]" />
            <span className="font-heading font-bold text-white uppercase tracking-wider">ALGORITMO CER</span>
          </div>
          <button onClick={() => router.back()} className="text-[#9CA3AF] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Formula display */}
          <div className="bg-[#1a1a1a] rounded-xl p-5">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">CALCULADORA CER EN VIVO</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#2e2e2e] rounded-lg p-3 flex items-center gap-2">
                <span className="text-[10px] text-[#9CA3AF] uppercase leading-tight">MULTIPLICADOR DE ARQUETIPO</span>
              </div>
              <span className="text-[#9CA3AF]">/</span>
              <div className="flex-1 bg-[#2e2e2e] rounded-lg p-3 flex items-center gap-2 justify-between">
                <span className="text-[10px] text-[#9CA3AF] uppercase leading-tight">MULTIPLICADOR DE ARQUETIPO</span>
                <RefreshCw size={12} className="text-[#9CA3AF] shrink-0" />
              </div>
            </div>
            <div className="mt-3 bg-[#2e2e2e] rounded-lg p-3 flex items-center gap-2">
              <X size={12} className="text-[#F97316]" />
              <div>
                <span className="text-sm text-white font-heading font-bold uppercase">MULTIPLICADOR DE ARQUETIPO</span>
                <p className="text-xs text-[#9CA3AF]">Silverback (1.15x)</p>
              </div>
            </div>
          </div>

          {/* CER Score */}
          <div className="text-center border-t border-[#333] pt-6">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">PUNTAJE CER ACTUAL</p>
            <span className="font-heading font-bold text-7xl text-[#F97316]">24.8</span>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="text-xs text-[#9CA3AF]">Cálculo en Vivo Activo</span>
            </div>
          </div>

          <div className="border-t border-[#333]" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-2 border-[#F97316] pl-4">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">PESO REGISTRADO</p>
              <p className="font-heading font-bold text-2xl text-white">315 lbs</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">REPETICIONES COMPLETADAS</p>
              <p className="font-heading font-bold text-2xl text-white">8</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.back()}
              className="border border-[#555] text-white font-heading font-bold uppercase tracking-wider py-3 rounded hover:border-white transition-colors"
            >
              CERRAR
            </button>
            <button
              onClick={() => router.push("/arena")}
              className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider py-3 rounded transition-colors"
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
