"use client";

// S6: refresca los datos del Server Component padre cada `cadaMs` (polling, sin websockets).
// Se usa en la Sala de Tácticas para ver mensajes nuevos de otros miembros (CU-002-004).
// Pausa mientras la pestaña está oculta para no pegarle a la API de más.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ cadaMs = 5000 }: { cadaMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, cadaMs);
    return () => clearInterval(id);
  }, [router, cadaMs]);

  return null;
}
