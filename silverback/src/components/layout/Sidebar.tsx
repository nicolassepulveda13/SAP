"use client";

// S4-Entrega: navegación solo con pantallas integradas a la API (las ocultas se filtran vía lib/features.ts)
// El bloque de usuario recibe datos reales desde (app)/layout.tsx en vez del texto fijo de la maqueta
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Shield, MessageSquare, Users, Swords, PlusCircle, Calculator, Clock,
  LayoutGrid, Zap, Gift, Trophy,
} from "lucide-react";
import { estaOculta } from "@/lib/features";

export type SidebarUsuario = { nombre: string; rol: string; clan: string | null } | null;

const secciones = [
  {
    titulo: "Santuario",
    items: [
      { label: "Panel del Clan", href: "/santuario", icon: LayoutDashboard },
      { label: "La Forja", href: "/santuario/forja", icon: Shield },
      { label: "Sala de Tácticas", href: "/santuario/tacticas", icon: MessageSquare },
      { label: "Roles", href: "/santuario/roles", icon: Users },
    ],
  },
  {
    titulo: "Arena",
    items: [
      { label: "Guerra Global", href: "/arena", icon: Swords },
      { label: "Registrar", href: "/arena/registrar", icon: PlusCircle },
      { label: "Calculadora CER", href: "/arena/calculadora", icon: Calculator },
      { label: "Historial", href: "/arena/historial", icon: Clock },
    ],
  },
  {
    titulo: "Evolución",
    items: [
      { label: "Árbol de Habilidades", href: "/evolucion/habilidades", icon: LayoutGrid },
      { label: "Mercado", href: "/evolucion/tienda", icon: Zap },
    ],
  },
  {
    titulo: "Perfil",
    items: [
      { label: "Beneficios", href: "/perfil/beneficios", icon: Gift },
      { label: "Trofeos", href: "/perfil/trofeos", icon: Trophy },
    ],
  },
]
  .map((s) => ({ ...s, items: s.items.filter((i) => !estaOculta(i.href)) }))
  .filter((s) => s.items.length > 0);

export default function Sidebar({ usuario }: { usuario: SidebarUsuario }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-[#181818] border-r border-[#333] flex flex-col z-40">
      {/* User info */}
      <div className="p-4 flex flex-col items-center gap-2 border-b border-[#333]">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F97316] bg-[#2e2e2e] flex items-center justify-center">
          <span className="text-2xl">🦍</span>
        </div>
        {usuario && (
          <>
            <p className="font-heading font-bold text-sm text-[#F97316] tracking-wider uppercase text-center">
              {usuario.nombre}
            </p>
            <p className="text-xs text-[#9CA3AF] text-center">
              {usuario.rol}{usuario.clan ? ` · ${usuario.clan}` : ""}
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {secciones.map((s) => (
          <div key={s.titulo} className="mb-2">
            <p className="px-4 pt-2 pb-1 text-[10px] text-[#555] uppercase tracking-widest font-heading font-bold">
              {s.titulo}
            </p>
            {s.items.map(({ label, href, icon: Icon }) => {
              // Match exacto para las raíces (/santuario, /arena) así no quedan activas en sus subrutas
              const isActive = href === "/santuario" || href === "/arena"
                ? pathname === href
                : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-heading font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-[#F97316] text-white"
                      : "text-[#9CA3AF] hover:text-white hover:bg-[#2e2e2e]"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="p-4 border-t border-[#333]">
        <p className="font-heading font-bold text-sm text-[#F97316] tracking-widest uppercase">
          SILVERBACK
        </p>
      </div>
    </aside>
  );
}
