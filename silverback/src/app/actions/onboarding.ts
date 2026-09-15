"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api-client";
import { setToken } from "@/lib/session";

export type OnboardingState = { error?: string } | undefined;

const API_BASE = process.env.API_URL ?? "http://localhost:5057";

const VALIDACIONES = {
  edad: { min: 14, max: 99 },
  pesoKg: { min: 30, max: 300 },
  alturaCm: { min: 100, max: 250 },
};

type OnboardingDraft = {
  nombre: string;
  email: string;
  password: string;
  edad: string;
  pesoKg: string;
  alturaCm: string;
  nivelExperiencia: string;
  arquetipo?: string;
};

async function leerDraft(): Promise<OnboardingDraft | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_onboarding")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

async function guardarDraft(draft: OnboardingDraft): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("sb_onboarding", JSON.stringify(draft), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 30,
    path: "/",
  });
}

export async function saveStep1(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const nombre = (formData.get("nombre") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const edad = formData.get("edad") as string;
  const pesoKg = formData.get("pesoKg") as string;
  const alturaCm = formData.get("alturaCm") as string;
  const nivelExperiencia = formData.get("nivelExperiencia") as string;

  if (!nombre || !email || !password || !edad || !pesoKg || !alturaCm || !nivelExperiencia)
    return { error: "Completá todos los campos." };

  const edadNum = Number(edad);
  const pesoNum = Number(pesoKg);
  const alturaNum = Number(alturaCm);

  if (edadNum < VALIDACIONES.edad.min || edadNum > VALIDACIONES.edad.max)
    return { error: `La edad debe estar entre ${VALIDACIONES.edad.min} y ${VALIDACIONES.edad.max} años.` };
  if (pesoNum < VALIDACIONES.pesoKg.min || pesoNum > VALIDACIONES.pesoKg.max)
    return { error: `El peso debe estar entre ${VALIDACIONES.pesoKg.min} y ${VALIDACIONES.pesoKg.max} kg.` };
  if (alturaNum < VALIDACIONES.alturaCm.min || alturaNum > VALIDACIONES.alturaCm.max)
    return { error: `La altura debe estar entre ${VALIDACIONES.alturaCm.min} y ${VALIDACIONES.alturaCm.max} cm.` };

  await guardarDraft({ nombre, email, password, edad, pesoKg, alturaCm, nivelExperiencia });
  redirect("/onboarding/archetype");
}

export async function saveStep2(arquetipo: string): Promise<void> {
  const draft = await leerDraft();
  if (!draft) redirect("/onboarding/biometrics");
  await guardarDraft({ ...draft, arquetipo });
  redirect("/onboarding/matchmaking");
}

export type ClanDisponible = {
  id: string;
  nombre: string;
  cantidadMiembros: number;
  capacidadMaxima: number;
};

export async function getClanesDisponibles(): Promise<ClanDisponible[]> {
  try {
    return await apiFetch<ClanDisponible[]>("/api/incorporacion/clanes", {
      cache: "no-store",
    } as RequestInit);
  } catch {
    return [];
  }
}

export async function joinClan(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const clanId = formData.get("clanId") as string;
  if (!clanId) return { error: "Seleccioná un clan." };

  const draft = await leerDraft();
  if (!draft?.arquetipo) redirect("/onboarding/biometrics");

  // 1. Registrar — no hay token en cookie todavía, apiFetch envía sin Authorization
  let tokenPreliminar: string;
  try {
    const data = await apiFetch<{ token: string; id: string }>(
      "/api/incorporacion/registrar",
      {
        method: "POST",
        body: JSON.stringify({
          nombre: draft!.nombre,
          email: draft!.email,
          password: draft!.password,
          arquetipo: draft!.arquetipo,
          edad: Number(draft!.edad),
          pesoKg: Number(draft!.pesoKg),
          alturaCm: Number(draft!.alturaCm),
          nivelExperiencia: draft!.nivelExperiencia,
        }),
      }
    );
    tokenPreliminar = data.token;
  } catch (e) {
    return { error: (e as Error).message ?? "Error al registrarse." };
  }

  // 2. Unirse — necesita Bearer del token preliminar (aún no está en cookie)
  try {
    const res = await fetch(`${API_BASE}/api/incorporacion/unirse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenPreliminar}`,
      },
      body: JSON.stringify({ clanId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: (err as { error?: string }).error ?? "Error al unirse al clan." };
    }
    const data = await res.json();
    await setToken(data.token);
  } catch {
    return { error: "No se pudo unir al clan." };
  }

  // 3. Limpiar el draft
  const cookieStore = await cookies();
  cookieStore.delete("sb_onboarding");

  redirect("/santuario");
}

export async function crearClan(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const nombre = (formData.get("nombreClan") as string)?.trim();
  if (!nombre) return { error: "Ingresá un nombre para tu clan." };

  const draft = await leerDraft();
  if (!draft?.arquetipo) redirect("/onboarding/biometrics");

  // 1. Registrar cuenta con el draft acumulado
  let tokenPreliminar: string;
  try {
    const data = await apiFetch<{ token: string; id: string }>(
      "/api/incorporacion/registrar",
      {
        method: "POST",
        body: JSON.stringify({
          nombre: draft!.nombre,
          email: draft!.email,
          password: draft!.password,
          arquetipo: draft!.arquetipo,
          edad: Number(draft!.edad),
          pesoKg: Number(draft!.pesoKg),
          alturaCm: Number(draft!.alturaCm),
          nivelExperiencia: draft!.nivelExperiencia,
        }),
      }
    );
    tokenPreliminar = data.token;
  } catch (e) {
    return { error: (e as Error).message ?? "Error al registrarse." };
  }

  // 2. Crear clan con el token preliminar (aún no está en cookie)
  try {
    const res = await fetch(`${API_BASE}/api/incorporacion/clan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenPreliminar}`,
      },
      body: JSON.stringify({ nombre }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: (err as { error?: string }).error ?? "Error al crear el clan." };
    }
    const data = await res.json();
    await setToken(data.token);
  } catch {
    return { error: "No se pudo crear el clan." };
  }

  const cookieStore = await cookies();
  cookieStore.delete("sb_onboarding");
  redirect("/santuario");
}
