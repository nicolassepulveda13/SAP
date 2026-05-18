"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus, Calculator, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageLabel } from "@/components/ui/PageLabel";

export default function RegistrarEsfuerzoPage() {
  const router = useRouter();
  const [ejercicio, setEjercicio] = useState("");
  const [peso, setPeso] = useState(100);
  const [reps, setReps] = useState(5);

  return (
    <div className="max-w-2xl mx-auto">
      <PageLabel page="P9" />
      <div className="flex items-center gap-3 mb-8">
        <Link href="/arena" className="text-[#9CA3AF] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-12 h-12 bg-[#F97316] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-xl">⚔️</span>
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-white uppercase tracking-wider">
            REGISTRAR ESFUERZO DE BATALLA
          </h1>
          <p className="text-sm text-[#9CA3AF]">Registra tu rendimiento. La precisión es poder.</p>
        </div>
      </div>

      <div className="bg-[#242424] border border-[#F97316]/40 rounded-xl p-8 space-y-6">
        {/* Exercise name */}
        <div>
          <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-2">NOMBRE DEL EJERCICIO</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="EJ. SENTADILLA CON BARRA"
              value={ejercicio}
              onChange={(e) => setEjercicio(e.target.value)}
              className="w-full bg-[#1a1a1a] border-b border-[#555] pl-10 pr-4 py-3 text-white placeholder-[#555] outline-none focus:border-[#F97316] font-heading uppercase tracking-wider text-sm"
            />
          </div>
        </div>

        {/* Spinners */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">PESO (KG)</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPeso((v) => Math.max(0, v - 5))}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] rounded flex items-center justify-center transition-colors"
              >
                <Minus size={16} className="text-white" />
              </button>
              <span className="font-heading font-bold text-5xl text-[#F97316] w-24 text-center">{peso}</span>
              <button
                onClick={() => setPeso((v) => v + 5)}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] rounded flex items-center justify-center transition-colors"
              >
                <Plus size={16} className="text-white" />
              </button>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">REPETICIONES</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setReps((v) => Math.max(1, v - 1))}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] rounded flex items-center justify-center transition-colors"
              >
                <Minus size={16} className="text-white" />
              </button>
              <span className="font-heading font-bold text-5xl text-[#F97316] w-16 text-center">{reps}</span>
              <button
                onClick={() => setReps((v) => v + 1)}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] rounded flex items-center justify-center transition-colors"
              >
                <Plus size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => router.push("/arena/calculadora")}
          className="w-full border border-[#555] hover:border-white text-white font-heading font-bold uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <Calculator size={16} /> CALCULAR CER
        </button>

        <button
          onClick={() => router.push("/arena")}
          className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle2 size={18} /> REGISTRAR ESFUERZO
        </button>
      </div>
    </div>
  );
}
