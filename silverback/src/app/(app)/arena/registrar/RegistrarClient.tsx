// S4-Arena: RegistrarClient — formulario de registro de entrenamiento con preview CER en vivo (P9)
// useActionState(registrarEntrenamiento) — muestra puntaje CER del servidor en estado de éxito
// Los spinners controlan useState(peso/reps); hidden inputs sincronizan con el FormData al submit
// S5-Voz: botón DICTAR (Web Speech API, es-AR). Lo entendido se muestra para confirmar antes de completar los campos.
// El formulario manual está siempre visible: la voz solo lo completa. Sin soporte (ej. Firefox) se avisa y se sigue a mano.
"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Minus, Plus, CheckCircle2, Zap, Mic, MicOff, X } from "lucide-react";
import Link from "next/link";
import { PageLabel } from "@/components/ui/PageLabel";
import { registrarEntrenamiento } from "@/app/actions/arena";
import { interpretarDictado, type Dictado } from "@/lib/voz";

// La Web Speech API no está en lib.dom de TypeScript: tipado mínimo de lo que se usa
type Reconocimiento = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type ConstructorReconocimiento = new () => Reconocimiento;

function obtenerReconocimiento(): ConstructorReconocimiento | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: ConstructorReconocimiento; webkitSpeechRecognition?: ConstructorReconocimiento };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// El soporte de la Web Speech API no cambia mientras la página está abierta: no hay nada a qué suscribirse
const sinSuscripcion = () => () => {};

const ERRORES_VOZ: Record<string, string> = {
  "not-allowed": "No hay permiso para usar el micrófono. Habilitalo en el navegador.",
  "no-speech": "No se escuchó nada. Probá de nuevo.",
  "audio-capture": "No se encontró un micrófono.",
  network: "El reconocimiento de voz necesita conexión a internet.",
};

const MODIFICADORES: Record<string, number> = {
  VOLUMEN: 1.1,
  DEFINIDO: 1.05,
  ATLETICO: 1.0,
};

export default function RegistrarClient({ arquetipo }: { arquetipo: string }) {
  const [state, action, pending] = useActionState(registrarEntrenamiento, undefined);
  const [ejercicio, setEjercicio] = useState("");
  const [peso, setPeso] = useState(60);
  const [reps, setReps] = useState(8);

  // S5-Voz: estado del dictado
  // null en el servidor (no hay window); en el cliente, si el navegador trae la Web Speech API
  const vozSoportada = useSyncExternalStore(
    sinSuscripcion,
    () => obtenerReconocimiento() !== null,
    () => null,
  );
  const [escuchando, setEscuchando] = useState(false);
  const [transcripcion, setTranscripcion] = useState("");
  const [dictado, setDictado] = useState<Dictado | null>(null);
  const [errorVoz, setErrorVoz] = useState<string | null>(null);
  const reconocimientoRef = useRef<Reconocimiento | null>(null);

  // Si se sale de la pantalla con el micrófono abierto, se corta
  useEffect(() => () => reconocimientoRef.current?.stop(), []);

  function dictar() {
    const Ctor = obtenerReconocimiento();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "es-AR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      setTranscripcion(texto);
      setDictado(interpretarDictado(texto));
    };
    rec.onerror = (e) => setErrorVoz(ERRORES_VOZ[e.error] ?? "No se pudo reconocer la voz.");
    rec.onend = () => setEscuchando(false);
    reconocimientoRef.current = rec;
    setErrorVoz(null);
    setDictado(null);
    setTranscripcion("");
    setEscuchando(true);
    rec.start();
  }

  function aplicarDictado() {
    if (!dictado) return;
    if (dictado.ejercicio) setEjercicio(dictado.ejercicio);
    if (dictado.peso !== undefined) setPeso(Math.max(0, dictado.peso));
    if (dictado.reps !== undefined) setReps(Math.max(1, dictado.reps));
    setDictado(null);
    setTranscripcion("");
  }

  const mod = MODIFICADORES[arquetipo] ?? 1.0;
  const cerPreview = Math.round(peso * reps * mod * 100) / 100;

  if (state?.resultado) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <PageLabel page="P9" />
        <div className="text-7xl mb-6">💥</div>
        <h2 className="font-heading font-bold text-4xl text-[#F97316] uppercase mb-2">¡ESFUERZO REGISTRADO!</h2>
        <p className="text-[#9CA3AF] mb-8">Tu performance ha sido procesada por el sistema.</p>
        <div className="bg-[#242424] border border-[#F97316]/40 rounded-xl p-8 mb-8 inline-block min-w-64">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-widest mb-2">PUNTAJE CER OBTENIDO</p>
          <span className="font-heading font-bold text-7xl text-[#F97316]">{state.resultado.puntaje}</span>
          <p className="text-xs text-[#9CA3AF] mt-2">{state.resultado.descripcion}</p>
          {state.resultado.xpGanado > 0 && (
            <p className="text-sm text-white mt-3 font-heading font-bold">+{state.resultado.xpGanado} XP</p>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <Link
            href="/arena"
            className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors"
          >
            VOLVER A LA ARENA
          </Link>
          <Link
            href="/arena/historial"
            className="border border-[#555] hover:border-white text-white font-heading font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors"
          >
            VER HISTORIAL
          </Link>
        </div>
      </div>
    );
  }

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

      <form action={action} className="bg-[#242424] border border-[#F97316]/40 rounded-xl p-8 space-y-6">
        {/* hidden inputs sincronizan los spinners con el FormData */}
        <input type="hidden" name="pesoKg" value={peso} />
        <input type="hidden" name="repeticiones" value={reps} />

        {/* S5-Voz: dictado por voz — completa los campos de abajo, que siempre se pueden editar a mano */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">CARGA POR VOZ</p>
              <p className="text-xs text-[#555] mt-1">Ej: “sentadilla 80 kilos 10 repeticiones”</p>
            </div>
            {vozSoportada !== false && (
              <button
                type="button"
                onClick={escuchando ? () => reconocimientoRef.current?.stop() : dictar}
                disabled={pending || vozSoportada === null}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded font-heading font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 ${
                  escuchando ? "bg-red-500/80 hover:bg-red-500 text-white animate-pulse" : "border border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10"
                }`}
              >
                {escuchando ? <><MicOff size={16} /> ESCUCHANDO…</> : <><Mic size={16} /> DICTAR</>}
              </button>
            )}
          </div>

          {vozSoportada === false && (
            <p className="text-xs text-[#9CA3AF] mt-3">
              Tu navegador no soporta dictado por voz (usá Chrome o Edge). Cargá los datos a mano abajo.
            </p>
          )}
          {errorVoz && <p className="text-xs text-red-400 mt-3">{errorVoz}</p>}

          {dictado && (
            <div className="mt-4 border-t border-[#333] pt-4">
              <p className="text-xs text-[#9CA3AF] mb-2">Escuché: <span className="text-white italic">“{transcripcion}”</span></p>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-[#242424] rounded p-2">
                  <p className="text-[10px] text-[#9CA3AF] uppercase">EJERCICIO</p>
                  <p className="text-sm text-white font-heading font-bold truncate">{dictado.ejercicio ?? "—"}</p>
                </div>
                <div className="bg-[#242424] rounded p-2">
                  <p className="text-[10px] text-[#9CA3AF] uppercase">PESO</p>
                  <p className="text-sm text-white font-heading font-bold">{dictado.peso !== undefined ? `${dictado.peso} kg` : "—"}</p>
                </div>
                <div className="bg-[#242424] rounded p-2">
                  <p className="text-[10px] text-[#9CA3AF] uppercase">REPS</p>
                  <p className="text-sm text-white font-heading font-bold">{dictado.reps ?? "—"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={aplicarDictado}
                  disabled={!dictado.ejercicio && dictado.peso === undefined && dictado.reps === undefined}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white text-xs font-heading font-bold uppercase tracking-wider py-2 rounded"
                >
                  USAR ESTOS DATOS
                </button>
                <button
                  type="button"
                  onClick={() => { setDictado(null); setTranscripcion(""); }}
                  className="border border-[#555] hover:border-white text-white text-xs font-heading font-bold uppercase tracking-wider px-3 py-2 rounded flex items-center gap-1"
                >
                  <X size={12} /> DESCARTAR
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-[#9CA3AF] uppercase tracking-wider block mb-2">NOMBRE DEL EJERCICIO</label>
          <input
            type="text"
            name="ejercicio"
            placeholder="EJ. SENTADILLA CON BARRA"
            value={ejercicio}
            onChange={(e) => setEjercicio(e.target.value.toUpperCase())}
            disabled={pending}
            required
            className="w-full bg-[#1a1a1a] border-b border-[#555] px-4 py-3 text-white placeholder-[#555] outline-none focus:border-[#F97316] font-heading uppercase tracking-wider text-sm disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">PESO (KG)</p>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setPeso((v) => Math.max(0, v - 5))} disabled={pending}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] disabled:opacity-50 rounded flex items-center justify-center transition-colors">
                <Minus size={16} className="text-white" />
              </button>
              <span className="font-heading font-bold text-5xl text-[#F97316] w-24 text-center">{peso}</span>
              <button type="button" onClick={() => setPeso((v) => v + 5)} disabled={pending}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] disabled:opacity-50 rounded flex items-center justify-center transition-colors">
                <Plus size={16} className="text-white" />
              </button>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 text-center">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">REPETICIONES</p>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setReps((v) => Math.max(1, v - 1))} disabled={pending}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] disabled:opacity-50 rounded flex items-center justify-center transition-colors">
                <Minus size={16} className="text-white" />
              </button>
              <span className="font-heading font-bold text-5xl text-[#F97316] w-16 text-center">{reps}</span>
              <button type="button" onClick={() => setReps((v) => v + 1)} disabled={pending}
                className="w-10 h-10 bg-[#2e2e2e] hover:bg-[#3a3a3a] disabled:opacity-50 rounded flex items-center justify-center transition-colors">
                <Plus size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview CER en vivo — calculado client-side con el modificador del arquetipo */}
        <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#F97316]" />
              <span className="text-xs text-[#9CA3AF] uppercase tracking-wider">PUNTAJE CER ESTIMADO</span>
            </div>
            <span className="text-xs bg-[#2e2e2e] text-[#F97316] px-2 py-0.5 rounded font-heading uppercase">
              {arquetipo} ×{mod}
            </span>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-heading font-bold text-5xl text-[#F97316]">{cerPreview}</span>
            <span className="text-[#9CA3AF] text-sm mb-1">= {peso} × {reps} × {mod}</span>
          </div>
        </div>

        {state?.error && (
          <p className="text-red-400 text-sm text-center">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || !ejercicio.trim()}
          className="w-full bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-widest py-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle2 size={18} /> {pending ? "PROCESANDO..." : "REGISTRAR ESFUERZO"}
        </button>
      </form>
    </div>
  );
}
