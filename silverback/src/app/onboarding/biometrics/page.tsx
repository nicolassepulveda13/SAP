"use client";

import { useActionState } from "react";
import { Calendar, Scale, Ruler, User, Mail, Lock } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { saveStep1 } from "@/app/actions/onboarding";

export default function BiometricCalibrationPage() {
  const [state, action, pending] = useActionState(saveStep1, undefined);

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

        <form action={action} className="space-y-4">
          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">NOMBRE</label>
            <div className="relative">
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                required
                className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">EMAIL</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                required
                className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">CONTRASEÑA</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">EDAD</label>
            <div className="relative">
              <input
                type="number"
                name="edad"
                placeholder="00"
                required
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
                  name="pesoKg"
                  placeholder="00.0"
                  required
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
                  name="alturaCm"
                  placeholder="000"
                  required
                  className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <Ruler size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-1">NIVEL DE EXPERIENCIA</label>
            <select
              name="nivelExperiencia"
              required
              defaultValue=""
              className="w-full bg-white text-[#333] rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="" disabled>Seleccionar Nivel</option>
              <option value="PRINCIPIANTE">Principiante</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
              <option value="ELITE">Élite</option>
            </select>
          </div>

          {state?.error && (
            <p className="text-red-400 text-xs text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-widest py-3 rounded transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {pending ? "GUARDANDO..." : "CONTINUAR →"}
          </button>
        </form>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <div className="w-6 h-1 bg-[#F97316] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
        <div className="w-6 h-1 bg-[#444] rounded-full" />
      </div>
    </div>
  );
}
