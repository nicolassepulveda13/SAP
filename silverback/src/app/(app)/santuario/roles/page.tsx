"use client";

import { useState } from "react";
import { Users, UserMinus, Clock } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const roles = ["SILVERBACK (LÍDER)", "BETA (OFICIAL)", "EXPLORADOR (MIEMBRO)", "RECLUTA"];

const initialMembers = [
  { id: 1, name: 'JAXSON "IRON" V.', level: 38, days: 120, role: "SILVERBACK (LÍDER)", avatar: null },
  { id: 2, name: 'ELENA "FORGE" M.', level: 35, days: 85, role: "BETA (OFICIAL)", avatar: null },
  { id: 3, name: "MARCUS K.", level: 12, days: 14, role: "EXPLORADOR (MIEMBRO)", initials: "MK" },
];

export default function RolesPage() {
  const [members, setMembers] = useState(initialMembers);

  function updateRole(id: number, role: string) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  return (
    <div>
      <PageLabel page="P7" />
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-4xl text-[#F97316] uppercase tracking-wider mb-2">
            PANEL DE GESTIÓN TÁCTICA
          </h1>
          <p className="text-sm text-[#9CA3AF] max-w-lg">
            Gestiona la jerarquía y el personal del clan. Los niveles de autoridad dictan el acceso a la arena.
          </p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl px-6 py-4 flex items-center gap-3 shrink-0">
          <Users size={20} className="text-[#F97316]" />
          <div>
            <span className="font-heading font-bold text-2xl text-white">24 / 50</span>
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">MIEMBROS ACTIVOS</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#333] mb-6" />

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="bg-[#242424] border border-[#333] rounded-xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#2e2e2e] flex items-center justify-center shrink-0 overflow-hidden">
              {member.initials ? (
                <span className="font-heading font-bold text-lg text-[#9CA3AF]">{member.initials}</span>
              ) : (
                <span className="text-2xl">🦍</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-white uppercase mb-1">{member.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">
                  NIVEL {member.level}
                </span>
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                  <Clock size={10} /> {member.days} Días
                </span>
              </div>
            </div>
            <select
              value={member.role}
              onChange={(e) => updateRole(member.id, e.target.value)}
              className="bg-[#1a1a1a] border border-[#444] text-white text-xs font-heading font-bold uppercase px-3 py-2 rounded outline-none focus:border-[#F97316] cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button className="border border-[#F97316]/60 text-[#F97316] hover:bg-[#F97316]/10 font-heading font-bold uppercase text-xs px-4 py-2 rounded tracking-wider transition-colors flex items-center gap-2">
              <UserMinus size={14} /> EXPULSAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
