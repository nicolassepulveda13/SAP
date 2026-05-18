"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Scale, Ruler } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

export default function BiometricCalibrationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ edad: "", peso: "", altura: "", nivel: "" });

  return (
    <div className="w-full max-w-sm">
      <PageLabel page="P1" />
      <div className="bg-[#242424] border border-[#333] rounded-xl p-8 shadow-2xl">
        <h2 className="font-heading font-bold text-2xl text-white uppercase tracking-wider text-center mb-1">
          CALIBRACIÓN BIOMÉTRICA
        </h2>
        <p className="text-[#9CA3AF] text-sm text-center mb-6">
          Establece tu línea base para generar tu protocolo óptimo.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">EDAD</label>
            <div className="relative">
              <input
                type="number"
                placeholder="00"
                value={form.edad}
                onChange={(e) => setForm({ ...form, edad: e.target.value })}
                className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">PESO (KG)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="00.0"
                  value={form.peso}
                  onChange={(e) => setForm({ ...form, peso: e.target.value })}
                  className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <Scale size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">ALTURA (CM)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="000"
                  value={form.altura}
                  onChange={(e) => setForm({ ...form, altura: e.target.value })}
                  className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <Ruler size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">NIVEL DE EXPERIENCIA</label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="" disabled>Seleccionar Nivel</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="elite">Élite</option>
            </select>
          </div>

          <button
            onClick={() => router.push("/onboarding/archetype")}
            className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-3 rounded transition-colors flex items-center justify-center gap-2 mt-2"
          >
            CONTINUAR →
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-6 h-1 bg-[#F97316] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
      </div>
    </div>
  );
}
