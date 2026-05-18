"use client";

import { useRouter } from "next/navigation";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageLabel } from "@/components/ui/PageLabel";

export default function RachaPage() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center min-h-full">
      <div className="absolute top-0 left-0">
        <PageLabel page="P17" />
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/santuario" className="text-[#9CA3AF] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-heading font-bold text-[#F97316] uppercase tracking-wider">SILVERBACK</span>
        </div>

        <div className="bg-[#242424] border border-[#333] rounded-2xl overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="font-heading font-bold text-2xl text-white uppercase tracking-wider mb-1">RACHA ACTUAL</h2>
            <p className="text-sm text-[#9CA3AF] mb-6">Tu disciplina está en riesgo.</p>

            <div className="border-t border-[#333] pt-8 pb-8">
              {/* Glowing number */}
              <div className="relative inline-block">
                <span
                  className="font-heading font-bold text-[120px] leading-none text-[#F97316]"
                  style={{ textShadow: "0 0 40px rgba(249,115,22,0.6)" }}
                >
                  42
                </span>
              </div>
              <p className="text-sm text-[#9CA3AF] uppercase tracking-widest mt-2">DÍAS CONSECUTIVOS</p>
            </div>

            {/* Warning */}
            <div className="bg-[#3a1515] border border-[#ef4444]/40 rounded-lg px-4 py-3 flex items-center justify-center gap-2 mb-6">
              <AlertTriangle size={14} className="text-[#ef4444]" />
              <span className="text-xs font-heading font-bold text-[#ef4444] uppercase">RACHA A PUNTO DE PERDERSE</span>
            </div>

            {/* Save button */}
            <button
              onClick={() => router.push("/santuario")}
              className="w-full bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mb-2"
            >
              <Shield size={18} /> SALVAR RACHA
            </button>
            <p className="text-xs text-[#9CA3AF] text-center">
              Costo: <span className="text-[#F97316] font-bold">100 pts</span> (Tienes: 450 pts)
            </p>

            <button
              onClick={() => router.push("/santuario")}
              className="mt-6 text-xs text-[#9CA3AF] hover:text-white underline uppercase tracking-wider font-heading transition-colors"
            >
              DEJAR MORIR LA RACHA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
