"use server";
import { redirect } from "next/navigation";
import { setToken, deleteToken } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

const API_BASE = process.env.API_URL ?? "http://localhost:5057";

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Completá todos los campos." };

  let token: string;
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: (err as { error?: string }).error ?? "Email o contraseña incorrectos." };
    }
    const data = await res.json();
    token = data.token;
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }

  await setToken(token);
  redirect("/santuario");
}

export async function logout(): Promise<void> {
  await deleteToken();
  redirect("/login");
}
