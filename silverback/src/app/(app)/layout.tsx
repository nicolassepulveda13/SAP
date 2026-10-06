import Topbar from "@/components/layout/Topbar";
import Sidebar, { type SidebarUsuario } from "@/components/layout/Sidebar";
import { apiFetch } from "@/lib/api-client";

type Dashboard = {
  miembro: { nombre: string; rol: string };
  clan: { nombre: string } | null;
};

// S4-Entrega: el layout trae nombre, rol y clan reales para el Sidebar (antes era texto fijo de la maqueta)
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let usuario: SidebarUsuario = null;
  try {
    const d = await apiFetch<Dashboard>("/api/perfil/dashboard");
    usuario = { nombre: d.miembro.nombre, rol: d.miembro.rol, clan: d.clan?.nombre ?? null };
  } catch {
    // Si falla, cada página maneja su propia redirección a /login
  }

  return (
    <div className="h-screen bg-[#181818] overflow-hidden">
      <Topbar />
      <div className="flex h-full pt-14">
        <Sidebar usuario={usuario} />
        <main className="flex-1 ml-64 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
