"use client";

import { useState } from "react";
import { AlertTriangle, Send, Plus } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const messages = [
  {
    id: 1,
    type: "system",
    title: "SISTEMA ANULADO",
    text: "Los objetivos de la Incursión Semanal han sido actualizados. Se requiere un gran volumen de peso muerto para despejar el sector 4.",
    time: "08:00 AM",
  },
  {
    id: 2,
    type: "member",
    user: "IRON_JAW",
    level: 38,
    text: "Logré un nuevo PR en press de banca hoy. 315lbs por 3 repeticiones. La forma se sintió sólida, pero la fuerza de agarre necesita trabajo.",
    time: "08:15 AM",
    isSelf: false,
  },
  {
    id: 3,
    type: "member",
    user: "CLAN OVERLORD",
    level: 42,
    text: "Trabajo sólido. Intenta incorporar caminatas del granjero pesadas al final de tu sesión para fortalecer ese agarre. Te necesitamos fuerte para la próxima incursión.",
    time: "08:22 AM",
    isSelf: true,
  },
  {
    id: 4,
    type: "challenge",
    title: "DESAFÍO DE ARENA INICIADO",
    text: "El Clan Titán nos ha desafiado por el control del Sector 7. Reúnan a sus escuadrones.",
    time: "",
  },
  {
    id: 5,
    type: "member",
    user: "BRUTE_FORCE",
    level: 45,
    text: "Tomaré la iniciativa en el Sector 7. Necesito a dos levantadores pesados de apoyo. ¿Quién se une?",
    time: "09:05 AM",
    isSelf: false,
  },
];

export default function TacticasPage() {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-[#333] flex items-center justify-between shrink-0">
        <div>
          <PageLabel page="P6" />
          <p className="text-xs text-[#9CA3AF] uppercase tracking-widest">CHAT</p>
          <h1 className="font-heading font-bold text-xl text-white uppercase tracking-wider">
            COMUNICACIONES DEL CLAN Y ALERTAS DEL SISTEMA
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="text-xs font-heading font-bold text-[#22c55e] uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.map((msg) => {
          if (msg.type === "system") {
            return (
              <div key={msg.id} className="bg-[#2a1a0a] border border-[#F97316]/40 rounded-lg p-4 flex gap-3">
                <AlertTriangle size={16} className="text-[#F97316] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-heading font-bold text-[#F97316] uppercase">{msg.title}</span>
                    <span className="text-xs text-[#9CA3AF]">{msg.time}</span>
                  </div>
                  <p className="text-sm text-[#9CA3AF]">{msg.text}</p>
                </div>
              </div>
            );
          }

          if (msg.type === "challenge") {
            return (
              <div key={msg.id} className="bg-[#2a1a0a] border-2 border-[#F97316] rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F97316] rounded flex items-center justify-center shrink-0">
                  <span className="text-lg">⚔️</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-heading font-bold text-[#F97316] uppercase mb-0.5">{msg.title}</p>
                  <p className="text-sm text-[#9CA3AF]">{msg.text}</p>
                </div>
                <button className="border border-[#F97316] text-[#F97316] font-heading font-bold uppercase text-xs px-4 py-2 rounded tracking-wider hover:bg-[#F97316] hover:text-white transition-colors shrink-0">
                  VER INFORME
                </button>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xl bg-[#242424] border rounded-xl p-4 ${msg.isSelf ? "border-[#F97316]/40" : "border-[#333]"}`}>
                <div className="flex justify-between items-center mb-2 gap-8">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-white uppercase">{msg.user}</span>
                    <span className="text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-1.5 py-0.5 rounded font-heading uppercase">
                      LVL {msg.level}
                    </span>
                    {msg.isSelf && (
                      <span className="text-[10px] bg-[#F97316] text-white px-1.5 py-0.5 rounded font-heading uppercase">
                        CLAN OVERLORD
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#9CA3AF] shrink-0">{msg.time}</span>
                </div>
                <p className="text-sm text-[#9CA3AF]">{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-[#333] shrink-0 flex gap-3">
        <button className="w-10 h-10 bg-[#242424] border border-[#333] rounded flex items-center justify-center shrink-0 hover:border-[#F97316] transition-colors">
          <Plus size={16} className="text-[#9CA3AF]" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TRANSMITIR MENSAJE AL CLAN..."
          className="flex-1 bg-[#242424] border border-[#333] rounded px-4 py-2.5 text-sm text-white placeholder-[#9CA3AF] outline-none focus:border-[#F97316]"
        />
        <button className="bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider px-6 py-2.5 rounded flex items-center gap-2 transition-colors">
          ENVIAR <Send size={14} />
        </button>
      </div>
    </div>
  );
}
