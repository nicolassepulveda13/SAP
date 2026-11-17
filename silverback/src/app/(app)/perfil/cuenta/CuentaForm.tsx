// S8-Perfil: CU-005-007 — formulario de datos (GUARDAR CAMBIOS) y "CAMBIAR CONTRASEÑA" desplegable con
// CONTRASEÑA ACTUAL, NUEVA y CONFIRMAR NUEVA (ACTUALIZAR CONTRASEÑA). FA-3: si no coinciden se resaltan ambos campos.
"use client";

import { useActionState, useState } from "react";
import { actualizarCuenta, cambiarPassword } from "@/app/actions/perfil";

export function CuentaForm({ nombre, email }: { nombre: string; email: string }) {
  const [datos, accionDatos, guardando] = useActionState(actualizarCuenta, undefined);
  const [pass, accionPass, actualizando] = useActionState(cambiarPassword, undefined);
  const [abrirPassword, setAbrirPassword] = useState(false);

  return (
    <div className="space-y-6">
      <form action={accionDatos} className="bg-[#242424] border border-[#333] rounded-xl p-6 space-y-3">
        <h2 className="font-heading font-bold text-sm text-[#F97316] uppercase tracking-wider">DATOS PERSONALES</h2>
        <Field label="NOMBRE" name="nombre" defaultValue={nombre} pending={guardando} />
        <Field label="EMAIL" name="email" type="email" defaultValue={email} pending={guardando} />
        <div className="pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-wider px-6 py-2.5 rounded"
          >
            {guardando ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
          </button>
          {datos?.error && <p className="text-red-400 text-sm mt-3">{datos.error}</p>}
          {datos?.ok && <p className="text-green-400 text-sm mt-3">Datos actualizados.</p>}
        </div>
      </form>

      <div className="bg-[#242424] border border-[#333] rounded-xl p-6">
        <button
          type="button"
          onClick={() => setAbrirPassword((v) => !v)}
          className="font-heading font-bold text-sm text-[#F97316] uppercase tracking-wider"
        >
          {abrirPassword ? "▾" : "▸"} CAMBIAR CONTRASEÑA
        </button>
        {abrirPassword && (
          <form action={accionPass} className="space-y-3 mt-4">
            <Field label="CONTRASEÑA ACTUAL" name="passwordActual" type="password" pending={actualizando} required />
            <Field label="NUEVA CONTRASEÑA" name="passwordNueva" type="password" pending={actualizando} required resaltar={pass?.noCoinciden} />
            <Field label="CONFIRMAR NUEVA CONTRASEÑA" name="passwordConfirmacion" type="password" pending={actualizando} required resaltar={pass?.noCoinciden} />
            <div className="pt-2">
              <button
                type="submit"
                disabled={actualizando}
                className="bg-[#F97316] hover:bg-[#EA6800] disabled:opacity-50 text-white font-heading font-bold uppercase tracking-wider px-6 py-2.5 rounded"
              >
                {actualizando ? "ACTUALIZANDO..." : "ACTUALIZAR CONTRASEÑA"}
              </button>
              {pass?.error && <p className="text-red-400 text-sm mt-3">{pass.error}</p>}
              {pass?.ok && <p className="text-green-400 text-sm mt-3">Contraseña actualizada.</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue, required, pending, resaltar }: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  pending: boolean;
  resaltar?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={pending}
        aria-invalid={resaltar || undefined}
        className={`w-full bg-[#1a1a1a] border px-3 py-2 rounded text-white text-sm focus:outline-none focus:border-[#F97316] disabled:opacity-50 ${
          resaltar ? "border-red-500" : "border-[#333]"
        }`}
      />
    </div>
  );
}
