// CU-002-006: confirmación antes de expulsar. Client Component mínimo (el resto de la página es Server)
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { expulsarMiembro } from "@/app/actions/santuario";

export function ExpulsarButton({ clanId, miembroId, nombre }: {
  clanId: string;
  miembroId: string;
  nombre: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const confirmar = () => {
    if (!confirm(`¿Expulsar a ${nombre} del clan? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(async () => {
      try {
        await expulsarMiembro(clanId, miembroId);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "No se pudo expulsar al miembro.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={confirmar}
      disabled={pending}
      title="Expulsar del clan"
      className="border border-red-500/50 text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors disabled:opacity-50"
    >
      <UserMinus size={14} />
    </button>
  );
}
