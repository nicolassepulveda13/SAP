"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="flex h-screen items-center justify-center bg-[#181818]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            🦍 SilverBack
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">El camino del gorila</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2 font-semibold text-white transition-colors"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm">
          ¿Primera vez?{" "}
          <a href="/onboarding/biometrics" className="text-orange-400 underline">
            Creá tu cuenta
          </a>
        </p>
      </div>
    </main>
  );
}
