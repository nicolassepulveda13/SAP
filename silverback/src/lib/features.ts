// S4-Entrega: rutas con pantalla maquetada o SIN funcionalidad real todavía.
// Se ocultan de la navegación y el middleware redirige a /santuario si se entra por URL.
// Cuando algo se implementa, se saca de la lista y vuelve a aparecer solo.

// Paquetes completos (la ruta y todas sus subrutas)
//   /evolucion → PKG_EVOLUCIÓN / BÓVEDA (S7): evolución, árbol de habilidades, botín, tienda
//   /perfil    → PKG_PERFIL (S8): dashboard, racha, fatiga, trofeos, beneficios
export const RUTAS_OCULTAS = ["/evolucion", "/perfil"];

// Pantallas sueltas (solo la ruta exacta, sus hermanas siguen visibles)
//   (vacía desde S6: Guerra Global ya tiene ciclo semanal real)
export const PANTALLAS_OCULTAS: string[] = [];

export function estaOculta(pathname: string): boolean {
  return (
    PANTALLAS_OCULTAS.includes(pathname) ||
    RUTAS_OCULTAS.some((r) => pathname === r || pathname.startsWith(r + "/"))
  );
}
