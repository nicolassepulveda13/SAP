// S8-Perfil: Client Component — actualizarCuenta con dos secciones (datos + contraseña)
"use client";

import { useActionState } from "react";
import { actualizarCuenta } from "@/app/actions/perfil";

export function CuentaForm({ nombre, email }: { nombre: string; email: string }) {
  const [state, action, pending] = useActionState(actualizarCuenta, undefined);

  return (
    <form action={action} className="bg-[#242424] border border-[#333] rounded-xl p-6 space-y-6">
      <section className="space-y-3">
        <h2 className="font-heading font-bold text-sm text-[#F97316] uppercase tracking-wider">
          DATOS PERSONALES
        </h2>
        <Field label="NOMBRE" name="nombre" defaultValue={nombre} required pending={pending} />
        <Field label="EMAIL" name="email" type="email" defaultValue={email} required pending={pending} />
      </section>

      <section className="space-y-3 border-t border-[#333] pt-6">
        <h2 className="font-heading font-bold text-sm text-[#F97316] uppercase tracking-wider">
          CONTRASEÑA (opcional)
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Dejalos en blanco si no querés cambiarla.
        </p>
        <Field label="CONTRASEÑA ACTUAL" name="passwordActual" type="password" pending={pending} />
        <Field label="NUEVA CONTRASEÑA" name="passwordNueva" type="password" pending={pending} />
      </section>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-wider px-6 py-2.5 rounded"
        >
          {pending ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
        </button>
        {state?.error && <p className="text-red-400 text-sm mt-3">{state.error}</p>}
        {state?.ok && <p className="text-green-400 text-sm mt-3">Datos actualizados.</p>}
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", defaultValue, required, pending }: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  pending: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={pending}
        className="w-full bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded text-white text-sm focus:outline-none focus:border-[#F97316] disabled:opacity-50"
      />
    </div>
  );
}
