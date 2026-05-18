"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare, Clock, Target, Gift, Trophy, Zap, LayoutGrid
} from "lucide-react";

const navItems = [
  { label: "Sala de Tácticas", href: "/santuario/tacticas", icon: MessageSquare },
  { label: "Árbol de Habilidades", href: "/evolucion/habilidades", icon: LayoutGrid },
  { label: "Historial", href: "/arena/historial", icon: Clock },
  { label: "Mercado", href: "/evolucion/tienda", icon: Zap },
  { label: "Radar", href: "/onboarding/matchmaking", icon: Target },
  { label: "Beneficios", href: "/perfil/beneficios", icon: Gift },
  { label: "Trofeos", href: "/perfil/trofeos", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-[#181818] border-r border-[#333] flex flex-col z-40">
      {/* User info */}
      <div className="p-4 flex flex-col items-center gap-2 border-b border-[#333]">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F97316] bg-[#2e2e2e] flex items-center justify-center">
          <span className="text-2xl">🦍</span>
        </div>
        <p className="font-heading font-bold text-sm text-[#F97316] tracking-wider uppercase">
          CLAN OVERLORD
        </p>
        <p className="text-xs text-[#9CA3AF]">Silverback Nivel 42</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-heading font-semibold uppercase tracking-wider transition-colors ${
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
