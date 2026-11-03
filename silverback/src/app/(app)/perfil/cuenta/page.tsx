// S8-Perfil: CU-005-007 (C-26) — Gestionar Datos de Cuenta (P21). Pre-cargado desde el dashboard.
import { PageLabel } from "@/components/ui/PageLabel";
import { getDashboard } from "@/app/actions/perfil";
import { CuentaForm } from "./CuentaForm";

export default async function CuentaPage() {
  const d = await getDashboard();
  return (
    <div>
      <PageLabel page="P21" />
      <div className="mb-8">
        <h1 className="font-heading font-bold text-4xl text-white uppercase">DATOS DE CUENTA</h1>
        <p className="text-sm text-[#9CA3AF]">
          Actualizá tu nombre, email o contraseña.
        </p>
      </div>

      <div className="max-w-xl">
        <CuentaForm nombre={d.miembro.nombre} email={d.miembro.email} />
      </div>
    </div>
  );
}
