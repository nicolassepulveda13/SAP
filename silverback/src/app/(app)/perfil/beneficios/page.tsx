"use client";

import { useState } from "react";
import { Filter, Lock, Dumbbell, Apple, Utensils } from "lucide-react";
import { PageLabel } from "@/components/ui/PageLabel";

const benefits = [
  {
    featured: true,
    label: "DESTACADO",
    partner: "IRON FORGE ATHLETICS",
    title: "30% OFF EN EQUIPAMIENTO PESADO",
    desc: "Actualiza tu arsenal personal con equipo de grado industrial. Válido en pesas rusas, barras olímpicas y racks. Solo para miembros Nivel 10+.",
    action: "DESBLOQUEAR CÓDIGO",
    locked: false,
    expiry: null,
    icon: <Dumbbell size={20} className="text-white" />,
    iconBg: "bg-[#F97316]",
    wide: true,
  },
  {
    featured: false,
    label: null,
    partner: "APEX NUTRITION",
    title: "2X1 EN PROTEÍNA ISOLADA",
    desc: "Recuperación máxima para entrenamientos brutales. Oferta válida en sucursales físicas.",
    action: "CANJEAR →",
    locked: false,
    expiry: "EXPIRA EN 48H",
    icon: <Apple size={20} className="text-[#F97316]" />,
    iconBg: "bg-[#2e2e2e]",
  },
  {
    featured: false,
    label: "ROPA DEPORTIVA",
    partner: "GRIT APPAREL",
    title: "ENVÍO GRATIS + 15% OFF",
    desc: "Indumentaria diseñada para resistir el castigo. Aplicable a la nueva colección de compresión.",
    action: "COPIAR CUPÓN",
    locked: false,
    expiry: null,
    icon: <Dumbbell size={20} className="text-[#9CA3AF]" />,
    iconBg: "bg-[#2e2e2e]",
  },
  {
    featured: false,
    label: "RECUPERACIÓN",
    partner: "CRYO-TITAN LABS",
    title: "1 SESIÓN GRATIS / MES",
    desc: "Terapia de frío avanzada para recuperación de élite.",
    action: "BLOQUEADO",
    locked: true,
    expiry: null,
    icon: null,
    iconBg: "bg-[#2e2e2e]",
    levelReq: "REQUIERE NIVEL 20",
  },
  {
    featured: false,
    label: "ALIMENTACIÓN",
    partner: "PRIMAL PREP MEALS",
    title: "SUSCRIPCIÓN PREMIUM A COSTO BASE",
    desc: "Comidas preparadas altas en proteína. Obtén el plan de 4,000 calorías por el precio del plan estándar.",
    action: "ACTIVAR OFERTA",
    locked: false,
    expiry: null,
    icon: <Utensils size={20} className="text-[#9CA3AF]" />,
    iconBg: "bg-[#2e2e2e]",
  },
];

export default function BeneficiosPage() {
  return (
    <div>
      <PageLabel page="P20" />
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">BENEFICIOS ALIADOS</h1>
          <p className="text-sm text-[#9CA3AF]">Arsenal de recompensas exclusivas para el Clan Silverback. Reclama tu ventaja.</p>
        </div>
        <button className="border border-[#555] hover:border-white text-white font-heading font-bold uppercase text-xs px-4 py-2.5 rounded flex items-center gap-2 transition-colors shrink-0">
          <Filter size={14} /> FILTROS
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Featured: spans 2 rows / 2 cols */}
        <div className="col-span-2 row-span-1 bg-[#242424] border border-[#333] rounded-xl overflow-hidden flex">
          <div className="w-48 bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-6xl">🏋️</span>
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#F97316] text-white text-[10px] font-heading font-bold uppercase px-2 py-0.5 rounded">DESTACADO</span>
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1">⚔️ {benefits[0].partner}</span>
              </div>
              <h2 className="font-heading font-bold text-xl text-white uppercase mb-2">{benefits[0].title}</h2>
              <p className="text-xs text-[#9CA3AF]">{benefits[0].desc}</p>
            </div>
            <button className="mt-4 bg-[#F97316] hover:bg-[#EA6800] text-white font-heading font-bold uppercase tracking-wider py-2.5 px-5 rounded flex items-center gap-2 self-start transition-colors text-xs">
              <Lock size={12} /> {benefits[0].action}
            </button>
          </div>
        </div>

        {/* Apex Nutrition */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex flex-col">
          <div className="w-12 h-12 bg-[#2e2e2e] rounded-lg flex items-center justify-center mb-3">
            <Apple size={20} className="text-[#F97316]" />
          </div>
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">{benefits[1].partner}</p>
          <h3 className="font-heading font-bold text-sm text-white uppercase mb-2">{benefits[1].title}</h3>
          <p className="text-xs text-[#9CA3AF] flex-1 mb-4">{benefits[1].desc}</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#ef4444] font-heading uppercase">{benefits[1].expiry}</span>
            <button className="text-[#F97316] font-heading font-bold uppercase text-xs hover:text-white transition-colors">
              {benefits[1].action}
            </button>
          </div>
        </div>

        {/* Grit Apparel */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center">
              <Dumbbell size={16} className="text-[#9CA3AF]" />
            </div>
            <span className="text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">ROPA DEPORTIVA</span>
          </div>
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">{benefits[2].partner}</p>
          <h3 className="font-heading font-bold text-sm text-white uppercase mb-2">{benefits[2].title}</h3>
          <p className="text-xs text-[#9CA3AF] flex-1 mb-4">{benefits[2].desc}</p>
          <button className="border border-[#F97316] text-[#F97316] font-heading font-bold uppercase text-xs py-2 rounded hover:bg-[#F97316] hover:text-white transition-colors">
            {benefits[2].action}
          </button>
        </div>

        {/* Cryo-Titan (locked) */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex flex-col opacity-60">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-[#9CA3AF]" />
            </div>
            <span className="text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">RECUPERACIÓN</span>
          </div>
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">{benefits[3].partner}</p>
          <h3 className="font-heading font-bold text-sm text-white uppercase mb-2">{benefits[3].title}</h3>
          <div className="flex-1 mb-4">
            <div className="bg-[#2e2e2e] rounded-lg py-2 text-center">
              <span className="text-xs font-heading font-bold text-[#9CA3AF] uppercase">{benefits[3].levelReq}</span>
            </div>
          </div>
          <button className="border border-[#555] text-[#555] font-heading font-bold uppercase text-xs py-2 rounded cursor-not-allowed">
            BLOQUEADO
          </button>
        </div>

        {/* Primal Prep */}
        <div className="bg-[#242424] border border-[#333] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#2e2e2e] rounded-lg flex items-center justify-center">
              <Utensils size={16} className="text-[#9CA3AF]" />
            </div>
            <span className="text-[10px] bg-[#2e2e2e] text-[#9CA3AF] px-2 py-0.5 rounded font-heading uppercase">ALIMENTACIÓN</span>
          </div>
          <p className="text-xs text-[#9CA3AF] uppercase mb-1">{benefits[4].partner}</p>
          <h3 className="font-heading font-bold text-sm text-white uppercase mb-2">{benefits[4].title}</h3>
          <p className="text-xs text-[#9CA3AF] flex-1 mb-4">{benefits[4].desc}</p>
          <button className="border border-[#F97316] text-[#F97316] font-heading font-bold uppercase text-xs py-2 rounded hover:bg-[#F97316] hover:text-white transition-colors">
            {benefits[4].action}
          </button>
        </div>
      </div>
    </div>
  );
}
