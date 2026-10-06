"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { estaOculta } from "@/lib/features";

// S4-Entrega: se filtran las pestañas de paquetes sin integración (Bóveda, Perfil).
// "Arena" queda activa en todas las subrutas /arena/*.
const tabs = [
  { label: "Santuario", href: "/santuario" },
  { label: "Arena", href: "/arena" },
  { label: "Desafíos", href: "/santuario/forja" },
  { label: "Bóveda", href: "/evolucion/botin" },
  { label: "Perfil", href: "/perfil" },
].filter((t) => !estaOculta(t.href));

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#181818] border-b border-[#333] z-50 flex items-center px-6 gap-8">
      <Link href="/santuario" className="font-heading font-bold text-xl text-[#F97316] tracking-widest shrink-0">
        SILVERBACK
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {tabs.map((tab) => {
          const isActive = tab.href === "/santuario"
            ? pathname === "/santuario" || pathname.startsWith("/santuario/tacticas") || pathname.startsWith("/santuario/roles")
            : tab.href.startsWith("/arena")
              ? pathname.startsWith("/arena")
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-1.5 text-sm font-heading font-semibold uppercase tracking-wider transition-colors relative ${
                isActive
                  ? "text-[#F97316] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#F97316]"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
