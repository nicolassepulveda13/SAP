import { AlertTriangle, Send } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";
import { requireClan } from "@/lib/clan-context";
import { apiFetch } from "@/lib/api-client";
import { enviarMensaje } from "@/app/actions/santuario";

type Mensaje = {
  id: string;
  contenido: string;
  tipo: string;
  enviadoEn: string;
  miembroId: string;
  autorNombre: string | null;
};

export default async function TacticsRoomPage() {
  const { data, clanId } = await requireClan();
  const mensajes = await apiFetch<Mensaje[]>(`/api/santuario/${clanId}/mensajes`);
  const ordenados = [...mensajes].reverse();

  return (
    <div className="max-w-2xl mx-auto flex flex-col">
      <PageLabel page="P6" />
      <h1 className="font-heading font-bold text-3xl text-[#F97316] uppercase tracking-wider mb-4">
        SALA DE TÁCTICAS
      </h1>

      <div className="space-y-3 mb-4">
        {ordenados.length === 0 && (
          <p className="text-sm text-[#9CA3AF]">
            Todavía no hay mensajes en el clan. Arrancá la conversación.
          </p>
        )}
        {ordenados.map((m) => {
          const esPropio = m.miembroId === data.miembro.id;
          if (m.tipo === "SISTEMA") {
            return (
              <div
                key={m.id}
                className="bg-[#2e2e2e] border border-[#F97316]/40 rounded-lg p-3 flex gap-2 items-start"
              >
                <AlertTriangle size={14} className="text-[#F97316] mt-0.5 shrink-0" />
                <p className="text-xs text-[#9CA3AF]">{m.contenido}</p>
              </div>
            );
          }
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg p-3 ${
                esPropio
                  ? "ml-auto bg-[#F97316]/20 border border-[#F97316]/40"
                  : "bg-[#242424] border border-[#333]"
              }`}
            >
              <p className="text-xs text-[#9CA3AF] mb-1">
                {m.autorNombre ?? "Miembro"} ·{" "}
                {new Date(m.enviadoEn).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-sm text-white">{m.contenido}</p>
            </div>
          );
        })}
      </div>

      <form action={enviarMensaje.bind(null, clanId)} className="flex gap-2">
        <input
          name="contenido"
          required
          placeholder="Escribí un mensaje..."
          className="flex-1 bg-[#242424] border border-[#444] rounded-lg px-4 py-3 text-sm text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316]"
        />
        <button
          type="submit"
          className="bg-[#F97316] hover:bg-[#EA6800] text-white rounded-lg px-4 flex items-center justify-center transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
