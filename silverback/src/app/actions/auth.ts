// S1-Auth: Server Actions de autenticación — login y logout
// "use server" = estas funciones corren SOLO en el servidor aunque se llamen desde el cliente
"use server";
import { redirect } from "next/navigation";
import { setToken, deleteToken } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

const API_BASE = process.env.API_URL ?? "http://localhost:5057";

// S1-Auth: login() — Server Action llamada desde LoginPage via useActionState
// Firma del contrato useActionState: (prevState, formData) => Promise<State>
// Llama a POST /api/auth/login, recibe JWT y lo persiste en cookie HTTP-only
export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Completá todos los campos." };

  // S1-Auth: fetch directo (sin apiFetch) porque aún no hay token en cookie
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

  // S1-Auth: persistir JWT y redirigir al hub principal
  await setToken(token);
  redirect("/santuario");
}

// S1-Auth: logout() — borra la cookie sb_token y redirige al login
// Llamado desde el botón "Cerrar sesión" en SantuarioPage con <form action={logout}>
export async function logout(): Promise<void> {
  await deleteToken();
  redirect("/login");
}
