"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, User } from "lucide-react";

const tabs = [
  { label: "Santuario", href: "/santuario" },
  { label: "Arena", href: "/arena" },
  { label: "Desafíos", href: "/santuario/forja" },
  { label: "Bóveda", href: "/evolucion/botin" },
  { label: "Perfil", href: "/perfil" },
];

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#181818] border-b border-[#333] z-50 flex items-center px-6 gap-8">
      <Link href="/santuario" className="font-heading font-bold text-xl text-[#F97316] tracking-widest shrink-0">
        SILVERBACK
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href) ||
            (tab.href === "/santuario" && (pathname === "/santuario" || pathname.startsWith("/santuario/tacticas") || pathname.startsWith("/santuario/roles")));
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

      <div className="flex items-center gap-3 shrink-0">
        <button className="text-[#9CA3AF] hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-[#9CA3AF] hover:text-white transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#2e2e2e] border border-[#444] flex items-center justify-center">
          <User size={16} className="text-[#9CA3AF]" />
        </div>
      </div>
    </header>
  );
}
