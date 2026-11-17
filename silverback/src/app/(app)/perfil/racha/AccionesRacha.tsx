// S8-Perfil: Client Component — SALVAR RACHA (CU-005-003) y DEJAR MORIR LA RACHA (FA-2)
"use client";

import { useState, useTransition } from "react";
import { Shield } from "lucide-react";
import { salvarRacha, dejarMorirRacha } from "@/app/actions/perfil";

export function AccionesRacha({ costo, puntos, tieneClan }: { costo: number; puntos: number; tieneClan: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const alcanza = tieneClan && puntos >= costo;

  const salvar = () =>
    startTransition(async () => {
      const r = await salvarRacha(); // si sale bien, redirige al Santuario (paso 15)
      if (r?.error) setError(r.error);
    });

  const dejarMorir = () =>
    startTransition(async () => {
      const r = await dejarMorirRacha();
      if (r.error) setError(r.error);
    });

  return (
    <div>
      <button
        type="button"
        onClick={salvar}
        disabled={!alcanza || pending}
        className="bg-[#F97316] hover:bg-[#EA6800] disabled:bg-[#555] disabled:cursor-not-allowed text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded flex items-center gap-2 mx-auto"
      >
        <Shield size={16} /> {pending ? "..." : "SALVAR RACHA"}
      </button>
      <p data-testid="costo-rescate" className="text-xs text-[#9CA3AF] mt-2">
        {costo} pts (Tienes: {puntos} pts)
      </p>
      {!alcanza && (
        <p className="text-xs text-red-400 mt-2">
          {tieneClan
            ? "Saldo insuficiente. Los Puntos de Clan se ganan registrando entrenamientos en la Arena."
            : "Necesitás pertenecer a un clan para salvar la racha."}
        </p>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      <button
        type="button"
        onClick={dejarMorir}
        disabled={pending}
        className="mt-6 text-xs text-[#9CA3AF] underline uppercase tracking-wider hover:text-white"
      >
        DEJAR MORIR LA RACHA
      </button>
    </div>
  );
}
